'use client';

import { useIsAuthenticated, useAuthIsLoading } from '@/stores';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export default function Home() {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthIsLoading();
  const router = useRouter();
  const t = useTranslations('common');

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <p>{t('loading')}</p>
    </div>
  );
}
