'use client';

import Link from 'next/link';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/contexts';
import { Avatar } from '@/components/ui';
import { ThemeToggle } from './theme-toggle';
import { LanguageSelector } from './language-selector';
import { HeaderNotifications } from './header-notifications';

export function Header() {
  const { user, isAuthenticated } = useAuth();
  return (
    <header className="border-b border-divider p-3 flex items-center justify-end">
      <div className="flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
        {isAuthenticated && <HeaderNotifications />}
        {isAuthenticated && user && (
          <Link href="/dashboard/profile">
            <Avatar
              name={getInitials(user.name)}
              src={user.photo ? user.photo : undefined}
              size="sm"
              className="cursor-pointer"
              isBordered
              color={user.avatarColor}
            />
          </Link>
        )}
      </div>
    </header>
  );
}
