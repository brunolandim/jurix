'use client';

import { useEffect } from 'react';
import {
  useAuthUser,
  useIsAuthenticated,
  useHeaderNotificationsActions,
} from './selectors';

/**
 * Hook for notifications polling only.
 * State is managed by Zustand store.
 * Use this in HeaderNotifications component.
 */
export function useNotificationsPolling() {
  const user = useAuthUser();
  const isAuthenticated = useIsAuthenticated();
  const { fetchNotifications } = useHeaderNotificationsActions();

  const lawyerId = user?.id || null;

  // Fetch on mount and when lawyerId changes
  useEffect(() => {
    if (isAuthenticated && lawyerId) {
      fetchNotifications(lawyerId);
    }
  }, [isAuthenticated, lawyerId, fetchNotifications]);

  // Polling every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !lawyerId) return;

    const interval = setInterval(() => {
      fetchNotifications(lawyerId);
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, lawyerId, fetchNotifications]);
}
