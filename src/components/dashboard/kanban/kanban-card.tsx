'use client';

import { useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/i18n-provider';
import { Avatar, Card, CardBody, Tooltip } from '@/components/ui';
import { LegalCase, CasePriority } from '@/types';

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
  const { locale } = useLocale();

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
        <p className="text-xs text-default-500">{legalCase.client}</p>

        <div className="flex items-center justify-between text-xs text-default-400 mt-2">
          {legalCase.lawyer && (
            <div className="flex gap-2 items-center">
              <Avatar
                name={legalCase.lawyer.name}
                src={legalCase.lawyer.photo ? legalCase.lawyer.photo : undefined}
                color="success"
                className="cursor-pointer w-6 h-6 text-sm"
              />
              <span>{legalCase.lawyer.name}</span>
            </div>
          )}
          <span className="ml-auto">{new Date(legalCase.updatedAt).toLocaleDateString(locale)}</span>
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

    // Se o movimento foi menor que 5px, considera como click
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
