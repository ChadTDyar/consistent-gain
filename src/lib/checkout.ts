const ARL_FUNCTION_URL =
  'https://skaeklayghuqwakrbemy.supabase.co/functions/v1/create-checkout-session';
const ARL_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYWVrbGF5Z2h1cXdha3JiZW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NzYyMDEsImV4cCI6MjA2ODQ1MjIwMX0.bnqUSXXEQJuQPEkOSoazNSlaKEIxcjGzgk1yKBxj2iQ';

export async function handleCheckout(
  priceId: string,
  appName: string,
  customerEmail?: string
): Promise<void> {
  const response = await fetch(ARL_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ARL_ANON_KEY}`,
    },
    body: JSON.stringify({ priceId, appName, customerEmail }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error ?? 'Checkout failed');
  }

  const { url } = await response.json();
  if (url) window.location.href = url;
}
