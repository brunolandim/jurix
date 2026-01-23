'use client';

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
} from '@/components/ui';
import { LegalCase, CasePriority, KanbanColumn } from '@/types';

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
  onColumnChange?: (caseId: string, newColumnId: string) => void;
};

export function CaseDetailModal({ legalCase, isOpen, onClose, columns, onColumnChange }: CaseDetailModalProps) {
  const t = useTranslations('priority');
  const tKanban = useTranslations('kanban');
  const { locale } = useLocale();

  if (!legalCase) return null;

  const currentColumn = columns.find((col) => col.id === legalCase.columnId);

  const handleColumnChange = (columnId: string) => {
    if (onColumnChange && columnId !== legalCase.columnId) {
      onColumnChange(legalCase.id, columnId);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
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
        <ModalBody className="pt-4 pb-6">
          <div className="flex gap-6">
            {/* Left side - Description */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-default-700 mb-3">{tKanban('modal.description')}</h3>
              <div className="rounded-lg p-4 min-h-[200px]">
                {legalCase.description ? (
                  <div className="text-sm whitespace-pre-wrap text-default-700 leading-relaxed">
                    {legalCase.description}
                  </div>
                ) : (
                  <p className="text-default-400 text-sm italic">{tKanban('modal.noDescription')}</p>
                )}
              </div>
            </div>

            {/* Right side - Details */}

            <div className=" w-72 shrink-0">
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
                    {legalCase.lawyer ? (
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={legalCase.lawyer.name}
                          src={legalCase.lawyer.photo || undefined}
                          size="sm"
                          className="w-6 h-6"
                        />
                        <span className="text-sm">{legalCase.lawyer.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-default-400">
                        <Avatar
                          icon={<User className="w-3 h-3" />}
                          size="sm"
                          className="w-6 h-6"
                          classNames={{ icon: 'text-default-400' }}
                        />
                        <span className="text-sm">{tKanban('unassigned')}</span>
                      </div>
                    )}
                  </div>

                  <Divider />

                  {/* Created By */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-500">{tKanban('modal.createdBy')}</span>
                    {legalCase.createdBy ? (
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={legalCase.createdBy.name}
                          src={legalCase.createdBy.photo || undefined}
                          size="sm"
                          className="w-6 h-6"
                        />
                        <span className="text-sm">{legalCase.createdBy.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-default-400">-</span>
                    )}
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
