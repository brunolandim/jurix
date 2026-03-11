'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, CheckCircle, FileText, AlertCircle, Clock, AlertTriangle, Eye, ExternalLink, RefreshCw } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Spinner, Chip } from '@/components/ui';
import { shareableLinkService, PublicLinkData } from '@/services';
import { PublicDocument, DocumentStatus } from '@/types';
import { cn } from '@/lib/utils';

type PageState = 'loading' | 'error' | 'expired' | 'success' | 'ready';

type DocumentWithUpload = PublicDocument & {
  isUploading?: boolean;
  uploadError?: string;
  file?: File;
  previewUrl?: string;
};

export default function PublicUploadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const t = useTranslations('publicUpload');
  const tDoc = useTranslations('document');

  const getDocLabel = (docName: string) => {
    const translated = tDoc.raw(`options.${docName}`);
    return typeof translated === 'string' ? translated : docName;
  };

  const [pageState, setPageState] = useState<PageState>('loading');
  const [linkData, setLinkData] = useState<PublicLinkData | null>(null);
  const [documents, setDocuments] = useState<DocumentWithUpload[]>([]);

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

  // Polling: enquanto houver documentos em pending_approval, verifica o status do link
  // a cada 10s para detectar quando o advogado aprovar tudo (link expira → tela de sucesso)
  useEffect(() => {
    if (pageState !== 'ready') return;

    const hasPendingApproval = documents.some((d) => d.status === 'pending_approval');
    if (!hasPendingApproval) return;

    const interval = setInterval(async () => {
      const data = await shareableLinkService.getLinkByToken(token).catch(() => null);
      if (!data || data.isExpired) {
        setPageState('expired');
        clearInterval(interval);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [pageState, documents, token]);

  const handleFileSelect = useCallback(
    async (documentId: string, file: File) => {
      const previewUrl = URL.createObjectURL(file);
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === documentId ? { ...doc, isUploading: true, uploadError: undefined, file, previewUrl } : doc))
      );

      try {
        const result = await shareableLinkService.uploadDocument(token, documentId, file);

        if (result.success) {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === documentId
                ? {
                    ...doc,
                    status: 'pending_approval' as DocumentStatus,
                    isUploading: false,
                    rejectionReason: undefined,
                    rejectionNote: undefined,
                  }
                : doc
            )
          );

          if (result.allCompleted) {
            setPageState('success');
          }
        } else {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === documentId ? { ...doc, isUploading: false, uploadError: t('uploadError') } : doc
            )
          );
        }
      } catch {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === documentId ? { ...doc, isUploading: false, uploadError: t('uploadError') } : doc
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

  const totalDocuments = documents.length;
  const receivedDocuments = documents.filter((d) => d.status === 'received').length;
  const progressPercent = totalDocuments > 0 ? (receivedDocuments / totalDocuments) * 100 : 0;

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
              {documents.map((doc) => {
                const isRejected = doc.status === 'rejected';
                const isPendingApproval = doc.status === 'pending_approval';
                const isReceived = doc.status === 'received';
                const isPending = doc.status === 'pending';

                return (
                  <div
                    key={doc.id}
                    className={cn(
                      'p-4 rounded-lg border transition-colors',
                      isReceived && 'border-success/30 bg-success/5',
                      isPendingApproval && 'border-secondary/30 bg-secondary/5',
                      isRejected && 'border-danger/30 bg-danger/5',
                      isPending && 'border-default-200 hover:border-default-300'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isReceived ? (
                          <CheckCircle className="w-5 h-5 text-success shrink-0" />
                        ) : isPendingApproval ? (
                          <Eye className="w-5 h-5 text-secondary shrink-0" />
                        ) : isRejected ? (
                          <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
                        ) : (
                          <FileText className="w-5 h-5 text-default-400 shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{getDocLabel(doc.name)}</p>
                          {doc.description && <p className="text-xs text-default-400">{doc.description}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isReceived ? (
                          <Chip size="sm" color="success" variant="flat">
                            {t('statusReceived')}
                          </Chip>
                        ) : isPendingApproval ? (
                          <>
                            <Chip size="sm" color="secondary" variant="flat">
                              {t('statusPendingApproval')}
                            </Chip>
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                className="hidden"
                                onChange={handleInputChange(doc.id)}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov,.webm,.avi"
                              />
                              <Button
                                as="span"
                                size="sm"
                                variant="light"
                                color="default"
                                isIconOnly
                                title={t('replace')}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </label>
                          </>
                        ) : isRejected ? (
                          <Chip size="sm" color="danger" variant="flat">
                            {t('statusRejected')}
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
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov,.webm,.avi"
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

                    {/* Rejection reason - shown below the document info */}
                    {isRejected && (doc.rejectionReason || doc.rejectionNote) && (
                      <div className="mt-3 p-3 rounded-md bg-danger/10 border border-danger/20">
                        <p className="text-sm font-medium text-danger mb-1">{t('rejectionReason')}:</p>
                        <p className="text-sm text-danger-600">
                          {doc.rejectionReason && tDoc(`rejectionReasons.${doc.rejectionReason}`)}
                        </p>
                        {doc.rejectionNote && (
                          <p className="text-sm text-danger-500 mt-1 italic">&quot;{doc.rejectionNote}&quot;</p>
                        )}
                        {/* Reupload button for rejected documents */}
                        <div className="mt-3">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              onChange={handleInputChange(doc.id)}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov,.webm,.avi"
                            />
                            <Button
                              as="span"
                              size="sm"
                              color="danger"
                              variant="flat"
                              startContent={<Upload className="w-4 h-4" />}
                            >
                              {t('reupload')}
                            </Button>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Preview do arquivo enviado */}
                    {doc.previewUrl && !doc.isUploading && (
                      <div className="mt-3">
                        {doc.file?.type.startsWith('image/') ? (
                          <img
                            src={doc.previewUrl}
                            alt={doc.file?.name}
                            className="max-h-32 rounded-md object-contain border border-default-200"
                          />
                        ) : doc.file?.type.startsWith('video/') ? (
                          <video
                            src={doc.previewUrl}
                            controls
                            className="max-h-48 rounded-md border border-default-200 w-full"
                          />
                        ) : (
                          <div className="flex items-center gap-2 p-2 rounded-md bg-default-100 border border-default-200">
                            <FileText className="w-5 h-5 text-default-400 shrink-0" />
                            <span className="text-xs text-default-600 truncate flex-1">{doc.file?.name}</span>
                            <a
                              href={doc.previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {t('viewFile')}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Upload error */}
                    {doc.uploadError && <p className="text-xs text-danger mt-2">{doc.uploadError}</p>}
                  </div>
                );
              })}
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
