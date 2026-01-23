export const locales = ['pt-BR', 'en', 'es'] as const;
export const defaultLocale = 'pt-BR';

export type Locale = (typeof locales)[number];
