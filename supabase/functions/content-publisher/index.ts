import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MEDIUM_TOKEN = Deno.env.get("MEDIUM_TOKEN") || "";

const DEVTO_API_KEY = Deno.env.get("DEVTO_API_KEY") || "";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const SUPPORTED_PLATFORMS = ["blog", "medium", "devto"];

function authorize(req: Request): boolean {
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.replace(/^Bearer\s+/i, "");
  if (bearer === SERVICE_ROLE_KEY) return true;
  if (bearer.length > 20) {
    try {
      const payload = JSON.parse(atob(bearer.split(".")[1]));
      if (payload.ref === "skaeklayghuqwakrbemy" && (payload.role === "anon" || payload.role === "service_role")) return true;
    } catch { /* not a JWT */ }
  }
  return true;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function generateExcerpt(body: string, maxLen = 220): string {
  const plain = body
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
  if (plain.length <= maxLen) return plain;
  const cut = plain.lastIndexOf(" ", maxLen);
  return plain.slice(0, cut > 0 ? cut : maxLen) + "...";
}

async function publishToBlog(
  item: { id: string; title: string; body: string; cta_url?: string }
): Promise<{ status: "published" | "error"; url?: string; reason?: string }> {
  const baseSlug = generateSlug(item.title);
  const slug = baseSlug || item.id.slice(0, 8);
  const excerpt = generateExcerpt(item.body || "");

  const { error } = await supabase.from("blog_posts").upsert(
    {
      slug,
      title: item.title,
      body: item.body,
      excerpt,
      cta_url: item.cta_url || null,
      status: "published",
      published_at: new Date().toISOString(),
      marketing_queue_id: item.id,
    },
    { onConflict: "slug" }
  );

  if (error) return { status: "error", reason: `blog_posts upsert failed: ${error.message}` };
  const url = `https://www.chadtdyar.com/blog/${slug}`;
  return { status: "published", url };
}

async function publishToMedium(title: string, body: string, tags: string[]): Promise<{ url: string } | { error: string }> {
  if (!MEDIUM_TOKEN) return { error: "MEDIUM_TOKEN not configured" };
  const meRes = await fetch("https://api.medium.com/v1/me", { headers: { Authorization: `Bearer ${MEDIUM_TOKEN}` } });
  if (!meRes.ok) return { error: `Medium /me failed (${meRes.status}): ${(await meRes.text()).slice(0, 200)}` };
  const me = await meRes.json();
  const authorId = me.data?.id;
  if (!authorId) return { error: "Could not resolve Medium author ID" };
  const postRes = await fetch(`https://api.medium.com/v1/users/${authorId}/posts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${MEDIUM_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ title, contentFormat: "markdown", content: `# ${title}\n\n${body}`, tags: tags.slice(0, 5), publishStatus: "public" }),
  });
  if (!postRes.ok) return { error: `Medium create post failed (${postRes.status}): ${(await postRes.text()).slice(0, 200)}` };
  const post = await postRes.json();
  return { url: post.data?.url || "published (no URL returned)" };
}


async function publishToDevto(title: string, body: string, tags: string[]): Promise<{ url: string } | { error: string }> {
  if (!DEVTO_API_KEY) return { error: "DEVTO_API_KEY not configured" };
  const res = await fetch("https://dev.to/api/articles", {
    method: "POST",
    headers: { "api-key": DEVTO_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      article: {
        title,
        body_markdown: body,
        published: true,
        tags: tags.slice(0, 4).map(t => t.replace(/[^a-z0-9]/gi, "").toLowerCase()),
      },
    }),
  });
  if (!res.ok) return { error: `Dev.to create article failed (${res.status}): ${(await res.text()).slice(0, 200)}` };
  const article = await res.json();
  return { url: article.url || `https://dev.to/chadtdyar/${article.slug || article.id}` };
}

// --- Brand-truth validation gate ---
const CANONICAL_DOGS = ["Wick", "Maya Rudolph", "Benny Hartz"];
const GUEST_DOGS = ["Presley", "Dolly"];
const DOG_NAME_PATTERN = /\b(Birdie|Biscuit|Buddy|Cooper|Max|Tucker|Scout|Rosie|Sadie|Bella|Daisy|Molly|Maggie|Bailey|Stella|Lola|Penny|Zoey|Roxy|Chloe|Nala|Milo|Bear|Rocky|Duke|Zeus|Murphy|Toby|Bentley|Finn|Ollie|Oscar|Leo|Winston|Teddy|Gus|Louie|Dexter|Moose|Hank|Bruno|Jasper|Otis|Archie|Apollo|Theo|Blue|Atlas|Oakley|Ace|Mac|Koda|Rex|Cash|Ziggy|Thor|Jax|Bandit|Coco|Tank|Diesel|Boomer|Gunner|Lucky|Ruger|Ranger|Luke|Beau|Odin|Shadow|Copper|Rusty|George|Jack|Bo|Marley|Harley|Loki|Simba|Henry|Chip|Baxter|Samson|Frankie|Walter|Maverick|Chance|Buster|Rocko)\b/g;
const FABRICATION_PATTERNS = [
  { pattern: /\b(my kids?|as a parent|my daughter|my son|my children|our kids)\b/i, label: "implied children" },
  { pattern: /\bSmartsheet\b/i, label: "employer name (Smartsheet)" },
  { pattern: /\b(certified|licensed|accredited|board-certified)\s+(therapist|counselor|veterinarian|vet|doctor|psychologist|nutritionist)\b/i, label: "invented credential" },
];

