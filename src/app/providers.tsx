'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { I18nProvider } from '@/components/i18n-provider';
import { AuthProvider } from '@/contexts';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <HeroUIProvider>
          <AuthProvider>{children}</AuthProvider>
        </HeroUIProvider>
      </NextThemesProvider>
    </I18nProvider>
  );
}
