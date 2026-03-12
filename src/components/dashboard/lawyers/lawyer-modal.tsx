'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  Select,
  SelectItem,
  PhoneInput,
} from '@/components/ui';
import { lawyerService } from '@/services/lawyer-service';
import { handleApiError } from '@/lib/handle-api-error';
import type { Lawyer } from '@/types';

type LawyerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lawyer?: Lawyer | null;
};

export function LawyerModal({ isOpen, onClose, onSuccess, lawyer }: LawyerModalProps) {
  const t = useTranslations('lawyers');
  const te = useTranslations();
  const tc = useTranslations('common');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    oab: '',
    specialty: '',
    role: 'lawyer' as 'lawyer' | 'owner' | 'admin',
  });

  const roleOptions = ['owner', 'admin', 'lawyer'] as const;

  useEffect(() => {
    if (lawyer) {
      setForm({
        name: lawyer.name,
        email: lawyer.email,
        phone: lawyer.phone || '',
        oab: lawyer.oab,
        specialty: lawyer.specialty || '',
        role: lawyer.role || 'lawyer',
      });
    } else {
      setForm({ name: '', email: '', phone: '', oab: '', specialty: '', role: 'lawyer' });
    }
  }, [lawyer, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (lawyer) {
        const changes: Partial<typeof form> = {};
        for (const key of Object.keys(form) as (keyof typeof form)[]) {
          if (form[key] !== (lawyer[key as keyof typeof lawyer] ?? '')) {
            (changes as Record<string, unknown>)[key] = form[key];
          }
        }
        await lawyerService.updateLawyer(lawyer.id, changes);
        toast.success(t('updateSuccess'));
      } else {
        await lawyerService.createLawyer({ ...form, active: true, avatarColor: 'default' });
        toast.success(t('createSuccess'));
      }
      onSuccess();
      onClose();
    } catch (error) {
      handleApiError(error, te);
    } finally {
      setLoading(false);
    }
  };

  const isValid = form.name.trim() && form.email.trim() && form.oab.trim();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>{lawyer ? t('editLawyer') : t('newLawyer')}</ModalHeader>
        <ModalBody className="flex flex-col gap-4">
          <Input
            label={t('name')}
            placeholder={t('namePlaceholder')}
            value={form.name}
            onValueChange={(v) => setForm((f) => ({ ...f, name: v }))}
            isRequired
          />
          <Input
            label={t('email')}
            placeholder={t('emailPlaceholder')}
            type="email"
            value={form.email}
            onValueChange={(v) => setForm((f) => ({ ...f, email: v }))}
            isRequired
          />
          <PhoneInput label={t('phone')} value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          <Input
            label={t('oab')}
            placeholder={t('oabPlaceholder')}
            value={form.oab}
            onValueChange={(v) => setForm((f) => ({ ...f, oab: v }))}
            isRequired
          />
          <Input
            label={t('specialty')}
            placeholder={t('specialtyPlaceholder')}
            value={form.specialty}
            onValueChange={(v) => setForm((f) => ({ ...f, specialty: v }))}
          />
          <Select
            label={t('role')}
            selectedKeys={[form.role]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as 'lawyer' | 'owner' | 'admin';
              if (value) setForm((f) => ({ ...f, role: value }));
            }}
          >
            {roleOptions.map((role) => (
              <SelectItem key={role}>{t(`roles.${role}`)}</SelectItem>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            {tc('cancel')}
          </Button>
          <Button color="primary" onPress={handleSubmit} isLoading={loading} isDisabled={!isValid}>
            {tc('save')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
