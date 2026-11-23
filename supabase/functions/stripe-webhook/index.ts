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

// Find the Momentum user for a Stripe event. Primary path: stripe_customers.
// Fallback (purchases through the shared checkout never write that row): match
// the Stripe customer's email to an account, but ONLY for the Momentum Premium
// product, because the Stripe account is shared with other apps. On a match the
// missing stripe_customers row is added so later events resolve directly.
// Apple/RevenueCat-only accounts never produce Stripe events, so they are unaffected.
async function resolveUserId(
  supabaseClient: any,
  stripe: Stripe,
  customerId: string | null,
  subscriptionId: string,
  productId: string | null,
): Promise<string | null> {
  const bySub = await supabaseClient
    .from('stripe_customers').select('user_id')
    .eq('stripe_subscription_id', subscriptionId).maybeSingle();
  if (bySub.data?.user_id) return bySub.data.user_id;

  if (!customerId) return null;
  const byCustomer = await supabaseClient
    .from('stripe_customers').select('user_id')
    .eq('stripe_customer_id', customerId).maybeSingle();
  if (byCustomer.data?.user_id) return byCustomer.data.user_id;

  if (productId !== PREMIUM_PRODUCT) {
    logStep("No stripe_customers row and not a Momentum product; skipping", { customerId, productId });
    return null;
  }

  const customer = await stripe.customers.retrieve(customerId);
  const email = (customer as Stripe.Customer).deleted ? null : (customer as Stripe.Customer).email?.toLowerCase();
  if (!email) return null;

  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabaseClient.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    const match = data.users.find((u: any) => u.email?.toLowerCase() === email);
    if (match) {
      const { error: insertError } = await supabaseClient.from('stripe_customers').insert({
        user_id: match.id, stripe_customer_id: customerId, stripe_subscription_id: subscriptionId,
      });
      if (insertError) logStep("stripe_customers backfill failed", { message: insertError.message });
      logStep("Resolved user by Stripe email fallback", { userId: match.id });
      return match.id;
    }
    if (data.users.length < 1000) break;
  }
  logStep("No account matches Stripe customer email", { customerId });
  return null;
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

          // Get the subscription to determine the plan
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const productId = subscription.items.data[0]?.price.product as string;
          const plan = resolvePlanFromProductId(productId);

          const userId = await resolveUserId(supabaseClient, stripe, customerId, subscriptionId, productId);
          if (!userId) {
            logStep("Error finding customer", { customerId });
            break;
          }
          const customerData = { user_id: userId };

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

        const eventProductId = (subscription.items.data[0]?.price.product as string) ?? null;
        const resolvedUserId = await resolveUserId(
          supabaseClient, stripe, subscription.customer as string, subscription.id, eventProductId,
        );
        if (!resolvedUserId) {
          logStep("Error finding customer", { subscriptionId: subscription.id });
          break;
        }
        const customerData = { user_id: resolvedUserId };

        const productId = subscription.items.data[0]?.price.product as string;
        const plan = resolvePlanFromProductId(productId);
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';

        await supabaseClient
          .from('stripe_customers')
          .update({
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
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

        const eventProductId = (subscription.items.data[0]?.price.product as string) ?? null;
        const resolvedUserId = await resolveUserId(
          supabaseClient, stripe, subscription.customer as string, subscription.id, eventProductId,
        );
        if (!resolvedUserId) {
          logStep("Error finding customer", { subscriptionId: subscription.id });
          break;
        }
        const customerData = { user_id: resolvedUserId };

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
