import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") || "";
const AGENT_SECRET = Deno.env.get("AGENT_SHARED_SECRET") || "";
const MAX_PER_RUN = 5;
const STALENESS_DAYS = 30;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ======================================================================
// POST-GENERATION CLEANUP
// ======================================================================

function cleanArtifacts(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/<budget:[^>]*>[\s\S]*?<\/budget:[^>]*>/g, "");
  cleaned = cleaned.replace(/<(?:token_budget|thinking|internal|meta|system)[^>]*>[\s\S]*?<\/(?:token_budget|thinking|internal|meta|system)[^>]*>/g, "");
  cleaned = cleaned.replace(/^(?:Unfortunately I need to revise|Let me revise|I need to reconsider|Wait,? (?:let me|I should)).*$/gm, "");
  cleaned = cleaned.replace(/<\/?(?:budget|token_budget|thinking|internal|meta|system)[^>]*>/g, "");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  // v23: strip em/en dashes
  cleaned = cleaned.replace(/[\u2014\u2013]/g, ",");
  return cleaned.trim();
}

// ======================================================================
// VOX VOICE GOVERNOR
// ======================================================================

interface VoxResult {
  pass: boolean;
  findings: string[];
}

// v25: Added quora and indiehackers to CLASS_MAP to stop infinite loop
const CLASS_MAP: Record<string, string> = {
  mastodon: "social",
  bluesky: "social",
  devto: "social",
  pinterest: "social",
  threads: "social",
  facebook: "social",
  instagram: "social",
  quora: "social",
  indiehackers: "social",
  blog: "blog",
  medium: "newsletter",
  substack: "newsletter",
};

const RULE_MAP: Record<string, string> = {
  social: "content_auto_approve_social",
  blog: "content_auto_approve_blog",
  newsletter: "content_auto_approve_longform",
  book_promo: "content_auto_approve_book_promo",
};

const NEVER_AUTO = new Set(["linkedin", "convertkit"]);

function checkEmDashes(text: string): string[] {
  if (/[\u2014\u2013]/.test(text)) return ["Em/en dash found. Use commas, periods, colons, or parentheses."];
  return [];
}

function checkStackedNegatives(text: string): string[] {
  const negStarts = /^(Not |Isn't |Wasn't |Don't |Doesn't |Didn't |Won't |Can't |Couldn't |Shouldn't |Wouldn't |Haven't |Hasn't |Hadn't |No |Neither |Never |Nor )/i;
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (let i = 0; i < sentences.length - 1; i++) {
    if (negStarts.test(sentences[i].trim()) && negStarts.test(sentences[i + 1].trim())) {
      return [`Stacked negatives: "${sentences[i].trim().slice(0, 40)}..." + "${sentences[i + 1].trim().slice(0, 40)}..."`];
    }
  }
  return [];
}

const BANNED_PHRASES = [
  "let's explore", "let's unpack", "let's dive into", "it's worth noting",
  "the key point is", "let me explain", "here's how", "i want to highlight",
  "in summary", "in conclusion", "moving forward", "that said",
  "at the end of the day", "when it comes to", "in terms of", "the fact that",
  "transformative", "leverage", "seamless", "robust", "scalable", "synergy",
  "paradigm shift", "holistic", "best-in-class", "game-changer", "disruptive",
  "stakeholder alignment", "value-add",
  "shed light on", "illuminate", "delve into", "paradigm",
  "generally speaking", "arguably", "it should be noted",
  "it's important to remember", "one could say", "in many ways",
  "furthermore", "moreover", "additionally", "in contrast",
  "on the other hand", "that being said", "with that in mind",
  "honestly", "deep dive", "unlock", "let's dive in",
];

function checkBannedPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  const hits: string[] = [];
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) hits.push(`Banned phrase: "${phrase}"`);
  }
  return hits;
}

