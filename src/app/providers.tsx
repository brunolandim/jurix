'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { I18nProvider } from '@/components/i18n-provider';
import { AuthProvider } from '@/contexts';
import { SubscriptionProvider } from '@/contexts/subscription-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <HeroUIProvider>
          <AuthProvider>
            <SubscriptionProvider>
              {children}
              <Toaster richColors position="top-right" theme="dark" />
            </SubscriptionProvider>
          </AuthProvider>
        </HeroUIProvider>
      </NextThemesProvider>
    </I18nProvider>
  );
}
