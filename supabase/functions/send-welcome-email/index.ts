import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

function buildHtml(name: string) {
  const safeName = name && name.trim() ? name.trim() : 'there';
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f7f5f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f2;padding:32px 12px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(13,59,94,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#F5A623 0%,#F2704A 100%);padding:32px 28px;">
                <h1 style="margin:0;color:#ffffff;font-size:24px;line-height:1.3;">Welcome to Momentum, ${safeName}!</h1>
                <p style="margin:8px 0 0;color:#fff6e8;font-size:15px;line-height:1.5;">Most people don't fail at habits. They fail at starting over.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 16px;color:#0D3B5E;font-size:16px;line-height:1.6;">
                  Your first move is simple: create your first habit and log your first completion.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr><td style="padding:10px 0;color:#0D3B5E;font-size:15px;line-height:1.5;"><strong style="color:#0D9488;">1.</strong> Create a habit</td></tr>
                  <tr><td style="padding:10px 0;color:#0D3B5E;font-size:15px;line-height:1.5;"><strong style="color:#0D9488;">2.</strong> Log your first completion to start your streak</td></tr>
                  <tr><td style="padding:10px 0;color:#0D3B5E;font-size:15px;line-height:1.5;"><strong style="color:#0D9488;">3.</strong> Check your insights after a few days</td></tr>
                </table>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="background:linear-gradient(135deg,#F5A623 0%,#F2704A 100%);border-radius:10px;">
                      <a href="https://momentumfit.app/dashboard" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">Open your dashboard</a>
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
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const name = typeof body?.name === 'string' ? body.name : '';
    const userId = typeof body?.userId === 'string' ? body.userId : null;

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 255) {
      return new Response(JSON.stringify({ error: 'A valid email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Server-side dedupe: one welcome email per user, ever.
    if (userId) {
      const { data: existing } = await admin
        .from('email_sequence_log')
        .select('id')
        .eq('user_id', userId)
        .eq('sequence_day', 0)
        .eq('email_type', 'welcome')
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ success: true, skipped: 'already_sent' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Claim the send before calling the provider so concurrent invocations
      // (multiple tabs/devices) cannot both send.
      const { error: claimError } = await admin
        .from('email_sequence_log')
        .insert({ user_id: userId, sequence_day: 0, email_type: 'welcome', user_email: email });

      if (claimError) {
        return new Response(JSON.stringify({ success: true, skipped: 'already_claimed' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }


    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Momentum <hello@momentumfit.app>',
        to: [email],
        subject: "Welcome to Momentum! 🏋️ Let's build your first habit",
        html: buildHtml(name),
      }),
    });

    if (!res.ok) {
      const details = await res.text();
      console.error(`Resend request failed [${res.status}]: ${details}`);
      // Release the claim so a later attempt can retry.
      if (userId) {
        await admin
          .from('email_sequence_log')
          .delete()
          .eq('user_id', userId)
          .eq('sequence_day', 0)
          .eq('email_type', 'welcome');
      }
      return new Response(JSON.stringify({ error: 'Email send failed', status: res.status, details }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sent = await res.json();


    return new Response(JSON.stringify({ success: true, id: sent?.id ?? null }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-welcome-email error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
