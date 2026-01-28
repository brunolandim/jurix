'use client';

import { useState, useCallback, useMemo } from 'react';
import { Plus, Trash2, FileText, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button, Chip, Select, SelectItem } from '@/components/ui';
import { DocumentRequest, DocumentStatus } from '@/types';
import { DeleteDocumentModal } from './modal/delete-document-modal';

type CaseDocumentsProps = {
  documents: DocumentRequest[];
  onAdd: (document: Omit<DocumentRequest, 'id' | 'caseId' | 'requestedAt' | 'receivedAt'>) => Promise<boolean>;
  onDelete: (documentId: string) => Promise<boolean>;
  onStatusChange: (documentId: string, status: DocumentStatus) => Promise<boolean>;
};

const statusColors: Record<DocumentStatus, 'warning' | 'success'> = {
  pending: 'warning',
  received: 'success',
};

// Lista de documentos comuns em processos jurídicos
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

export function CaseDocuments({ documents, onAdd, onDelete, onStatusChange }: CaseDocumentsProps) {
  const t = useTranslations('document');

  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentRequest | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Form state - agora é um Set de documentos selecionados
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  // Filtrar documentos que já foram adicionados
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

    // Adicionar cada documento selecionado
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
      const newStatus: DocumentStatus = doc.status === 'pending' ? 'received' : 'pending';
      setUpdatingStatusId(doc.id);
      await onStatusChange(doc.id, newStatus);
      setUpdatingStatusId(null);
    },
    [onStatusChange]
  );

  const sortedDocuments = [...documents].sort((a, b) => {
    // Pending primeiro, depois received
    if (a.status !== b.status) {
      return a.status === 'pending' ? -1 : 1;
    }
    return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
  });

  // Função para obter o label traduzido do documento
  const getDocLabel = (docName: string) => {
    // Se o documento está na lista de opções, traduz
    if (DOCUMENT_OPTIONS.includes(docName as (typeof DOCUMENT_OPTIONS)[number])) {
      return t(`options.${docName}`);
    }
    // Senão, retorna o nome original
    return docName;
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-default-700 flex items-center gap-2">
          <FileText size={16} />
          {t('title')}
        </h3>
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
          {sortedDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`flex justify-between bg-default-50 rounded-lg px-2 py-1.5 border ${
                doc.status === 'received' ? 'border-success-200 bg-success-50/50' : 'border-default-200'
              }`}
            >
              <div className="flex gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant={doc.status === 'received' ? 'solid' : 'bordered'}
                  color={doc.status === 'received' ? 'success' : 'default'}
                  onPress={() => handleStatusToggle(doc)}
                  isLoading={updatingStatusId === doc.id}
                  className="w-6 h-6 min-w-6"
                  title={doc.status === 'pending' ? t('markAsReceived') : t('markAsPending')}
                >
                  {updatingStatusId !== doc.id && <Check size={12} />}
                </Button>
                <span
                  className={`text-sm ${doc.status === 'received' ? 'line-through text-default-400' : 'text-default-700'}`}
                >
                  {getDocLabel(doc.name)}
                </span>
              </div>
              <div className="flex gap-2">
                <Chip size="sm" color={statusColors[doc.status]} variant="flat">
                  {t(`status.${doc.status}`)}
                </Chip>
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
          ))}
        </div>
      )}

      <DeleteDocumentModal
        document={documentToDelete}
        isDeleting={!!deletingId}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
