'use client';

import { useState, useEffect } from 'react';
import { Input, Select, SelectItem } from '@/components/ui';
import { useLocale } from '@/components/i18n-provider';
import { COUNTRY_CODES, getCountryByLocale, formatPhoneNumber, parsePhoneNumber, type LocaleCode } from '@/lib/phone';

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  isRequired?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  isDisabled?: boolean;
};

export function PhoneInput({
  value,
  onChange,
  label,
  placeholder,
  isRequired,
  isInvalid,
  errorMessage,
  isDisabled,
}: PhoneInputProps) {
  const { locale } = useLocale();
  const defaultCountry = getCountryByLocale(locale);

  const [countryCode, setCountryCode] = useState(defaultCountry.code);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (value) {
      const digits = value.replace(/\D/g, '');

      for (const [, country] of Object.entries(COUNTRY_CODES)) {
        const code = country.code.replace('+', '');
        if (digits.startsWith(code)) {
          setCountryCode(country.code);
          setPhoneNumber(digits.slice(code.length));
          return;
        }
      }

      setPhoneNumber(digits);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePhoneChange = (newPhone: string) => {
    const digits = parsePhoneNumber(newPhone);
    setPhoneNumber(digits);

    const code = countryCode.replace('+', '');
    const fullNumber = digits ? `${code}${digits}` : '';
    onChange(fullNumber);
  };

  const handleCountryChange = (newCode: typeof countryCode) => {
    setCountryCode(newCode);

    const code = newCode.replace('+', '');
    const fullNumber = phoneNumber ? `${code}${phoneNumber}` : '';
    onChange(fullNumber);
  };

  const currentPlaceholder = placeholder || COUNTRY_CODES[locale as LocaleCode]?.placeholder || '(11) 99999-9999';
  const formattedValue = formatPhoneNumber(phoneNumber, countryCode);

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm text-default-700">{label}</label>}
      <div className="flex gap-2">
        <div className="w-32 shrink-0">
          <Select
            selectedKeys={[countryCode]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as typeof countryCode;
              if (selected) handleCountryChange(selected);
            }}
            aria-label="Código do país"
            isDisabled={isDisabled}
            disallowEmptySelection
          >
            {Object.entries(COUNTRY_CODES).map(([, country]) => (
              <SelectItem key={country.code} textValue={`${country.flag} ${country.code}`}>
                {country.flag} {country.code}
              </SelectItem>
            ))}
          </Select>
        </div>

        <Input
          value={formattedValue}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder={currentPlaceholder}
          isRequired={isRequired}
          isInvalid={isInvalid}
          errorMessage={errorMessage}
          isDisabled={isDisabled}
          className="flex-1"
        />
      </div>
    </div>
  );
}
