'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, CheckCircle, FileText, AlertCircle, Clock } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Spinner, Chip } from '@/components/ui';
import { shareableLinkService, PublicLinkData } from '@/services';
import { PublicDocument } from '@/types';
import { cn } from '@/lib/utils';

type PageState = 'loading' | 'error' | 'expired' | 'success' | 'ready';

type DocumentWithUpload = PublicDocument & {
  isUploading?: boolean;
  uploadError?: string;
  file?: File;
};

export default function PublicUploadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const t = useTranslations('publicUpload');

  const [pageState, setPageState] = useState<PageState>('loading');
  const [linkData, setLinkData] = useState<PublicLinkData | null>(null);
  const [documents, setDocuments] = useState<DocumentWithUpload[]>([]);

  // Fetch link data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await shareableLinkService.getLinkByToken(token);

        if (!data) {
          setPageState('error');
          return;
        }

        if (data.isExpired) {
          setPageState('expired');
          setLinkData(data);
          return;
        }

        setLinkData(data);
        setDocuments(data.documents);
        setPageState('ready');
      } catch {
        setPageState('error');
      }
    }

    fetchData();
  }, [token]);

  const handleFileSelect = useCallback(
    async (documentId: string, file: File) => {
      // Update local state to show uploading
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId ? { ...doc, isUploading: true, uploadError: undefined, file } : doc
        )
      );

      try {
        const result = await shareableLinkService.uploadDocument(token, documentId, file);

        if (result.success) {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === documentId ? { ...doc, status: 'received', isUploading: false } : doc
            )
          );

          // Check if all documents are completed
          if (result.allCompleted) {
            setPageState('success');
          }
        } else {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === documentId
                ? { ...doc, isUploading: false, uploadError: t('uploadError') }
                : doc
            )
          );
        }
      } catch {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === documentId
              ? { ...doc, isUploading: false, uploadError: t('uploadError') }
              : doc
          )
        );
      }
    },
    [token, t]
  );

  const handleInputChange = useCallback(
    (documentId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(documentId, file);
      }
    },
    [handleFileSelect]
  );

  // Progress calculation
  const totalDocuments = documents.length;
  const receivedDocuments = documents.filter((d) => d.status === 'received').length;
  const progressPercent = totalDocuments > 0 ? (receivedDocuments / totalDocuments) * 100 : 0;

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-default-500">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Error state - link not found
  if (pageState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center py-10">
            <AlertCircle className="w-16 h-16 mx-auto text-danger mb-4" />
            <h1 className="text-xl font-semibold mb-2">{t('errorTitle')}</h1>
            <p className="text-default-500">{t('errorDescription')}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Expired state - all documents received
  if (pageState === 'expired' || pageState === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center py-10">
            <CheckCircle className="w-16 h-16 mx-auto text-success mb-4" />
            <h1 className="text-xl font-semibold mb-2">{t('successTitle')}</h1>
            <p className="text-default-500">{t('successDescription')}</p>
            {linkData && (
              <div className="mt-4 text-sm text-default-400">
                <p>{linkData.caseNumber}</p>
                <p>{linkData.caseTitle}</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  // Ready state - show documents to upload
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-col items-start gap-2 pb-2">
            <h1 className="text-xl font-semibold">{t('title')}</h1>
            <p className="text-sm text-default-500">{t('subtitle')}</p>
          </CardHeader>
          <CardBody className="pt-0">
            {/* Case Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-default-500">{t('caseNumber')}:</span>
                <span className="text-sm font-mono">{linkData?.caseNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-default-500">{t('caseTitle')}:</span>
                <span className="text-sm font-medium">{linkData?.caseTitle}</span>
              </div>
              {linkData?.lawyerName && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-default-500">{t('lawyer')}:</span>
                  <span className="text-sm">{linkData.lawyerName}</span>
                </div>
              )}
              {linkData?.caseDescription && (
                <div className="mt-3">
                  <span className="text-sm text-default-500">{t('description')}:</span>
                  <p className="text-sm mt-1 text-default-600">{linkData.caseDescription}</p>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-default-500">{t('progress')}</span>
                <span className="text-sm font-medium">
                  {receivedDocuments}/{totalDocuments}
                </span>
              </div>
              <div className="h-2 bg-default-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-success transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">{t('documentsTitle')}</h2>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border transition-colors',
                    doc.status === 'received'
                      ? 'border-success/30 bg-success/5'
                      : 'border-default-200 hover:border-default-300'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {doc.status === 'received' ? (
                      <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-default-400 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      {doc.description && (
                        <p className="text-xs text-default-400">{doc.description}</p>
                      )}
                      {doc.uploadError && (
                        <p className="text-xs text-danger">{doc.uploadError}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.status === 'received' ? (
                      <Chip size="sm" color="success" variant="flat">
                        {t('statusReceived')}
                      </Chip>
                    ) : doc.isUploading ? (
                      <div className="flex items-center gap-2">
                        <Spinner size="sm" />
                        <span className="text-sm text-default-500">{t('uploading')}</span>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleInputChange(doc.id)}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <Button
                          as="span"
                          size="sm"
                          color="primary"
                          variant="flat"
                          startContent={<Upload className="w-4 h-4" />}
                        >
                          {t('upload')}
                        </Button>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Info message */}
            <div className="mt-6 p-4 rounded-lg bg-default-100 flex items-start gap-3">
              <Clock className="w-5 h-5 text-default-500 shrink-0 mt-0.5" />
              <p className="text-sm text-default-500">{t('infoMessage')}</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
