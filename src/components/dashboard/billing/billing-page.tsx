'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Crown, Zap, Building2, CreditCard, AlertTriangle } from 'lucide-react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Chip,
  Divider,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { subscriptionService } from '@/services/subscription-service';
import type { Plan, SubscriptionInfo } from '@/types';

const planIcons = {
  pro: Zap,
  business: Crown,
  enterprise: Building2,
} as const;

const planColors = {
  pro: 'default',
  business: 'primary',
  enterprise: 'secondary',
} as const;

function formatPrice(cents: number): string {
  return `R$ ${(cents / 100).toFixed(0)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function UsageBar({ current, limit, label }: { current: number; limit: number | null; label: string }) {
  const t = useTranslations('billing');
  const percent = limit ? Math.min((current / limit) * 100, 100) : 0;
  const isNearLimit = limit ? percent >= 80 : false;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-foreground/70">{label}</span>
        <span className={cn('font-medium', isNearLimit && 'text-warning')}>
          {current} {limit !== null ? `${t('usageOf')} ${limit}` : `(${t('unlimited')})`}
        </span>
      </div>
      {limit !== null && (
        <div className="h-2 bg-default-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              percent >= 90 ? 'bg-danger' : percent >= 70 ? 'bg-warning' : 'bg-primary'
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function BillingPage() {
  const t = useTranslations('billing');
  const tc = useTranslations('common');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [plansData, infoData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getSubscription(),
      ]);
      setPlans(plansData);
      setInfo(infoData);
    } catch {
      console.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCheckout = async (planType: string) => {
    setActionLoading(planType);
    try {
      const url = await subscriptionService.createCheckout(planType);
      if (url) {
        window.location.href = url;
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handlePortal = async () => {
    setActionLoading('portal');
    try {
      const url = await subscriptionService.createPortal();
      if (url) {
        window.location.href = url;
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    setActionLoading('cancel');
    try {
      const success = await subscriptionService.cancel();
      if (success) {
        setShowCancelModal(false);
        await loadData();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async () => {
    setActionLoading('reactivate');
    try {
      const success = await subscriptionService.reactivate();
      if (success) {
        await loadData();
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const currentPlan = info?.plan;
  const status = info?.status;
  const hasActiveSubscription = status === 'active' || status === 'trialing';

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {/* Subscription Status */}
      {info && status && (
        <Card>
          <CardBody className="gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Chip
                  color={
                    status === 'active' ? 'success' :
                    status === 'trialing' ? 'primary' :
                    status === 'past_due' ? 'warning' : 'danger'
                  }
                  variant="flat"
                  size="lg"
                >
                  {t(`status.${status}`)}
                </Chip>
                {currentPlan && (
                  <span className="text-lg font-semibold capitalize">{currentPlan}</span>
                )}
              </div>
              <div className="flex gap-2">
                {hasActiveSubscription && (
                  <Button
                    variant="flat"
                    startContent={<CreditCard size={16} />}
                    onPress={handlePortal}
                    isLoading={actionLoading === 'portal'}
                  >
                    {t('managePayment')}
                  </Button>
                )}
              </div>
            </div>

            {/* Trial / Period info */}
            {status === 'trialing' && info.trialEndsAt && (
              <p className="text-sm text-foreground/60">
                {t('trialEndsAt')} {formatDate(info.trialEndsAt)}
              </p>
            )}
            {status === 'active' && info.subscription?.currentPeriodEnd && (
              <p className="text-sm text-foreground/60">
                {t('currentPeriodEnd')} {formatDate(info.subscription.currentPeriodEnd)}
              </p>
            )}
            {info.cancelAtPeriodEnd && (
              <div className="flex items-center gap-2 text-warning">
                <AlertTriangle size={16} />
                <span className="text-sm">{t('cancelScheduled')}</span>
              </div>
            )}

            {/* Usage */}
            {hasActiveSubscription && info.usage && (
              <>
                <Divider />
                <div>
                  <h3 className="text-sm font-semibold mb-3">{t('usage')}</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <UsageBar current={info.usage.lawyers.current} limit={info.usage.lawyers.limit} label={t('lawyers')} />
                    <UsageBar current={info.usage.activeCases.current} limit={info.usage.activeCases.limit} label={t('activeCases')} />
                    <UsageBar current={info.usage.documents.current} limit={info.usage.documents.limit} label={t('documents')} />
                    <UsageBar current={info.usage.shareLinks.current} limit={info.usage.shareLinks.limit} label={t('shareLinks')} />
                  </div>
                </div>
              </>
            )}

            {/* Cancel / Reactivate */}
            {hasActiveSubscription && !info.cancelAtPeriodEnd && (
              <div className="flex justify-end">
                <Button
                  variant="light"
                  color="danger"
                  size="sm"
                  onPress={() => setShowCancelModal(true)}
                >
                  {t('cancelSubscription')}
                </Button>
              </div>
            )}
            {info.cancelAtPeriodEnd && (
              <div className="flex justify-end">
                <Button
                  color="primary"
                  size="sm"
                  onPress={handleReactivate}
                  isLoading={actionLoading === 'reactivate'}
                >
                  {t('reactivate')}
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* No subscription message */}
      {!status && (
        <Card>
          <CardBody className="text-center py-8">
            <CreditCard size={40} className="mx-auto mb-3 text-foreground/30" />
            <p className="text-lg font-medium mb-1">{t('noSubscription')}</p>
            <p className="text-foreground/50 mb-2">{t('noSubscriptionDesc')}</p>
            <p className="text-sm text-primary">{t('trialInfo')}</p>
          </CardBody>
        </Card>
      )}

      <Divider />

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('plans')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.type === currentPlan;
            const Icon = planIcons[plan.type] ?? Zap;
            const isPopular = plan.type === 'business';
            const limits = plan.limits;

            return (
              <Card
                key={plan.type}
                className={cn(
                  'relative',
                  isCurrent && 'border-2 border-primary'
                )}
              >
                {isPopular && (
                  <div className="absolute top-3 right-3">
                    <Chip color="warning" size="sm" variant="flat">
                      {t('popular')}
                    </Chip>
                  </div>
                )}
                <CardHeader className="flex flex-col items-start gap-1 pb-0">
                  <div className="flex items-center gap-2">
                    <Icon size={20} />
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                    <span className="text-foreground/50 text-sm">{t('month')}</span>
                  </div>
                </CardHeader>
                <CardBody>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-success shrink-0" />
                      <span>{limits.lawyers !== null ? `${limits.lawyers} ${t('lawyers')}` : `${t('lawyers')} ${t('unlimited').toLowerCase()}`}</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-success shrink-0" />
                      <span>{limits.activeCases !== null ? `${limits.activeCases} ${t('activeCases')}` : `${t('activeCases')} ${t('unlimited').toLowerCase()}`}</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-success shrink-0" />
                      <span>{limits.documents !== null ? `${limits.documents} ${t('documents')}` : `${t('documents')} ${t('unlimited').toLowerCase()}`}</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-success shrink-0" />
                      <span>{limits.shareLinks !== null ? `${limits.shareLinks} ${t('shareLinks')}` : `${t('shareLinks')} ${t('unlimited').toLowerCase()}`}</span>
                    </li>
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
                      color={planColors[plan.type] ?? 'default'}
                      variant={isPopular ? 'solid' : 'bordered'}
                      onPress={() => handleCheckout(plan.type)}
                      isLoading={actionLoading === plan.type}
                    >
                      {hasActiveSubscription ? t('upgrade') : t('subscribe')}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
        {!hasActiveSubscription && (
          <p className="text-center text-sm text-foreground/50 mt-4">{t('trialInfo')}</p>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} size="sm">
        <ModalContent>
          <ModalHeader>{t('cancelSubscription')}</ModalHeader>
          <ModalBody>
            <p>{t('confirmCancel')}</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setShowCancelModal(false)}>
              {tc('cancel')}
            </Button>
            <Button
              color="danger"
              onPress={handleCancel}
              isLoading={actionLoading === 'cancel'}
            >
              {t('confirmCancelBtn')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
