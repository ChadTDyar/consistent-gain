import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

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

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { sessionId: session.id, customerId: session.customer });
        
        if (session.mode === 'subscription' && session.customer) {
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;
          
          // Get user_id from stripe_customers table
          const { data: customerData, error: customerError } = await supabaseClient
            .from('stripe_customers')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .single();
          
          if (customerError) {
            logStep("Error finding customer", { error: customerError.message });
            break;
          }
          
          // Update stripe_customers with subscription info
          const { error: stripeError } = await supabaseClient
            .from('stripe_customers')
            .update({
              stripe_subscription_id: subscriptionId,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customerId);
          
          if (stripeError) {
            logStep("Error updating stripe_customers", { error: stripeError.message });
          }
          
          // Update profile with subscription status
          const { error: profileError } = await supabaseClient
            .from('profiles')
            .update({
              subscription_status: 'active',
              is_premium: true
            })
            .eq('id', customerData.user_id);
          
          if (profileError) {
            logStep("Error updating profile", { error: profileError.message });
          } else {
            logStep("Profile and subscription updated successfully");
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { 
          subscriptionId: subscription.id, 
          status: subscription.status 
        });
        
        // Get user_id from stripe_customers table
        const { data: customerData, error: customerError } = await supabaseClient
          .from('stripe_customers')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();
        
        if (customerError) {
          logStep("Error finding customer", { error: customerError.message });
          break;
        }
        
        // Update stripe_customers with period end
        const { error: stripeError } = await supabaseClient
          .from('stripe_customers')
          .update({
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
        
        if (stripeError) {
          logStep("Error updating stripe_customers", { error: stripeError.message });
        }
        
        // Update profile with subscription status
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            is_premium: subscription.status === 'active'
          })
          .eq('id', customerData.user_id);
        
        if (profileError) {
          logStep("Error updating profile", { error: profileError.message });
        } else {
          logStep("Profile and subscription updated successfully");
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id });
        
        // Get user_id from stripe_customers table
        const { data: customerData, error: customerError } = await supabaseClient
          .from('stripe_customers')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();
        
        if (customerError) {
          logStep("Error finding customer", { error: customerError.message });
          break;
        }
        
        // Clear subscription info from stripe_customers
        const { error: stripeError } = await supabaseClient
          .from('stripe_customers')
          .update({
            stripe_subscription_id: null,
            current_period_end: null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
        
        if (stripeError) {
          logStep("Error updating stripe_customers", { error: stripeError.message });
        }
        
        // Update profile with canceled status
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            is_premium: false
          })
          .eq('id', customerData.user_id);
        
        if (profileError) {
          logStep("Error updating profile", { error: profileError.message });
        } else {
          logStep("Profile and subscription updated successfully");
        }
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
