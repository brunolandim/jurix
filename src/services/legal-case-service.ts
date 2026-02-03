import { api } from './api';
import {
  LegalCase,
  CaseNotification,
  DocumentRequest,
  DocumentStatus,
  RejectionReason,
  NotificationType,
} from '@/types';

export type CreateCaseParams = {
  number: string;
  title: string;
  description?: string;
  client: string;
  priority: LegalCase['priority'];
  columnId: string;
  assignedTo?: string;
  createdBy: string;
};

export type MoveCaseParams = {
  caseId: string;
  columnId: string;
  order: number;
};

export type AddNotificationParams = {
  caseId: string;
  type: NotificationType;
  message?: string;
  date: string;
};

export type AddDocumentParams = {
  caseId: string;
  name: string;
  description?: string;
  status: DocumentStatus;
};

export const legalCaseService = {
  // ============ CASES ============
  async createCase(params: CreateCaseParams): Promise<LegalCase | null> {
    const res = await api.post<LegalCase>('/cases', params);
    return res.success && res.data ? res.data : null;
  },

  async updateCase(id: string, data: Partial<Omit<LegalCase, 'id'>>): Promise<LegalCase | null> {
    const res = await api.put<LegalCase>(`/cases/${id}`, data);
    return res.success && res.data ? res.data : null;
  },

  async moveCase({ caseId, columnId, order }: MoveCaseParams): Promise<LegalCase | null> {
    const res = await api.patch<LegalCase>(`/cases/${caseId}/move`, { columnId, order });
    return res.success && res.data ? res.data : null;
  },

  async assignLawyer(caseId: string, assignedTo: string): Promise<LegalCase | null> {
    const res = await api.patch<LegalCase>(`/cases/${caseId}/assign`, { assignedTo });
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

  async deleteNotification(notificationId: string): Promise<boolean> {
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

  async updateDocumentStatus(documentId: string, status: DocumentStatus): Promise<DocumentRequest | null> {
    const res = await api.put<DocumentRequest>(`/documents/${documentId}`, { status });
    return res.success && res.data ? res.data : null;
  },

  async approveDocument(documentId: string): Promise<DocumentRequest | null> {
    const res = await api.patch<DocumentRequest>(`/documents/${documentId}/approve`);
    return res.success && res.data ? res.data : null;
  },

  async rejectDocument(documentId: string, reason: RejectionReason, note?: string): Promise<DocumentRequest | null> {
    const res = await api.patch<DocumentRequest>(`/documents/${documentId}/reject`, { reason, note });
    return res.success && res.data ? res.data : null;
  },
};
