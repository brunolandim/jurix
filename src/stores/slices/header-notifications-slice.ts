import { StateCreator } from 'zustand';
import { notificationService, type NotificationWithCase } from '@/services/notification-service';

export interface HeaderNotificationsSlice {
  headerNotifications: {
    notifications: NotificationWithCase[];
    isLoading: boolean;
    error: string | null;
  };
  headerNotificationsActions: {
    fetchNotifications: (lawyerId: string) => Promise<void>;
    markAsRead: (notificationId: string, lawyerId: string) => Promise<boolean>;
    markAllAsRead: (lawyerId: string) => Promise<boolean>;
    clearNotifications: () => void;
  };
}

export const createHeaderNotificationsSlice: StateCreator<
  HeaderNotificationsSlice,
  [],
  [],
  HeaderNotificationsSlice
> = (set, get) => ({
  headerNotifications: {
    notifications: [],
    isLoading: true,
    error: null,
  },
  headerNotificationsActions: {
    fetchNotifications: async (lawyerId) => {
      if (!lawyerId) {
        set({ headerNotifications: { notifications: [], isLoading: false, error: null } });
        return;
      }
      try {
        const data = await notificationService.getMyNotifications(lawyerId);
        set({ headerNotifications: { notifications: data, isLoading: false, error: null } });
      } catch {
        set({
          headerNotifications: {
            ...get().headerNotifications,
            isLoading: false,
            error: 'Erro ao carregar notificações',
          },
        });
      }
    },
    markAsRead: async (notificationId, lawyerId) => {
      const success = await notificationService.markAsRead(notificationId, lawyerId);
      if (success) {
        set((state) => ({
          headerNotifications: {
            ...state.headerNotifications,
            notifications: state.headerNotifications.notifications.filter(
              (n) => n.id !== notificationId
            ),
          },
        }));
      }
      return success;
    },
    markAllAsRead: async (lawyerId) => {
      const success = await notificationService.markAllAsRead(lawyerId);
      if (success) {
        set((state) => ({
          headerNotifications: { ...state.headerNotifications, notifications: [] },
        }));
      }
      return success;
    },
    clearNotifications: () => {
      set({ headerNotifications: { notifications: [], isLoading: false, error: null } });
    },
  },
});
