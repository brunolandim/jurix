import { api } from './api';
import { KanbanColumn } from '@/types';

const sortByOrder = (columns: KanbanColumn[]) =>
  columns.map((col) => ({ ...col, cases: [...col.cases].sort((a, b) => a.order - b.order) }));

export const columnService = {
  async getColumns(): Promise<KanbanColumn[]> {
    const res = await api.get<KanbanColumn[]>('/columns');
    return res.success && res.data ? sortByOrder(res.data) : [];
  },

  async createColumn(title: string): Promise<KanbanColumn | null> {
    const res = await api.post<KanbanColumn>('/columns', { title });
    return res.success && res.data ? res.data : null;
  },

  async updateColumn(id: string, title: string): Promise<KanbanColumn | null> {
    const res = await api.put<KanbanColumn>(`/columns/${id}`, { title });
    return res.success && res.data ? res.data : null;
  },

  async deleteColumn(id: string): Promise<boolean> {
    const res = await api.delete(`/columns/${id}`);
    return res.success;
  },
};