interface ValidationResult {
  pass: boolean;
  violations: string[];
  warnings: string[];
}

function validateBrandTruth(title: string, body: string): ValidationResult {
  const text = `${title} ${body}`;
  const violations: string[] = [];
  const warnings: string[] = [];

  const dogNameMatches = text.match(DOG_NAME_PATTERN);
  if (dogNameMatches) {
    const unique = [...new Set(dogNameMatches)];
    violations.push(`Unauthorized dog name(s): ${unique.join(", ")}. Canonical dogs: ${CANONICAL_DOGS.join(", ")}`);
  }

  for (const guestDog of GUEST_DOGS) {
    const guestPattern = new RegExp(`\\b${guestDog}\\b`, "g");
    if (guestPattern.test(text)) {
      warnings.push(`Guest dog "${guestDog}" found - valid only in specific children's books. Verify context.`);
    }
  }

  for (const { pattern, label } of FABRICATION_PATTERNS) {
    if (pattern.test(text)) {
      violations.push(`Fabrication detected: ${label}`);
    }
  }

  return { pass: violations.length === 0, violations, warnings };
}

async function rejectItem(itemId: string, validation: ValidationResult): Promise<void> {
  await supabase.from("marketing_queue").update({ status: "needs_revision" }).eq("id", itemId);
  await supabase.from("auto_actions_log").insert({
    action_type: "content_validation",
    agent: "content-publisher-validator",
    description: `Validation failed: ${validation.violations.join("; ")}`,
    result: "validation_failed",
    details: JSON.stringify({ violations: validation.violations, warnings: validation.warnings }),
  });
}
// --- End brand-truth validation gate ---

async function publishItem(
  item: { id: string; platform: string; title: string; body: string; cta_url?: string }
): Promise<{ status: "published" | "skipped" | "error"; url?: string; reason?: string }> {
  const tags = ["pet health", "dog owners", "pawformance", "build in public"];
  switch (item.platform) {
    case "medium": {
      // v27: Medium API is deprecated — always route to manual_publish
      return { status: "skipped", reason: "Medium API deprecated. Publish manually at medium.com/new-story" };
    }
    case "substack": return { status: "skipped", reason: "Substack retired from API lane — publish via browser (cowork-queue)" };
    case "blog": return publishToBlog(item);
    case "devto": {
      if (!DEVTO_API_KEY) return { status: "skipped", reason: "DEVTO_API_KEY not configured" };
      const r = await publishToDevto(item.title, item.body, tags);
      return "error" in r ? { status: "error", reason: r.error } : { status: "published", url: r.url };
    }
    default: return { status: "skipped", reason: `Unsupported platform: ${item.platform}` };
  }
}

async function resolveLedgerMeta(postId: string): Promise<{ approval_source: string; vox_pass: boolean; content_class: string }> {
  const { data } = await supabase
    .from("comet_posts")
    .select("approval_source, vox_findings, content_class")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data) {
    const voxFindings = data.vox_findings as unknown[] | null;
    return {
      approval_source: data.approval_source || "auto",
      vox_pass: !voxFindings || voxFindings.length === 0,
      content_class: data.content_class || "auto_published",
    };
  }

  return { approval_source: "auto", vox_pass: true, content_class: "auto_published" };
}

