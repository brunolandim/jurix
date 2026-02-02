'use client';

import { useEffect } from 'react';
import { useAuth, useAuthActions, useLawyersActions, useKanbanActions } from './selectors';

export function StoreInitializer({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { initialize } = useAuthActions();
  const { fetchLawyers } = useLawyersActions();
  const { fetchColumns } = useKanbanActions();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchLawyers();
      fetchColumns();
    }
  }, [isAuthenticated, isLoading, fetchLawyers, fetchColumns]);

  return <>{children}</>;
}
