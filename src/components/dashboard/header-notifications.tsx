'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { BellRing, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts';
import { notificationService, type NotificationWithCase } from '@/services';
import { emitNotificationDeleted, emitNotificationRead, emitAllNotificationsRead, onNotificationCreated } from '@/lib/notification-events';
import { Badge, Button, Popover, PopoverTrigger, PopoverContent, Chip, Spinner } from '@/components/ui';
import { NotificationType } from '@/types';

const typeColors: Record<NotificationType, 'primary' | 'warning' | 'secondary' | 'success' | 'default'> = {
  hearing: 'primary',
  deadline: 'warning',
  meeting: 'secondary',
  task: 'success',
  other: 'default',
};

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  isMarking,
  isDeleting,
}: {
  notification: NotificationWithCase;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isMarking: boolean;
  isDeleting: boolean;
}) {
  const t = useTranslations('notification');
  const tHeader = useTranslations('headerNotifications');

  return (
    <div className={`flex gap-3 p-3 hover:bg-default-100/50 transition-colors ${notification.isRead ? 'opacity-50' : ''}`}>
      <div className="flex-1 min-w-0">
        {/* Header: tipo + número + horário */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Chip size="sm" color={typeColors[notification.type]} variant="flat" className="h-5 text-xs shrink-0">
              {t(`types.${notification.type}`)}
            </Chip>
            <span className="text-xs font-mono text-default-400 truncate">
              {notification.case?.number ?? '—'}
            </span>
          </div>
          <span className="text-xs text-default-400 shrink-0">
            {new Date(notification.date).toLocaleString([], {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Conteúdo */}
        <p className="text-sm font-medium text-default-700 leading-snug truncate">
          {notification.case?.title ?? '—'}
        </p>
        {notification.message && (
          <p className="text-xs text-default-500 mt-1 leading-relaxed truncate">{notification.message}</p>
        )}
      </div>

      {/* Ações à direita */}
      <div className="flex flex-col items-center justify-center gap-1 shrink-0">
        {!notification.isRead && (
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="success"
            onPress={() => onMarkAsRead(notification.id)}
            isLoading={isMarking}
            title={tHeader('markAsRead')}
          >
            {!isMarking && <Check size={16} />}
          </Button>
        )}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          color="danger"
          onPress={() => onDelete(notification.id)}
          isLoading={isDeleting}
          title={tHeader('delete')}
        >
          {!isDeleting && <Trash2 size={16} />}
        </Button>
      </div>
    </div>
  );
}

export function HeaderNotifications() {
  const t = useTranslations('headerNotifications');
  const { user, isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState<NotificationWithCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const lawyerId = user?.id || null;
  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  // Buscar notificações
  const fetchNotifications = useCallback(async () => {
    if (!lawyerId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      const data = await notificationService.getMyNotifications(lawyerId);
      setNotifications(data);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, [lawyerId]);

  // Fetch on mount + re-fetch when a notification is created elsewhere
  useEffect(() => {
    if (!isAuthenticated || !lawyerId) return;

    fetchNotifications();

    return onNotificationCreated(() => fetchNotifications());
  }, [isAuthenticated, lawyerId, fetchNotifications]);

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      if (!lawyerId) return;
      setMarkingId(id);
      const success = await notificationService.markAsRead(id, lawyerId);
      if (success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
        );
        emitNotificationRead(id);
      }
      setMarkingId(null);
    },
    [lawyerId]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    if (!lawyerId) return;
    setIsMarkingAll(true);
    const success = await notificationService.markAllAsRead(lawyerId);
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      emitAllNotificationsRead();
    }
    setIsMarkingAll(false);
  }, [lawyerId]);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      const success = await notificationService.delete(id);
      if (success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        emitNotificationDeleted(id);
      }
      setDeletingId(null);
    },
    []
  );

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-end" offset={10}>
      <PopoverTrigger>
        <Button isIconOnly variant="light" radius="full" aria-label={t('title')}>
          <Badge
            content={unreadCount > 9 ? '9+' : unreadCount}
            color="danger"
            size="sm"
            isInvisible={unreadCount === 0}
            shape="circle"
          >
            <BellRing size={20} className={unreadCount > 0 ? 'text-warning' : 'text-default-500'} />
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 overflow-hidden !block">
        <div className="flex items-center justify-between px-4 py-3 gap-5">
          <h3 className="font-semibold text-default-700">{t('title')}</h3>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="light"
              color="primary"
              startContent={!isMarkingAll && <CheckCheck size={14} />}
              onPress={handleMarkAllAsRead}
              isLoading={isMarkingAll}
              className="h-7"
            >
              {t('markAllAsRead')}
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="sm" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-default-400">
              <BellRing size={40} className="mb-3 opacity-30" />
              <p className="text-sm">{t('noNotifications')}</p>
            </div>
          ) : (
            <div className="divide-y divide-default-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  isMarking={markingId === notification.id}
                  isDeleting={deletingId === notification.id}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
