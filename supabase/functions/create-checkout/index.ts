import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICES: Record<string, Record<string, string>> = {
  plus: {
    monthly: "price_1T5nbML98dr6Pw0kHQlfSif0",
    annual: "price_1T5nbML98dr6Pw0kIN3gcS0D",
  },
  pro: {
    monthly: "price_1T5ncwL98dr6Pw0ktGV0YCL2",
    annual: "price_1T5ncwL98dr6Pw0kdbGjczhT",
  },
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { plan, interval = 'monthly', priceId: legacyPriceId } = await req.json();
    
    // Support both new plan-based and legacy priceId-based requests
    let resolvedPriceId: string;
    if (plan && PRICES[plan]) {
      const billingInterval = interval === 'annual' ? 'annual' : 'monthly';
      resolvedPriceId = PRICES[plan][billingInterval];
    } else if (legacyPriceId) {
      resolvedPriceId = legacyPriceId;
    } else {
      throw new Error("plan ('plus' or 'pro') or priceId is required");
    }
    logStep("Request parsed", { plan, interval, priceId: resolvedPriceId });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: existingCustomer } = await supabaseServiceClient
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId;

    if (existingCustomer) {
      customerId = existingCustomer.stripe_customer_id;
      logStep("Found existing customer", { customerId });
    } else {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email: user.email });
        customerId = customer.id;
      }

      await supabaseServiceClient
        .from('stripe_customers')
        .insert({ user_id: user.id, stripe_customer_id: customerId });
      logStep("Stored customer", { customerId });
    }

    const origin = req.headers.get("origin") || Deno.env.get("SUPABASE_URL");
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${origin}/settings?upgraded=true`,
      cancel_url: `${origin}/pricing`,
    });
    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
