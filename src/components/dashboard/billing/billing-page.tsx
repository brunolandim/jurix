'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Check, Crown, Zap, Building2, CreditCard, AlertTriangle, Bell } from 'lucide-react';

function WhatsAppIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
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
import { useSubscription } from '@/contexts/subscription-context';
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
      <div className="flex justify-between text-sm gap-2">
        <span className="text-foreground/70 truncate">{label}</span>
        <span className={cn('font-medium shrink-0', isNearLimit && 'text-warning')}>
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
  const searchParams = useSearchParams();
  const { isOwner, refresh: refreshSubscription } = useSubscription();
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
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Stripe checkout redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast.success(t('checkoutSuccess'));
      refreshSubscription();
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', { send_to: 'AW-18136720691/LABEL_ASSINATURA' });
      }
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (canceled === 'true') {
      toast.info(t('checkoutCanceled'));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams, t, refreshSubscription]);

  const handleCheckout = async (planType: string) => {
    setActionLoading(planType);
    try {
      const res = await subscriptionService.createCheckout(planType);
      if (!res.success) {
        const details = (res as { data: { error?: { details?: { code?: string; plan?: string } } } }).data?.error?.details;
        if (details?.code === 'PLAN_LIMITS_EXCEEDED') {
          toast.error(t('downgradeLimitsExceeded', { plan: details.plan ?? '' }));
        } else if (res.code === 'FORBIDDEN') {
          toast.error(t('ownerOnly'));
        } else {
          toast.error(res.message || t('loadError'));
        }
        return;
      }
      if (res.data?.upgraded) {
        toast.success(t('upgradeSuccess'));
        await loadData();
        refreshSubscription();
      } else if (res.data?.url) {
        window.location.href = res.data.url;
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
        toast.success(t('cancelSuccess'));
        setShowCancelModal(false);
        await loadData();
        refreshSubscription();
      }
    } catch {
      toast.error(t('loadError'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async () => {
    setActionLoading('reactivate');
    try {
      const success = await subscriptionService.reactivate();
      if (success) {
        toast.success(t('reactivateSuccess'));
        await loadData();
        refreshSubscription();
      }
    } catch {
      toast.error(t('loadError'));
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Chip
                  color={
                    status === 'active'
                      ? 'success'
                      : status === 'trialing'
                        ? 'primary'
                        : status === 'past_due'
                          ? 'warning'
                          : 'danger'
                  }
                  variant="flat"
                  size="lg"
                >
                  {t(`status.${status}`)}
                </Chip>
                {currentPlan && <span className="text-lg font-semibold capitalize">{currentPlan}</span>}
              </div>
              {hasActiveSubscription && isOwner && (
                <Button
                  variant="flat"
                  startContent={<CreditCard size={16} />}
                  onPress={handlePortal}
                  isLoading={actionLoading === 'portal'}
                  size="sm"
                >
                  {t('managePayment')}
                </Button>
              )}
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
                    <UsageBar
                      current={info.usage.lawyers.current}
                      limit={info.usage.lawyers.limit}
                      label={t('lawyers')}
                    />
                    <UsageBar
                      current={info.usage.activeCases.current}
                      limit={info.usage.activeCases.limit}
                      label={t('activeCases')}
                    />
                    <UsageBar
                      current={info.usage.documents.current}
                      limit={info.usage.documents.limit}
                      label={t('documents')}
                    />
                    <UsageBar
                      current={info.usage.shareLinks.current}
                      limit={info.usage.shareLinks.limit}
                      label={t('shareLinks')}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Cancel / Reactivate (owner only) */}
            {isOwner && hasActiveSubscription && !info.cancelAtPeriodEnd && (
              <div className="flex justify-end">
                <Button variant="light" color="danger" size="sm" onPress={() => setShowCancelModal(true)}>
                  {t('cancelSubscription')}
                </Button>
              </div>
            )}
            {isOwner && info.cancelAtPeriodEnd && (
              <div className="flex justify-end">
                <Button color="primary" size="sm" onPress={handleReactivate} isLoading={actionLoading === 'reactivate'}>
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
              <Card key={plan.type} className={cn('relative', isCurrent && 'border-2 border-primary')}>
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
                  <div className="mb-3 rounded-lg bg-primary/10 p-3">
                    <div className="flex items-center gap-2">
                      <Bell size={18} className="text-primary shrink-0" />
                      <span className="text-sm font-semibold text-primary">{t('notificationHighlight')}</span>
                    </div>
                    <p className="mt-1 ml-[26px] text-xs text-foreground/60">{t('notificationHighlightDesc')}</p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-success shrink-0" />
                      <span>
                        {limits.lawyers !== null
                          ? `${limits.lawyers} ${t('lawyers')}`
                          : `${t('lawyers')} ${t('unlimited').toLowerCase()}`}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-success shrink-0" />
                      <span>
                        {limits.activeCases !== null
                          ? `${limits.activeCases} ${t('activeCases')}`
                          : `${t('activeCases')} ${t('unlimited').toLowerCase()}`}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-success shrink-0" />
                      <span>
                        {limits.documents !== null
                          ? `${limits.documents} ${t('documents')}`
                          : `${t('documents')} ${t('unlimited').toLowerCase()}`}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-success shrink-0" />
                      <span>
                        {limits.shareLinks !== null
                          ? `${limits.shareLinks} ${t('shareLinks')}`
                          : `${t('shareLinks')} ${t('unlimited').toLowerCase()}`}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <WhatsAppIcon size={16} className="text-success shrink-0" />
                      <span>{t('whatsappShare')}</span>
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
                      isDisabled={!isOwner}
                    >
                      {!hasActiveSubscription
                        ? t('subscribe')
                        : plan.price > (plans.find((p) => p.type === currentPlan)?.price ?? 0)
                          ? t('upgrade')
                          : t('downgrade')}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
        {!hasActiveSubscription && isOwner && <p className="text-center text-sm text-foreground/50 mt-4">{t('trialInfo')}</p>}
        {!isOwner && <p className="text-center text-sm text-foreground/50 mt-4">{t('ownerOnly')}</p>}
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
            <Button color="danger" onPress={handleCancel} isLoading={actionLoading === 'cancel'}>
              {t('confirmCancelBtn')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
