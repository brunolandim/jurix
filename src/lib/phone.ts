export const COUNTRY_CODES = {
  'pt-BR': { code: '+55', country: 'BR', flag: '🇧🇷', placeholder: '(11) 99999-9999' },
  'en': { code: '+1', country: 'US', flag: '🇺🇸', placeholder: '(555) 123-4567' },
  'es': { code: '+34', country: 'ES', flag: '🇪🇸', placeholder: '612 34 56 78' },
} as const;

export type LocaleCode = keyof typeof COUNTRY_CODES;

export function getCountryByLocale(locale: string): typeof COUNTRY_CODES[LocaleCode] {
  const normalized = locale as LocaleCode;
  return COUNTRY_CODES[normalized] || COUNTRY_CODES['pt-BR'];
}

export function formatPhoneNumber(phone: string, countryCode: string): string {
  const digits = phone.replace(/\D/g, '');
  
  switch (countryCode) {
    case '+55': // Brasil
      if (digits.length === 11) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      }
      if (digits.length === 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
      }
      return digits;
    
    case '+1': // EUA
      if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
      return digits;
    
    case '+34': // Espanha
      if (digits.length === 9) {
        return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
      }
      return digits;
    
    default:
      return digits;
  }
}

export function parsePhoneNumber(formattedPhone: string): string {
  return formattedPhone.replace(/\D/g, '');
}

export function getFullPhoneNumber(phone: string, countryCode: string): string {
  const digits = parsePhoneNumber(phone);
  const code = countryCode.replace('+', '');
  
  if (digits.startsWith(code)) {
    return digits;
  }
  
  return `${code}${digits}`;
}
