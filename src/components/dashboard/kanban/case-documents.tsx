'use client';

import { useState, useCallback, useMemo } from 'react';
import { Plus, Trash2, FileText, Check, Eye, AlertTriangle, Clock, X, FileCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button, Chip, Select, SelectItem, Tooltip } from '@/components/ui';
import { DocumentRequest, DocumentStatus, RejectionReason } from '@/types';
import { DeleteDocumentModal } from './modal/delete-document-modal';
import { DocumentPreviewModal } from './modal/document-preview-modal';

type CaseDocumentsProps = {
  documents: DocumentRequest[];
  onAdd: (document: Omit<DocumentRequest, 'id' | 'caseId' | 'requestedAt' | 'receivedAt'>) => Promise<boolean>;
  onDelete: (documentId: string) => Promise<boolean>;
  onStatusChange: (documentId: string, status: DocumentStatus) => Promise<boolean>;
  onApprove: (documentId: string) => Promise<boolean>;
  onReject: (documentId: string, reason: RejectionReason, note?: string) => Promise<boolean>;
};

const statusColors: Record<DocumentStatus, 'warning' | 'success' | 'danger' | 'secondary'> = {
  pending: 'warning',
  pending_approval: 'secondary',
  rejected: 'danger',
  received: 'success',
};

const statusIcons: Record<DocumentStatus, React.ReactNode> = {
  pending: <Clock size={12} />,
  pending_approval: <FileCheck size={12} />,
  rejected: <X size={12} />,
  received: <Check size={12} />,
};

const DOCUMENT_OPTIONS = [
  'rg',
  'cpf',
  'cnh',
  'compResidencia',
  'compRenda',
  'certNascimento',
  'certCasamento',
  'certObito',
  'contracheque',
  'cartTrabalho',
  'irpf',
  'extratoFgts',
  'extratoBanco',
  'contrato',
  'procuracao',
  'certNegDebitos',
  'certAntecedentes',
  'laudoMedico',
  'boletimOcorrencia',
  'escritura',
  'matriculaImovel',
  'iptu',
  'contratoSocial',
  'cnpj',
  'balanco',
  'notaFiscal',
  'outros',
] as const;

const STATUS_ORDER: Record<DocumentStatus, number> = {
  pending_approval: 0, // Primeiro - precisa de acao
  rejected: 1, // Segundo - precisa reenvio
  pending: 2, // Terceiro - aguardando envio
  received: 3, // Ultimo - concluido
};

