'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { I18nProvider } from '@/components/i18n-provider';
import { StoreInitializer } from '@/stores';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <HeroUIProvider>
          <StoreInitializer>{children}</StoreInitializer>
        </HeroUIProvider>
      </NextThemesProvider>
    </I18nProvider>
  );
}
