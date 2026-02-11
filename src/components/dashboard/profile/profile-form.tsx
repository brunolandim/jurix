'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Camera, Check } from 'lucide-react';
import { useAuth } from '@/contexts';
import { profileService } from '@/services';
import { Avatar, Button, Input, Divider } from '@/components/ui';
import { getInitials } from '@/lib/utils';

const AVATAR_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
];

export function ProfileForm() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [specialty, setSpecialty] = useState(user?.specialty ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [avatarColor, setAvatarColor] = useState(user?.avatarColor ?? '#3b82f6');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const currentPhoto = photoPreview ?? user.photo ?? undefined;

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error(t('passwordMismatch'));
      return;
    }

    setIsSaving(true);

    try {
      let photoUrl: string | undefined;

      if (photoFile) {
        try {
          photoUrl = await profileService.uploadFile('photos', photoFile);
        } catch {
          toast.error(t('uploadError'));
          setIsSaving(false);
          return;
        }
      }

      const data: Record<string, unknown> = {
        name,
        phone: phone || undefined,
        specialty: specialty || undefined,
        avatarColor,
      };

      if (photoUrl) {
        data.photo = photoUrl;
      }

      if (newPassword) {
        data.password = newPassword;
      }

      const updated = await profileService.updateProfile(data);
      updateUser(updated);
      setNewPassword('');
      setConfirmPassword('');
      setPhotoFile(null);
      setPhotoPreview(null);
      toast.success(t('saveSuccess'));
    } catch {
      toast.error(t('saveError'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex flex-col gap-6 py-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Avatar
            name={getInitials(name || user.name)}
            src={currentPhoto}
            className="w-24 h-24 text-2xl"
            isBordered
            style={!currentPhoto ? { backgroundColor: avatarColor } : undefined}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-colors"
          >
            <Camera size={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm cursor-pointer text-primary hover:underline"
        >
          {t('changePhoto')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handlePhotoSelect}
        />
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-default-500">{t('avatarColor')}</span>
          <div className="flex gap-2">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setAvatarColor(color)}
                className="w-8 h-8 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-110 ring-offset-2 ring-offset-background"
                style={{
                  backgroundColor: color,
                  boxShadow: avatarColor === color ? `0 0 0 2px var(--color-background), 0 0 0 4px ${color}` : undefined,
                }}
              >
                {avatarColor === color && <Check size={16} className="text-white" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Input
        label={t('name')}
        value={name}
        onValueChange={setName}
        isRequired
      />

      <Input
        label={t('phone')}
        value={phone}
        onValueChange={setPhone}
      />

      <Input
        label={t('specialty')}
        value={specialty}
        onValueChange={setSpecialty}
      />

      <Divider />

      <h2 className="text-lg font-semibold">{t('changePassword')}</h2>

      <Input
        type="password"
        label={t('newPassword')}
        value={newPassword}
        onValueChange={setNewPassword}
      />

      <Input
        type="password"
        label={t('confirmPassword')}
        value={confirmPassword}
        onValueChange={setConfirmPassword}
      />

      <Button
        type="submit"
        color="primary"
        isLoading={isSaving}
        className="w-full"
      >
        {tCommon('save')}
      </Button>
    </form>
  );
}
