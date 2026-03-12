import { toast } from 'sonner';

type ApiError = {
  code?: string;
  message?: string;
  messageKey?: string;
};

export function handleApiError(
  error: unknown,
  t: (key: string) => string
) {
  const apiError = error as ApiError;
  const code = apiError?.code;

  if (code === 'PLAN_LIMIT_REACHED') {
    toast.error(t('errors.planLimitReached'), {
      action: {
        label: t('errors.upgradeCta'),
        onClick: () => {
          window.location.href = '/dashboard/billing';
        },
      },
    });
  } else if (code === 'SUBSCRIPTION_REQUIRED') {
    toast.error(t('errors.subscriptionRequired'), {
      action: {
        label: t('errors.subscribeCta'),
        onClick: () => {
          window.location.href = '/dashboard/billing';
        },
      },
    });
  } else if (code === 'READ_ONLY_MODE') {
    toast.error(t('errors.readOnlyMode'));
  } else if (apiError?.messageKey) {
    try {
      toast.error(t(apiError.messageKey));
    } catch {
      toast.error(apiError?.message || t('errors.generic'));
    }
  } else {
    toast.error(apiError?.message || t('errors.generic'));
  }
}
