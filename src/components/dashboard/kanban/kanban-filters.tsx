'use client';

import { Search, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Avatar, Input, Tooltip, Button, Checkbox, AvatarGroup, Popover, PopoverTrigger, PopoverContent } from '@/components/ui';
import { Lawyer } from '@/types';

type KanbanFiltersProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  lawyers: Lawyer[];
  selectedLawyerIds: string[];
  onToggleLawyer: (lawyerId: string) => void;
  onClearFilters: () => void;
  showUnassigned?: boolean;
  onToggleUnassigned?: () => void;
};

const MAX_VISIBLE_AVATARS = 5;

export function KanbanFilters({
  searchTerm,
  onSearchChange,
  lawyers,
  selectedLawyerIds,
  onToggleLawyer,
  onClearFilters,
  showUnassigned = false,
  onToggleUnassigned,
}: KanbanFiltersProps) {
  const t = useTranslations('kanban');
  const hasActiveFilters = searchTerm.length > 0 || selectedLawyerIds.length > 0 || showUnassigned;

  return (
    <div className="flex gap-5 items-center">
      <Input
        type="text"
        placeholder={t('searchPlaceholder')}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-64"
        startContent={<Search className="w-4 h-4 text-default-400" />}
      />

      {lawyers.length > 0 && (
        <AvatarGroup
          isBordered
          max={MAX_VISIBLE_AVATARS}
          renderCount={() => (
            <Popover placement="bottom">
              <PopoverTrigger>
                <Avatar name={`+`} size="sm" className="cursor-pointer translate-x-0!" color="default" />
              </PopoverTrigger>
              <PopoverContent className="p-2">
                <div className="flex flex-col gap-1 max-h-64 overflow-auto min-w-56">
                  {lawyers.map((lawyer) => (
                    <div
                      key={lawyer.id}
                      className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-default-100 cursor-pointer"
                      onClick={() => onToggleLawyer(lawyer.id)}
                    >
                      <Checkbox
                        isSelected={selectedLawyerIds.includes(lawyer.id)}
                        onValueChange={() => onToggleLawyer(lawyer.id)}
                        size="sm"
                      />
                      <Avatar name={lawyer.name} src={lawyer.photo} size="sm" className="shrink-0" />
                      <span className="text-sm">{lawyer.name}</span>
                    </div>
                  ))}
                  {onToggleUnassigned && (
                    <div
                      className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-default-100 cursor-pointer"
                      onClick={onToggleUnassigned}
                    >
                      <Checkbox isSelected={showUnassigned} onValueChange={onToggleUnassigned} size="sm" />
                      <Avatar
                        icon={<User className="w-4 h-4" />}
                        size="sm"
                        className="shrink-0"
                        classNames={{ icon: 'text-default-500' }}
                      />
                      <span className="text-sm">{t('unassigned')}</span>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        >
          {lawyers.map((lawyer) => (
            <Tooltip key={lawyer.id} content={lawyer.name}>
              <Avatar
                name={lawyer.name}
                src={lawyer.photo}
                size="sm"
                className="cursor-pointer"
                color={selectedLawyerIds.includes(lawyer.id) ? 'primary' : 'default'}
                isBordered
                onClick={() => onToggleLawyer(lawyer.id)}
              />
            </Tooltip>
          ))}
        </AvatarGroup>
      )}

      <Button onPress={onClearFilters} variant="faded" isDisabled={!hasActiveFilters}>
        {t('clearFilters')}
      </Button>
    </div>
  );
}
