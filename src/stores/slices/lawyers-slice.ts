import { StateCreator } from 'zustand';
import { Lawyer } from '@/types';
import { lawyerService } from '@/services';

export interface LawyersSlice {
  lawyers: {
    list: Lawyer[];
    isLoading: boolean;
  };
  lawyersActions: {
    fetchLawyers: () => Promise<void>;
  };
}

export const createLawyersSlice: StateCreator<LawyersSlice, [], [], LawyersSlice> = (set) => ({
  lawyers: {
    list: [],
    isLoading: true,
  },
  lawyersActions: {
    fetchLawyers: async () => {
      const lawyers = await lawyerService.getLawyers();
      set({ lawyers: { list: lawyers, isLoading: false } });
    },
  },
});
