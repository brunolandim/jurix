'use client';

import { useIsAuthenticated, useAuthIsLoading } from '@/stores';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { KanbanBoard } from '@/components/dashboard/kanban';

export default function Dashboard() {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthIsLoading();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-4 h-full">
      <KanbanBoard />
    </div>
  );
}
