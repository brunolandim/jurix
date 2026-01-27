'use client';

import { useEffect } from 'react';
import { useAuthActions, useLawyersActions, useKanbanActions } from './selectors';

export function StoreInitializer({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuthActions();
  const { fetchLawyers } = useLawyersActions();
  const { fetchColumns } = useKanbanActions();

  useEffect(() => {
    initialize();
    fetchLawyers();
    fetchColumns();
  }, [initialize, fetchLawyers, fetchColumns]);

  return <>{children}</>;
}