// v23: Banned opener patterns
function checkOpenerPatterns(text: string): string[] {
  const firstLine = text.split("\n")[0].trim();
  const lower = firstLine.toLowerCase();
  const hits: string[] = [];

  if (/^\d+\s+years?\s+(in|of|as)\s+/i.test(firstLine)) {
    hits.push(`Banned opener: credential-first ("${firstLine.slice(0, 50)}..."). Start with a specific moment.`);
  }
  if (/^i almost\s+/i.test(firstLine)) {
    hits.push(`Banned opener: performative vulnerability ("${firstLine.slice(0, 50)}..."). Start with the moment itself.`);
  }
  if (lower.startsWith("let me tell you about") || lower.startsWith("here's the thing about")) {
    hits.push(`Banned opener: patronizing setup ("${firstLine.slice(0, 50)}...")`);
  }
  if (/^in today'?s\s+(landscape|world|environment|market|economy)/i.test(firstLine)) {
    hits.push(`Banned opener: corporate filler ("${firstLine.slice(0, 50)}...")`);
  }
  if (/^if you'?re like most\s+/i.test(firstLine)) {
    hits.push(`Banned opener: false solidarity ("${firstLine.slice(0, 50)}...")`);
  }
  if (firstLine.endsWith("?")) {
    const secondLine = (text.split("\n")[1] || "").trim().toLowerCase();
    if (secondLine.startsWith("the answer") || secondLine.startsWith("it's ") || secondLine.startsWith("well,")) {
      hits.push(`Banned opener: rhetorical question with immediate answer. Start with the insight.`);
    }
  }

  return hits;
}

