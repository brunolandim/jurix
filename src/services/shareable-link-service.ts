import { ShareableLink, PublicDocument } from '@/types';
import { api } from './api';
import { uploadWithPresignedUrl } from '@/lib/upload';

export type CreateShareableLinkParams = {
  caseId: string;
  documentIds: string[];
  createdBy: string;
};

export type PublicLinkData = {
  caseNumber: string;
  caseTitle: string;
  caseDescription?: string;
  lawyerName?: string;
  documents: PublicDocument[];
  isExpired: boolean;
};

type PresignedUrlResponse = {
  uploadUrl: string;
  fileUrl: string;
  documentId: string;
};

export const shareableLinkService = {
  async createLink(params: CreateShareableLinkParams): Promise<ShareableLink> {
    const res = await api.post<ShareableLink>('/share-links', params);

    if (!res.success || !res.data) {
      const error = new Error(res.message || 'Failed to create link');
      (error as any).code = res.code;
      (error as any).status = res.status;
      throw error;
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
    try {
      // 1. Get presigned URL
      const fileUrl = await uploadWithPresignedUrl(file, async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/share-links/${token}/upload-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId,
            contentType: file.type,
            fileName: file.name,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get presigned URL');
        }

        return response.json();
      });

      // 2. Confirm upload
      const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/share-links/${token}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          fileUrl,
        }),
      });

      if (!confirmResponse.ok) {
        return { success: false, allCompleted: false };
      }

      if (confirmResponse.status === 204) {
        return { success: true, allCompleted: false };
      }

      const result = await confirmResponse.json();
      return { success: true, allCompleted: result.allCompleted ?? false };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, allCompleted: false };
    }
  },

  getShareableUrl(token: string): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/case/${token}`;
    }
    return `/case/${token}`;
  },
};
