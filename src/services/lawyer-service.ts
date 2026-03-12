import { Lawyer } from '@/types';
import { api } from './api';

export const lawyerService = {
  async getLawyers(): Promise<Lawyer[]> {
    const res = await api.get<Lawyer[]>('/lawyers');
    if (!res.success || !res.data) return [];
    return res.data.filter((l) => l.active);
  },

  async getAllLawyers(): Promise<Lawyer[]> {
    const res = await api.get<Lawyer[]>('/lawyers');
    return res.success && res.data ? res.data : [];
  },

  async getLawyerById(id: string): Promise<Lawyer | null> {
    const res = await api.get<Lawyer>(`/lawyers/${id}`);
    return res.success && res.data ? res.data : null;
  },

  async createLawyer(lawyer: Omit<Lawyer, 'id' | 'createdAt'>): Promise<Lawyer> {
    const res = await api.post<Lawyer>('/lawyers', lawyer);
    if (!res.success || !res.data) {
      const error = new Error(res.message || 'Failed to create lawyer');
      (error as any).code = res.code;
      (error as any).status = res.status;
      throw error;
    }
    return res.data;
  },

  async updateLawyer(id: string, data: Partial<Lawyer>): Promise<Lawyer> {
    const res = await api.put<Lawyer>(`/lawyers/${id}`, data);
    if (!res.success || !res.data) {
      const error = new Error(res.message || 'Failed to update lawyer');
      (error as any).code = res.code;
      (error as any).status = res.status;
      throw error;
    }
    return res.data;
  },

  async deleteLawyer(id: string): Promise<boolean> {
    const res = await api.delete(`/lawyers/${id}`);
    return res.success;
  },
};
