import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function isAuthorized(req: Request, supabase: any): Promise<boolean> {
  const sr = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const bearer = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (sr && bearer && safeEqual(bearer, sr)) return true;
  const hdr = req.headers.get("x-agent-secret") ?? "";
  if (hdr) {
    const { data, error } = await supabase.rpc("verify_agent_secret", { p: hdr });
    if (!error && data === true) return true;
  }
  return false;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const DEST = "https://skaeklayghuqwakrbemy.supabase.co/functions/v1/sync-app-metrics";

Deno.serve(async (req) => {
  if (!(await isAuthorized(req, supabase))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { count: total } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: today } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since);

    const payload = {
      app_name: "Momentum",
      total_users: total ?? 0,
      signups_today: today ?? 0,
      synced_at: new Date().toISOString(),
    };

    const secret = Deno.env.get("AGENT_SHARED_SECRET") ?? "";
    const res = await fetch(DEST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("sync-app-metrics response", res.status, text);

    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status, payload }),
      { headers: { "Content-Type": "application/json" }, status: res.ok ? 200 : 502 },
    );
  } catch (err) {
    console.error("daily-signup-sync error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
