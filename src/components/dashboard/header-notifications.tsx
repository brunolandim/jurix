'use client';

import { useState } from 'react';
import { BellRing, Check, CheckCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useNotifications, NotificationWithCase } from '@/hooks';
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
  isMarking,
}: {
  notification: NotificationWithCase;
  onMarkAsRead: (id: string) => void;
  isMarking: boolean;
}) {
  const t = useTranslations('notification');
  const tHeader = useTranslations('headerNotifications');

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-default-100/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <Chip size="sm" color={typeColors[notification.type]} variant="flat" className="h-5 text-xs">
            {t(`types.${notification.type}`)}
          </Chip>
          <span className="text-xs text-default-400">
            {new Date(notification.date).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <p className="text-sm font-medium text-default-700 leading-tight">{notification.case.title}</p>
        <p className="text-xs text-default-400 font-mono mt-0.5">{notification.case.number}</p>
        {notification.message && (
          <p className="text-xs text-default-500 mt-1.5 leading-relaxed">{notification.message}</p>
        )}
      </div>
      <Button
        isIconOnly
        size="sm"
        variant="flat"
        color="success"
        className="shrink-0 mt-0.5"
        onPress={() => onMarkAsRead(notification.id)}
        isLoading={isMarking}
        title={tHeader('markAsRead')}
      >
        {!isMarking && <Check size={14} />}
      </Button>
    </div>
  );
}

export function HeaderNotifications() {
  const t = useTranslations('headerNotifications');
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const handleMarkAsRead = async (id: string) => {
    setMarkingId(id);
    await markAsRead(id);
    setMarkingId(null);
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    await markAllAsRead();
    setIsMarkingAll(false);
  };

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
      <PopoverContent className="w-96 p-0 overflow-hidden">
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
                  isMarking={markingId === notification.id}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
