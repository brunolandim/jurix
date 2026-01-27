'use client';

import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useJurixStore } from './jurix-store';

// ============================================
// Auth Selectors
// ============================================

export const useAuthUser = () => useJurixStore((state) => state.auth.user);
export const useIsAuthenticated = () => useJurixStore((state) => state.auth.isAuthenticated);
export const useAuthIsLoading = () => useJurixStore((state) => state.auth.isLoading);
export const useAuthError = () => useJurixStore((state) => state.auth.error);
export const useAuthActions = () => useJurixStore((state) => state.authActions);

export const useAuth = () =>
  useJurixStore(
    useShallow((state) => ({
      user: state.auth.user,
      isAuthenticated: state.auth.isAuthenticated,
      isLoading: state.auth.isLoading,
      error: state.auth.error,
    }))
  );

// ============================================
// Kanban Selectors
// ============================================

export const useColumns = () => useJurixStore((state) => state.kanban.columns);
export const useSelectedCase = () => useJurixStore((state) => state.kanban.selectedCase);
export const useActiveCase = () => useJurixStore((state) => state.kanban.activeCase);
export const useKanbanIsLoading = () => useJurixStore((state) => state.kanban.isLoading);
export const useKanbanActions = () => useJurixStore((state) => state.kanbanActions);

// Get a specific case by ID
export const useCase = (caseId: string) => {
  const columns = useJurixStore((state) => state.kanban.columns);
  return useMemo(() => {
    for (const col of columns) {
      const legalCase = col.cases.find((c) => c.id === caseId);
      if (legalCase) return legalCase;
    }
    return undefined;
  }, [columns, caseId]);
};

// Get notification count for a specific case (KEY for badge updates)
export const useCaseNotificationCount = (caseId: string) => {
  const columns = useJurixStore((state) => state.kanban.columns);
  return useMemo(() => {
    for (const col of columns) {
      const legalCase = col.cases.find((c) => c.id === caseId);
      if (legalCase) return legalCase.notifications?.length ?? 0;
    }
    return 0;
  }, [columns, caseId]);
};

// ============================================
// Filters Selectors
// ============================================

export const useSearchTerm = () => useJurixStore((state) => state.filters.searchTerm);
export const useSelectedLawyerIds = () => useJurixStore((state) => state.filters.selectedLawyerIds);
export const useShowUnassigned = () => useJurixStore((state) => state.filters.showUnassigned);
export const useFilterActions = () => useJurixStore((state) => state.filterActions);

export const useFilters = () =>
  useJurixStore(
    useShallow((state) => ({
      searchTerm: state.filters.searchTerm,
      selectedLawyerIds: state.filters.selectedLawyerIds,
      showUnassigned: state.filters.showUnassigned,
    }))
  );

// Filtered columns (computed selector)
export const useFilteredColumns = () => {
  const columns = useJurixStore((state) => state.kanban.columns);
  const searchTerm = useJurixStore((state) => state.filters.searchTerm);
  const selectedLawyerIds = useJurixStore((state) => state.filters.selectedLawyerIds);
  const showUnassigned = useJurixStore((state) => state.filters.showUnassigned);

  return useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    const hasLawyerFilter = selectedLawyerIds.length > 0 || showUnassigned;

    return columns.map((col) => ({
      ...col,
      cases: col.cases.filter((c) => {
        const matchesSearch =
          !search ||
          c.number.toLowerCase().includes(search) ||
          c.title.toLowerCase().includes(search) ||
          c.client.toLowerCase().includes(search) ||
          (c.lawyer && c.lawyer.name.toLowerCase().includes(search));

        if (!hasLawyerFilter) {
          return matchesSearch;
        }

        const matchesSelectedLawyer = c.lawyer && selectedLawyerIds.includes(c.lawyer.id);
        const matchesUnassigned = showUnassigned && !c.lawyer;

        return matchesSearch && (matchesSelectedLawyer || matchesUnassigned);
      }),
    }));
  }, [columns, searchTerm, selectedLawyerIds, showUnassigned]);
};

// ============================================
// Lawyers Selectors
// ============================================

export const useLawyers = () => useJurixStore((state) => state.lawyers.list);
export const useLawyersIsLoading = () => useJurixStore((state) => state.lawyers.isLoading);
export const useLawyersActions = () => useJurixStore((state) => state.lawyersActions);

// ============================================
// Header Notifications Selectors
// ============================================

export const useHeaderNotifications = () =>
  useJurixStore((state) => state.headerNotifications.notifications);
export const useHeaderNotificationsIsLoading = () =>
  useJurixStore((state) => state.headerNotifications.isLoading);
export const useHeaderNotificationsError = () =>
  useJurixStore((state) => state.headerNotifications.error);
export const useHeaderNotificationsActions = () =>
  useJurixStore((state) => state.headerNotificationsActions);

export const useUnreadNotificationCount = () => {
  const notifications = useJurixStore((state) => state.headerNotifications.notifications);
  return notifications.length;
};
