'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationService, type NotificationWithCase } from '@/services/notification-service';
import { useAuth } from './use-auth';

// Re-exporta o tipo para uso externo
export type { NotificationWithCase };

export function useNotifications() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // O usuário logado é o próprio advogado
  const lawyerId = user?.id || null;

  const fetchNotifications = useCallback(async () => {
    if (!lawyerId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await notificationService.getMyNotifications(lawyerId);
      setNotifications(data);
    } catch (err) {
      setError('Erro ao carregar notificações');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [lawyerId]);

  // Carrega notificações ao montar e quando o lawyerId muda
  useEffect(() => {
    if (isAuthenticated && lawyerId) {
      fetchNotifications();
    }
  }, [isAuthenticated, lawyerId, fetchNotifications]);

  // Polling para atualizar notificações a cada 30 segundos
  useEffect(() => {
    if (!isAuthenticated || !lawyerId) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, lawyerId, fetchNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!lawyerId) return false;

      const success = await notificationService.markAsRead(notificationId, lawyerId);
      if (success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
      return success;
    },
    [lawyerId]
  );

  const markAllAsRead = useCallback(async () => {
    if (!lawyerId) return false;

    const success = await notificationService.markAllAsRead(lawyerId);
    if (success) {
      setNotifications([]);
    }
    return success;
  }, [lawyerId]);

  const unreadCount = notifications.length;

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
