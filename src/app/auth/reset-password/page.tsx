'use client';

import { Button, Input, InputOtp, Link, Card, CardBody } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { authService } from '@/services/auth-service';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('reset_email');
    if (stored) setEmail(stored);
  }, []);

  const codeComplete = code.length === 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('passwordMinLength'));
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(email, code, password);
      sessionStorage.removeItem('reset_email');
      toast.success(t('resetSuccess'));
      router.push('/auth/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('invalidCode'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardBody className="text-center gap-4">
            <h1 className="text-2xl font-bold">{t('sessionExpired')}</h1>
            <p className="text-default-500">{t('sessionExpiredDescription')}</p>
            <Link href="/auth/forgot-password">{t('requestNewCode')}</Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">{t('resetPassword')}</h1>
            <p className="text-default-500">
              {t('verificationCodeDescription', { email })}
            </p>

            {error && <div className="p-3 bg-danger-50 text-danger rounded-md text-sm">{error}</div>}

            <div className="flex justify-center">
              <InputOtp
                length={6}
                value={code}
                onValueChange={setCode}
                isRequired
              />
            </div>

            <Input
              type="password"
              label={t('newPassword')}
              placeholder="••••••••"
              value={password}
              onValueChange={setPassword}
              isRequired
              isDisabled={!codeComplete}
            />

            <Input
              type="password"
              label={t('confirmPassword')}
              placeholder="••••••••"
              value={confirmPassword}
              onValueChange={setConfirmPassword}
              isRequired
              isDisabled={!codeComplete}
            />

            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
              isDisabled={!codeComplete}
              fullWidth
            >
              {t('resetPassword')}
            </Button>

            <Link href="/auth/forgot-password" size="sm" className="text-center">
              {t('resendCode')}
            </Link>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
