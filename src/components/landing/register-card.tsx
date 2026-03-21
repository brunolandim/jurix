'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RegisterForm } from '@/components/auth/register-form';
import { authService } from '@/services';
import type { RegisterInput } from '@/components/auth/register-form';

export function RegisterCard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(data: RegisterInput) {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(data);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar escritório');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div id="cadastro" className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Cadastre sua empresa e comece a utilizar</h2>
        <p className="text-white/40 text-sm">Sem cartão de crédito. Configure em minutos.</p>
      </div>
      <RegisterForm onSubmit={handleRegister} isLoading={isLoading} error={error} />
    </div>
  );
}
