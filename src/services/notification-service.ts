import { CaseNotification, LegalCase } from '@/types';
import { api } from './api';

// ============ TYPES ============
export type NotificationWithCase = CaseNotification & {
  case: Pick<LegalCase, 'id' | 'number' | 'title'>;
};

// ============ SERVICE ============
export const notificationService = {
  async getMyNotifications(lawyerId: string): Promise<NotificationWithCase[]> {
    const res = await api.get<NotificationWithCase[]>(`/notifications?lawyerId=${lawyerId}`);
    return res.success && res.data ? res.data : [];
  },

  async markAsRead(notificationId: string, lawyerId: string): Promise<boolean> {
    const res = await api.patch(`/notifications/${notificationId}/read`);
    return res.success;
  },

  async markAllAsRead(lawyerId: string): Promise<boolean> {
    const res = await api.patch('/notifications/read-all');
    return res.success;
  },

  async create(
    data: Omit<NotificationWithCase, 'id' | 'createdAt' | 'isRead' | 'isSent' | 'readAt' | 'sentAt'>
  ): Promise<NotificationWithCase> {
    const res = await api.post<NotificationWithCase>('/notifications', data);
    if (!res.success || !res.data) {
      throw new Error('Failed to create notification');
    }
    return res.data;
  },

  async delete(notificationId: string): Promise<boolean> {
    const res = await api.delete(`/notifications/${notificationId}`);
    return res.success;
  },
};