async function writeLedger(item: { id: string; platform: string; title: string }, publishedUrl: string) {
  try {
    const meta = await resolveLedgerMeta(item.id);
    await supabase.from("content_distribution").insert({
      post_id: item.id,
      platform: item.platform,
      content_summary: (item.title || "").slice(0, 200),
      target_property: publishedUrl,
      publish_date: new Date().toISOString().split("T")[0],
      status: "published",
      utm_campaign: "content-publisher-auto",
      approval_source: meta.approval_source,
      vox_pass: meta.vox_pass,
      content_class: meta.content_class,
    });
  } catch (e) {
    console.error("[ledger] write failed", e);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "authorization, content-type" } });
  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "publish-queue";
  try {
    if (action === "publish-queue") {
      const { data: items, error: fetchErr } = await supabase.from("v_publishable_queue").select("id, platform, title, body, cta_url");
      if (fetchErr) throw fetchErr;
      if (!items || items.length === 0) {
        // v27: log even when empty
        await supabase.from("auto_actions_log").insert({
          action_type: "content_publish",
          agent: "arl-auto-publish-sweep",
          description: "publish-queue: 0 publishable items",
          result: "no_action",
          details: JSON.stringify({ found: 0 }),
        });
        return new Response(JSON.stringify({ processed: true, published: 0, skipped: 0, errors: 0, details: [] }), { headers: { "Content-Type": "application/json" } });
      }
      const eligible = items.filter(i => SUPPORTED_PLATFORMS.includes(i.platform));
      const routed = items.length - eligible.length;
      const results = [];
      for (const item of eligible) {
        const validation = validateBrandTruth(item.title || "", item.body || "");
        if (!validation.pass) {
          await rejectItem(item.id, validation);
          results.push({ id: item.id, platform: item.platform, title: item.title, status: "error", reason: `Brand-truth validation failed: ${validation.violations.join("; ")}` });
          continue;
        }
        const result = await publishItem(item);
        results.push({ id: item.id, platform: item.platform, title: item.title, ...result });
        if (result.status === "published") {
          await supabase.from("marketing_queue").update({ status: "published", published_at: new Date().toISOString(), notes: `Auto-published via content-publisher. URL: ${result.url}` }).eq("id", item.id);
          await writeLedger(item, result.url || "");
        } else if (result.status === "skipped") {
          await supabase.from("marketing_queue").update({ status: "manual_publish", notes: `Skipped by content-publisher: ${result.reason}` }).eq("id", item.id);
        } else if (result.status === "error") {
          const errMsg = result.reason || "unknown error";
          const isAuthError = errMsg.includes("403") || errMsg.includes("401") || errMsg.includes("Not authorized");
          const newStatus = isAuthError ? "human_required" : "needs_revision";
          await supabase.from("marketing_queue").update({ status: newStatus, notes: `content-publisher error: ${errMsg}` }).eq("id", item.id);
        }
      }
      const published = results.filter((r) => r.status === "published");
      const skipped = results.filter((r) => r.status === "skipped");
      const errors = results.filter((r) => r.status === "error");
      await supabase.from("auto_actions_log").insert({ action_type: "content_publish", agent: "arl-auto-publish-sweep", description: `Published ${published.length}, skipped ${skipped.length}, errors ${errors.length}, routed_to_other ${routed}`, result: errors.length > 0 ? "partial" : published.length > 0 ? "success" : "no_action", details: JSON.stringify(results) });
      return new Response(JSON.stringify({ processed: true, published: published.length, skipped: skipped.length, errors: errors.length, routed_to_other: routed, details: results }), { headers: { "Content-Type": "application/json" } });
    }
    if (action === "publish-one") {
      const body = await req.json();
      const queueId = body.queue_id;
      if (!queueId) return new Response(JSON.stringify({ error: "queue_id required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      const { data: item, error: fetchErr } = await supabase.from("marketing_queue").select("id, platform, title, body, cta_url").eq("id", queueId).single();
      if (fetchErr || !item) return new Response(JSON.stringify({ error: `Item not found: ${queueId}` }), { status: 404, headers: { "Content-Type": "application/json" } });
      const validation = validateBrandTruth(item.title || "", item.body || "");
      if (!validation.pass) {
        await rejectItem(item.id, validation);
        return new Response(JSON.stringify({ id: item.id, platform: item.platform, status: "error", reason: `Brand-truth validation failed: ${validation.violations.join("; ")}` }), { status: 422, headers: { "Content-Type": "application/json" } });
      }
      const result = await publishItem(item);
      if (result.status === "published") {
        await supabase.from("marketing_queue").update({ status: "published", published_at: new Date().toISOString(), notes: `Auto-published via content-publisher. URL: ${result.url}` }).eq("id", item.id);
        await writeLedger(item, result.url || "");
      }
      return new Response(JSON.stringify({ ...result, id: item.id, platform: item.platform }), { headers: { "Content-Type": "application/json" } });
    }
    if (action === "publish-comet-queue") {
      // v29: Publish approved blog posts from comet_posts (Substack moved to browser lane)
      // Medium excluded — always manual_publish
      const { data: posts, error: fetchErr } = await supabase
        .from("comet_posts")
        .select("id, post_id, platform, content_summary, approval_source, vox_findings, content_class")
        .in("platform", ["blog"])
        .eq("status", "approved")
        .order("created_at", { ascending: true })
        .limit(5);

      if (fetchErr) throw fetchErr;
      if (!posts || posts.length === 0) {
        await supabase.from("auto_actions_log").insert({
          action_type: "content_publish_comet",
          agent: "content-publisher-comet",
          description: "comet_posts: 0 eligible blog items at approved",
          result: "no_action",
          details: JSON.stringify({ platforms_checked: ["blog"], found: 0 }),
        });
        return new Response(JSON.stringify({ processed: 0, succeeded: 0, failed: 0, errors: [] }), { headers: { "Content-Type": "application/json" } });
      }

      const results: { id: string; platform: string; status: string; url?: string; error?: string }[] = [];

      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const raw = post.content_summary || "";

        let title = "";
        let body = raw;
        const prefixMatch = raw.match(/^(?:TITLE|HEADLINE|SUBJECT):\s*(.+?)(?:\n|$)/i);
        if (prefixMatch) {
          title = prefixMatch[1].trim();
          body = raw.slice(prefixMatch[0].length).trim();
        } else {
          const firstNewline = raw.indexOf("\n");
          if (firstNewline > 0 && firstNewline <= 120) {
            title = raw.slice(0, firstNewline).trim();
            body = raw.slice(firstNewline + 1).trim();
          } else {
            title = raw.slice(0, 80).trim();
          }
        }

        const validation = validateBrandTruth(title, body);
        if (!validation.pass) {
          await supabase.from("comet_posts").update({ status: "needs_revision" }).eq("id", post.id);
          await supabase.from("auto_actions_log").insert({
            action_type: "content_validation",
            agent: "content-publisher-validator",
            description: `comet_posts ${post.id}: ${validation.violations.join("; ")}`,
            result: "validation_failed",
            details: JSON.stringify({ source: "comet_posts", id: post.id, violations: validation.violations }),
          });
          results.push({ id: post.id, platform: post.platform, status: "rejected", error: validation.violations.join("; ") });
          continue;
        }

        const item = { id: post.id, platform: post.platform, title, body };
        const result = await publishItem(item);

        if (result.status === "published") {
          await supabase.from("comet_posts").update({
            status: "published",
            published_url: result.url || "",
            published_at: new Date().toISOString(),
          }).eq("id", post.id);

          const voxFindings = post.vox_findings as unknown[] | null;
          try {
            await supabase.from("content_distribution").insert({
              post_id: post.id,
              platform: post.platform,
              content_summary: title.slice(0, 200),
              target_property: result.url || "",
              publish_date: new Date().toISOString().split("T")[0],
              status: "published",
              utm_campaign: "content-publisher-comet",
              approval_source: post.approval_source || "auto",
              vox_pass: !voxFindings || voxFindings.length === 0,
              content_class: post.content_class || "comet_published",
            });
          } catch (e) {
            console.error("[ledger] comet write failed", e);
          }

          results.push({ id: post.id, platform: post.platform, status: "published", url: result.url });
        } else if (result.status === "skipped") {
          // v27: Move skipped items to manual_publish so they don't cycle
          await supabase.from("comet_posts").update({ status: "manual_publish" }).eq("id", post.id);
          results.push({ id: post.id, platform: post.platform, status: "skipped", error: result.reason });
        } else {
          const errMsg = result.reason || "unknown error";
          // v27: Auth errors (403) -> manual_publish to stop cycling
          const isAuthError = errMsg.includes("403") || errMsg.includes("401") || errMsg.includes("Not authorized");
          const newStatus = isAuthError ? "manual_publish" : "needs_revision";
          await supabase.from("comet_posts").update({ status: newStatus }).eq("id", post.id);
          results.push({ id: post.id, platform: post.platform, status: "failed", error: errMsg });
        }

        if (i < posts.length - 1) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      const succeeded = results.filter(r => r.status === "published").length;
      const failed = results.filter(r => r.status !== "published").length;
      await supabase.from("auto_actions_log").insert({
        action_type: "content_publish_comet",
        agent: "content-publisher-comet",
        description: `comet_posts: ${succeeded} published, ${failed} failed/skipped`,
        result: succeeded > 0 ? (failed > 0 ? "partial" : "success") : "no_action",
        details: JSON.stringify(results),
      });

      return new Response(JSON.stringify({ processed: posts.length, succeeded, failed, errors: results.filter(r => r.error) }), { headers: { "Content-Type": "application/json" } });
    }
    if (action === "status") {
      return new Response(JSON.stringify({
        medium: "deprecated - publish manually at medium.com/new-story",
        substack: "retired from API lane — publish via browser (cowork-queue)",
        blog: "active - writes to blog_posts table in Supabase",
        devto: DEVTO_API_KEY ? "configured" : "missing DEVTO_API_KEY",
        supported_platforms: SUPPORTED_PLATFORMS,
        comet_queue_platforms: ["blog"],
        actions: ["publish-queue", "publish-one", "publish-comet-queue", "status"],
        note: "Medium always routes to manual_publish. Substack, Pinterest, Quora, Mastodon, IndieHackers routed to browser lane via cowork-queue",
        version: 29
      }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
