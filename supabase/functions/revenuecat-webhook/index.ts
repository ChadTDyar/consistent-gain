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
    // Verify webhook authenticity via shared Authorization header
    const expectedAuth = Deno.env.get("REVENUECAT_WEBHOOK_AUTH_HEADER");
    if (expectedAuth) {
      const incomingAuth = req.headers.get("authorization") ?? req.headers.get("Authorization");
      if (incomingAuth !== expectedAuth) {
        logStep("Unauthorized webhook attempt");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { "Content-Type": "application/json" },
          status: 401,
        });
      }
    } else {
      logStep("WARNING: REVENUECAT_WEBHOOK_AUTH_HEADER not configured, skipping auth check");
    }

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

    // Resolve the matched entitlement
    const entitlementIds = Object.keys(
      event.subscriber?.entitlements ?? {},
    );
    const matchedEntitlement = entitlementIds.find(
      (id) => ENTITLEMENT_TIER_MAP[id],
    );

    if (!matchedEntitlement) {
      logStep("No matching entitlement found", { entitlementIds });
      return new Response(
        JSON.stringify({ error: "Unknown entitlement" }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const tier = isActive ? ENTITLEMENT_TIER_MAP[matchedEntitlement] : "free";
    logStep("Resolved tier", { tier, entitlement: matchedEntitlement, eventType });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const results: { write: string; success: boolean; error?: string }[] = [];

    // --- Write 1: user_conversion_state (all entitlements) ---
    try {
      const { error } = await supabaseClient
        .from("user_conversion_state")
        .upsert(
          {
            user_id: appUserId,
            tier,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

      if (error) {
        logStep("user_conversion_state upsert FAILED", { message: error.message });
        results.push({ write: "user_conversion_state", success: false, error: error.message });
      } else {
        logStep("user_conversion_state upsert OK", { userId: appUserId, tier });
        results.push({ write: "user_conversion_state", success: true });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logStep("user_conversion_state upsert EXCEPTION", { message: msg });
      results.push({ write: "user_conversion_state", success: false, error: msg });
    }

    // --- Write 2: profiles.is_premium (homegrown_premium) ---
    if (matchedEntitlement === "homegrown_premium") {
      try {
        const { error } = await supabaseClient
          .from("profiles")
          .upsert(
            {
              id: appUserId,
              is_premium: isActive,
            },
            { onConflict: "id" },
          );

        if (error) {
          logStep("profiles.is_premium upsert FAILED", { message: error.message });
          results.push({ write: "profiles.is_premium", success: false, error: error.message });
        } else {
          logStep("profiles.is_premium upsert OK", { userId: appUserId, is_premium: isActive });
          results.push({ write: "profiles.is_premium", success: true });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        logStep("profiles.is_premium upsert EXCEPTION", { message: msg });
        results.push({ write: "profiles.is_premium", success: false, error: msg });
      }
    }

    // --- Write 3: profiles.subscription_tier (palettepro_business) ---
    if (matchedEntitlement === "palettepro_business") {
      try {
        const { error } = await supabaseClient
          .from("profiles")
          .upsert(
            {
              id: appUserId,
              subscription_tier: isActive ? "business" : "free",
            },
            { onConflict: "id" },
          );

        if (error) {
          logStep("profiles.subscription_tier upsert FAILED", { message: error.message });
          results.push({ write: "profiles.subscription_tier", success: false, error: error.message });
        } else {
          logStep("profiles.subscription_tier upsert OK", { userId: appUserId, subscription_tier: isActive ? "business" : "free" });
          results.push({ write: "profiles.subscription_tier", success: true });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        logStep("profiles.subscription_tier upsert EXCEPTION", { message: msg });
        results.push({ write: "profiles.subscription_tier", success: false, error: msg });
      }
    }

    // --- Write 4: ContentForge users.plan (contentforge_creator) ---
    if (matchedEntitlement === "contentforge_creator") {
      try {
        const cfUrl = Deno.env.get("CONTENTFORGE_SUPABASE_URL");
        const cfKey = Deno.env.get("CONTENTFORGE_SERVICE_ROLE_KEY");

        if (!cfUrl || !cfKey) {
          logStep("ContentForge Supabase credentials missing, skipping write");
          results.push({ write: "contentforge.users.plan", success: false, error: "Missing CONTENTFORGE_SUPABASE_URL or CONTENTFORGE_SERVICE_ROLE_KEY" });
        } else {
          const contentforgeClient = createClient(cfUrl, cfKey, {
            auth: { persistSession: false },
          });

          const { error } = await contentforgeClient
            .from("users")
            .upsert(
              {
                auth_id: appUserId,
                plan: isActive ? "creator" : "free",
              },
              { onConflict: "auth_id" },
            );

          if (error) {
            logStep("contentforge.users.plan upsert FAILED", { message: error.message });
            results.push({ write: "contentforge.users.plan", success: false, error: error.message });
          } else {
            logStep("contentforge.users.plan upsert OK", { userId: appUserId, plan: isActive ? "creator" : "free" });
            results.push({ write: "contentforge.users.plan", success: true });
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        logStep("contentforge.users.plan upsert EXCEPTION", { message: msg });
        results.push({ write: "contentforge.users.plan", success: false, error: msg });
      }
    }

    const allSucceeded = results.every((r) => r.success);
    logStep("All writes complete", { results, allSucceeded });

    return new Response(JSON.stringify({ received: true, results }), {
      headers: { "Content-Type": "application/json" },
      status: allSucceeded ? 200 : 207,
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
