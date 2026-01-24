'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/i18n-provider';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Avatar,
  Chip,
  Divider,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Textarea,
} from '@/components/ui';
import { LegalCase, CasePriority, KanbanColumn, Lawyer } from '@/types';
import { getInitials } from '@/lib/utils';

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
  onColumnChange?: (caseId: string, newColumnId: string) => void;
  onDescriptionChange?: (caseId: string, newDescription: string) => Promise<boolean>;
  onLawyerChange?: (caseId: string, lawyer: LegalCase['lawyer']) => Promise<boolean>;
};

export function CaseDetailModal({
  legalCase,
  isOpen,
  onClose,
  columns,
  lawyers,
  onColumnChange,
  onDescriptionChange,
  onLawyerChange,
}: CaseDetailModalProps) {
  const t = useTranslations('priority');
  const tKanban = useTranslations('kanban');
  const { locale } = useLocale();

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [isSavingLawyer, setIsSavingLawyer] = useState(false);

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

      const currentLawyerId = legalCase.lawyer?.id ?? null;
      if (lawyerId === currentLawyerId) return;

      setIsSavingLawyer(true);

      let newLawyer: LegalCase['lawyer'] = undefined;
      if (lawyerId) {
        const selectedLawyer = lawyers.find((l) => l.id === lawyerId);
        if (selectedLawyer) {
          newLawyer = {
            id: selectedLawyer.id,
            name: selectedLawyer.name,
            photo: selectedLawyer.photo || '',
          };
        }
      }

      await onLawyerChange?.(legalCase.id, newLawyer);
      setIsSavingLawyer(false);
    },
    [legalCase, lawyers, onLawyerChange]
  );

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
                  {currentColumn?.title}
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
                  <DropdownItem key={column.id}>{column.title}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-default-700 mb-3">{tKanban('modal.description')}:</h3>
              {isEditingDescription ? (
                <div className="flex flex-col gap-3">
                  <Textarea
                    autoFocus
                    value={editedDescription}
                    onValueChange={setEditedDescription}
                    onKeyDown={handleDescriptionKeyDown}
                    minRows={20}
                    className="min-h-79.5"
                    placeholder={tKanban('modal.noDescription')}
                    classNames={{
                      input: 'text-sm min-h-79.5 max-h-79.5 leading-relaxed',
                    }}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="flat" isDisabled={isSavingDescription} onPress={handleDescriptionCancel}>
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
                  className="rounded-lg min-h-84 max-h-84 overflow-auto p-3 cursor-pointer hover:bg-default-100 transition-colors border border-transparent hover:border-default-200"
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
                          {legalCase.lawyer ? (
                            <>
                              <Avatar
                                name={getInitials(legalCase.lawyer.name)}
                                src={legalCase.lawyer.photo || undefined}
                                isBordered
                                className="w-6 h-6"
                              />
                              <span className="text-sm">{legalCase.lawyer.name}</span>
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
                        selectedKeys={legalCase.lawyer ? [legalCase.lawyer.id] : []}
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
                        name={getInitials(legalCase.createdBy.name)}
                        src={legalCase.createdBy.photo || undefined}
                        isBordered
                        className="w-6 h-6"
                      />
                      <span className="text-sm">{legalCase.createdBy.name}</span>
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
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
