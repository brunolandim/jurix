'use client';

import { Button, Input, Link, Card, CardBody } from '@/components/ui';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implementar lógica de envio de email
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardBody className="text-center gap-4">
            <h1 className="text-2xl font-bold">Email enviado</h1>
            <p className="text-default-500">
              Se o email estiver cadastrado, você receberá um link para redefinir sua senha.
            </p>
            <Link href="/auth/login">Voltar para o login</Link>
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
            <h1 className="text-2xl font-bold">Esqueceu a senha?</h1>
            <p className="text-default-500">Digite seu email e enviaremos um link para redefinir sua senha.</p>

            <Input
              type="email"
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onValueChange={setEmail}
              isRequired
            />

            <Button type="submit" color="primary" isLoading={isLoading} fullWidth>
              Enviar link
            </Button>

            <Link href="/auth/login" size="sm" className="text-center">
              Voltar para o login
            </Link>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
