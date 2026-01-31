import { ShareableLink, PublicDocument } from '@/types';
import { api } from './api';

export type CreateShareableLinkParams = {
  caseId: string;
  documentIds: string[];
  createdBy: { id: string; name: string };
};

export type PublicLinkData = {
  caseNumber: string;
  caseTitle: string;
  caseDescription?: string;
  lawyerName?: string;
  documents: PublicDocument[];
  isExpired: boolean;
};

export const shareableLinkService = {
  async createLink(params: CreateShareableLinkParams): Promise<ShareableLink> {
    const res = await api.post<ShareableLink>('/share-links', params);

    if (!res.success || !res.data) {
      throw new Error('Failed to create link');
    }

    return res.data;
  },

  async getLinkByToken(token: string): Promise<PublicLinkData | null> {
    const res = await api.get<PublicLinkData>(`/share-links/${token}`);

    if (!res.success || !res.data) {
      return null;
    }

    return res.data;
  },

  async uploadDocument(
    token: string,
    documentId: string,
    file: File
  ): Promise<{ success: boolean; allCompleted: boolean }> {
    const formData = new FormData();
    formData.append('documentId', documentId);
    formData.append('file', file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || '/api'}/share-links/${token}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      return { success: false, allCompleted: false };
    }

    const result = await response.json();
    return { success: true, allCompleted: result.allCompleted ?? false };
  },

  getShareableUrl(token: string): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/case/${token}`;
    }
    return `/case/${token}`;
  },
};
