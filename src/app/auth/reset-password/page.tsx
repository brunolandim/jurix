"use client";

import { Button, Input, Link, Card, CardBody } from "@/components/ui";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    // TODO: Implementar lógica de reset de senha com o token
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    setSuccess(true);
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardBody className="text-center gap-4">
            <h1 className="text-2xl font-bold">Link inválido</h1>
            <p className="text-default-500">
              O link para redefinir senha é inválido ou expirou.
            </p>
            <Link href="/auth/forgot-password">Solicitar novo link</Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardBody className="text-center gap-4">
            <h1 className="text-2xl font-bold">Senha redefinida</h1>
            <p className="text-default-500">
              Sua senha foi redefinida com sucesso.
            </p>
            <Link href="/auth/login">Fazer login</Link>
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
            <h1 className="text-2xl font-bold">Redefinir senha</h1>
            <p className="text-default-500">Digite sua nova senha.</p>

            {error && (
              <div className="p-3 bg-danger-50 text-danger rounded-md text-sm">
                {error}
              </div>
            )}

            <Input
              type="password"
              label="Nova senha"
              placeholder="••••••"
              value={password}
              onValueChange={setPassword}
              isRequired
            />

            <Input
              type="password"
              label="Confirmar senha"
              placeholder="••••••"
              value={confirmPassword}
              onValueChange={setConfirmPassword}
              isRequired
            />

            <Button type="submit" color="primary" isLoading={isLoading} fullWidth>
              Redefinir senha
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
