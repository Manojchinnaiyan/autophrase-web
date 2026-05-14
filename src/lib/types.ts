export interface AccountStatus {
  user: { id: string; email: string };
  plan: 'trial' | 'pro' | 'expired';
  trialEndsAt: number;
  subscriptionActive: boolean;
  requestCount: number;
  licenseKey: string;
}

export interface DeviceSummary {
  id: string;
  name: string;
  createdAt: number;
  lastSeenAt: number;
}

export interface DevicesResponse {
  devices: DeviceSummary[];
  deviceLimit: number;
}
