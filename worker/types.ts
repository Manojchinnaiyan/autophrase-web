export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  TRIAL_DAYS: string;
  APP_URL: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  SESSION_SECRET?: string;
}

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: number;
  trial_ends_at: number;
  license_key: string | null;
}

export interface SessionRow {
  token: string;
  user_id: string;
  created_at: number;
  expires_at: number;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  status: 'pending' | 'active' | 'past_due' | 'canceled';
  plan: string;
  rzp_order_id: string | null;
  rzp_payment_id: string | null;
  rzp_subscription_id: string | null;
  current_period_end: number | null;
  created_at: number;
  updated_at: number;
}

export interface AccountStatus {
  user: { id: string; email: string };
  plan: 'trial' | 'pro' | 'expired';
  trialEndsAt: number;
  subscriptionActive: boolean;
  requestCount: number;
  licenseKey: string;
}

export interface LicenseStatus {
  plan: 'trial' | 'pro' | 'expired';
  trialEndsAt: number;
  email: string;
  /** Devices already paired with this license, including the caller. */
  devices?: DeviceSummary[];
  /** Cap for the current plan (e.g. 2 for trial, 5 for pro). */
  deviceLimit?: number;
}

export interface DeviceRow {
  id: string;
  user_id: string;
  fingerprint: string;
  name: string;
  created_at: number;
  last_seen_at: number;
}

export interface DeviceSummary {
  id: string;
  name: string;
  createdAt: number;
  lastSeenAt: number;
}

/** Device caps per plan. Trial intentionally tight to discourage sharing the
 *  trial period across friends; Pro has enough headroom for personal use. */
export const DEVICE_LIMIT: Record<'trial' | 'pro' | 'expired', number> = {
  trial: 2,
  pro: 5,
  expired: 0,
};
