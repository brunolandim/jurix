'use client';

import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Check, X, Trash2 } from 'lucide-react';
import { KanbanColumn as KanbanColumnType, LegalCase } from '@/types';
import { KanbanCard } from './kanban-card';

type KanbanColumnProps = {
  column: KanbanColumnType;
  totalCount: number;
  onCardClick?: (legalCase: LegalCase) => void;
  onColumnTitleUpdate?: (columnId: string, newTitle: string) => Promise<boolean>;
  onColumnDelete?: (columnId: string) => Promise<{ success: boolean; error?: 'default' | 'has_cases' }>;
};

export function KanbanColumn({
  column,
  totalCount,
  onCardClick,
  onColumnTitleUpdate,
  onColumnDelete,
}: KanbanColumnProps) {
  const t = useTranslations('kanban.columns');
  const tKanban = useTranslations('kanban');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDefaultColumn = !!column.isDefault;
  const hasTranslationKey = !!column.key;
  const displayTitle = hasTranslationKey ? t(column.key!) : column.title;
  const canDelete = !isDefaultColumn && column.cases.length === 0;

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const caseIds = column.cases.map((c) => c.id);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (isDefaultColumn || hasTranslationKey) return;
    setEditTitle(column.title);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditTitle(column.title);
    setIsEditing(false);
  };

  const handleConfirm = async () => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle || trimmedTitle === column.title) {
      handleCancel();
      return;
    }

    if (onColumnTitleUpdate) {
      setIsSaving(true);
      const success = await onColumnTitleUpdate(column.id, trimmedTitle);
      setIsSaving(false);
      if (success) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDelete = async () => {
    if (!canDelete || !onColumnDelete) return;

    setIsDeleting(true);
    await onColumnDelete(column.id);
    setIsDeleting(false);
  };

  return (
    <div className="group shrink-0 w-72 rounded-md bg-default-100 flex flex-col max-h-full">
      <div className="p-3 border-b border-default-200">
        <div className="flex items-center justify-between gap-2">
          {isEditing ? (
            <>
              <Input
                ref={inputRef}
                size="sm"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                isDisabled={isSaving}
                classNames={{
                  input: 'font-semibold',
                  inputWrapper: 'h-8 min-h-8',
                }}
              />
              <div className="flex gap-1 shrink-0">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  color="success"
                  onPress={handleConfirm}
                  isLoading={isSaving}
                  className="h-8 w-8 min-w-8"
                >
                  {!isSaving && <Check size={16} />}
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  color="danger"
                  onPress={handleCancel}
                  isDisabled={isSaving}
                  className="h-8 w-8 min-w-8"
                >
                  <X size={16} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <h3
                className={`font-semibold transition-colors flex-1 ${
                  isDefaultColumn || hasTranslationKey ? '' : 'cursor-pointer hover:text-primary'
                }`}
                onClick={handleStartEdit}
                title={isDefaultColumn || hasTranslationKey ? undefined : tKanban('column.clickToEdit')}
              >
                {displayTitle}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                {canDelete && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={handleDelete}
                    isLoading={isDeleting}
                    className="h-7 w-7 min-w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    title={tKanban('column.delete')}
                  >
                    {!isDeleting && <Trash2 size={14} />}
                  </Button>
                )}
                <span className="text-xs bg-default-200 px-2 py-1 rounded-md">
                  {column.cases.length === totalCount ? totalCount : `${column.cases.length}/${totalCount}`}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 p-2 space-y-2 overflow-y-auto min-h-48 transition-colors ${
          isOver ? 'bg-default-200/50' : ''
        }`}
      >
        <SortableContext items={caseIds} strategy={verticalListSortingStrategy}>
          {column.cases.map((legalCase) => (
            <KanbanCard key={legalCase.id} legalCase={legalCase} onClick={onCardClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
