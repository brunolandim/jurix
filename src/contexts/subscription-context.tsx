'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { subscriptionService } from '@/services/subscription-service';
import type { SubscriptionInfo } from '@/types';

type ResourceType = 'lawyers' | 'activeCases' | 'documents' | 'shareLinks';

interface SubscriptionContextType {
  subscription: SubscriptionInfo | null;
  isLoading: boolean;
  isOwner: boolean;
  canWrite: boolean;
  refresh: () => Promise<void>;
  canCreateResource: (type: ResourceType) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = user?.role === 'owner';
  const canWrite =
    subscription?.status === 'active' ||
    subscription?.status === 'trialing';

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const data = await subscriptionService.getSubscription();
      setSubscription(data);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    }
  }, [isAuthenticated, refresh]);

  const canCreateResource = useCallback(
    (type: ResourceType): boolean => {
      if (!subscription?.usage) return false;
      const usage = subscription.usage[type];
      if (usage.limit === null) return true;
      return usage.current < usage.limit;
    },
    [subscription]
  );

  return (
    <SubscriptionContext.Provider
      value={{ subscription, isLoading, isOwner, canWrite, refresh, canCreateResource }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
