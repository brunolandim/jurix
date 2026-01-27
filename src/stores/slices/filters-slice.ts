import { StateCreator } from 'zustand';

export interface FiltersSlice {
  filters: {
    searchTerm: string;
    selectedLawyerIds: string[];
    showUnassigned: boolean;
  };
  filterActions: {
    setSearchTerm: (term: string) => void;
    toggleLawyer: (lawyerId: string) => void;
    toggleUnassigned: () => void;
    clearFilters: () => void;
  };
}

export const createFiltersSlice: StateCreator<FiltersSlice, [], [], FiltersSlice> = (set) => ({
  filters: {
    searchTerm: '',
    selectedLawyerIds: [],
    showUnassigned: false,
  },
  filterActions: {
    setSearchTerm: (term) =>
      set((state) => ({ filters: { ...state.filters, searchTerm: term } })),
    toggleLawyer: (lawyerId) =>
      set((state) => ({
        filters: {
          ...state.filters,
          selectedLawyerIds: state.filters.selectedLawyerIds.includes(lawyerId)
            ? state.filters.selectedLawyerIds.filter((id) => id !== lawyerId)
            : [...state.filters.selectedLawyerIds, lawyerId],
        },
      })),
    toggleUnassigned: () =>
      set((state) => ({
        filters: { ...state.filters, showUnassigned: !state.filters.showUnassigned },
      })),
    clearFilters: () =>
      set({
        filters: { searchTerm: '', selectedLawyerIds: [], showUnassigned: false },
      }),
  },
});