const FACT_RULES = [
  { pattern: /\b16\s+books?\b|\bsixteen\s+books?\b/i, msg: "Must say 15 books, not 16" },
  { pattern: /\bcontentforge\.com\b/i, msg: "Wrong URL: use contentforgehq.com" },
  { pattern: /\bhue-pilot-pro\.lovable\.app\b/i, msg: "Wrong URL: use palettepro.design" },
  { pattern: /\bpalettepro\.com\b/i, msg: "Wrong URL: use palettepro.design" },
  { pattern: /\b(?:my |our |his )(?:kids?|children|daughters?|sons?)\b/i, msg: "Chad has no children" },
  { pattern: /\b(?:husband|wife)\b/i, msg: "Tony is Chad's partner, never husband/wife" },
  { pattern: /\bSmartsheet\b/i, msg: "Never mention employer" },
  { pattern: /\[\s*(?:INSERT|PLACEHOLDER|YOUR|NAME|TITLE)/i, msg: "Template prefix found" },
  { pattern: /\{\{\s*\w+\s*\}\}/i, msg: "Template placeholder found" },
  { pattern: /\bfour dogs\b|\b4 dogs\b|\btwo dogs\b|\b2 dogs\b/i, msg: "Chad has THREE dogs" },
  { pattern: /\bStanford\s+GSB\b|\bStanford\s+MBA\b|\bStanford.*Graduate School of Business\b/i, msg: "Stanford design thinking cert only" },
  { pattern: /\bworked at Forbes\b|\bForbes\s+employee\b/i, msg: "Forbes contributor, not employee" },
  { pattern: /\bdog book(?:s)?\b/i, msg: "Never call them 'dog books'" },
  { pattern: /\bGlobal Head\b|\bHead of Sales Enablement\b/i, msg: "Never mention corporate job title" },
];

function checkFactCanon(text: string): string[] {
  const hits: string[] = [];
  for (const rule of FACT_RULES) {
    if (rule.pattern.test(text)) hits.push(rule.msg);
  }
  return hits;
}

const CASEL_CANON: Record<string, string> = {
  "the wiggles, the woofs, and the why": "Self-Awareness",
  "the bark, the snort, and the squeak": "Emotional Regulation",
  "the sparkle, the snuggle, and the song": "Relationship Skills",
  "the park, the lap, and the pup cup": "Decision-Making",
  "the spiderhands, the bag monster, and the blanket snakes": "Courage and Facing Fears",
};

function checkCaselMapping(text: string): string[] {
  const lower = text.toLowerCase();
  const hits: string[] = [];
  for (const [title, competency] of Object.entries(CASEL_CANON)) {
    const titleSlice = title.slice(0, 20);
    if (lower.includes(titleSlice)) {
      const wrongComps = Object.values(CASEL_CANON).filter(c => c !== competency);
      for (const wrong of wrongComps) {
        if (lower.includes(wrong.toLowerCase()) && !lower.includes(competency.toLowerCase())) {
          hits.push(`CASEL mismatch: "${title.slice(0, 30)}..." maps to ${competency}, not ${wrong}`);
        }
      }
    }
  }
  return hits;
}

function checkBlogSeo(text: string, platform: string): string[] {
  if (platform !== "blog") return [];
  const hits: string[] = [];
  if (text.length < 400) hits.push("Blog post under 400 chars; expected 800+ words");
  if (!/https?:\/\/(?:chadtdyar\.com|contentforgehq\.com|getpillpal\.app|thehomegrown\.app|pawformance\.app|momentumfit\.app|palettepro\.design)/.test(text)) {
    hits.push("Blog post missing internal/product link for SEO");
  }
  return hits;
}

async function checkDogNames(text: string): Promise<string[]> {
  const hits: string[] = [];
  try {
    const { data } = await supabase
      .from("brand_rules")
      .select("rule_value")
      .eq("rule_key", "dog_names")
      .single();
    if (!data?.rule_value) return hits;

    const namesPart = (data.rule_value as string).split(".")[0];
    const canonicalNames = namesPart.split(",").map(n => n.trim().toLowerCase()).filter(Boolean);

    const notNames = new Set(["my", "our", "his", "her", "the", "and", "but", "for", "with", "from", "this", "that", "when", "then", "just", "also", "even", "still", "each", "every", "some", "been", "have", "has", "had", "was", "were", "are", "not", "all", "can", "will", "one", "two", "three"]);

    const dogNamePatterns = [
      /\b(?:my |our |his |her |the )?(?:dog|pup|puppy|hound|pooch|canine|fur baby|furbaby)(?:'s)?\s+(?:named\s+)?([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+)*)/g,
      /\b([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+)*)\s*[,.]?\s*(?:my |our |his |the )?(?:dog|pup|puppy|hound|rescue|mutt)/g,
      /\b(?:named|called|meet)\s+([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+)*)/g,
    ];

    const mentionedNames = new Set<string>();
    for (const pat of dogNamePatterns) {
      let match;
      while ((match = pat.exec(text)) !== null) {
        const name = match[1].toLowerCase();
        if (!notNames.has(name)) mentionedNames.add(name);
      }
    }

    for (const mentioned of mentionedNames) {
      if (!canonicalNames.some(cn => cn === mentioned || cn.includes(mentioned) || mentioned.includes(cn))) {
        hits.push(`Fabricated dog name "${mentioned}" — canonical dogs are: ${namesPart}`);
      }
    }
  } catch (e) {
    console.error("[vox] dog name check failed", e);
  }
  return hits;
}

function voxReview(text: string, platform: string): VoxResult {
  const findings: string[] = [
    ...checkEmDashes(text),
    ...checkStackedNegatives(text),
    ...checkBannedPhrases(text),
    ...checkOpenerPatterns(text),
    ...checkFactCanon(text),
    ...checkCaselMapping(text),
    ...checkBlogSeo(text, platform),
  ];
  return { pass: findings.length === 0, findings };
}

// ======================================================================
// CAP + STRIKE + STALENESS CHECKS
// ======================================================================

async function getAutoApproveCount7d(): Promise<number> {
  const { count } = await supabase
    .from("content_distribution")
    .select("*", { count: "exact", head: true })
    .eq("approval_source", "auto")
    .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString());
  return count || 0;
}

async function getWeeklyCap(): Promise<number> {
  const { data } = await supabase
    .from("autonomy_rules")
    .select("conditions")
    .eq("action_type", "content_auto_approve_cap")
    .single();
  return (data?.conditions as Record<string, number>)?.weekly_cap ?? 12;
}

async function isClassStruck(contentClass: string): Promise<boolean> {
  const { data } = await supabase
    .from("auto_publish_strikes")
    .select("id")
    .eq("content_class", contentClass)
    .gte("revert_until", new Date().toISOString())
    .limit(1);
  return (data && data.length > 0) || false;
}

async function isClassReverted(contentClass: string): Promise<boolean> {
  const actionType = RULE_MAP[contentClass];
  if (!actionType) return false;
  const { data } = await supabase
    .from("autonomy_rules")
    .select("reverted_until")
    .eq("action_type", actionType)
    .single();
  if (!data?.reverted_until) return false;
  return new Date(data.reverted_until) > new Date();
}

function isStale(createdAt: string): boolean {
  const age = Date.now() - new Date(createdAt).getTime();
  return age > STALENESS_DAYS * 86400000;
}

// ======================================================================
// GATE DECISION
// ======================================================================

interface GateResult {
  status: string;
  approval_source: string | null;
  vox_pass: boolean;
  content_class: string | null;
  reason: string;
  vox_findings: string[];
}

async function gateDecision(
  text: string,
  platform: string,
  createdAt: string | null,
  currentAutoCount: number,
  weeklyCap: number,
): Promise<GateResult> {
  const contentClass = CLASS_MAP[platform] || null;

  if (NEVER_AUTO.has(platform)) {
    return { status: "human_required", approval_source: null, vox_pass: false, content_class: contentClass, reason: "platform_requires_human", vox_findings: [] };
  }

  if (!contentClass) {
    return { status: "human_required", approval_source: null, vox_pass: false, content_class: null, reason: "platform_not_in_approved_classes", vox_findings: [] };
  }

  if (createdAt && isStale(createdAt)) {
    return { status: "human_required", approval_source: null, vox_pass: false, content_class: contentClass, reason: "stale_content", vox_findings: [`Content created ${createdAt.split('T')[0]} is >30d old`] };
  }

  if (await isClassStruck(contentClass) || await isClassReverted(contentClass)) {
    return { status: "human_required", approval_source: null, vox_pass: false, content_class: contentClass, reason: "class_reverted", vox_findings: [] };
  }

  const vox = voxReview(text, platform);

  const dogHits = await checkDogNames(text);
  if (dogHits.length > 0) vox.findings.push(...dogHits);
  if (dogHits.length > 0) vox.pass = false;

  if (!vox.pass) {
    return { status: "human_required", approval_source: null, vox_pass: false, content_class: contentClass, reason: "vox_failed", vox_findings: vox.findings };
  }

  if (currentAutoCount >= weeklyCap) {
    return { status: "human_required", approval_source: null, vox_pass: true, content_class: contentClass, reason: "weekly_cap", vox_findings: [] };
  }

  return { status: "approved", approval_source: "auto", vox_pass: true, content_class: contentClass, reason: "vox_passed", vox_findings: [] };
}

// ======================================================================
// HELPERS
// ======================================================================

async function getBrandContext(): Promise<string> {
  try {
    const resp = await fetch(
      `${SUPABASE_URL}/functions/v1/brand-rules?action=prompt-context`,
      { headers: { "x-agent-secret": AGENT_SECRET } }
    );
    if (!resp.ok) return "[brand-rules unavailable]";
    const data = await resp.json();
    return data.context || "[no context returned]";
  } catch {
    return "[brand-rules fetch failed]";
  }
}

async function callClaude(systemPrompt: string, userPrompt: string): Promise<{ ok: boolean; text?: string; error?: string }> {
  if (!ANTHROPIC_API_KEY) return { ok: false, error: "ANTHROPIC_API_KEY not set" };
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      return { ok: false, error: `Claude API ${resp.status}: ${errText.slice(0, 200)}` };
    }
    const data = await resp.json();
    const text = data.content?.[0]?.text || "";
    return { ok: true, text: cleanArtifacts(text) };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

const QUALITY_RULES = `
QUALITY RULES (apply to all content):
- No em dashes or en dashes. Use commas, periods, colons, or parentheses.
- Every piece must contain at least one specific detail unique to Chad: a dog name (Wick, Maya Rudolph, Benny Hartz), an app name, a book title, or a specific number from his life.
- The last line must land a specific insight, point to an asset, or ask a question. Never end with vague reflection.
- If you can replace "Chad" with any other builder's name and the piece still works, it's not specific enough.

BANNED OPENERS (never start a piece with):
- "[Number] years in [field], and I've..." (credential-first)
- "I almost [dramatic verb] the [thing]" (performative vulnerability)
- "Let me tell you about..." or "Here's the thing about..."
- "In today's [landscape/world/environment]..."
- "If you're like most [people/founders]..."
- A rhetorical question that the next sentence answers

REQUIRED OPENERS (start with one of):
- A specific moment: time, place, sensory detail, or a line of dialogue
- A concrete number or fact that creates tension
- A statement the reader might disagree with
- An action Chad took, in one sentence

CTA ROUTING (weave naturally, never as a billboard):
- Leadership/sales/coaching content -> mention the relevant book: "I wrote about this in [title]" with chadtdyar.com/books/[slug]
- Dog/parenting/SEL content -> mention the relevant Heart Dog book
- App building/shipping/indie hacking -> link to chadtdyar.com
- Specific app mentioned -> link to that app's domain
- Writing/daily practice -> mention Lab Notes (Substack)

BOOK SLUGS: how-to-talk-to-humans, think-on-your-feet-land-on-your-numbers, bring-your-best-self-to-work, performance-is-personal, performance-whisperer, performance-amplified, humbled-to-announce, the-wiggles-woofs-and-why, the-bark-snort-and-squeak, the-sparkle-snuggle-song, the-lap-park-pup-cup, the-spiderhands-bag-monster-blanket-snakes, the-deliberate-breath, the-nightmare-trilogy, the-gospel-trilogy
APP DOMAINS: contentforgehq.com, carecadence.app, pawformance.app, momentumfit.app, thehomegrown.app, palettepro.design
`;

function buildPrompt(item: Record<string, unknown>): string {
  const platform = item.platform as string;
  const title = item.title as string || "";
  const body = item.body as string || "";
  const ctaUrl = item.cta_url as string || "";
  const ctaText = item.cta_text as string || "";
  const contentType = item.content_type as string || "post";
  const hasFullBody = body.length > 100;

  if (hasFullBody) {
    return `You are Chad Dyar's writing assistant. POLISH this approved ${platform} ${contentType}, not rewrite it. Preserve voice, stories, structure. Fix only: voice rule violations, factual errors, rough edges.\n\n${QUALITY_RULES}\n\nTitle: ${title}\n\nApproved draft:\n${body}\n\n${ctaUrl ? `CTA: ${ctaText || ""} -> ${ctaUrl}` : ""}\n\nReturn ONLY the final post text. No preamble, no code fences.`;
  }

  return `You are Chad Dyar's writing assistant. Write a ${platform} ${contentType} based on this brief.\n\nTitle/topic: ${title}\n${body ? `Notes: ${body}` : ""}\n${ctaUrl ? `CTA: ${ctaText || ""} -> ${ctaUrl}` : ""}\n\n${QUALITY_RULES}\n\nPlatform rules:\n- ${platform === "linkedin" ? "Professional tone, 1200-1500 chars, hashtags" : ""}\n- ${platform === "blog" ? "Long-form, 800-1500 words, SEO-friendly, personal storytelling. Must include at least one internal link to chadtdyar.com/books/ or an app domain." : ""}\n- ${platform === "devto" ? "Developer audience, technical framing, 300-800 words" : ""}\n- ${platform === "mastodon" ? "Short, conversational, max 500 chars, include link" : ""}\n- ${platform === "bluesky" ? "Short, conversational, max 280 chars, include link" : ""}\n- ${platform === "medium" ? "Essay format, 600-1200 words, personal narrative" : ""}\n- ${platform === "substack" ? "Newsletter format, personal voice, 800-1500 words" : ""}\n- ${platform === "pinterest" ? "Pin description, 220-500 chars, keyword-rich. MINIMUM 220 characters. The database enforces a 200-char floor; write a full, vivid description that earns its length." : ""}\n- ${platform === "quora" ? "Answer format, 200-500 words, experience-first not theory-first. Start with a specific moment from Chad's career, not a credential." : ""}\n- ${platform === "indiehackers" ? "Builder community, milestone/learning format, include real numbers, 200-600 words." : ""}\n\nReturn ONLY the final post text. No preamble, no code fences.`;
}

async function writeLedger(postId: string, platform: string, contentSummary: string, gate: GateResult) {
  if (platform === "linkedin") return;

  try {
    await supabase.from("content_distribution").insert({
      post_id: postId,
      platform,
      content_summary: contentSummary.slice(0, 200),
      publish_date: new Date().toISOString().split("T")[0],
      status: "queued",
      utm_campaign: gate.approval_source === "auto" ? "vox-auto-approve" : "link-writer-auto",
      approval_source: gate.approval_source || "human",
      vox_pass: gate.vox_pass,
      content_class: gate.content_class,
    });
  } catch (e) {
    console.error("[ledger] write failed", e);
  }
}

// ======================================================================
// ACTION: run -- process marketing_queue -> comet_posts
// ======================================================================

async function processQueue(dryRun: boolean): Promise<Record<string, unknown>> {
  const brandContext = await getBrandContext();
  const weeklyCap = await getWeeklyCap();
  let currentAutoCount = await getAutoApproveCount7d();

  // v24: also pick up 'written' status (Vivian output)
  const { data: items, error: fetchErr } = await supabase
    .from("marketing_queue")
    .select("*")
    .in("status", ["approved", "edited", "written"])
    .order("created_at", { ascending: true })
    .limit(MAX_PER_RUN);

  if (fetchErr) throw fetchErr;
  if (!items || items.length === 0) {
    return { processed: 0, auto_approved: 0, flagged: 0, errors: 0, details: [] };
  }

  const results = [];
  let autoApproved = 0;
  let flagged = 0;
  let errors = 0;

  for (const item of items) {
    const platform = (item.platform as string || "").toLowerCase();
    const title = item.title as string || "";

    if (dryRun) {
      results.push({ id: item.id, platform, title, action: "dry_run" });
      continue;
    }

    const userPrompt = buildPrompt(item);
    const claudeResult = await callClaude(brandContext, userPrompt);

    if (!claudeResult.ok) {
      results.push({ id: item.id, platform, title, action: "error", error: claudeResult.error });
      errors++;
      continue;
    }

    const draft = claudeResult.text || "";
    const gate = await gateDecision(draft, platform, new Date().toISOString(), currentAutoCount, weeklyCap);

    // v26: Set post_id to activate UNIQUE constraint and prevent duplicate inserts
    const postId = `mq-${item.id}-${platform}`;

    const { error: insertErr } = await supabase.from("comet_posts").insert({
      post_id: postId,
      platform,
      content_summary: draft,
      status: gate.status,
      campaign: `mq_${item.id}`,
      approval_source: gate.approval_source || (NEVER_AUTO.has(platform) ? null : "vox_reviewed"),
      vox_findings: gate.vox_findings.length > 0 ? gate.vox_findings : null,
      content_class: gate.content_class,
    });

    if (insertErr) {
      // v26: If it's a unique constraint violation, the item already exists — skip, don't error
      if (insertErr.message?.includes("duplicate key") || insertErr.message?.includes("23505")) {
        results.push({ id: item.id, platform, title, action: "skipped_duplicate", error: "Already exists in comet_posts" });
        // Still update marketing_queue status so it doesn't get re-picked
        await supabase.from("marketing_queue").update({
          status: "ready",
          notes: ((item.notes as string) || "") + ` | Skipped (duplicate) ${new Date().toISOString().split("T")[0]}`,
        }).eq("id", item.id);
        continue;
      }
      results.push({ id: item.id, platform, title, action: "error", error: insertErr.message });
      errors++;
      continue;
    }

    const notesSuffix = gate.status === "approved"
      ? ` | Vox auto-approved ${new Date().toISOString().split("T")[0]}`
      : ` | Written ${new Date().toISOString().split("T")[0]} (${gate.reason})`;

    // v24: set to 'ready' after processing (not 'written') to avoid re-pickup
    await supabase.from("marketing_queue").update({
      status: "ready",
      notes: ((item.notes as string) || "") + notesSuffix,
    }).eq("id", item.id);

    await writeLedger(item.id as string, platform, title, gate);

    if (gate.status === "approved") {
      autoApproved++;
      currentAutoCount++;
      results.push({ id: item.id, platform, title, action: "vox_auto_approved" });
    } else {
      flagged++;
      results.push({ id: item.id, platform, title, action: "human_required", reason: gate.reason, findings: gate.vox_findings });
    }
  }

  return { processed: items.length, auto_approved: autoApproved, flagged, errors, details: results };
}

// ======================================================================
// ACTION: calendar-run
// ======================================================================

async function calendarRun(dryRun: boolean): Promise<Record<string, unknown>> {
  const { data: calItems, error: calErr } = await supabase
    .from("content_calendar")
    .select("*")
    .eq("status", "planned")
    .lte("week_start", new Date().toISOString().split("T")[0])
    .neq("content_type", "review")
    .order("week_start", { ascending: true })
    .limit(MAX_PER_RUN);

  if (calErr) throw calErr;
  if (!calItems || calItems.length === 0) {
    return { processed: 0, drafted: 0, errors: 0, details: [], message: "No planned calendar items due" };
  }

  const brandContext = await getBrandContext();
  const results = [];
  let drafted = 0;
  let errors = 0;

  for (const cal of calItems) {
    const platform = (cal.platform as string || "").toLowerCase();
    const title = cal.title_target as string || "";
    const appFocus = cal.app_focus as string || "";
    const contentType = cal.content_type as string || "post";

    if (dryRun) {
      results.push({ calendar_id: cal.id, platform, title, action: "dry_run" });
      continue;
    }

    const platformMap: Record<string, string> = {
      "reddit": "reddit",
      "twitter/x": "twitter",
      "dev.to": "devto",
      "hacker news": "hackernews",
      "indie hackers": "indiehackers",
      "directories": "directory",
    };
    const normalizedPlatform = platformMap[platform] || platform;

    const userPrompt = `You are Chad Dyar's writing assistant. Write a ${normalizedPlatform} ${contentType} based on this content calendar plan.\n\nTitle/topic: ${title}\nApp focus: ${appFocus}\nContent type: ${contentType}\nTarget platform: ${normalizedPlatform}\n\n${QUALITY_RULES}\n\nPlatform rules:\n- reddit: Authentic, problem-first framing. No marketing language. Ask for feedback. 200-500 words.\n- twitter: Thread format if build_thread (5-7 tweets, numbered). Single tweet if post. Conversational.\n- devto: Developer audience, technical framing, 300-800 words, include code/architecture details.\n- hackernews: Show HN format, concise, technical, honest about tradeoffs.\n- indiehackers: Milestone/learning format, include real numbers.\n- blog: Long-form, 800-1500 words, SEO-friendly, personal storytelling.\n- bluesky: Short, conversational, max 280 chars, include link.\n- quora: Answer format, 200-500 words, experience-first. Start with a specific moment, not a credential.\n\nReturn ONLY the final post text. No preamble, no code fences.`;

    const claudeResult = await callClaude(brandContext, userPrompt);

    if (!claudeResult.ok) {
      results.push({ calendar_id: cal.id, platform, title, action: "error", error: claudeResult.error });
      errors++;
      continue;
    }

    const draft = claudeResult.text || "";

    const { data: mqRow, error: mqErr } = await supabase.from("marketing_queue").insert({
      platform: normalizedPlatform,
      title,
      body: draft,
      content_type: contentType,
      status: "manual_publish",
      source: "link",
      notes: `Generated from calendar W${cal.week_number} for ${appFocus}`,
    }).select("id").single();

    if (mqErr) {
      results.push({ calendar_id: cal.id, platform, title, action: "error", error: mqErr.message });
      errors++;
      continue;
    }

    await supabase.from("content_calendar").update({
      status: "drafted",
      post_id: mqRow?.id || null,
    }).eq("id", cal.id);

    drafted++;
    results.push({ calendar_id: cal.id, platform, title, action: "drafted", queue_id: mqRow?.id });
  }

  return { processed: calItems.length, drafted, errors, details: results };
}

// ======================================================================
// ACTION: drain
// ======================================================================

async function drainBacklog(): Promise<Record<string, unknown>> {
  const weeklyCap = await getWeeklyCap();
  let currentAutoCount = await getAutoApproveCount7d();
  const eligiblePlatforms = Object.keys(CLASS_MAP);

  const { data: items, error } = await supabase
    .from("comet_posts")
    .select("*")
    .in("status", ["manual_publish", "human_required"])
    .in("platform", eligiblePlatforms)
    .is("approval_source", null)
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) throw error;
  if (!items || items.length === 0) {
    return { processed: 0, approved: 0, held: 0, details: [] };
  }

  const results = [];
  let approved = 0;
  let held = 0;

  for (const item of items) {
    const platform = (item.platform as string || "").toLowerCase();
    const text = (item.content_summary as string) || "";
    const createdAt = item.created_at as string;

    if (!text) {
      results.push({ id: item.id, platform, action: "skipped_no_content" });
      held++;
      continue;
    }

    const gate = await gateDecision(text, platform, createdAt, currentAutoCount, weeklyCap);

    await supabase.from("comet_posts").update({
      status: gate.status,
      approval_source: gate.approval_source || "vox_reviewed",
      vox_findings: gate.vox_findings.length > 0 ? gate.vox_findings : null,
      content_class: gate.content_class,
    }).eq("id", item.id);

    if (gate.status === "approved") {
      await writeLedger(item.id as string, platform, text.slice(0, 200), gate);
      approved++;
      currentAutoCount++;
      results.push({ id: item.id, platform, action: "vox_auto_approved" });
    } else {
      held++;
      results.push({ id: item.id, platform, action: "held", reason: gate.reason, findings: gate.vox_findings });
    }
  }

  return { processed: items.length, approved, held, remaining_cap: weeklyCap - currentAutoCount, details: results };
}

