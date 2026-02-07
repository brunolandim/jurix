'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
} from '@/components/ui';
import { lawyerService } from '@/services/lawyer-service';
import type { Lawyer } from '@/types';

type LawyerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lawyer?: Lawyer | null;
};

export function LawyerModal({ isOpen, onClose, onSuccess, lawyer }: LawyerModalProps) {
  const t = useTranslations('lawyers');
  const tc = useTranslations('common');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    oab: '',
    specialty: '',
  });

  useEffect(() => {
    if (lawyer) {
      setForm({
        name: lawyer.name,
        email: lawyer.email,
        phone: lawyer.phone || '',
        oab: lawyer.oab,
        specialty: lawyer.specialty || '',
      });
    } else {
      setForm({ name: '', email: '', phone: '', oab: '', specialty: '' });
    }
  }, [lawyer, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (lawyer) {
        await lawyerService.updateLawyer(lawyer.id, form);
      } else {
        await lawyerService.createLawyer({ ...form, active: true });
      }
      onSuccess();
      onClose();
    } catch {
      // error handled silently
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
          <Input
            label={t('phone')}
            placeholder={t('phonePlaceholder')}
            value={form.phone}
            onValueChange={(v) => setForm((f) => ({ ...f, phone: v }))}
          />
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
