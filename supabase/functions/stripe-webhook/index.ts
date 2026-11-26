import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Must stay in sync with PLANS.pro.product_id in src/lib/plans.ts
const PREMIUM_PRODUCT = 'prod_U3w9PqaaJVSOto';

// Mirrors resolvePlanFromProductId() in src/lib/plans.ts
function resolvePlanFromProductId(productId: string | null): string {
  if (!productId) return 'free';
  return productId === PREMIUM_PRODUCT ? 'pro' : 'plus'; // legacy products keep 'plus'
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// A failed profiles write means a paying user did not get (or lose) Premium.
// Return non-2xx so Stripe retries the event instead of treating it as done.
const profileWriteFailed = (eventType: string, userId: string, message: string) => {
  logStep("PROFILE UPDATE FAILED", { eventType, userId, message });
  return new Response(JSON.stringify({ error: `Profile update failed: ${message}` }), {
    headers: { "Content-Type": "application/json" },
    status: 500,
  });
};

// --- Email fallback for events with no stripe_customers row -----------------
// Purchases through the shared ARL checkout never write stripe_customers, so the
// lookups below can miss. In that case Premium is re-derived from Stripe by the
// customer's email. These rules mirror supabase/functions/check-subscription/
// entitlement.ts (resolveEntitlement + product allowlist). Keep them in sync;
// another function's directory cannot be imported from here.
const LEGACY_PLUS_PRODUCT = 'prod_U3w81PJvJRTiQQ';
const MOMENTUM_PRODUCT_PLANS: Record<string, 'pro' | 'plus'> = {
  [PREMIUM_PRODUCT]: 'pro',
  [LEGACY_PLUS_PRODUCT]: 'plus',
};
const ENTITLED_STATUSES = new Set(['active', 'trialing']);
const PLAN_RANK = { free: 0, plus: 1, pro: 2 } as const;

const itemProductId = (item: any): string | null => {
  const product = item?.price?.product;
  if (!product) return null;
  return typeof product === 'string' ? product : product.id ?? null;
};

function resolveEntitlement(subs: any[]): { plan: 'free' | 'plus' | 'pro'; status: 'active' | 'trialing' | 'inactive' } {
  let best: { plan: 'free' | 'plus' | 'pro'; status: 'active' | 'trialing' | 'inactive' } = { plan: 'free', status: 'inactive' };
  for (const sub of subs) {
    if (!ENTITLED_STATUSES.has(sub.status)) continue;
    for (const item of sub.items?.data ?? []) {
      const product = itemProductId(item);
      const plan = product ? MOMENTUM_PRODUCT_PLANS[product] : undefined;
      if (!plan) continue;
      const status = sub.status as 'active' | 'trialing';
      const better =
        PLAN_RANK[plan] > PLAN_RANK[best.plan] ||
        (PLAN_RANK[plan] === PLAN_RANK[best.plan] && best.status === 'trialing' && status === 'active');
      if (better) best = { plan, status };
    }
  }
  return best;
}

// current_period_end lives on the subscription item in current Stripe API
// versions; older payloads carry it on the subscription. Never throws.
function periodEndIso(subscription: any): string | null {
  const raw = subscription?.items?.data?.[0]?.current_period_end ?? subscription?.current_period_end;
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return null;
  const date = new Date(raw * 1000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const ok200 = () => new Response(JSON.stringify({ received: true }), {
  headers: { "Content-Type": "application/json" },
  status: 200,
});

async function findUserIdByEmail(supabaseClient: any, email: string): Promise<string | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabaseClient.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    const match = data.users.find((u: any) => u.email?.toLowerCase() === target);
    if (match) return match.id;
    if (data.users.length < 1000) break;
  }
  return null;
}

// Re-derive Premium from every subscription of every Stripe customer with this
// customer's email. Writes profiles only; never writes stripe_customers.
async function syncProfileByStripeEmail(
  supabaseClient: any,
  stripe: Stripe,
  customerId: string | null,
  eventType: string,
): Promise<Response> {
  if (!customerId) {
    logStep("Fallback: event has no customer id", { eventType });
    return ok200();
  }
  const customer = await stripe.customers.retrieve(customerId);
  const email = (customer as any).deleted ? null : (customer as Stripe.Customer).email;
  if (!email) {
    logStep("Fallback: Stripe customer has no email; ignoring", { eventType, customerId });
    return ok200();
  }

  const userId = await findUserIdByEmail(supabaseClient, email);
  if (!userId) {
    // Shared Stripe account: this customer may belong to another app.
    logStep("Fallback: no Momentum account for this email; ignoring", { eventType, customerId });
    return ok200();
  }

  const customers = await stripe.customers.list({ email, limit: 10 });
  const allSubs: any[] = [];
  for (const c of customers.data) {
    const subs = await stripe.subscriptions.list({ customer: c.id, status: 'all', limit: 100 });
    allSubs.push(...subs.data);
  }

  const hasMomentumHistory = allSubs.some((sub) =>
    (sub.items?.data ?? []).some((item: any) => {
      const product = itemProductId(item);
      return product ? product in MOMENTUM_PRODUCT_PLANS : false;
    })
  );
  const entitlement = resolveEntitlement(allSubs);

  if (entitlement.plan === 'free' && !hasMomentumHistory) {
    // Stripe has never sold this email Momentum, so any Premium on the profile
    // came from Apple/RevenueCat or a seeded grant. Leave it alone.
    logStep("Fallback: no Momentum Stripe subscription on record; not downgrading", { eventType, userId });
    return ok200();
  }

  const { error: profileError } = await supabaseClient
    .from('profiles')
    .update({
      plan: entitlement.plan,
      is_premium: entitlement.plan !== 'free',
      subscription_status: entitlement.status,
    })
    .eq('id', userId);

  if (profileError) {
    return profileWriteFailed(eventType, userId, profileError.message);
  }
  logStep("Fallback: profile re-derived from Stripe by email", { eventType, userId, ...entitlement });
  return ok200();
}

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const signature = req.headers.get("stripe-signature");

    if (!signature) throw new Error("No stripe-signature header");

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Event verified", { type: event.type, id: event.id });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { sessionId: session.id, customerId: session.customer });

        if (session.mode === 'subscription' && session.customer) {
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          const { data: customerData, error: customerError } = await supabaseClient
            .from('stripe_customers')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (customerError || !customerData) {
            logStep("No stripe_customers row; using email fallback", { error: customerError?.message });
            return await syncProfileByStripeEmail(supabaseClient, stripe, customerId, event.type);
          }

          // Get the subscription to determine the plan
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const productId = subscription.items.data[0]?.price.product as string;
          // Shared Stripe account: a Momentum customer can also buy another
          // app's product. Only Momentum products touch Momentum data.
          if (!(productId in MOMENTUM_PRODUCT_PLANS)) {
            logStep("Not a Momentum product; ignoring", { subscriptionId, productId });
            return ok200();
          }
          const plan = resolvePlanFromProductId(productId);

          await supabaseClient
            .from('stripe_customers')
            .update({
              stripe_subscription_id: subscriptionId,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customerId);

          const { error: profileError } = await supabaseClient
            .from('profiles')
            .update({
              subscription_status: subscription.status,
              is_premium: true,
              plan,
            })
            .eq('id', customerData.user_id);

          if (profileError) {
            return profileWriteFailed(event.type, customerData.user_id, profileError.message);
          }
          logStep("Profile updated", { plan, userId: customerData.user_id });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { subscriptionId: subscription.id, status: subscription.status });

        const { data: customerData, error: customerError } = await supabaseClient
          .from('stripe_customers')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (customerError || !customerData) {
          logStep("No stripe_customers row; using email fallback", { error: customerError?.message });
          return await syncProfileByStripeEmail(supabaseClient, stripe, subscription.customer as string, event.type);
        }

        const productId = subscription.items.data[0]?.price.product as string;
        const plan = resolvePlanFromProductId(productId);
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';

        await supabaseClient
          .from('stripe_customers')
          .update({
            current_period_end: periodEndIso(subscription),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            is_premium: isActive,
            plan: isActive ? plan : 'free',
          })
          .eq('id', customerData.user_id);

        if (profileError) {
          return profileWriteFailed(event.type, customerData.user_id, profileError.message);
        }
        logStep("Profile updated", { plan, isActive });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id });

        const { data: customerData, error: customerError } = await supabaseClient
          .from('stripe_customers')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (customerError || !customerData) {
          logStep("No stripe_customers row; using email fallback", { error: customerError?.message });
          return await syncProfileByStripeEmail(supabaseClient, stripe, subscription.customer as string, event.type);
        }

        await supabaseClient
          .from('stripe_customers')
          .update({
            stripe_subscription_id: null,
            current_period_end: null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            is_premium: false,
            plan: 'free',
          })
          .eq('id', customerData.user_id);

        if (profileError) {
          return profileWriteFailed(event.type, customerData.user_id, profileError.message);
        }
        logStep("Profile reverted to free");
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