// ======================================================================
// ACTION: strike
// ======================================================================

async function recordStrike(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const contentClass = body.content_class as string;
  const reason = body.reason as string;
  const defectRef = body.defect_ref as string || null;

  if (!contentClass || !reason) {
    return { ok: false, error: "content_class and reason required" };
  }

  const { error: strikeErr } = await supabase.from("auto_publish_strikes").insert({
    content_class: contentClass,
    reason,
    defect_ref: defectRef,
    created_by: "link-writer",
  });

  if (strikeErr) return { ok: false, error: strikeErr.message };

  const actionType = RULE_MAP[contentClass];
  if (actionType) {
    const revertUntil = new Date(Date.now() + 14 * 86400000).toISOString();
    await supabase.from("autonomy_rules").update({
      reverted_until: revertUntil,
    }).eq("action_type", actionType);
  }

  await supabase.from("auto_actions_log").insert({
    action_type: "strike_recorded",
    agent: "link-writer-cron",
    result: "success",
    description: `Strike on class '${contentClass}': ${reason}. 14-day revert active.`,
    details: { content_class: contentClass, reason, defect_ref: defectRef },
  });

  return { ok: true, content_class: contentClass, reverted_for: "14 days" };
}

// ======================================================================
// HTTP HANDLER
// ======================================================================

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "authorization, content-type" },
    });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "run";
  const dryRun = url.searchParams.get("dry_run") === "true";

  try {
    if (action === "run") {
      const result = await processQueue(dryRun);
      await supabase.from("auto_actions_log").insert({
        action_type: "content_write",
        agent: "link-writer-cron",
        description: `Writer sweep: ${result.auto_approved} vox-auto, ${result.flagged} held, ${result.errors} errors${dryRun ? " (DRY RUN)" : ""}`,
        result: (result.errors as number) > 0 ? "partial" : (result.auto_approved as number) > 0 || (result.flagged as number) > 0 ? "success" : "no_action",
        details: result,
      });
      return new Response(JSON.stringify({ ok: true, ...result }), { headers: { "Content-Type": "application/json" } });
    }

    if (action === "calendar-run") {
      const result = await calendarRun(dryRun);
      await supabase.from("auto_actions_log").insert({
        action_type: "calendar_content_write",
        agent: "link-writer-cron",
        description: `Calendar run: ${result.drafted} drafted, ${result.errors} errors${dryRun ? " (DRY RUN)" : ""}`,
        result: (result.errors as number) > 0 ? "partial" : (result.drafted as number) > 0 ? "success" : "no_action",
        details: result,
      });
      return new Response(JSON.stringify({ ok: true, ...result }), { headers: { "Content-Type": "application/json" } });
    }

    if (action === "drain") {
      const result = await drainBacklog();
      await supabase.from("auto_actions_log").insert({
        action_type: "backlog_drain",
        agent: "link-writer-cron",
        description: `Backlog drain: ${result.approved} auto-approved, ${result.held} held, cap remaining: ${result.remaining_cap}`,
        result: (result.approved as number) > 0 ? "success" : "no_action",
        details: result,
      });
      return new Response(JSON.stringify({ ok: true, ...result }), { headers: { "Content-Type": "application/json" } });
    }

    if (action === "strike") {
      const body = await req.json();
      const result = await recordStrike(body);
      return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" }, status: result.ok ? 200 : 400 });
    }

    if (action === "vox-check") {
      const body = await req.json();
      const result = voxReview(body.text || "", body.platform || "general");
      const dogHits = await checkDogNames(body.text || "");
      if (dogHits.length > 0) {
        result.findings.push(...dogHits);
        result.pass = false;
      }
      return new Response(JSON.stringify({ ok: true, ...result }), { headers: { "Content-Type": "application/json" } });
    }

    if (action === "status") {
      const { count: approvedCount } = await supabase
        .from("marketing_queue")
        .select("*", { count: "exact", head: true })
        .in("status", ["approved", "edited", "written"]);
      const autoCount7d = await getAutoApproveCount7d();
      const cap = await getWeeklyCap();

      const { data: strikes } = await supabase
        .from("auto_publish_strikes")
        .select("content_class, revert_until")
        .gte("revert_until", new Date().toISOString());

      const { data: calStatus } = await supabase
        .from("content_calendar")
        .select("status")
        .lte("week_start", new Date().toISOString().split("T")[0]);

      const calCounts: Record<string, number> = {};
      (calStatus || []).forEach((r: { status: string }) => {
        calCounts[r.status] = (calCounts[r.status] || 0) + 1;
      });

      return new Response(JSON.stringify({
        ok: true,
        anthropic: ANTHROPIC_API_KEY ? "configured" : "missing",
        brand_rules: AGENT_SECRET ? "configured" : "missing",
        approved_queue: approvedCount || 0,
        max_per_run: MAX_PER_RUN,
        auto_approved_7d: autoCount7d,
        weekly_cap: cap,
        cap_remaining: cap - autoCount7d,
        active_strikes: strikes || [],
        calendar_due: calCounts,
        version: 26,
      }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}`, valid: ["run", "calendar-run", "drain", "strike", "vox-check", "status"] }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
