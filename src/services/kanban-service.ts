import { api } from './api';
import { KanbanColumn, LegalCase, CaseNotification, DocumentRequest, DocumentStatus, RejectionReason } from '@/types';

// ============ TYPES ============
export type MoveCaseParams = {
  caseId: string;
  columnId: string;
  previousId: string | null;
  nextId: string | null;
};

export type CreateCaseParams = {
  number: string;
  title: string;
  description?: string;
  client: string;
  priority: LegalCase['priority'];
  columnId: string;
  lawyer?: string;
  createdBy: string;
};

export type AddNotificationParams = {
  caseId: string;
  type: CaseNotification['type'];
  message?: string;
  date: string;
};

export type AddDocumentParams = {
  caseId: string;
  name: string;
  description?: string;
  status: DocumentStatus;
};

// ============ HELPERS ============
const sortByOrder = (columns: KanbanColumn[]) =>
  columns.map((col) => ({ ...col, cases: [...col.cases].sort((a, b) => a.order - b.order) }));

// ============ SERVICE ============
export const kanbanService = {
  // ============ COLUMNS ============
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

  // ============ CASES ============
  async createCase(params: CreateCaseParams): Promise<LegalCase | null> {
    const res = await api.post<LegalCase>('/cases', params);
    return res.success && res.data ? res.data : null;
  },

  async updateCase(id: string, data: Partial<Omit<LegalCase, 'id'>>): Promise<LegalCase | null> {
    const res = await api.put<LegalCase>(`/cases/${id}`, data);
    return res.success && res.data ? res.data : null;
  },

  async moveCase({ caseId, columnId, previousId, nextId }: MoveCaseParams): Promise<LegalCase | null> {
    const res = await api.patch<LegalCase>(`/cases/${caseId}/move`, { columnId, previousId, nextId });
    return res.success && res.data ? res.data : null;
  },

  async assignLawyer(caseId: string, lawyerId: string): Promise<LegalCase | null> {
    const res = await api.patch<LegalCase>(`/cases/${caseId}/assign`, { lawyerId });
    return res.success && res.data ? res.data : null;
  },

  async deleteCase(id: string): Promise<boolean> {
    const res = await api.delete(`/cases/${id}`);
    return res.success;
  },

  // ============ NOTIFICATIONS ============
  async addNotification(params: AddNotificationParams): Promise<CaseNotification | null> {
    const res = await api.post<CaseNotification>('/notifications', params);
    return res.success && res.data ? res.data : null;
  },

  async deleteNotification(caseId: string, notificationId: string): Promise<boolean> {
    const res = await api.delete(`/notifications/${notificationId}`);
    return res.success;
  },

  // ============ DOCUMENTS ============
  async getDocuments(caseId: string): Promise<DocumentRequest[]> {
    const res = await api.get<DocumentRequest[]>(`/documents?caseId=${caseId}`);
    return res.success && res.data ? res.data : [];
  },

  async addDocument(params: AddDocumentParams): Promise<DocumentRequest | null> {
    const res = await api.post<DocumentRequest>('/documents', params);
    return res.success && res.data ? res.data : null;
  },

  async deleteDocument(documentId: string): Promise<boolean> {
    const res = await api.delete(`/documents/${documentId}`);
    return res.success;
  },

  async updateDocumentStatus(
    caseId: string,
    documentId: string,
    status: DocumentStatus
  ): Promise<DocumentRequest | null> {
    const res = await api.put<DocumentRequest>(`/documents/${documentId}`, { status });
    return res.success && res.data ? res.data : null;
  },

  async approveDocument(caseId: string, documentId: string): Promise<DocumentRequest | null> {
    const res = await api.patch<DocumentRequest>(`/documents/${documentId}/approve`);
    return res.success && res.data ? res.data : null;
  },

  async rejectDocument(
    caseId: string,
    documentId: string,
    reason: RejectionReason,
    note?: string
  ): Promise<DocumentRequest | null> {
    const res = await api.patch<DocumentRequest>(`/documents/${documentId}/reject`, { reason, note });
    return res.success && res.data ? res.data : null;
  },
};
