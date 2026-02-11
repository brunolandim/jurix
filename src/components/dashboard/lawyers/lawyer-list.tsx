'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Pencil } from 'lucide-react';
import { Button, Card, CardBody, Chip } from '@/components/ui';
import { lawyerService } from '@/services/lawyer-service';
import { getInitials } from '@/lib/utils';
import { Avatar } from '@/components/ui';
import type { Lawyer } from '@/types';
import { LawyerModal } from './lawyer-modal';

export function LawyerList() {
  const t = useTranslations('lawyers');
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState<Lawyer | null>(null);

  const fetchLawyers = useCallback(async () => {
    setLoading(true);
    const data = await lawyerService.getAllLawyers();
    setLawyers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLawyers();
  }, [fetchLawyers]);

  const handleToggleActive = async (lawyer: Lawyer) => {
    await lawyerService.updateLawyer(lawyer.id, { active: !lawyer.active });
    fetchLawyers();
  };

  const handleEdit = (lawyer: Lawyer) => {
    setEditingLawyer(lawyer);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingLawyer(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button color="primary" startContent={<Plus size={18} />} onPress={handleCreate}>
          {t('newLawyer')}
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardBody className="animate-pulse h-32" />
            </Card>
          ))}
        </div>
      ) : lawyers.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12 text-foreground/50">
            {t('noLawyers')}
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lawyers.map((lawyer) => (
            <Card key={lawyer.id}>
              <CardBody className="flex flex-row gap-4 items-start">
                <Avatar
                  name={getInitials(lawyer.name)}
                  src={lawyer.photo || undefined}
                  size="lg"
                  isBordered
                  style={!lawyer.photo ? { backgroundColor: lawyer.avatarColor ?? '#3b82f6' } : undefined}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{lawyer.name}</p>
                      <p className="text-sm text-foreground/60 truncate">{lawyer.email}</p>
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleEdit(lawyer)}
                    >
                      <Pencil size={16} />
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Chip size="sm" variant="flat">{lawyer.oab}</Chip>
                    {lawyer.role && (
                      <Chip size="sm" variant="flat" color="primary">{t(`roles.${lawyer.role}`)}</Chip>
                    )}
                    {lawyer.specialty && (
                      <Chip size="sm" variant="flat" color="secondary">{lawyer.specialty}</Chip>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Chip
                      size="sm"
                      color={lawyer.active ? 'success' : 'default'}
                      variant="dot"
                    >
                      {lawyer.active ? t('active') : t('inactive')}
                    </Chip>
                    <Button
                      size="sm"
                      variant="flat"
                      color={lawyer.active ? 'warning' : 'success'}
                      onPress={() => handleToggleActive(lawyer)}
                    >
                      {lawyer.active ? t('deactivate') : t('activate')}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <LawyerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchLawyers}
        lawyer={editingLawyer}
      />
    </div>
  );
}
