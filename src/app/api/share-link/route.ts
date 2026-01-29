import { NextRequest, NextResponse } from 'next/server';
import { shareableLinksStore, StoredLink } from './store';

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// POST - Create a new shareable link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { legalCase, documentIds, documents, createdBy } = body;

    const token = generateToken();

    const link: StoredLink = {
      id: crypto.randomUUID(),
      token,
      caseId: legalCase.id,
      caseNumber: legalCase.number,
      caseTitle: legalCase.title,
      caseDescription: legalCase.description,
      lawyerName: legalCase.lawyer?.name,
      documentIds,
      documents: documents.map((doc: { id: string; name: string; description?: string }) => ({
        id: doc.id,
        name: doc.name,
        description: doc.description,
        status: 'pending' as const,
      })),
      isExpired: false,
      createdAt: new Date().toISOString(),
      createdBy,
    };

    shareableLinksStore.set(token, link);

    return NextResponse.json({ success: true, data: link });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json({ success: false, error: 'Failed to create link' }, { status: 500 });
  }
}
