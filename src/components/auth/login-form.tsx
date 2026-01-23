'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button, Input, Form } from '@/components/ui';
import { LoginCredentials } from '@/types';

type LoginFormProps = {
  onSubmit: (credentials: LoginCredentials) => void;
  isLoading: boolean;
  error: string | null;
};

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ email, password });
  }

  return (
    <Form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
      <h2 className="text-xl font-semibold text-center">{t('login')}</h2>

      <Input
        type="email"
        label={t('email')}
        placeholder="seu@email.com"
        value={email}
        onValueChange={setEmail}
        isRequired
      />

      <Input
        type="password"
        label={t('password')}
        placeholder="••••••"
        value={password}
        onValueChange={setPassword}
        isRequired
      />

      {error && <p className="text-danger text-sm text-center">{t('loginError')}</p>}

      <Button type="submit" color="primary" isLoading={isLoading} className="w-full">
        {t('login')}
      </Button>

      <Link href="/auth/forgot-password" className="text-sm text-center text-primary">
        {t('forgotPassword')}
      </Link>

      <p className="text-xs text-default-500 text-center">{t('demoCredentials')}: bruno@email.com / 123456</p>
    </Form>
  );
}
