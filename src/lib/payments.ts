import { supabase } from '@/integrations/supabase/client';

export type Coupon = { code: string; type: 'percentage' | 'fixed'; value: number; minSpend: number };

/** Discount on the item subtotal. Must match discountFor in supabase/functions/process-payment. */
export const couponDiscount = (c: Pick<Coupon, 'type' | 'value'>, subtotal: number) =>
  Math.min(subtotal, Math.round((c.type === 'percentage' ? subtotal * c.value / 100 : c.value) * 100) / 100);

/** Call the process-payment edge function; throws with the server's message on failure. */
export async function callPayments<T = Record<string, unknown>>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('process-payment', { body });
  if (error) {
    let message = 'Something went wrong. Please try again.';
    try {
      const payload = await (error as { context?: Response }).context?.json();
      if (payload?.error) message = payload.error;
    } catch { /* non-JSON error body */ }
    throw new Error(message);
  }
  return data as T;
}

interface PaystackOptions {
  email: string;
  amountKobo: number;
  reference: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

type PaystackPop = { setup: (o: Record<string, unknown>) => { openIframe: () => void } };
const paystack = () => (window as unknown as { PaystackPop?: PaystackPop }).PaystackPop;

async function loadPaystack(): Promise<PaystackPop> {
  if (!paystack()) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Paystack failed to load. Check your connection and try again.'));
      document.body.appendChild(script);
    });
  }
  const pop = paystack();
  if (!pop) throw new Error('Paystack failed to load. Check your connection and try again.');
  return pop;
}

/** True when a real Paystack public key is configured (otherwise the dev test mode is used). */
export const hasPaystackKey = () => /^pk_(live|test)_/.test(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '');

/** Open the Paystack popup for exactly the amount the server calculated. */
export async function openPaystack({ email, amountKobo, reference, onSuccess, onClose }: PaystackOptions) {
  const pop = await loadPaystack();
  pop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email,
    amount: amountKobo,
    currency: 'NGN',
    ref: reference,
    callback: (response: { reference: string }) => onSuccess(response.reference),
    onClose,
  }).openIframe();
}
