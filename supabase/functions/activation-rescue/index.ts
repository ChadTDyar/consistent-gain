import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

function buildHtml(name: string, days: number, goalTitle: string | null) {
  const safeName = name && name.trim() ? name.trim() : 'there';
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const goalLine = goalTitle
    ? `<p style="margin:0 0 16px;color:#0D3B5E;font-size:16px;line-height:1.6;">You already created <strong>${escape(goalTitle)}</strong> — now just log your first completion to start your streak.</p>`
    : '';

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f7f5f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f2;padding:32px 12px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(13,59,94,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#F5A623 0%,#F2704A 100%);padding:32px 28px;">
                <h1 style="margin:0;color:#ffffff;font-size:24px;line-height:1.3;">Your first habit is waiting, ${escape(safeName)}</h1>
                <p style="margin:8px 0 0;color:#fff6e8;font-size:15px;line-height:1.5;">Most people don't fail at habits. They fail at starting over.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 16px;color:#0D3B5E;font-size:16px;line-height:1.6;">
                  You signed up for Momentum ${days} ${days === 1 ? 'day' : 'days'} ago but haven't logged your first completion yet.
                </p>
                ${goalLine}
                <p style="margin:0 0 16px;color:#0D3B5E;font-size:16px;line-height:1.6;">
                  Most people get stuck on one thing: picking the right first habit. Here's the secret — it doesn't matter which one. Pick the smallest thing you'd do anyway.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr><td style="padding:10px 0;color:#0D3B5E;font-size:15px;line-height:1.5;"><strong style="color:#0D9488;">•</strong> A 10-minute walk</td></tr>
                  <tr><td style="padding:10px 0;color:#0D3B5E;font-size:15px;line-height:1.5;"><strong style="color:#0D9488;">•</strong> Drinking water first thing</td></tr>
                  <tr><td style="padding:10px 0;color:#0D3B5E;font-size:15px;line-height:1.5;"><strong style="color:#0D9488;">•</strong> 5 minutes of stretching</td></tr>
                </table>
                <p style="margin:0 0 24px;color:#0D3B5E;font-size:16px;line-height:1.6;">
                  Create any habit, log it once, and you'll have your first streak started.
                </p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="background:linear-gradient(135deg,#F5A623 0%,#F2704A 100%);border-radius:10px;">
                      <a href="https://momentumfit.app/dashboard" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">Log my first habit →</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;border-top:1px solid #eee;color:#6b7280;font-size:12px;">
                © 2026 Momentum. Build habits that last.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: userList, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (listError) throw listError;

    const now = Date.now();
    const cutoffMs = 48 * 60 * 60 * 1000;

    let sent = 0;
    let skipped = 0;
    const failures: Array<{ userId: string; reason: string }> = [];

    for (const user of userList?.users ?? []) {
      const email = user.email;
      const createdAt = user.created_at;
      if (!email || !createdAt) { skipped++; continue; }

      const ageMs = now - new Date(createdAt).getTime();
      if (!Number.isFinite(ageMs) || ageMs < cutoffMs) { skipped++; continue; }

      const { count: activityCount, error: activityError } = await supabase
        .from('activity_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (activityError) { failures.push({ userId: user.id, reason: activityError.message }); continue; }
      if ((activityCount ?? 0) > 0) { skipped++; continue; }

      const { count: sentCount, error: logError } = await supabase
        .from('email_sequence_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('sequence_day', 2)
        .eq('email_type', 'activation_rescue');
      if (logError) { failures.push({ userId: user.id, reason: logError.message }); continue; }
      if ((sentCount ?? 0) > 0) { skipped++; continue; }

      const { data: goals } = await supabase
        .from('goals')
        .select('title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1);
      const goalTitle = typeof goals?.[0]?.title === 'string' ? goals[0].title : null;

      const name =
        (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
        (typeof user.user_metadata?.name === 'string' && user.user_metadata.name) ||
        '';
      const days = Math.max(1, Math.floor(ageMs / (24 * 60 * 60 * 1000)));

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Momentum <hello@momentumfit.app>',
          to: [email],
          subject: 'Your first habit is waiting 🏋️',
          html: buildHtml(name, days, goalTitle),
        }),
      });

      if (!res.ok) {
        const details = await res.text();
        console.error(`Resend request failed [${res.status}]: ${details}`);
        failures.push({ userId: user.id, reason: `resend_${res.status}` });
        continue;
      }

      const { error: upsertError } = await supabase
        .from('email_sequence_log')
        .upsert(
          { user_id: user.id, sequence_day: 2, email_type: 'activation_rescue', user_email: email },
          { onConflict: 'user_id,sequence_day,email_type' },
        );
      if (upsertError) console.error('email_sequence_log upsert failed:', upsertError.message);

      sent++;
    }

    return new Response(JSON.stringify({ success: true, sent, skipped, failures }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('activation-rescue error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
