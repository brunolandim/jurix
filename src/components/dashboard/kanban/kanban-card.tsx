'use client';

import { useRef, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BellRing, FileText, FileCheck, FileX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/i18n-provider';
import { Avatar, Card, CardBody, Tooltip } from '@/components/ui';
import { LegalCase, CasePriority } from '@/types';
import { getInitials } from '@/lib/utils';

const priorityColors: Record<CasePriority, string> = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

const priorityBorderColors: Record<CasePriority, string> = {
  low: 'border-l-gray-500',
  medium: 'border-l-blue-500',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-500',
};

type KanbanCardContentProps = {
  legalCase: LegalCase;
  isDragging?: boolean;
};

export function KanbanCardContent({ legalCase, isDragging }: KanbanCardContentProps) {
  const t = useTranslations('priority');
  const tKanban = useTranslations('kanban');
  const { locale } = useLocale();

  // Calcular contadores diretamente do caso
  const notificationCount = useMemo(() => legalCase.notifications?.length ?? 0, [legalCase.notifications]);
  const pendingDocumentCount = useMemo(
    () => legalCase.documents?.filter((d) => d.status === 'pending').length ?? 0,
    [legalCase.documents]
  );
  const pendingApprovalCount = useMemo(
    () => legalCase.documents?.filter((d) => d.status === 'pending_approval').length ?? 0,
    [legalCase.documents]
  );
  const receivedDocumentCount = useMemo(
    () => legalCase.documents?.filter((d) => d.status === 'received').length ?? 0,
    [legalCase.documents]
  );
  const rejectedDocumentCount = useMemo(
    () => legalCase.documents?.filter((d) => d.status === 'rejected').length ?? 0,
    [legalCase.documents]
  );

  return (
    <Card
      className={`${isDragging ? 'opacity-50 shadow-lg scale-105' : 'hover:scale-[1.02]'} transition-all border-l-4 b ${priorityBorderColors[legalCase.priority]}`}
    >
      <CardBody className="flex flex-col p-3  gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-default-500 font-mono">{legalCase.number}</span>
          <Tooltip content={t(legalCase.priority)} placement="top">
            <span className={`w-3 h-3 rounded-full ${priorityColors[legalCase.priority]}`} />
          </Tooltip>
        </div>

        <h4 className="font-medium text-sm line-clamp-2">{legalCase.title}</h4>
        <div className="flex justify-between">
          <p className="text-xs text-default-500">{legalCase.client}</p>
          <div className="flex items-center gap-3 ml-auto text-xs">
            {pendingDocumentCount > 0 && (
              <Tooltip content={tKanban('card.documents', { count: pendingDocumentCount })} placement="top">
                <div className="flex items-center gap-1 text-warning-500">
                  <FileText size={12} />
                  <span>{pendingDocumentCount}</span>
                </div>
              </Tooltip>
            )}
            {pendingApprovalCount > 0 && (
              <Tooltip content={tKanban('card.documentsPendingApproval', { count: pendingApprovalCount })} placement="top">
                <div className="flex items-center gap-1 text-secondary-500">
                  <FileText size={12} />
                  <span>{pendingApprovalCount}</span>
                </div>
              </Tooltip>
            )}
            {receivedDocumentCount > 0 && (
              <Tooltip content={tKanban('card.documentsReceived', { count: receivedDocumentCount })} placement="top">
                <div className="flex items-center gap-1 text-success-500">
                  <FileCheck size={12} />
                  <span>{receivedDocumentCount}</span>
                </div>
              </Tooltip>
            )}
            {rejectedDocumentCount > 0 && (
              <Tooltip content={tKanban('card.documentsRejected', { count: rejectedDocumentCount })} placement="top">
                <div className="flex items-center gap-1 text-danger-500">
                  <FileX size={12} />
                  <span>{rejectedDocumentCount}</span>
                </div>
              </Tooltip>
            )}
            {notificationCount > 0 && (
              <Tooltip content={tKanban('card.notifications', { count: notificationCount })} placement="top">
                <div className="flex items-center gap-1 text-default-500">
                  <BellRing size={12} />
                  <span>{notificationCount}</span>
                </div>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-default-400 mt-2">
          {legalCase.assignee && (
            <div className="flex gap-2 items-center">
              <Avatar
                name={getInitials(legalCase.assignee.name)}
                src={legalCase.assignee.photo ? legalCase.assignee.photo : undefined}
                isBordered
                className="cursor-pointer w-6 h-6 text-sm"
                color={legalCase.assignee.avatarColor}
              />
              <span>{legalCase.assignee.name}</span>
            </div>
          )}
          <span>{new Date(legalCase.updatedAt).toLocaleDateString(locale)}</span>
        </div>
      </CardBody>
    </Card>
  );
}

type KanbanCardProps = {
  legalCase: LegalCase;
  onClick?: (legalCase: LegalCase) => void;
};

export function KanbanCard({ legalCase, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: legalCase.id });
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!mouseDownPos.current) return;

    const dx = Math.abs(e.clientX - mouseDownPos.current.x);
    const dy = Math.abs(e.clientY - mouseDownPos.current.y);

    if (dx < 5 && dy < 5 && onClick) {
      onClick(legalCase);
    }

    mouseDownPos.current = null;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...attributes}
      {...listeners}
    >
      <KanbanCardContent legalCase={legalCase} isDragging={isDragging} />
    </div>
  );
}
