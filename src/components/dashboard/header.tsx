'use client';

import { APP_NAME } from '@/lib/constants';
import { useAuth } from '@/hooks';
import { Avatar } from '@/components/ui';
import { ThemeToggle } from './theme-toggle';
import { LanguageSelector } from './language-selector';

export function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="border-b border-divider px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold">{APP_NAME}</h1>

      <div className="flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
        {isAuthenticated && user && (
          <div>
            <Avatar
              name={user.name}
              src={user.image_url ? user.image_url : undefined}
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
