'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth, useAuthActions, useLawyersActions, useKanbanActions } from './selectors';

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ['/case/'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

export function StoreInitializer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const { initialize } = useAuthActions();
  const { fetchLawyers } = useLawyersActions();
  const { fetchColumns } = useKanbanActions();

  useEffect(() => {
    if (isPublicRoute(pathname)) return;
    initialize();
  }, [initialize, pathname]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchLawyers();
      fetchColumns();
    }
  }, [isAuthenticated, isLoading, fetchLawyers, fetchColumns]);

  return <>{children}</>;
}
