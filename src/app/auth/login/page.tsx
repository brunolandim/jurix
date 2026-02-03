'use client';

import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, isAuthenticated, isLoading, error, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <LoginForm onSubmit={login} isLoading={isLoading} error={error} />
    </div>
  );
}
