// One-off: set both reviewer accounts to Premium via service role. Delete after use.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REVIEWERS = [
  { id: "e63d6163-4957-4bee-a64a-fdddc2a1c059", email: "reviewer@momentumfit.app" },
  { id: "1851212a-7f5b-45be-8edb-c3b88b085040", email: "apple-review@momentumfit.app" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const results: any[] = [];
  for (const r of REVIEWERS) {
    const { error } = await admin.from("profiles").upsert({
      id: r.id,
      name: "App Store Reviewer",
      plan: "premium",
      is_premium: true,
      subscription_status: "active",
      theme_preference: "system",
      reminder_enabled: true,
    }, { onConflict: "id" });
    results.push({ email: r.email, ok: !error, error: error?.message });
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
