import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CHAD_EMAIL = "chadtd1@gmail.com";
const SEED_REPLY_TO = "seeds@reply.chadtdyar.com";
const DASHBOARD_URL = "https://arl-marketing-engine.netlify.app";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function getSecret(name: string): Promise<string> {
  const env = Deno.env.get(name);
  if (env) return env;
  try {
    const { data } = await supabase
      .from("vault_decrypted_secrets")
      .select("decrypted_secret")
      .eq("name", name)
      .single();
    return data?.decrypted_secret || "";
  } catch { return ""; }
}

async function sendEmail(resendKey: string, subject: string, html: string): Promise<number> {
  if (!resendKey) return 500;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ARL Brain <brain@contentforgehq.com>",
      to: CHAD_EMAIL,
      reply_to: SEED_REPLY_TO,
      subject,
      html,
    }),
  });
  return res.status;
}

Deno.serve(async () => {
  const RESEND_API_KEY = await getSecret("RESEND_API_KEY");

  const { data: runs } = await supabase
    .from("circuit_health_runs")
    .select("run_at, open_defects, critical_open, high_open, sigma_level, first_pass_yield")
    .order("run_at", { ascending: false })
    .limit(1);
  const run = runs?.[0];

  const { data: hotDefects } = await supabase
    .from("circuit_defects")
    .select("check_code, severity, description")
    .eq("status", "open")
    .in("severity", ["critical", "high"])
    .order("severity")
    .order("detected_at");

  const { data: humanRequired } = await supabase
    .from("marketing_queue")
    .select("id, title, platform, content_type, body")
    .eq("status", "human_required")
    .order("created_at", { ascending: true });

  const { data: liQueue } = await supabase
    .from("marketing_queue")
    .select("id, title, body")
    .eq("platform", "linkedin")
    .eq("status", "human_required")
    .order("created_at", { ascending: false })
    .limit(1);

  const { data: mpItems } = await supabase
    .from("marketing_queue")
    .select("id, title, platform, created_at")
    .eq("status", "manual_publish")
    .order("created_at", { ascending: true })
    .limit(5);

  const { count: seedCount } = await supabase
    .from("content_seeds")
    .select("id", { count: "exact", head: true })
    .eq("source", "chad")
    .eq("exhausted", false);
  const seeds = seedCount ?? 0;

  const { data: warmLeads } = await supabase
    .from("warm_leads")
    .select("platform, handle, app_relevance, next_action, last_contact_date")
    .eq("status", "active")
    .order("last_contact_date", { ascending: true })
    .limit(5);

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const wsStr = weekStart.toISOString().split("T")[0];
  const weStr = weekEnd.toISOString().split("T")[0];

  const { data: calendarItems } = await supabase
    .from("content_calendar")
    .select("week_number, platform, content_type, app_focus, title_target, status, week_start")
    .gte("week_start", wsStr)
    .lte("week_start", weStr)
    .not("status", "in", '("past — archive","done","killed")')
    .order("week_start", { ascending: true });

  const { data: overdueItems } = await supabase
    .from("content_calendar")
    .select("week_number, platform, content_type, app_focus, title_target, status, week_start")
    .eq("status", "planned")
    .lt("week_start", wsStr)
    .not("status", "in", '("past — archive","done","killed")')
    .order("week_start", { ascending: true })
    .limit(5);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const dayOfWeek = new Date().getDay(); // 0=Sun, 6=Sat
  const isSaturday = dayOfWeek === 6;
  const showLinkedInSection = dayOfWeek === 5 || dayOfWeek === 6; // Fri or Sat only

  const scoreRow = run
    ? `Sigma ${run.sigma_level} &nbsp;|&nbsp; ${run.open_defects} open &nbsp;|&nbsp; ${run.critical_open} critical &nbsp;|&nbsp; ${run.high_open} high &nbsp;|&nbsp; FPY ${(run.first_pass_yield * 100).toFixed(0)}%`
    : "No run data yet";

  const alertsHtml = hotDefects && hotDefects.length > 0
    ? hotDefects.map(d =>
        `<tr><td style="padding:4px 8px;color:${d.severity === 'critical' ? '#c0392b' : '#e67e22'};font-weight:bold">${d.severity.toUpperCase()}</td><td style="padding:4px 8px">${d.check_code}</td><td style="padding:4px 8px">${d.description}</td></tr>`
      ).join("")
    : `<tr><td colspan="3" style="padding:4px 8px;color:#27ae60">No critical or high defects open.</td></tr>`;

  // FIX v16: include &source=marketing_queue in all approve/kill links so dashboard-api
  // receives the required source parameter and does not return 400.
  const approvalHtml = humanRequired && humanRequired.length > 0
    ? humanRequired.map(item => {
        const preview = (item.body ?? "").substring(0, 200).replace(/</g, "&lt;");
        return `<tr>
          <td style="padding:6px 8px;font-weight:bold">${item.title}</td>
          <td style="padding:6px 8px">${item.platform}</td>
          <td style="padding:6px 8px;font-size:12px;color:#555">${preview}${preview.length >= 200 ? '...' : ''}</td>
          <td style="padding:6px 8px;white-space:nowrap">
            <a href="${DASHBOARD_URL}?approve=${item.id}&source=marketing_queue" style="color:#27ae60;font-weight:bold;margin-right:8px">Approve</a>
            <a href="${DASHBOARD_URL}?kill=${item.id}&source=marketing_queue" style="color:#c0392b">Kill</a>
          </td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="4" style="padding:6px 8px;color:#888">Nothing waiting for approval.</td></tr>`;

  // Dedupe: exclude LinkedIn items that are already shown in the "Needs Your Decision" table
  const hrIds = new Set((humanRequired || []).map(h => h.id));
  const liFiltered = (liQueue || []).filter(p => !hrIds.has(p.id));

  const liHtml = showLinkedInSection
    ? (liFiltered.length > 0
      ? (() => {
          const p = liFiltered[0];
          const body = (p.body ?? "").replace(/</g, "&lt;");
          return `<div style="background:#f0f7ff;border-left:4px solid #2980b9;padding:12px 16px;margin:8px 0">
            <strong>${p.title}</strong><br/>
            <div style="margin-top:8px;font-size:13px;white-space:pre-wrap">${body}</div>
            <div style="margin-top:10px">
              <a href="${DASHBOARD_URL}?approve=${p.id}&source=marketing_queue" style="background:#2980b9;color:white;padding:6px 14px;border-radius:4px;text-decoration:none;margin-right:8px">Post this Saturday</a>
              <a href="${DASHBOARD_URL}?kill=${p.id}&source=marketing_queue" style="color:#c0392b">Kill it</a>
            </div>
          </div>`;
        })()
      : `<p style="color:#888">No LinkedIn post queued.</p>`)
    : null; // Don't show LinkedIn section on non-Fri/Sat days

  const mpHtml = mpItems && mpItems.length > 0
    ? mpItems.map(item =>
        `<div style="padding:4px 0;font-size:13px">&#9658; <strong>${item.platform}</strong>: ${item.title} <span style="color:#aaa">(since ${new Date(item.created_at).toLocaleDateString()})</span></div>`
      ).join("")
    : `<p style="color:#27ae60">Manual publish queue is clear.</p>`;

  const warmLeadsHtml = warmLeads && warmLeads.length > 0
    ? warmLeads.map(l => {
        const daysSince = l.last_contact_date
          ? Math.floor((Date.now() - new Date(l.last_contact_date).getTime()) / 86400000)
          : null;
        const ageTag = daysSince != null && daysSince > 14
          ? `<span style="color:#c0392b;font-weight:bold">${daysSince}d ago</span>`
          : daysSince != null
          ? `<span style="color:#888">${daysSince}d ago</span>`
          : `<span style="color:#888">unknown</span>`;
        return `<tr>
          <td style="padding:4px 8px;font-weight:bold">${l.handle}</td>
          <td style="padding:4px 8px">${l.platform}</td>
          <td style="padding:4px 8px;font-size:12px">${l.app_relevance || ''}</td>
          <td style="padding:4px 8px;font-size:12px">${l.next_action || ''}</td>
          <td style="padding:4px 8px">${ageTag}</td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="5" style="padding:4px 8px;color:#888">No active warm leads.</td></tr>`;

  const calItems = [...(overdueItems || []), ...(calendarItems || [])];
  const calendarHtml = calItems.length > 0
    ? calItems.map(c => {
        const isOverdue = c.week_start && c.week_start < wsStr;
        const statusColor = c.status === 'published' ? '#27ae60' : c.status === 'drafted' ? '#2980b9' : isOverdue ? '#c0392b' : '#888';
        const label = isOverdue ? 'OVERDUE' : c.status?.toUpperCase() || 'PLANNED';
        return `<tr>
          <td style="padding:4px 8px">W${c.week_number}</td>
          <td style="padding:4px 8px;font-weight:bold">${c.platform}</td>
          <td style="padding:4px 8px">${c.app_focus || ''}</td>
          <td style="padding:4px 8px;font-size:12px">${(c.title_target || '').slice(0, 60)}</td>
          <td style="padding:4px 8px;color:${statusColor};font-weight:bold;font-size:11px">${label}</td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="5" style="padding:4px 8px;color:#888">No calendar items this week.</td></tr>`;

  const seedBankLine = seeds >= 3
    ? `<span style="color:#27ae60;font-size:12px">OK ${seeds} seeds in bank</span>`
    : seeds > 0
    ? `<span style="color:#e67e22;font-size:12px">Warning: ${seeds} seed in bank, running low</span>`
    : `<span style="color:#c0392b;font-size:12px">Warning: Seed bank empty</span>`;

  const seedBlock = `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
  <tr>
    <td style="background:#1a1a1a;padding:20px 24px;border-radius:6px">
      <p style="margin:0 0 4px 0;color:#f39c12;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Your one job before you read anything else</p>
      <p style="margin:0 0 12px 0;color:#ffffff;font-size:18px;font-weight:bold;line-height:1.3">Hit Reply. Give me one sentence.</p>
      <p style="margin:0 0 16px 0;color:#cccccc;font-size:14px;line-height:1.5">Something that happened. Something you noticed. Something that surprised you. A fragment is fine. That sentence becomes content.</p>
      <p style="margin:0;color:#888888;font-size:12px">${seedBankLine} &nbsp;&middot;&nbsp; Reply goes directly to the seed queue</p>
    </td>
  </tr>
</table>`;

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;max-width:680px;margin:0 auto;padding:20px;color:#222">
<h2 style="border-bottom:2px solid #222;padding-bottom:8px;margin-bottom:20px">ARL Morning Brief &mdash; ${today}</h2>
${seedBlock}
<h3 style="margin-bottom:4px">Circuit Health</h3>
<p style="background:#f5f5f5;padding:10px 14px;border-radius:4px;font-family:monospace;font-size:13px;margin-top:0">${scoreRow}</p>
<table style="width:100%;border-collapse:collapse;font-size:13px">${alertsHtml}</table>
<hr style="margin:20px 0;border:none;border-top:1px solid #ddd"/>
<h3 style="margin-bottom:4px">Content Calendar This Week</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <thead><tr style="background:#f5f5f5">
    <th style="padding:4px 8px;text-align:left">Wk</th>
    <th style="padding:4px 8px;text-align:left">Platform</th>
    <th style="padding:4px 8px;text-align:left">App</th>
    <th style="padding:4px 8px;text-align:left">Topic</th>
    <th style="padding:4px 8px;text-align:left">Status</th>
  </tr></thead>
  <tbody>${calendarHtml}</tbody>
</table>
<hr style="margin:20px 0;border:none;border-top:1px solid #ddd"/>
<h3 style="margin-bottom:4px">Warm Leads</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <thead><tr style="background:#f5f5f5">
    <th style="padding:4px 8px;text-align:left">Handle</th>
    <th style="padding:4px 8px;text-align:left">Platform</th>
    <th style="padding:4px 8px;text-align:left">App</th>
    <th style="padding:4px 8px;text-align:left">Next Action</th>
    <th style="padding:4px 8px;text-align:left">Last Touch</th>
  </tr></thead>
  <tbody>${warmLeadsHtml}</tbody>
</table>
<hr style="margin:20px 0;border:none;border-top:1px solid #ddd"/>
${showLinkedInSection ? `<h3 style="margin-bottom:4px">Saturday LinkedIn Post${isSaturday ? ' <span style="color:#c0392b">(TODAY)</span>' : ''}</h3>
${liHtml}
<hr style="margin:20px 0;border:none;border-top:1px solid #ddd"/>` : ''}
<h3 style="margin-bottom:4px">Needs Your Decision</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <thead><tr style="background:#f5f5f5">
    <th style="padding:6px 8px;text-align:left">Title</th>
    <th style="padding:6px 8px;text-align:left">Platform</th>
    <th style="padding:6px 8px;text-align:left">Preview</th>
    <th style="padding:6px 8px;text-align:left">Action</th>
  </tr></thead>
  <tbody>${approvalHtml}</tbody>
</table>
<hr style="margin:20px 0;border:none;border-top:1px solid #ddd"/>
<h3 style="margin-bottom:4px">Manual Publish Queue</h3>
${mpHtml}
<hr style="margin:20px 0;border:none;border-top:1px solid #ddd"/>
<p style="font-size:11px;color:#aaa">ARL Brain &nbsp;|&nbsp; <a href="${DASHBOARD_URL}">Dashboard</a></p>
</body></html>`;

  const subject = (run?.critical_open ?? 0) > 0
    ? `ARL Brain &mdash; ${today} &mdash; ${run.critical_open} critical`
    : (run?.high_open ?? 0) > 0
    ? `ARL Brain &mdash; ${today} &mdash; ${run.high_open} high`
    : `ARL Brain &mdash; ${today} &mdash; reply with a seed`;

  const status = await sendEmail(RESEND_API_KEY, subject, html);

  await supabase.from("agent_decisions").insert({
    made_by: "chief",
    decision: `Morning digest sent via Resend, status ${status}`,
    rationale: `Daily touchpoint: scoreboard, seed prompt (${seeds} in bank), calendar (${calItems.length} items), warm leads (${warmLeads?.length || 0}), LinkedIn slot, approval queue, manual publish queue`,
    tags: ["morning_digest", "daily_touchpoint"],
  });

  return new Response(JSON.stringify({ ok: true, resend_status: status, seeds_in_bank: seeds, calendar_items: calItems.length, warm_leads: warmLeads?.length || 0 }), {
    headers: { "Content-Type": "application/json" },
  });
});
