import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ENTITLEMENT_TIER_MAP: Record<string, string> = {
  momentum_premium: "premium",
  pawformance_pro: "pro",
  palettepro_business: "business",
  homegrown_premium: "premium",
  contentforge_creator: "creator",
  pillpal_family: "family",
};

const ACTIVE_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
]);

const LAPSED_EVENTS = new Set([
  "CANCELLATION",
  "EXPIRATION",
  "BILLING_ISSUE",
]);

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[REVENUECAT-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    const body = await req.text();
    if (!body) {
      return new Response(JSON.stringify({ error: "Empty request body" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const payload = JSON.parse(body);
    const event = payload.event;
    if (!event) {
      return new Response(JSON.stringify({ error: "Missing event in payload" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const eventType: string = event.type;
    const appUserId: string | undefined = event.app_user_id;
    logStep("Webhook received", { type: eventType, appUserId });

    if (!appUserId) {
      return new Response(JSON.stringify({ error: "Missing app_user_id" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const isActive = ACTIVE_EVENTS.has(eventType);
    const isLapsed = LAPSED_EVENTS.has(eventType);

    if (!isActive && !isLapsed) {
      logStep("Unhandled event type, skipping", { type: eventType });
      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    let tier = "free";

    if (isActive) {
      const entitlementIds = Object.keys(
        event.subscriber?.entitlements ?? {},
      );
      const matchedEntitlement = entitlementIds.find(
        (id) => ENTITLEMENT_TIER_MAP[id],
      );

      if (matchedEntitlement) {
        tier = ENTITLEMENT_TIER_MAP[matchedEntitlement];
      } else {
        logStep("No matching entitlement found", { entitlementIds });
        return new Response(
          JSON.stringify({ error: "Unknown entitlement" }),
          {
            headers: { "Content-Type": "application/json" },
            status: 400,
          },
        );
      }
    }

    logStep("Resolved tier", { tier, eventType });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { error: upsertError } = await supabaseClient
      .from("user_conversion_state")
      .upsert(
        {
          user_id: appUserId,
          tier,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (upsertError) {
      logStep("Upsert error", { message: upsertError.message });
      return new Response(
        JSON.stringify({ error: upsertError.message }),
        {
          headers: { "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    logStep("Upsert successful", { userId: appUserId, tier });

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
