'use client';

import { LoginForm } from '@/components/auth/login-form';
import { useIsAuthenticated, useAuthIsLoading, useAuthError, useAuthActions } from '@/stores';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthIsLoading();
  const error = useAuthError();
  const { login } = useAuthActions();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <LoginForm onSubmit={login} isLoading={isLoading} error={error} />
    </div>
  );
}
