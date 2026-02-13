'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { I18nProvider, useLocale } from '@/components/i18n-provider';
import { AuthProvider } from '@/contexts';
import { SubscriptionProvider } from '@/contexts/subscription-context';

function InnerProviders({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark">
      <HeroUIProvider locale={locale}>
        <AuthProvider>
          <SubscriptionProvider>
            {children}
            <Toaster richColors position="top-right" theme="dark" />
          </SubscriptionProvider>
        </AuthProvider>
      </HeroUIProvider>
    </NextThemesProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <InnerProviders>{children}</InnerProviders>
    </I18nProvider>
  );
}
