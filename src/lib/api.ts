import type { AccountStatus, DevicesResponse } from './types';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...init.headers,
    },
  });
  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { error: text };
  }
  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? `request failed (${res.status})`);
  }
  return body as T;
}

export const api = {
  signup: (email: string, password: string) =>
    request<{ ok: true }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signin: (email: string, password: string) =>
    request<{ ok: true }>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signout: () => request<{ ok: true }>('/api/auth/signout', { method: 'POST' }),
  me: () => request<AccountStatus>('/api/me'),
  recordUsage: () => request<{ ok: true; count: number }>('/api/usage/record', { method: 'POST' }),
  plans: () =>
    request<
      Array<{
        id: string;
        label: string;
        amountPaise: number;
        currency: string;
        periodDays: number;
      }>
    >('/api/billing/plans'),
  createOrder: (plan: string) =>
    request<{
      orderId: string;
      subscriptionId: string;
      keyId: string;
      amount: number;
      currency: string;
      label: string;
      stub: boolean;
    }>('/api/billing/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }),
  verifyPayment: (payload: {
    subscriptionId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) =>
    request<{ ok: true; currentPeriodEnd: number }>('/api/billing/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listDevices: () => request<DevicesResponse>('/api/devices'),
  revokeDevice: (id: string) =>
    request<{ ok: true }>(`/api/devices/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
