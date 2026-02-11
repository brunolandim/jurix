'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Scale, Users, CreditCard, UserCog, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import Link from 'next/link';
import { Tooltip } from '@/components/ui';
import { useAuth } from '@/contexts';
import { useSubscription } from '@/contexts';

const SIDEBAR_COLLAPSED_KEY = 'jurix-sidebar-collapsed';

const menuItems = [
  { key: 'cases', href: '/dashboard', icon: Scale, minRole: 'lawyer' },
  { key: 'lawyers', href: '/dashboard/lawyers', icon: Users, minRole: 'admin' },
  { key: 'billing', href: '/dashboard/billing', icon: CreditCard, minRole: 'admin' },
  { key: 'profile', href: '/dashboard/profile', icon: UserCog, minRole: 'lawyer' },
] as const;

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('sidebar');
  const { logout } = useAuth();
  const { isOwner, isAdmin } = useSubscription();

  const visibleItems = menuItems.filter((item) => {
    if (item.minRole === 'owner') return isOwner;
    if (item.minRole === 'admin') return isAdmin;
    return true;
  });

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(stored === 'true');
    } else {
      setCollapsed(window.innerWidth < 768);
    }
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  if (!mounted) {
    return <div className="w-16 shrink-0" />;
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen border-r border-divider  flex flex-col shrink-0 overflow-hidden"
    >
      <div className="flex items-center p-3.75 border-b border-divider">
        <motion.div
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
          transition={{ duration: 0.15 }}
          className="overflow-hidden whitespace-nowrap"
        >
          <span className="text-xl font-bold ml-1">{APP_NAME}</span>
        </motion.div>
        <button
          onClick={toggle}
          className={cn('p-2 rounded-md hover:bg-default-100 transition-colors', collapsed ? 'mx-auto' : 'ml-auto')}
          aria-label={collapsed ? t('expand') : t('collapse')}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const label = t(item.key);

          const linkContent = (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                active ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-default-100 hover:text-foreground'
              )}
            >
              <Icon size={20} className="shrink-0" />
              <motion.span
                initial={false}
                animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {label}
              </motion.span>
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.key} content={label} placement="right">
                {linkContent}
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      <div className="border-t border-divider px-2 py-4">
        {collapsed ? (
          <Tooltip content={t('logout')} placement="right">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium text-danger hover:bg-danger/10 w-full"
            >
              <LogOut size={20} className="shrink-0" />
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium text-danger hover:bg-danger/10 w-full"
          >
            <LogOut size={20} className="shrink-0" />
            <motion.span
              initial={false}
              animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden whitespace-nowrap"
            >
              {t('logout')}
            </motion.span>
          </button>
        )}
      </div>
    </motion.aside>
  );
}
