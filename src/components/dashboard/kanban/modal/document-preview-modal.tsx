'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Textarea,
  Chip,
} from '@/components/ui';
import { Image } from '@heroui/react';
import { DocumentRequest, RejectionReason } from '@/types';
import { Check, X, AlertTriangle } from 'lucide-react';

type DocumentPreviewModalProps = {
  document: DocumentRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (documentId: string) => Promise<boolean>;
  onReject: (documentId: string, reason: RejectionReason, note?: string) => Promise<boolean>;
};

const REJECTION_REASONS: RejectionReason[] = [
  'low_quality',
  'wrong_document',
  'incomplete',
  'illegible',
  'other',
];

export function DocumentPreviewModal({
  document,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: DocumentPreviewModalProps) {
  const t = useTranslations('document');

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState<RejectionReason | ''>('');
  const [rejectNote, setRejectNote] = useState('');

  const resetState = useCallback(() => {
    setShowRejectForm(false);
    setRejectReason('');
    setRejectNote('');
    setIsApproving(false);
    setIsRejecting(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const handleApprove = useCallback(async () => {
    if (!document) return;

    setIsApproving(true);
    const success = await onApprove(document.id);
    setIsApproving(false);

    if (success) {
      handleClose();
    }
  }, [document, onApprove, handleClose]);

  const handleReject = useCallback(async () => {
    if (!document || !rejectReason) return;

    setIsRejecting(true);
    const success = await onReject(document.id, rejectReason, rejectNote || undefined);
    setIsRejecting(false);

    if (success) {
      handleClose();
    }
  }, [document, rejectReason, rejectNote, onReject, handleClose]);

  if (!document) return null;

  const isPendingApproval = document.status === 'pending_approval';
  const isRejected = document.status === 'rejected';
  const isReceived = document.status === 'received';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span>{document.name}</span>
            <Chip
              size="sm"
              color={
                isPendingApproval ? 'warning' : isRejected ? 'danger' : isReceived ? 'success' : 'default'
              }
              variant="flat"
            >
              {t(`status.${document.status}`)}
            </Chip>
          </div>
          {document.description && (
            <span className="text-sm text-default-500 font-normal">{document.description}</span>
          )}
        </ModalHeader>

        <ModalBody>
          {/* Preview da imagem */}
          {document.fileUrl ? (
            <div className="flex justify-center bg-default-100 rounded-lg p-4">
              <Image
                src={document.fileUrl}
                alt={document.name}
                className="max-h-[400px] object-contain rounded-lg"
                fallbackSrc="https://placehold.co/800x600/png?text=Documento"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center bg-default-100 rounded-lg p-8 text-default-400">
              {t('noPreview')}
            </div>
          )}

          {/* Informacao de rejeicao anterior */}
          {isRejected && document.rejectionReason && (
            <div className="mt-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <div className="flex items-center gap-2 text-danger-600 font-medium mb-1">
                <AlertTriangle size={16} />
                {t('rejectedDocument')}
              </div>
              <p className="text-sm text-danger-700">
                <strong>{t('reason')}:</strong> {t(`rejectionReasons.${document.rejectionReason}`)}
              </p>
              {document.rejectionNote && (
                <p className="text-sm text-danger-600 mt-1">
                  <strong>{t('note')}:</strong> {document.rejectionNote}
                </p>
              )}
            </div>
          )}

          {/* Formulario de rejeicao */}
          {showRejectForm && (
            <div className="mt-4 p-3 bg-default-100 rounded-lg space-y-3">
              <Select
                label={t('selectReason')}
                placeholder={t('selectReasonPlaceholder')}
                selectedKeys={rejectReason ? new Set([rejectReason]) : new Set()}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as RejectionReason;
                  setRejectReason(selected || '');
                }}
              >
                {REJECTION_REASONS.map((reason) => (
                  <SelectItem key={reason}>{t(`rejectionReasons.${reason}`)}</SelectItem>
                ))}
              </Select>

              <Textarea
                label={t('rejectionNote')}
                placeholder={t('rejectionNotePlaceholder')}
                value={rejectNote}
                onValueChange={setRejectNote}
                minRows={2}
              />
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          {isPendingApproval && !showRejectForm && (
            <>
              <Button variant="flat" onPress={handleClose}>
                {t('cancel')}
              </Button>
              <Button
                color="danger"
                variant="flat"
                startContent={<X size={16} />}
                onPress={() => setShowRejectForm(true)}
              >
                {t('reject')}
              </Button>
              <Button
                color="success"
                startContent={<Check size={16} />}
                onPress={handleApprove}
                isLoading={isApproving}
              >
                {t('approve')}
              </Button>
            </>
          )}

          {showRejectForm && (
            <>
              <Button variant="flat" onPress={() => setShowRejectForm(false)}>
                {t('back')}
              </Button>
              <Button
                color="danger"
                startContent={<X size={16} />}
                onPress={handleReject}
                isLoading={isRejecting}
                isDisabled={!rejectReason}
              >
                {t('confirmReject')}
              </Button>
            </>
          )}

          {(isRejected || isReceived) && (
            <Button variant="flat" onPress={handleClose}>
              {t('close')}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
