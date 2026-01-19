# CLAUDE.md

## Projeto

**Jurix** - Aplicação jurídica construída com Next.js 16 e React 19.

## Stack Técnica

- **Framework:** Next.js 16.1.3 (App Router)
- **UI:** React 19.2.3 + HeroUI + Tailwind CSS 4
- **Animações:** Framer Motion
- **Tema:** next-themes (dark mode padrão)
- **Linguagem:** TypeScript

## Comandos

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Iniciar produção
npm run lint     # Executar ESLint
```

## Estrutura do Projeto

```
src/
├── app/                    # App Router (páginas)
│   ├── auth/               # Autenticação (login, forgot-password, reset-password)
│   ├── dashboard/          # Área protegida
│   ├── layout.tsx          # Layout raiz
│   ├── providers.tsx       # HeroUI + ThemeProvider
│   └── globals.css         # Estilos globais
├── components/             # Componentes React
│   ├── auth/               # Componentes de autenticação
│   ├── dashboard/          # Componentes do dashboard
│   └── ui/                 # Componentes UI reutilizáveis
├── hooks/                  # Custom hooks
│   └── use-auth.ts         # Hook de autenticação
├── services/               # Serviços e API
│   ├── api.ts              # Cliente HTTP
│   └── auth-service.ts     # Serviço de autenticação
├── lib/                    # Utilitários
│   ├── utils.ts            # Funções utilitárias (cn, etc.)
│   └── constants.ts        # Constantes da aplicação
├── types/                  # Tipos TypeScript
│   ├── index.ts            # Tipos exportados
│   └── global.d.ts         # Tipos globais
└── hero.ts                 # Configuração HeroUI
```

## Convenções

### Imports

Usar path aliases configurados no tsconfig:
- `@/components` → `src/components`
- `@/hooks` → `src/hooks`
- `@/services` → `src/services`
- `@/lib` → `src/lib`
- `@/types` → `src/types`

### Componentes

- Usar `"use client"` para componentes com hooks/interatividade
- Componentes de página em `src/app/`
- Componentes reutilizáveis em `src/components/`

### Estilização

- Tailwind CSS para estilos
- Usar `cn()` de `@/lib/utils` para classes condicionais
- HeroUI para componentes base

### Autenticação

- `useAuth()` hook para estado de autenticação
- Páginas protegidas redirecionam para `/auth/login`
- Serviço de auth em `@/services/auth-service`

## Idioma

Interface em Português (pt-BR).
