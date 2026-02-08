import { api } from './api';
import type { Plan, SubscriptionInfo } from '@/types';

export const subscriptionService = {
  async getPlans(): Promise<Plan[]> {
    const res = await api.get<Plan[]>('/plans');
    return res.success && res.data ? res.data : [];
  },

  async getSubscription(): Promise<SubscriptionInfo | null> {
    const res = await api.get<SubscriptionInfo>('/subscriptions');
    return res.success && res.data ? res.data : null;
  },

  async createCheckout(plan: string): Promise<string | null> {
    const res = await api.post<{ url: string }>('/subscriptions/checkout', { plan });
    return res.success && res.data ? res.data.url : null;
  },

  async createPortal(): Promise<string | null> {
    const res = await api.post<{ url: string }>('/subscriptions/portal', {});
    return res.success && res.data ? res.data.url : null;
  },

  async cancel(): Promise<boolean> {
    const res = await api.delete('/subscriptions');
    return res.success;
  },

  async reactivate(): Promise<boolean> {
    const res = await api.patch('/subscriptions/reactivate');
    return res.success;
  },
};
