'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { PhoneInput } from '@/components/ui';

export type RegisterInput = {
  companyName: string;
  document: string;
  companyEmail?: string;
  companyPhone?: string;
  name: string;
  email: string;
  password: string;
  oab: string;
  phone?: string;
};

type RegisterFormProps = {
  onSubmit: (data: RegisterInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

export function RegisterForm({ onSubmit, isLoading, error }: RegisterFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<RegisterInput>({
    companyName: '',
    document: '',
    companyEmail: '',
    companyPhone: '',
    name: '',
    email: '',
    password: '',
    oab: '',
    phone: '',
  });

  function set(field: keyof RegisterInput) {
    return (value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <div className="w-full max-w-md">
      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className={`flex items-center gap-2 text-sm font-medium ${step === 1 ? 'text-amber-500' : 'text-white/40'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step === 1 ? 'border-amber-500 bg-amber-500 text-black' : 'border-white/20 text-white/40'}`}>1</span>
          Escritório
        </div>
        <div className="flex-1 h-px bg-white/10" />
        <div className={`flex items-center gap-2 text-sm font-medium ${step === 2 ? 'text-amber-500' : 'text-white/40'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step === 2 ? 'border-amber-500 bg-amber-500 text-black' : 'border-white/20 text-white/40'}`}>2</span>
          Responsável
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleNext} className="flex flex-col gap-4">
          <Input
            label="Nome do escritório"
            placeholder="Escritório Silva Advocacia"
            value={form.companyName}
            onValueChange={set('companyName')}
            isRequired
            classNames={{ inputWrapper: 'bg-white/5 border-white/10', label: 'text-white/60' }}
          />
          <Input
            label="CNPJ"
            placeholder="00.000.000/0001-00"
            value={form.document}
            onValueChange={set('document')}
            isRequired
            classNames={{ inputWrapper: 'bg-white/5 border-white/10', label: 'text-white/60' }}
          />
          <Input
            type="email"
            label="Email do escritório (opcional)"
            placeholder="contato@escritorio.com.br"
            value={form.companyEmail}
            onValueChange={set('companyEmail')}
            classNames={{ inputWrapper: 'bg-white/5 border-white/10', label: 'text-white/60' }}
          />
          <PhoneInput
            label="Telefone do escritório (opcional)"
            value={form.companyPhone ?? ''}
            onChange={set('companyPhone')}
          />
          <Button type="submit" className="w-full bg-amber-500 text-black font-semibold hover:bg-amber-400 mt-2">
            Continuar
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Seu nome completo"
            placeholder="João da Silva"
            value={form.name}
            onValueChange={set('name')}
            isRequired
            classNames={{ inputWrapper: 'bg-white/5 border-white/10', label: 'text-white/60' }}
          />
          <Input
            type="email"
            label="Seu email"
            placeholder="joao@escritorio.com.br"
            value={form.email}
            onValueChange={set('email')}
            isRequired
            classNames={{ inputWrapper: 'bg-white/5 border-white/10', label: 'text-white/60' }}
          />
          <Input
            label="Número OAB"
            placeholder="SP123456"
            value={form.oab}
            onValueChange={set('oab')}
            isRequired
            classNames={{ inputWrapper: 'bg-white/5 border-white/10', label: 'text-white/60' }}
          />
          <PhoneInput
            label="Seu telefone (opcional)"
            value={form.phone ?? ''}
            onChange={set('phone')}
          />
          <Input
            type="password"
            label="Senha"
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onValueChange={set('password')}
            isRequired
            classNames={{ inputWrapper: 'bg-white/5 border-white/10', label: 'text-white/60' }}
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="bordered"
              className="flex-1 border-white/20 text-white/60"
              onPress={() => setStep(1)}
            >
              Voltar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="flex-1 bg-amber-500 text-black font-semibold hover:bg-amber-400"
            >
              Cadastrar
            </Button>
          </div>
        </form>
      )}

      <p className="text-center text-white/40 text-sm mt-6">
        Já tem conta?{' '}
        <Link href="/auth/login" className="text-amber-500 hover:text-amber-400">
          Entrar
        </Link>
      </p>
    </div>
  );
}
