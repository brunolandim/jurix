"use client";

import { useState } from "react";
import { Button, Input, Link,Form } from "@/components/ui";
import { LoginCredentials } from "@/types";

type LoginFormProps = {
  onSubmit: (credentials: LoginCredentials) => void;
  isLoading: boolean;
  error: string | null;
};

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ email, password });
  }

  return (
    <Form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
      <h2 className="text-xl font-semibold text-center">Login</h2>

      <Input
        type="email"
        label="Email"
        placeholder="seu@email.com"
        value={email}
        onValueChange={setEmail}
        isRequired
      />

      <Input
        type="password"
        label="Senha"
        placeholder="••••••"
        value={password}
        onValueChange={setPassword}
        isRequired
      />

      {error && (
        <p className="text-danger text-sm text-center">{error}</p>
      )}

      <Button type="submit" color="primary" isLoading={isLoading} className="w-full">
        Entrar
      </Button>

      <Link href="/auth/forgot-password" size="sm" className="text-center">
        Esqueceu a senha?
      </Link>

      <p className="text-xs text-default-500 text-center">
        Use: bruno@email.com / 123456
      </p>
    </Form>
  );
}
