'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, CreditCard } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, CardFooter, Input, Chip, Divider } from '@/components/ui';
import { cn } from '@/lib/utils';

type Plan = {
  key: 'basic' | 'professional' | 'enterprise';
  popular?: boolean;
};

const plans: Plan[] = [
  { key: 'basic' },
  { key: 'professional', popular: true },
  { key: 'enterprise' },
];

const planColors = {
  basic: 'default',
  professional: 'primary',
  enterprise: 'secondary',
} as const;

export function BillingPage() {
  const t = useTranslations('billing');
  const tc = useTranslations('common');
  const [currentPlan] = useState<string>('professional');
  const [savedCard, setSavedCard] = useState<{ last4: string; name: string; expiry: string } | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardForm, setCardForm] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  const handleSaveCard = () => {
    const last4 = cardForm.number.replace(/\s/g, '').slice(-4);
    setSavedCard({ last4, name: cardForm.name, expiry: cardForm.expiry });
    setShowCardForm(false);
    setCardForm({ number: '', name: '', expiry: '', cvv: '' });
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return digits.slice(0, 2) + '/' + digits.slice(2);
    }
    return digits;
  };

  const isCardValid =
    cardForm.number.replace(/\s/g, '').length === 16 &&
    cardForm.name.trim().length > 0 &&
    cardForm.expiry.length === 5 &&
    cardForm.cvv.length >= 3;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('plans')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.key === currentPlan;
            const features = t.raw(`${plan.key}.features`) as string[];

            return (
              <Card
                key={plan.key}
                className={cn(
                  'relative',
                  isCurrent && 'border-2 border-primary'
                )}
              >
                {plan.popular && (
                  <div className="absolute top-3 right-3">
                    <Chip color="warning" size="sm" variant="flat">
                      {t('popular')}
                    </Chip>
                  </div>
                )}
                <CardHeader className="flex flex-col items-start gap-1 pb-0">
                  <h3 className="text-lg font-bold">{t(`${plan.key}.name`)}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{t(`${plan.key}.price`)}</span>
                    <span className="text-foreground/50 text-sm">{t('month')}</span>
                  </div>
                </CardHeader>
                <CardBody>
                  <ul className="space-y-2">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check size={16} className="text-success shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
                <CardFooter>
                  {isCurrent ? (
                    <Button fullWidth variant="flat" isDisabled>
                      {t('current')}
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      color={planColors[plan.key]}
                      variant={plan.popular ? 'solid' : 'bordered'}
                    >
                      {t('select')}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      <Divider />

      {/* Payment Method */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('paymentMethod')}</h2>
        {savedCard && !showCardForm ? (
          <Card className="max-w-md">
            <CardBody className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <CreditCard size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {t('cardEndingIn')} {savedCard.last4}
                </p>
                <p className="text-sm text-foreground/60">
                  {savedCard.name} &bull; {savedCard.expiry}
                </p>
              </div>
              <Button size="sm" variant="flat" onPress={() => setShowCardForm(true)}>
                {tc('edit')}
              </Button>
            </CardBody>
          </Card>
        ) : !showCardForm ? (
          <Card className="max-w-md">
            <CardBody className="text-center py-8">
              <CreditCard size={32} className="mx-auto mb-3 text-foreground/30" />
              <p className="text-foreground/50 mb-4">{t('noCard')}</p>
              <Button color="primary" onPress={() => setShowCardForm(true)}>
                {t('addCard')}
              </Button>
            </CardBody>
          </Card>
        ) : (
          <Card className="max-w-md">
            <CardBody className="flex flex-col gap-4">
              <Input
                label={t('cardNumber')}
                placeholder={t('cardNumberPlaceholder')}
                value={cardForm.number}
                onValueChange={(v) => setCardForm((f) => ({ ...f, number: formatCardNumber(v) }))}
                startContent={<CreditCard size={18} className="text-foreground/40" />}
                maxLength={19}
              />
              <Input
                label={t('cardName')}
                placeholder={t('cardNamePlaceholder')}
                value={cardForm.name}
                onValueChange={(v) => setCardForm((f) => ({ ...f, name: v }))}
              />
              <div className="flex gap-4">
                <Input
                  label={t('cardExpiry')}
                  placeholder={t('cardExpiryPlaceholder')}
                  value={cardForm.expiry}
                  onValueChange={(v) => setCardForm((f) => ({ ...f, expiry: formatExpiry(v) }))}
                  maxLength={5}
                  className="flex-1"
                />
                <Input
                  label={t('cardCvv')}
                  placeholder={t('cardCvvPlaceholder')}
                  value={cardForm.cvv}
                  onValueChange={(v) => setCardForm((f) => ({ ...f, cvv: v.replace(/\D/g, '').slice(0, 4) }))}
                  maxLength={4}
                  type="password"
                  className="w-28"
                />
              </div>
            </CardBody>
            <CardFooter className="gap-2">
              <Button
                variant="flat"
                onPress={() => {
                  setShowCardForm(false);
                  setCardForm({ number: '', name: '', expiry: '', cvv: '' });
                }}
              >
                {tc('cancel')}
              </Button>
              <Button color="primary" onPress={handleSaveCard} isDisabled={!isCardValid}>
                {t('saveCard')}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
