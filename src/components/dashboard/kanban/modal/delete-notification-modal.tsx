'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from '@/components/i18n-provider';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
} from '@/components/ui';
import { CaseNotification, NotificationType } from '@/types';

const typeColors: Record<NotificationType, 'primary' | 'warning' | 'secondary' | 'success' | 'default'> = {
  hearing: 'primary',
  deadline: 'warning',
  meeting: 'secondary',
  task: 'success',
  other: 'default',
};

type DeleteNotificationModalProps = {
  notification: CaseNotification | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteNotificationModal({
  notification,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteNotificationModalProps) {
  const t = useTranslations('notification');
  const { locale } = useLocale();

  return (
    <Modal isOpen={!!notification} onClose={onCancel} size="sm">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {t('deleteConfirm.title')}
        </ModalHeader>
        <ModalBody>
          <p className="text-default-600">{t('deleteConfirm.message')}</p>
          {notification && (
            <div className="bg-default-100 rounded-lg p-3 mt-2">
              <div className="flex items-center gap-2 mb-1">
                <Chip size="sm" color={typeColors[notification.type]} variant="flat">
                  {t(`types.${notification.type}`)}
                </Chip>
                <span className="text-sm font-medium">
                  {new Date(notification.date).toLocaleString(locale, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              {notification.message && (
                <p className="text-sm text-default-500">{notification.message}</p>
              )}
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
