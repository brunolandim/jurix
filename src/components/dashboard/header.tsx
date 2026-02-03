'use client';

import { APP_NAME } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/contexts';
import { Avatar } from '@/components/ui';
import { ThemeToggle } from './theme-toggle';
import { LanguageSelector } from './language-selector';
import { HeaderNotifications } from './header-notifications';

export function Header() {
  const { user, isAuthenticated } = useAuth();
  return (
    <header className="border-b border-divider px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold">{APP_NAME}</h1>

      <div className="flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
        {isAuthenticated && <HeaderNotifications />}
        {isAuthenticated && user && (
          <div>
            <Avatar
              name={getInitials(user.name)}
              src={user.photo ? user.photo : undefined}
              size="sm"
              color="primary"
              className="cursor-pointer"
              isBordered
            />
          </div>
        )}
      </div>
    </header>
  );
}
