'use client';

import { useTranslations } from 'next-intl';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
} from '@/components/ui';
import { DocumentRequest, DocumentStatus } from '@/types';

const statusColors: Record<DocumentStatus, 'warning' | 'success' | 'danger' | 'secondary'> = {
  pending: 'warning',
  pending_approval: 'secondary',
  rejected: 'danger',
  received: 'success',
};

// Mesma lista do case-documents.tsx
const DOCUMENT_OPTIONS = [
  'rg', 'cpf', 'cnh', 'compResidencia', 'compRenda', 'certNascimento',
  'certCasamento', 'certObito', 'contracheque', 'cartTrabalho', 'irpf',
  'extratoFgts', 'extratoBanco', 'contrato', 'procuracao', 'certNegDebitos',
  'certAntecedentes', 'laudoMedico', 'boletimOcorrencia', 'escritura',
  'matriculaImovel', 'iptu', 'contratoSocial', 'cnpj', 'balanco', 'notaFiscal', 'outros',
] as const;

type DeleteDocumentModalProps = {
  document: DocumentRequest | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteDocumentModal({
  document,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteDocumentModalProps) {
  const t = useTranslations('document');

  const getDocLabel = (docName: string) => {
    if (DOCUMENT_OPTIONS.includes(docName as typeof DOCUMENT_OPTIONS[number])) {
      return t(`options.${docName}`);
    }
    return docName;
  };

  return (
    <Modal isOpen={!!document} onClose={onCancel} size="sm">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {t('deleteConfirm.title')}
        </ModalHeader>
        <ModalBody>
          <p className="text-default-600">{t('deleteConfirm.message')}</p>
          {document && (
            <div className="bg-default-100 rounded-lg p-3 mt-2">
              <div className="flex items-center gap-2">
                <Chip size="sm" color={statusColors[document.status]} variant="flat">
                  {t(`status.${document.status}`)}
                </Chip>
                <span className="text-sm font-medium">{getDocLabel(document.name)}</span>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onCancel} isDisabled={isDeleting}>
            {t('cancel')}
          </Button>
          <Button color="danger" onPress={onConfirm} isLoading={isDeleting}>
            {t('delete')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
