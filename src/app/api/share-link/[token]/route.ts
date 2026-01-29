import { NextRequest, NextResponse } from 'next/server';
import { shareableLinksStore } from '../store';

// GET - Get link data by token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const link = shareableLinksStore.get(token);

    if (!link) {
      return NextResponse.json({ success: false, error: 'Link not found' }, { status: 404 });
    }

    // Return public data
    return NextResponse.json({
      success: true,
      data: {
        caseNumber: link.caseNumber,
        caseTitle: link.caseTitle,
        caseDescription: link.caseDescription,
        lawyerName: link.lawyerName,
        documents: link.documents,
        isExpired: link.isExpired,
      },
    });
  } catch (error) {
    console.error('Error getting share link:', error);
    return NextResponse.json({ success: false, error: 'Failed to get link' }, { status: 500 });
  }
}

// POST - Upload document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const link = shareableLinksStore.get(token);

    if (!link) {
      return NextResponse.json({ success: false, error: 'Link not found' }, { status: 404 });
    }

    if (link.isExpired) {
      return NextResponse.json({ success: false, error: 'Link expired' }, { status: 400 });
    }

    const body = await request.json();
    const { documentId } = body;

    if (!link.documentIds.includes(documentId)) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    // Update document status
    link.documents = link.documents.map((doc) =>
      doc.id === documentId ? { ...doc, status: 'received' as const } : doc
    );

    // Check if all documents are received
    const allReceived = link.documents.every((doc) => doc.status === 'received');
    if (allReceived) {
      link.isExpired = true;
    }

    shareableLinksStore.set(token, link);

    return NextResponse.json({
      success: true,
      data: { allCompleted: allReceived },
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload' }, { status: 500 });
  }
}
