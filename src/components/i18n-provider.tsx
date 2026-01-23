'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { locales, defaultLocale, type Locale } from '@/i18n/routing';

const LOCALE_STORAGE_KEY = 'jurix-locale';

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isLoaded: boolean;
};

const I18nContext = createContext<I18nContextType | null>(null);

function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  const browserLang = navigator.language;

  if (locales.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }

  const langCode = browserLang.split('-')[0];
  const match = locales.find((locale) => locale.startsWith(langCode));

  return match || defaultLocale;
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale;
  }

  return getBrowserLocale();
}

// Import messages dynamically
async function loadMessages(locale: Locale) {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch {
    return (await import(`@/messages/${defaultLocale}.json`)).default;
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    setLocaleState(newLocale);
  }, []);

  // Load messages when locale changes
  useEffect(() => {
    loadMessages(locale).then((msgs) => {
      setMessages(msgs);
      setIsLoaded(true);
    });
  }, [locale]);

  if (!messages) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, isLoaded }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useLocale must be used within I18nProvider');
  }
  return context;
}
