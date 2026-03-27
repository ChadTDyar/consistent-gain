const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Chad Dyar <hello@chadtdyar.com>",
      to,
      subject,
      html,
      reply_to: "chadtd1@gmail.com",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Email send failed: ${JSON.stringify(error)}`);
  }

  return response.json();
}
