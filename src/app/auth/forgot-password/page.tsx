'use client';

import { Button, Input, Link, Card, CardBody } from '@/components/ui';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { authService } from '@/services/auth-service';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      sessionStorage.setItem('reset_email', email);
      router.push('/auth/reset-password');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('sendCodeError'));
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">{t('forgotPassword')}</h1>
            <p className="text-default-500">{t('forgotPasswordDescription')}</p>

            {error && <div className="p-3 bg-danger-50 text-danger rounded-md text-sm">{error}</div>}

            <Input
              type="email"
              label={t('email')}
              placeholder="seu@email.com"
              value={email}
              onValueChange={setEmail}
              isRequired
            />

            <Button type="submit" color="primary" isLoading={isLoading} fullWidth>
              {t('sendCode')}
            </Button>

            <Link href="/auth/login" size="sm" className="text-center">
              {t('backToLogin')}
            </Link>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
