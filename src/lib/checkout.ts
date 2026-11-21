import { supabase } from '@/integrations/supabase/client';
import { readAttribution } from '@/lib/attribution';

const ARL_FUNCTION_URL =
  'https://skaeklayghuqwakrbemy.supabase.co/functions/v1/create-checkout-session';
const ARL_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYWVrbGF5Z2h1cXdha3JiZW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NzYyMDEsImV4cCI6MjA2ODQ1MjIwMX0.bnqUSXXEQJuQPEkOSoazNSlaKEIxcjGzgk1yKBxj2iQ';

// Read once by /success to report the real purchase amount.
const CHECKOUT_PRICE_KEY = 'momentum_checkout_price_id';

export function consumeCheckoutPriceId(): string | null {
  try {
    const id = localStorage.getItem(CHECKOUT_PRICE_KEY);
    localStorage.removeItem(CHECKOUT_PRICE_KEY);
    return id;
  } catch {
    return null;
  }
}

export async function buildCheckoutMetadata() {
  const { data: { session } } = await supabase.auth.getSession();
  const attr = readAttribution();
  return {
    user_id: session?.user?.id ?? null,
    utm_source: attr?.utm_source ?? null,
    utm_medium: attr?.utm_medium ?? null,
    utm_campaign: attr?.utm_campaign ?? null,
    landing_path: attr?.landing_path ?? null,
  };
}

export async function handleCheckout(
  priceId: string,
  appName: string,
  customerEmail?: string
): Promise<void> {
  const metadata = await buildCheckoutMetadata();

  const response = await fetch(ARL_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ARL_ANON_KEY}`,
    },
    body: JSON.stringify({ priceId, appName, customerEmail, metadata }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error ?? 'Checkout failed');
  }

  const { url } = await response.json();
  if (url) {
    try {
      localStorage.setItem(CHECKOUT_PRICE_KEY, priceId);
    } catch {
      // ignore storage failures
    }
    window.location.href = url;
  }
}
