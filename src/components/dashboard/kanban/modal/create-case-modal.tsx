'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, User } from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Button,
  Select,
  SelectItem,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  PhoneInput,
} from '@/components/ui';
import { CasePriority, Lawyer, LegalCase } from '@/types';
import { getInitials } from '@/lib/utils';

type CreateCaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  lawyers: Lawyer[];
  currentUser: { id: string; name: string; photo: string };
  onCreateCase: (data: {
    number: string;
    title: string;
    description?: string;
    client: string;
    clientPhone: string;
    priority: CasePriority;
    assignedTo?: string;
    createdBy: string;
  }) => Promise<LegalCase | null>;
};

const priorities: CasePriority[] = ['low', 'medium', 'high', 'urgent'];

export function CreateCaseModal({ isOpen, onClose, lawyers, currentUser, onCreateCase }: CreateCaseModalProps) {
  const t = useTranslations('kanban.createCase');
  const tPriority = useTranslations('priority');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [number, setNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [priority, setPriority] = useState<CasePriority>('medium');
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer>();

  const resetForm = useCallback(() => {
    setNumber('');
    setTitle('');
    setDescription('');
    setClient('');
    setClientPhone('');
    setPriority('medium');
    setSelectedLawyer(undefined);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!number.trim() || !title.trim() || !client.trim()) return;

    setIsSubmitting(true);

    const result = await onCreateCase({
      number: number.trim(),
      title: title.trim(),
      description: description.trim() || undefined,
      client: client.trim(),
      clientPhone: clientPhone.trim(),
      priority,
      assignedTo: selectedLawyer?.id,
      createdBy: currentUser.id,
    });

    setIsSubmitting(false);

    if (result) {
      handleClose();
    }
  }, [
    number,
    title,
    description,
    client,
    clientPhone,
    priority,
    selectedLawyer,
    currentUser,
    onCreateCase,
    handleClose,
  ]);

  const handleLawyerChange = useCallback(
    (lawyerId: string | null) => {
      if (!lawyerId) {
        setSelectedLawyer(undefined);
        return;
      }

      const lawyer = lawyers.find((l) => l.id === lawyerId);
      if (lawyer) {
        setSelectedLawyer(lawyer);
      }
    },
    [lawyers]
  );

  const isFormValid = number.trim() && title.trim() && client.trim();

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">{t('title')}</h2>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <Input
              label={t('caseNumber')}
              placeholder={t('caseNumberPlaceholder')}
              value={number}
              onValueChange={setNumber}
              isRequired
              isDisabled={isSubmitting}
            />

            <Input
              label={t('caseTitle')}
              placeholder={t('caseTitlePlaceholder')}
              value={title}
              onValueChange={setTitle}
              isRequired
              isDisabled={isSubmitting}
            />

            <Input
              label={t('client')}
              placeholder={t('clientPlaceholder')}
              value={client}
              onValueChange={setClient}
              isRequired
              isDisabled={isSubmitting}
            />

            <PhoneInput
              label={t('clientPhone')}
              value={clientPhone}
              isRequired
              onChange={setClientPhone}
              isDisabled={isSubmitting}
            />

            <Select
              label={t('priority')}
              selectedKeys={[priority]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as CasePriority;
                if (selected) setPriority(selected);
              }}
              isDisabled={isSubmitting}
            >
              {priorities.map((p) => (
                <SelectItem key={p}>{tPriority(p)}</SelectItem>
              ))}
            </Select>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-default-700">{t('lawyer')}</label>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    className="justify-between"
                    endContent={<ChevronDown className="w-4 h-4" />}
                    isDisabled={isSubmitting}
                  >
                    {selectedLawyer ? (
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={getInitials(selectedLawyer.name)}
                          src={selectedLawyer.photo || undefined}
                          className="w-6 h-6"
                          color={selectedLawyer.avatarColor}
                        />
                        <span>{selectedLawyer.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-default-400">
                        <User className="w-4 h-4" />
                        <span>{t('selectLawyer')}</span>
                      </div>
                    )}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label={t('selectLawyer')}
                  selectedKeys={selectedLawyer ? [selectedLawyer.id] : []}
                  selectionMode="single"
                  className="max-h-60 overflow-auto"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string | undefined;
                    handleLawyerChange(selected || null);
                  }}
                >
                  {lawyers.map((lawyer) => (
                    <DropdownItem
                      key={lawyer.id}
                      startContent={
                        <Avatar
                          name={getInitials(lawyer.name)}
                          src={lawyer.photo || undefined}
                          className="w-6 h-6"
                          color={lawyer.avatarColor}
                        />
                      }
                    >
                      {lawyer.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>

            <Textarea
              label={t('description')}
              placeholder={t('descriptionPlaceholder')}
              value={description}
              onValueChange={setDescription}
              minRows={4}
              isDisabled={isSubmitting}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={handleClose} isDisabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button color="primary" onPress={handleSubmit} isLoading={isSubmitting} isDisabled={!isFormValid}>
            {t('create')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
