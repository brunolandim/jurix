'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button, Input } from '@/components/ui';

type AddColumnProps = {
  onCreateColumn: (title: string) => Promise<boolean>;
};

export function AddColumn({ onCreateColumn }: AddColumnProps) {
  const t = useTranslations('kanban.column');
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleCancel = () => {
    setTitle('');
    setIsAdding(false);
  };

  const handleConfirm = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      handleCancel();
      return;
    }

    setIsSubmitting(true);
    const success = await onCreateColumn(trimmedTitle);
    setIsSubmitting(false);

    if (success) {
      setTitle('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isAdding) {
    return (
      <div className="shrink-0 w-72 rounded-md bg-default-100 p-3">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            size="sm"
            placeholder={t('titlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            isDisabled={isSubmitting}
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
              isLoading={isSubmitting}
              className="h-8 w-8 min-w-8"
            >
              {!isSubmitting && <Check size={16} />}
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              color="danger"
              onPress={handleCancel}
              isDisabled={isSubmitting}
              className="h-8 w-8 min-w-8"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="shrink-0 w-72 h-12 rounded-md bg-default-100 hover:bg-default-200 transition-colors flex items-center justify-center gap-2 text-default-500 hover:text-default-700"
    >
      <Plus size={20} />
      <span className="font-medium">{t('add')}</span>
    </button>
  );
}
