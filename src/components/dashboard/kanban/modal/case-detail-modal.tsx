'use client';

import { useState, useCallback, useMemo } from 'react';
import { ChevronDown, User, Share2, Copy, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/i18n-provider';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Avatar,
  Chip,
  Divider,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Textarea,
  Input,
} from '@/components/ui';
import {
  LegalCase,
  CasePriority,
  KanbanColumn,
  Lawyer,
  CaseNotification,
  NotificationType,
  DocumentRequest,
  DocumentStatus,
  RejectionReason,
} from '@/types';
import { getInitials } from '@/lib/utils';
import { CaseNotifications } from '../case-notifications';
import { CaseDocuments } from '../case-documents';

const priorityColors: Record<CasePriority, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
  low: 'default',
  medium: 'primary',
  high: 'warning',
  urgent: 'danger',
};

type CaseDetailModalProps = {
  legalCase: LegalCase | null;
  isOpen: boolean;
  onClose: () => void;
  columns: KanbanColumn[];
  lawyers: Lawyer[];
  user: Lawyer | null;
  onColumnChange?: (caseId: string, newColumnId: string) => void;
  onDescriptionChange?: (caseId: string, newDescription: string) => Promise<boolean>;
  onLawyerChange?: (caseId: string, lawyer: string) => Promise<boolean>;
  onAddNotification?: (
    caseId: string,
    data: { type: NotificationType; message?: string; date: string }
  ) => Promise<CaseNotification | null>;
  onDeleteNotification?: (caseId: string, notificationId: string) => Promise<boolean>;
  onAddDocument?: (
    caseId: string,
    data: { name: string; description?: string; status: DocumentStatus }
  ) => Promise<DocumentRequest | null>;
  onDeleteDocument?: (caseId: string, documentId: string) => Promise<boolean>;
  onDocumentStatusChange?: (caseId: string, documentId: string, status: DocumentStatus) => Promise<boolean>;
  onApproveDocument?: (caseId: string, documentId: string) => Promise<boolean>;
  onRejectDocument?: (caseId: string, documentId: string, reason: RejectionReason, note?: string) => Promise<boolean>;
  onGenerateShareLink?: (caseId: string, lawyerId: string, documentIds: string[]) => Promise<{ url: string } | null>;
};

