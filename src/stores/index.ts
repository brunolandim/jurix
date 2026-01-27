// Store
export { useJurixStore, type JurixStore } from './jurix-store';

// Selectors (state access + actions)
export * from './selectors';

// React-specific hooks (logic that can't live in Zustand)
export { useDndKanban } from './use-dnd-kanban';
export { useNotificationsPolling } from './use-notifications-polling';
export { StoreInitializer } from './store-initializer';

// Re-export types
export type { NotificationWithCase } from '@/services/notification-service';
