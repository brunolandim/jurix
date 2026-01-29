import { ShareableLink, PublicDocument, LegalCase } from '@/types';

export type CreateShareableLinkParams = {
  legalCase: LegalCase;
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
  /**
   * Creates a shareable link for a case with specific documents
   */
  async createLink(params: CreateShareableLinkParams): Promise<ShareableLink> {
    const { legalCase, documentIds, createdBy } = params;

    // Get document details from the case
    const documents = (legalCase.documentRequests || [])
      .filter((doc) => documentIds.includes(doc.id))
      .map((doc) => ({
        id: doc.id,
        name: doc.name,
        description: doc.description,
      }));

    const response = await fetch('/api/share-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        legalCase,
        documentIds,
        documents,
        createdBy,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create link');
    }

    return result.data;
  },

  /**
   * Gets link data by token (public - no auth required)
   */
  async getLinkByToken(token: string): Promise<PublicLinkData | null> {
    const response = await fetch(`/api/share-link/${token}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to get link');
    }

    const result = await response.json();

    if (!result.success) {
      return null;
    }

    return result.data;
  },

  /**
   * Uploads a document file (public - no auth required)
   */
  async uploadDocument(
    token: string,
    documentId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    file: File
  ): Promise<{ success: boolean; allCompleted: boolean }> {
    // In a real implementation, you would upload the file to storage
    // For now, we just mark it as received
    const response = await fetch(`/api/share-link/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId }),
    });

    if (!response.ok) {
      return { success: false, allCompleted: false };
    }

    const result = await response.json();

    if (!result.success) {
      return { success: false, allCompleted: false };
    }

    return { success: true, allCompleted: result.data.allCompleted };
  },

  /**
   * Gets the full URL for a shareable link
   */
  getShareableUrl(token: string): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/case/${token}`;
    }
    return `/case/${token}`;
  },
};