export function CaseDocuments({ documents, onAdd, onDelete, onStatusChange, onApprove, onReject }: CaseDocumentsProps) {
  const t = useTranslations('document');

  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentRequest | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<DocumentRequest | null>(null);

  // Form state - agora e um Set de documentos selecionados
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  // Filtrar documentos que ja foram adicionados
  const availableOptions = useMemo(() => {
    const existingNames = new Set(documents.map((d) => d.name));
    return DOCUMENT_OPTIONS.filter((opt) => !existingNames.has(opt));
  }, [documents]);

  const resetForm = useCallback(() => {
    setSelectedDocs(new Set());
    setIsAdding(false);
  }, []);

  const handleAdd = useCallback(async () => {
    if (selectedDocs.size === 0) return;

    setIsSubmitting(true);

    const docsToAdd = Array.from(selectedDocs);
    let allSuccess = true;

    for (const docName of docsToAdd) {
      const success = await onAdd({
        name: docName,
        status: 'pending',
      });
      if (!success) allSuccess = false;
    }

    setIsSubmitting(false);

    if (allSuccess) {
      resetForm();
    }
  }, [selectedDocs, onAdd, resetForm]);

  const handleDeleteClick = useCallback((document: DocumentRequest) => {
    setDocumentToDelete(document);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!documentToDelete) return;

    setDeletingId(documentToDelete.id);
    await onDelete(documentToDelete.id);
    setDeletingId(null);
    setDocumentToDelete(null);
  }, [documentToDelete, onDelete]);

  const handleDeleteCancel = useCallback(() => {
    setDocumentToDelete(null);
  }, []);

  const handleStatusToggle = useCallback(
    async (doc: DocumentRequest) => {
      // So permite toggle entre pending e received para documentos sem arquivo
      if (doc.status === 'pending_approval' || doc.status === 'rejected') {
        // Para esses status, abre o preview
        setPreviewDocument(doc);
        return;
      }

      const newStatus: DocumentStatus = doc.status === 'pending' ? 'received' : 'pending';
      setUpdatingStatusId(doc.id);
      await onStatusChange(doc.id, newStatus);
      setUpdatingStatusId(null);
    },
    [onStatusChange]
  );

  const handlePreviewClick = useCallback((doc: DocumentRequest) => {
    setPreviewDocument(doc);
  }, []);

  const handlePreviewClose = useCallback(() => {
    setPreviewDocument(null);
  }, []);

  const sortedDocuments = [...documents].sort((a, b) => {
    // Ordenar por prioridade do status
    const orderDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (orderDiff !== 0) return orderDiff;
    return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
  });

  // Funcao para obter o label traduzido do documento
  const getDocLabel = (docName: string) => {
    // Se o documento esta na lista de opcoes, traduz
    if (DOCUMENT_OPTIONS.includes(docName as (typeof DOCUMENT_OPTIONS)[number])) {
      return t(`options.${docName}`);
    }
    // Senao, retorna o nome original
    return docName;
  };

  // Contadores por status
  const statusCounts = useMemo(() => {
    return documents.reduce(
      (acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      },
      {} as Record<DocumentStatus, number>
    );
  }, [documents]);

  const pendingApprovalCount = statusCounts['pending_approval'] || 0;
  const rejectedCount = statusCounts['rejected'] || 0;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-default-700 flex items-center gap-2">
            <FileText size={16} />
            {t('title')}
          </h3>
          {pendingApprovalCount > 0 && (
            <Chip size="sm" color="secondary" variant="flat">
              {pendingApprovalCount} {t('pendingApproval')}
            </Chip>
          )}
          {rejectedCount > 0 && (
            <Chip size="sm" color="danger" variant="flat">
              {rejectedCount} {t('rejected')}
            </Chip>
          )}
        </div>
        {!isAdding && availableOptions.length > 0 && (
          <Button size="sm" variant="flat" startContent={<Plus size={14} />} onPress={() => setIsAdding(true)}>
            {t('add')}
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-default-100 rounded-lg p-3 mb-3 space-y-3">
          <Select
            label={t('selectDocuments')}
            placeholder={t('selectPlaceholder')}
            selectionMode="multiple"
            selectedKeys={selectedDocs}
            onSelectionChange={(keys) => setSelectedDocs(new Set(keys as Set<string>))}
            isDisabled={isSubmitting}
            classNames={{
              trigger: 'min-h-12',
            }}
          >
            {availableOptions.map((opt) => (
              <SelectItem key={opt}>{t(`options.${opt}`)}</SelectItem>
            ))}
          </Select>

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="flat" onPress={resetForm} isDisabled={isSubmitting}>
              {t('cancel')}
            </Button>
            <Button
              size="sm"
              color="primary"
              onPress={handleAdd}
              isLoading={isSubmitting}
              isDisabled={selectedDocs.size === 0}
            >
              {t('addSelected')} {selectedDocs.size > 0 && `(${selectedDocs.size})`}
            </Button>
          </div>
        </div>
      )}

      {sortedDocuments.length === 0 ? (
        <p className="text-sm text-default-400 italic">{t('noDocuments')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {sortedDocuments.map((doc) => {
            const isPendingApproval = doc.status === 'pending_approval';
            const isRejected = doc.status === 'rejected';
            const isReceived = doc.status === 'received';
            const hasFile = !!doc.fileUrl;

            return (
              <div
                key={doc.id}
                className={`flex justify-between bg-default-50 rounded-lg px-2 py-1.5 border ${
                  isReceived
                    ? 'border-success-200 bg-success-50/50'
                    : isPendingApproval
                      ? 'border-secondary-200 bg-secondary-50/50'
                      : isRejected
                        ? 'border-danger-200 bg-danger-50/50'
                        : 'border-default-200'
                }`}
              >
                <div className="flex gap-2 items-center">
                  {/* Botao de status/check */}
                  {isPendingApproval ? (
                    <Tooltip content={t('clickToReview')}>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="secondary"
                        onPress={() => handlePreviewClick(doc)}
                        className="w-6 h-6 min-w-6"
                      >
                        <FileCheck size={12} />
                      </Button>
                    </Tooltip>
                  ) : isRejected ? (
                    <Tooltip content={doc.rejectionNote || t(`rejectionReasons.${doc.rejectionReason}`)}>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="danger"
                        onPress={() => handlePreviewClick(doc)}
                        className="w-6 h-6 min-w-6"
                      >
                        <AlertTriangle size={12} />
                      </Button>
                    </Tooltip>
                  ) : (
                    <Button
                      isIconOnly
                      size="sm"
                      variant={isReceived ? 'solid' : 'bordered'}
                      color={isReceived ? 'success' : 'default'}
                      onPress={() => handleStatusToggle(doc)}
                      isLoading={updatingStatusId === doc.id}
                      className="w-6 h-6 min-w-6"
                      title={doc.status === 'pending' ? t('markAsReceived') : t('markAsPending')}
                    >
                      {updatingStatusId !== doc.id && <Check size={12} />}
                    </Button>
                  )}

                  {/* Nome do documento */}
                  <span className={`text-sm ${isReceived ? 'line-through text-default-400' : 'text-default-700'}`}>
                    {getDocLabel(doc.name)}
                  </span>
                </div>

                <div className="flex gap-2 items-center">
                  {/* Chip de status */}
                  <Chip
                    size="sm"
                    color={statusColors[doc.status]}
                    variant="flat"
                    startContent={statusIcons[doc.status]}
                  >
                    {t(`status.${doc.status}`)}
                  </Chip>

                  {/* Botao de preview (se tem arquivo) */}
                  {hasFile && (
                    <Tooltip content={t('viewDocument')}>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handlePreviewClick(doc)}
                        className="w-6 h-6 min-w-6"
                      >
                        <Eye size={12} />
                      </Button>
                    </Tooltip>
                  )}

                  {/* Botao de deletar */}
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => handleDeleteClick(doc)}
                    className="w-6 h-6 min-w-6"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DeleteDocumentModal
        document={documentToDelete}
        isDeleting={!!deletingId}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <DocumentPreviewModal
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={handlePreviewClose}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  );
}
