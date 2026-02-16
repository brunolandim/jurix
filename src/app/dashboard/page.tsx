'use client';

import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { KanbanBoard } from '@/components/dashboard/kanban';

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
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
    <div className="px-4 pt-4 h-full flex flex-col overflow-hidden">
      <KanbanBoard />
    </div>
  );
}