export function CaseDetailModal({
  legalCase,
  isOpen,
  onClose,
  columns,
  lawyers,
  user,
  onColumnChange,
  onDescriptionChange,
  onLawyerChange,
  onAddNotification,
  onDeleteNotification,
  onAddDocument,
  onDeleteDocument,
  onDocumentStatusChange,
  onApproveDocument,
  onRejectDocument,
  onGenerateShareLink,
}: CaseDetailModalProps) {
  const t = useTranslations('priority');
  const tKanban = useTranslations('kanban');
  const tColumns = useTranslations('kanban.columns');
  const tShare = useTranslations('shareLink');
  const { locale } = useLocale();

  const getColumnTitle = (column: KanbanColumn) => (column.key ? tColumns(column.key) : column.title);

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [isSavingLawyer, setIsSavingLawyer] = useState(false);

  // Share link state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleDescriptionClick = useCallback(() => {
    if (!legalCase) return;
    const currentDescription = legalCase.description || '';
    setEditedDescription(currentDescription);
    setOriginalDescription(currentDescription);
    setIsEditingDescription(true);
  }, [legalCase]);

  const handleDescriptionSave = useCallback(async () => {
    if (!legalCase || editedDescription === originalDescription) {
      setIsEditingDescription(false);
      return;
    }

    setIsSavingDescription(true);
    const success = await onDescriptionChange?.(legalCase.id, editedDescription);
    setIsSavingDescription(false);

    if (success) {
      setIsEditingDescription(false);
    }
  }, [legalCase, onDescriptionChange, editedDescription, originalDescription]);

  const handleDescriptionCancel = useCallback(() => {
    setEditedDescription(originalDescription);
    setIsEditingDescription(false);
  }, [originalDescription]);

  const handleDescriptionKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDescriptionCancel();
      }
    },
    [handleDescriptionCancel]
  );

  const hasDescriptionChanged = editedDescription !== originalDescription;

  const handleLawyerChange = useCallback(
    async (lawyerId: string | null) => {
      if (!legalCase) return;

      const currentLawyerId = legalCase.assignee?.id ?? null;
      if (lawyerId === currentLawyerId) return;

      setIsSavingLawyer(true);

      let newLawyer: any;
      if (lawyerId) {
        const selectedLawyer = lawyers.find((l) => l.id === lawyerId);
        if (selectedLawyer) {
          newLawyer = {
            id: selectedLawyer.id,
            name: selectedLawyer.name,
            photo: selectedLawyer.photo || '',
            email: selectedLawyer.email,
            oab: selectedLawyer.oab,
          };
        }
      }

      await onLawyerChange?.(legalCase.id, newLawyer.id);
      setIsSavingLawyer(false);
    },
    [legalCase, lawyers, onLawyerChange]
  );

  // Share link handlers
  const shareableDocuments = useMemo(
    () => legalCase?.documents?.filter((d) => d.status === 'pending' || d.status === 'rejected') || [],
    [legalCase?.documents]
  );
  const hasShareableDocuments = shareableDocuments.length > 0;

  const handleOpenShareModal = useCallback(async () => {
    if (!legalCase || !onGenerateShareLink || !user?.id || shareableDocuments.length === 0) return;

    setIsShareModalOpen(true);
    setShareUrl(null);
    setIsGeneratingLink(true);
    setIsCopied(false);

    const documentIds = shareableDocuments.map((d) => d.id);
    const result = await onGenerateShareLink(legalCase.id, user.id, documentIds);

    setIsGeneratingLink(false);
    if (result) {
      setShareUrl(result.url);
    }
  }, [legalCase, onGenerateShareLink, shareableDocuments, user]);

  const handleCloseShareModal = useCallback(() => {
    setIsShareModalOpen(false);
    setShareUrl(null);
    setIsCopied(false);
  }, []);

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [shareUrl]);

  if (!legalCase) return null;

  const currentColumn = columns.find((col) => col.id === legalCase.columnId);

  const handleColumnChange = (columnId: string) => {
    if (onColumnChange && columnId !== legalCase.columnId) {
      onColumnChange(legalCase.id, columnId);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" className="h-full " scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2 pb-0">
          <div className="flex items-center justify-between">
            <span className="text-sm text-default-500 font-mono">{legalCase.number}</span>
          </div>
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">{legalCase.title}</h2>
            <Dropdown>
              <DropdownTrigger>
                <Button color="primary" variant="solid" size="sm" endContent={<ChevronDown className="w-4 h-4" />}>
                  {currentColumn ? getColumnTitle(currentColumn) : ''}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label={tKanban('modal.changeStatus')}
                selectedKeys={[legalCase.columnId]}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  if (selected) handleColumnChange(selected);
                }}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.id}>{getColumnTitle(column)}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="flex flex-col md:flex-row gap-6 h-full">
            <div className="flex-1 min-w-0 h-full">
              <div>
                <h3 className="text-sm font-semibold text-default-700 mb-3">{tKanban('modal.description')}:</h3>
                {isEditingDescription ? (
                  <div className="flex flex-col gap-3">
                    <Textarea
                      autoFocus
                      value={editedDescription}
                      onValueChange={setEditedDescription}
                      onKeyDown={handleDescriptionKeyDown}
                      minRows={20}
                      placeholder={tKanban('modal.noDescription')}
                      classNames={{
                        input: 'text-sm min-h-79.75 max-h-79.75 leading-relaxed',
                      }}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="flat"
                        isDisabled={isSavingDescription}
                        onPress={handleDescriptionCancel}
                      >
                        {tKanban('modal.cancel')}
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        isDisabled={!hasDescriptionChanged}
                        isLoading={isSavingDescription}
                        onPress={handleDescriptionSave}
                      >
                        {tKanban('modal.save')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-lg min-h-84 max-h-84  overflow-auto p-3 cursor-pointer hover:bg-default-100 transition-colors border border-transparent hover:border-default-200"
                    onClick={handleDescriptionClick}
                  >
                    {legalCase.description ? (
                      <div className="text-sm whitespace-pre-wrap text-default-700 leading-relaxed">
                        {legalCase.description}
                      </div>
                    ) : (
                      <p className="text-default-400 text-sm italic">{tKanban('modal.noDescription')}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <CaseNotifications
                notifications={legalCase.notifications || []}
                onAdd={async (data) => {
                  if (onAddNotification) {
                    const result = await onAddNotification(legalCase.id, data);
                    return !!result;
                  }
                  return false;
                }}
                onDelete={async (notificationId) => {
                  if (onDeleteNotification) {
                    return await onDeleteNotification(legalCase.id, notificationId);
                  }
                  return false;
                }}
              />

              {/* Documents */}
              <CaseDocuments
                documents={legalCase.documents || []}
                onAdd={async (data) => {
                  if (onAddDocument) {
                    const result = await onAddDocument(legalCase.id, data);
                    return !!result;
                  }
                  return false;
                }}
                onDelete={async (documentId) => {
                  if (onDeleteDocument) {
                    return await onDeleteDocument(legalCase.id, documentId);
                  }
                  return false;
                }}
                onStatusChange={async (documentId, status) => {
                  if (onDocumentStatusChange) {
                    return await onDocumentStatusChange(legalCase.id, documentId, status);
                  }
                  return false;
                }}
                onApprove={async (documentId) => {
                  if (onApproveDocument) {
                    return await onApproveDocument(legalCase.id, documentId);
                  }
                  return false;
                }}
                onReject={async (documentId, reason, note) => {
                  if (onRejectDocument) {
                    return await onRejectDocument(legalCase.id, documentId, reason, note);
                  }
                  return false;
                }}
              />
            </div>

            <div className=" w-full md:w-72 min-h-72 shrink-0">
              <div className="border border-default-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-default-700 mb-4">{tKanban('modal.details')}</h3>

                <div className="space-y-4">
                  {/* Client */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-500">{tKanban('modal.client')}</span>
                    <span className="text-sm font-medium">{legalCase.client}</span>
                  </div>

                  <Divider />

                  {/* Lawyer */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-500">{tKanban('modal.lawyer')}</span>
                    <Dropdown>
                      <DropdownTrigger>
                        <button
                          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
                          disabled={isSavingLawyer}
                        >
                          {legalCase.assignee ? (
                            <>
                              <Avatar
                                name={getInitials(legalCase.assignee.name)}
                                src={legalCase.assignee.photo || undefined}
                                isBordered
                                className="w-6 h-6"
                                style={!legalCase.assignee.photo ? { backgroundColor: legalCase.assignee.avatarColor ?? '#3b82f6' } : undefined}
                              />
                              <span className="text-sm">{legalCase.assignee.name}</span>
                            </>
                          ) : (
                            <>
                              <Avatar
                                icon={<User className="w-3 h-3" />}
                                isBordered
                                className="w-6 h-6"
                                classNames={{ icon: 'text-default-400' }}
                              />
                              <span className="text-sm text-default-400">{tKanban('unassigned')}</span>
                            </>
                          )}
                          <ChevronDown className="w-3 h-3 text-default-400" />
                        </button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label={tKanban('modal.selectLawyer')}
                        selectedKeys={legalCase.assignee ? [legalCase.assignee.id] : []}
                        selectionMode="single"
                        className="max-h-60 overflow-auto"
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string | undefined;
                          handleLawyerChange(selected || null);
                        }}
                      >
                        {lawyers.map((lawyer) => (
                          <DropdownItem
                            key={lawyer.id}
                            startContent={
                              <Avatar
                                name={getInitials(lawyer.name)}
                                src={lawyer.photo || undefined}
                                className="w-6 h-6"
                                style={!lawyer.photo ? { backgroundColor: lawyer.avatarColor ?? '#3b82f6' } : undefined}
                              />
                            }
                          >
                            {lawyer.name}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </div>

                  <Divider />

                  {/* Created By */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-500">{tKanban('modal.createdBy')}</span>
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={getInitials(legalCase.creator.name)}
                        src={legalCase.creator.photo || undefined}
                        isBordered
                        className="w-6 h-6"
                        style={!legalCase.creator.photo ? { backgroundColor: legalCase.creator.avatarColor ?? '#3b82f6' } : undefined}
                      />
                      <span className="text-sm">{legalCase.creator.name}</span>
                    </div>
                  </div>

                  <Divider />

                  {/* Priority */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-500">{tKanban('modal.priority')}</span>
                    <Chip size="sm" color={priorityColors[legalCase.priority]} variant="flat">
                      {t(legalCase.priority)}
                    </Chip>
                  </div>

                  <Divider />

                  {/* Created At */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-500">{tKanban('modal.createdAt')}</span>
                    <span className="text-sm">{new Date(legalCase.createdAt).toLocaleDateString(locale)}</span>
                  </div>

                  <Divider />

                  {/* Updated At */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-500">{tKanban('modal.updatedAt')}</span>
                    <span className="text-sm">{new Date(legalCase.updatedAt).toLocaleDateString(locale)}</span>
                  </div>
                </div>
              </div>

              {/* Share with Client Button */}
              {onGenerateShareLink && (
                <div className="mt-4">
                  <Button
                    className="w-full"
                    color="secondary"
                    variant="flat"
                    startContent={<Share2 className="w-4 h-4" />}
                    isDisabled={!hasShareableDocuments}
                    onPress={handleOpenShareModal}
                  >
                    {tShare('button')}
                  </Button>
                  {!hasShareableDocuments && (
                    <p className="text-xs text-default-400 mt-2 text-center">{tShare('noPendingDocuments')}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </ModalBody>
      </ModalContent>

      {/* Share Link Modal */}
      <Modal isOpen={isShareModalOpen} onClose={handleCloseShareModal} size="md">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">{tShare('title')}</h3>
            <p className="text-sm text-default-500 font-normal">{tShare('description')}</p>
          </ModalHeader>
          <ModalBody>
            {isGeneratingLink ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                  <p className="text-sm text-default-500">{tShare('generating')}</p>
                </div>
              </div>
            ) : shareUrl ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    classNames={{
                      input: 'text-sm font-mono',
                    }}
                  />
                  <Button color={isCopied ? 'success' : 'primary'} variant="flat" isIconOnly onPress={handleCopyLink}>
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                {isCopied && <p className="text-sm text-success text-center">{tShare('copied')}</p>}
                <div className="bg-default-100 rounded-lg p-3">
                  <p className="text-xs text-default-500">{tShare('linkReady')}</p>
                </div>
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={handleCloseShareModal}>
              {tShare('close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Modal>
  );
}
