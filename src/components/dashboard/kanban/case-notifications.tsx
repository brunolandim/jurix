'use client';

import { useState, useCallback } from 'react';
import { Plus, Trash2, Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/i18n-provider';
import { ZonedDateTime, now, getLocalTimeZone } from '@internationalized/date';
import {
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  DatePicker,
} from '@/components/ui';
import { CaseNotification, NotificationType } from '@/types';
import { DeleteNotificationModal } from './modal';

type CaseNotificationsProps = {
  notifications: CaseNotification[];
  onAdd: (notification: Omit<CaseNotification, 'id' | 'caseId' | 'createdAt' | 'isRead' | 'isSent' | 'readAt' | 'sentAt' | 'lawyerId'>) => Promise<boolean>;
  onDelete: (notificationId: string) => Promise<boolean>;
};

const notificationTypes: NotificationType[] = ['hearing', 'deadline', 'meeting', 'task', 'other'];

const typeColors: Record<NotificationType, 'primary' | 'warning' | 'secondary' | 'success' | 'default'> = {
  hearing: 'primary',
  deadline: 'warning',
  meeting: 'secondary',
  task: 'success',
  other: 'default',
};

export function CaseNotifications({ notifications, onAdd, onDelete }: CaseNotificationsProps) {
  const t = useTranslations('notification');
  const { locale } = useLocale();

  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notificationToDelete, setNotificationToDelete] = useState<CaseNotification | null>(null);

  // Form state
  const [type, setType] = useState<NotificationType>('hearing');
  const [message, setMessage] = useState('');
  const [dateValue, setDateValue] = useState<ZonedDateTime | null>(null);

  const resetForm = useCallback(() => {
    setType('hearing');
    setMessage('');
    setDateValue(null);
    setIsAdding(false);
  }, []);

  const handleAdd = useCallback(async () => {
    if (!dateValue) return;

    // Converte ZonedDateTime para ISO string
    const isoDate = dateValue.toDate().toISOString();

    setIsSubmitting(true);
    const success = await onAdd({
      type,
      message: message.trim() || undefined,
      date: isoDate,
    });
    setIsSubmitting(false);

    if (success) {
      resetForm();
    }
  }, [type, message, dateValue, onAdd, resetForm]);

  const handleDeleteClick = useCallback((notification: CaseNotification) => {
    setNotificationToDelete(notification);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!notificationToDelete) return;

    setDeletingId(notificationToDelete.id);
    await onDelete(notificationToDelete.id);
    setDeletingId(null);
    setNotificationToDelete(null);
  }, [notificationToDelete, onDelete]);

  const handleDeleteCancel = useCallback(() => {
    setNotificationToDelete(null);
  }, []);

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-default-700 flex items-center gap-2">
          <Bell size={16} />
          {t('title')}
        </h3>
        {!isAdding && (
          <Button
            size="sm"
            variant="flat"
            startContent={<Plus size={14} />}
            onPress={() => setIsAdding(true)}
          >
            {t('add')}
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-default-100 rounded-lg p-3 mb-3 space-y-3">
          <div className="flex gap-2 items-end">
            <Select
              size="sm"
              label={t('type')}
              labelPlacement="outside"
              selectedKeys={[type]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as NotificationType;
                if (selected) setType(selected);
              }}
              className="flex-1"
              isDisabled={isSubmitting}
            >
              {notificationTypes.map((nt) => (
                <SelectItem key={nt}>{t(`types.${nt}`)}</SelectItem>
              ))}
            </Select>

            <DatePicker
              size="sm"
              label={t('date')}
              labelPlacement="outside"
              value={dateValue}
              onChange={setDateValue}
              minValue={now(getLocalTimeZone())}
              className="flex-1"
              isDisabled={isSubmitting}
              hideTimeZone
              showMonthAndYearPickers
              granularity="minute"
              hourCycle={24}
            />
          </div>

          <Input
            size="sm"
            label={t('message')}
            placeholder={t('messagePlaceholder')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            isDisabled={isSubmitting}
          />

          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="flat"
              onPress={resetForm}
              isDisabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button
              size="sm"
              color="primary"
              onPress={handleAdd}
              isLoading={isSubmitting}
              isDisabled={!dateValue}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      )}

      {sortedNotifications.length === 0 ? (
        <p className="text-sm text-default-400 italic">{t('noNotifications')}</p>
      ) : (
        <div className="space-y-2">
          {sortedNotifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between bg-default-50 rounded-lg p-2 border border-default-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Chip size="sm" color={typeColors[notification.type]} variant="flat">
                  {t(`types.${notification.type}`)}
                </Chip>
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {new Date(notification.date).toLocaleString(locale, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                  {notification.message && (
                    <p className="text-xs text-default-500 truncate">{notification.message}</p>
                  )}
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={() => handleDeleteClick(notification)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}

      <DeleteNotificationModal
        notification={notificationToDelete}
        isDeleting={!!deletingId}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
