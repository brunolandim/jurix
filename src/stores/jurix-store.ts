import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createAuthSlice, type AuthSlice } from './slices/auth-slice';
import { createFiltersSlice, type FiltersSlice } from './slices/filters-slice';
import { createLawyersSlice, type LawyersSlice } from './slices/lawyers-slice';
import { createKanbanSlice, type KanbanSlice } from './slices/kanban-slice';
import {
  createHeaderNotificationsSlice,
  type HeaderNotificationsSlice,
} from './slices/header-notifications-slice';

export type JurixStore = AuthSlice &
  FiltersSlice &
  LawyersSlice &
  KanbanSlice &
  HeaderNotificationsSlice;

export const useJurixStore = create<JurixStore>()(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
      ...createFiltersSlice(...args),
      ...createLawyersSlice(...args),
      ...createKanbanSlice(...args),
      ...createHeaderNotificationsSlice(...args),
    }),
    {
      name: 'jurix-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist filters
      partialize: (state) => ({
        filters: {
          selectedLawyerIds: state.filters.selectedLawyerIds,
          showUnassigned: state.filters.showUnassigned,
        },
      }),
    }
  )
);
