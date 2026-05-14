/**
 * Loads the Razorpay Checkout script lazily and opens the modal.
 * When the order ID is a stub (no Razorpay keys configured) we skip the script
 * and call back with a fake success payload so the verify flow can be exercised
 * during development.
 */

interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: { email?: string };
  theme?: { color?: string };
  handler: (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (opts: RazorpayOptions) => { open: () => void };
  }
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')));
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

export interface CheckoutArgs {
  orderId: string;
  keyId: string;
  amount: number;
  currency: string;
  label: string;
  email?: string;
  stub: boolean;
}

export async function openCheckout(args: CheckoutArgs): Promise<{
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
} | null> {
  if (args.stub) {
    // Dev fallback — pretend the user completed checkout.
    await new Promise((r) => setTimeout(r, 400));
    return {
      razorpay_order_id: args.orderId,
      razorpay_payment_id: `stub_pay_${Date.now()}`,
      razorpay_signature: 'stub',
    };
  }
  await loadScript();
  if (!window.Razorpay) throw new Error('Razorpay script did not load');
  return new Promise((resolve) => {
    const rzp = new window.Razorpay!({
      key: args.keyId,
      order_id: args.orderId,
      amount: args.amount,
      currency: args.currency,
      name: 'Autophrase',
      description: args.label,
      prefill: { email: args.email },
      theme: { color: '#18181b' },
      handler: (resp) => resolve(resp),
      modal: { ondismiss: () => resolve(null) },
    });
    rzp.open();
  });
}
