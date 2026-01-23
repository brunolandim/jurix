'use client';

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@/components/ui';
import { Globe } from 'lucide-react';
import { useLocale } from '@/components/i18n-provider';
import { locales, type Locale } from '@/i18n/routing';

const localeNames: Record<Locale, string> = {
  'pt-BR': 'Português',
  en: 'English',
  es: 'Español',
};

const localeFlags: Record<Locale, string> = {
  'pt-BR': '🇧🇷',
  en: '🇺🇸',
  es: '🇪🇸',
};

export function LanguageSelector() {
  const { locale, setLocale } = useLocale();

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="light" size="sm" isIconOnly>
          <Globe className="w-5 h-5" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Language selection"
        selectedKeys={[locale]}
        selectionMode="single"
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as Locale;
          if (selected) setLocale(selected);
        }}
      >
        {locales.map((loc) => (
          <DropdownItem key={loc} startContent={<span>{localeFlags[loc]}</span>}>
            {localeNames[loc]}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
