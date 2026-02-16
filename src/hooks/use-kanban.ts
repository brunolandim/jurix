'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { KanbanColumn, LegalCase, Lawyer, NotificationType, DocumentStatus, RejectionReason } from '@/types';
import { columnService, legalCaseService, lawyerService, shareableLinkService } from '@/services';
import { handleApiError } from '@/lib/handle-api-error';
import { onNotificationDeleted, onNotificationRead, onAllNotificationsRead, emitNotificationCreated } from '@/lib/notification-events';

function calculateNewOrder(cases: LegalCase[], currentIndex: number): number {
  const previous = currentIndex > 0 ? cases[currentIndex - 1] : null;
  const next = currentIndex < cases.length - 1 ? cases[currentIndex + 1] : null;

  const previousOrder = previous?.order ?? null;
  const nextOrder = next?.order ?? null;

  if (previousOrder === null && nextOrder === null) return 1.0;
  if (previousOrder === null && nextOrder !== null) return nextOrder / 2;
  if (previousOrder !== null && nextOrder === null) return previousOrder + 1.0;
  return (previousOrder! + nextOrder!) / 2;
}

export function useKanban(isAuthenticated: boolean) {
  const t = useTranslations();
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCase, setActiveCase] = useState<LegalCase | null>(null);
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);

  // Filtros (estado local simples)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLawyerIds, setSelectedLawyerIds] = useState<string[]>([]);
  const [showUnassigned, setShowUnassigned] = useState(false);

  const columnsRef = useRef<KanbanColumn[]>([]);
  const dataLoaded = useRef(false);

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  // Carregar dados iniciais
  useEffect(() => {
    if (!isAuthenticated || dataLoaded.current) return;
    dataLoaded.current = true;

    async function loadData() {
      setIsLoading(true);
      const [columnsData, lawyersData] = await Promise.all([columnService.getColumns(), lawyerService.getLawyers()]);
      setColumns(columnsData);
      setLawyers(lawyersData);
      setIsLoading(false);
    }

    loadData();
  }, [isAuthenticated]);

  // Sincronizar notificações vindas do header
  useEffect(() => {
    const updateNotifications = (updater: (notifications: any[]) => any[]) => {
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cases: col.cases.map((c) => ({
            ...c,
            notifications: updater(c.notifications || []),
          })),
        }))
      );
      setSelectedCase((prev) =>
        prev ? { ...prev, notifications: updater(prev.notifications || []) } : prev
      );
    };

    const unsubDelete = onNotificationDeleted((id) => {
      updateNotifications((notifications) => notifications.filter((n) => n.id !== id));
    });

    const unsubRead = onNotificationRead((id) => {
      updateNotifications((notifications) =>
        notifications.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
    });

    const unsubAllRead = onAllNotificationsRead(() => {
      updateNotifications((notifications) =>
        notifications.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    });

    return () => { unsubDelete(); unsubRead(); unsubAllRead(); };
  }, []);

  // Colunas filtradas
  const filteredColumns = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    const hasLawyerFilter = selectedLawyerIds.length > 0 || showUnassigned;

    return columns.map((col) => ({
      ...col,
      cases: (col.cases || []).filter((c) => {
        const matchesSearch =
          !search ||
          c.number.toLowerCase().includes(search) ||
          c.title.toLowerCase().includes(search) ||
          c.client.toLowerCase().includes(search) ||
          (c.assignee && c.assignee.name.toLowerCase().includes(search));

        if (!hasLawyerFilter) return matchesSearch;

        const matchesSelectedLawyer = c.assignee && selectedLawyerIds.includes(c.assignee.id);
        const matchesUnassigned = showUnassigned && !c.assignee;

        return matchesSearch && (matchesSelectedLawyer || matchesUnassigned);
      }),
    }));
  }, [columns, searchTerm, selectedLawyerIds, showUnassigned]);

  // Ações de filtro
  const toggleLawyer = useCallback((lawyerId: string) => {
    setSelectedLawyerIds((prev) =>
      prev.includes(lawyerId) ? prev.filter((id) => id !== lawyerId) : [...prev, lawyerId]
    );
  }, []);

  const toggleUnassigned = useCallback(() => {
    setShowUnassigned((prev) => !prev);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedLawyerIds([]);
    setShowUnassigned(false);
  }, []);

  // Selecionar/fechar caso
  const selectCase = useCallback((legalCase: LegalCase | null) => {
    setSelectedCase(legalCase);
  }, []);

  const closeCase = useCallback(() => {
    setSelectedCase(null);
  }, []);

  const createCase = useCallback(
    async (params: {
      number: string;
      title: string;
      description?: string;
      client: string;
      clientPhone?: string;
      priority: LegalCase['priority'];
      assignedTo?: string;
      createdBy: string;
    }) => {
      const firstColumn = columns[0];
      if (!firstColumn) return null;

      try {
        const newCase = await legalCaseService.createCase({
          number: params.number,
          title: params.title,
          description: params.description,
          client: params.client,
          clientPhone: params.clientPhone,
          priority: params.priority,
          columnId: firstColumn.id,
          assignedTo: params.assignedTo,
          createdBy: params.createdBy,
        });

        setColumns((prev) =>
          prev.map((col) => (col.id === firstColumn.id ? { ...col, cases: [...col.cases, newCase] } : col))
        );

        return newCase;
      } catch (error) {
        handleApiError(error, t);
        return null;
      }
    },
    [columns, t]
  );

  const updateCaseData = useCallback(async (caseId: string, data: Partial<LegalCase>) => {
    const previousColumns = columnsRef.current;

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cases: col.cases.map((c) => (c.id === caseId ? { ...c, ...data } : c)),
      }))
    );

    setSelectedCase((prev) => (prev?.id === caseId ? { ...prev, ...data } : prev));

    const result = await legalCaseService.updateCase(caseId, data);
    if (!result) {
      setColumns(previousColumns);
      return false;
    }
    return true;
  }, []);

  const updateAssignLawyer = useCallback(
    async (caseId: string, lawyerId: string) => {
      const previousColumns = columnsRef.current;
      const lawyerFound = lawyers.find(({ id }) => id === lawyerId);
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cases: col.cases.map((c) => (c.id === caseId ? { ...c, assignedTo: lawyerId, assignee: lawyerFound } : c)),
        }))
      );

      setSelectedCase((prev) => (prev?.id === caseId ? { ...prev, assignedTo: lawyerId, assignee: lawyerFound } : prev));

      const result = await legalCaseService.assignLawyer(caseId, lawyerId);
      if (!result) {
        setColumns(previousColumns);
        return false;
      }
      return true;
    },
    [lawyers]
  );

  // Mover caso para outra coluna
  const moveCaseToColumn = useCallback((caseId: string, newColumnId: string) => {
    setColumns((prev) => {
      const sourceColumn = prev.find((col) => col.cases.some((c) => c.id === caseId));
      if (!sourceColumn || sourceColumn.id === newColumnId) return prev;

      const legalCase = sourceColumn.cases.find((c) => c.id === caseId);
      if (!legalCase) return prev;

      const targetColumn = prev.find((c) => c.id === newColumnId);
      const newOrder =
        targetColumn && targetColumn.cases.length > 0 ? Math.max(...targetColumn.cases.map((c) => c.order)) + 1 : 1;

      return prev.map((col) => {
        if (col.id === sourceColumn.id) {
          return { ...col, cases: col.cases.filter((c) => c.id !== caseId) };
        }
        if (col.id === newColumnId) {
          return { ...col, cases: [...col.cases, { ...legalCase, columnId: newColumnId, order: newOrder }] };
        }
        return col;
      });
    });

    setSelectedCase((prev) => (prev?.id === caseId ? { ...prev, columnId: newColumnId } : prev));

    // Persistir
    const targetColumn = columnsRef.current.find((c) => c.id === newColumnId);
    const newOrder = targetColumn && targetColumn.cases?.length > 0 
      ? Math.max(...targetColumn.cases.map((c) => c.order)) + 1 
      : 1;
    legalCaseService.moveCase({
      caseId,
      columnId: newColumnId,
      order: newOrder,
    });
  }, []);

  // Criar coluna
  const createColumn = useCallback(async (title: string) => {
    const newColumn = await columnService.createColumn(title);
    if (newColumn) {
      if (!newColumn.cases) newColumn.cases = [];
      setColumns((prev) => {
        const completedIndex = prev.findIndex((col) => col.isDefault && col.title === 'completed');
        if (completedIndex === -1) return [...prev, newColumn];
        const updated = [...prev];
        updated.splice(completedIndex, 0, newColumn);
        return updated;
      });
      return true;
    }
    return false;
  }, []);

  // Atualizar título da coluna
  const updateColumnTitle = useCallback(async (columnId: string, newTitle: string) => {
    const previousColumns = columnsRef.current;

    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, title: newTitle } : col)));

    const result = await columnService.updateColumn(columnId, newTitle);
    if (!result) {
      setColumns(previousColumns);
      return false;
    }
    return true;
  }, []);

  // Deletar coluna
  const deleteColumn = useCallback(
    async (columnId: string): Promise<{ success: boolean; error?: 'default' | 'has_cases' }> => {
      const column = columnsRef.current.find((c) => c.id === columnId);
      if (!column) return { success: false };
      if (column.isDefault) return { success: false, error: 'default' };
      if ((column.cases?.length ?? 0) > 0) return { success: false, error: 'has_cases' };

      const previousColumns = columnsRef.current;
      setColumns((prev) => prev.filter((c) => c.id !== columnId));

      const success = await columnService.deleteColumn(columnId);
      if (!success) {
        setColumns(previousColumns);
        return { success: false };
      }
      return { success: true };
    },
    []
  );

  // Notificações
  const addNotification = useCallback(
    async (caseId: string, data: { type: NotificationType; message?: string; date: string }) => {
      const newNotification = await legalCaseService.addNotification({ caseId, ...data });

      if (newNotification) {
        setColumns((prev) =>
          prev.map((col) => ({
            ...col,
            cases: col.cases.map((c) =>
              c.id === caseId ? { ...c, notifications: [...(c.notifications || []), newNotification] } : c
            ),
          }))
        );

        setSelectedCase((prev) =>
          prev?.id === caseId ? { ...prev, notifications: [...(prev.notifications || []), newNotification] } : prev
        );

        emitNotificationCreated();
      }

      return newNotification;
    },
    []
  );

  const deleteNotification = useCallback(async (caseId: string, notificationId: string) => {
    const success = await legalCaseService.deleteNotification(notificationId);

    if (success) {
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cases: col.cases.map((c) =>
            c.id === caseId
              ? { ...c, notifications: (c.notifications || []).filter((n) => n.id !== notificationId) }
              : c
          ),
        }))
      );

      setSelectedCase((prev) =>
        prev?.id === caseId
          ? { ...prev, notifications: (prev.notifications || []).filter((n) => n.id !== notificationId) }
          : prev
      );
    }

    return success;
  }, []);

  // Documentos
  const addDocument = useCallback(
    async (caseId: string, data: { name: string; description?: string; status: DocumentStatus }) => {
      try {
        const newDocument = await legalCaseService.addDocument({ caseId, ...data });

        setColumns((prev) =>
          prev.map((col) => ({
            ...col,
            cases: col.cases.map((c) =>
              c.id === caseId ? { ...c, documents: [...(c.documents || []), newDocument] } : c
            ),
          }))
        );

        setSelectedCase((prev) =>
          prev?.id === caseId ? { ...prev, documents: [...(prev.documents || []), newDocument] } : prev
        );

        return newDocument;
      } catch (error) {
        handleApiError(error, t);
        return null;
      }
    },
    [t]
  );

  const deleteDocument = useCallback(async (caseId: string, documentId: string) => {
    const success = await legalCaseService.deleteDocument(documentId);

    if (success) {
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cases: col.cases.map((c) =>
            c.id === caseId
              ? { ...c, documents: (c.documents || []).filter((d) => d.id !== documentId) }
              : c
          ),
        }))
      );

      setSelectedCase((prev) =>
        prev?.id === caseId
          ? { ...prev, documents: (prev.documents || []).filter((d) => d.id !== documentId) }
          : prev
      );
    }

    return success;
  }, []);

  const updateDocumentStatus = useCallback(async (caseId: string, documentId: string, status: DocumentStatus) => {
    const result = await legalCaseService.updateDocumentStatus(documentId, status);

    if (result) {
      const updateDoc = (d: { id: string }) =>
        d.id === documentId
          ? { ...d, status, receivedAt: status === 'received' ? new Date().toISOString() : undefined }
          : d;

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cases: col.cases.map((c) =>
            c.id === caseId ? { ...c, documents: (c.documents || []).map(updateDoc as any) } : c
          ),
        }))
      );

      setSelectedCase((prev) =>
        prev?.id === caseId ? { ...prev, documents: (prev.documents || []).map(updateDoc as any) } : prev
      );

      return true;
    }
    return false;
  }, []);

  const approveDocument = useCallback(async (caseId: string, documentId: string) => {
    const result = await legalCaseService.approveDocument(documentId, caseId);

    if (result) {
      const updateDoc = (d: { id: string }) =>
        d.id === documentId ? { ...d, status: 'received' as const, receivedAt: new Date().toISOString() } : d;

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cases: col.cases.map((c) =>
            c.id === caseId ? { ...c, documents: (c.documents || []).map(updateDoc as any) } : c
          ),
        }))
      );

      setSelectedCase((prev) =>
        prev?.id === caseId ? { ...prev, documents: (prev.documents || []).map(updateDoc as any) } : prev
      );

      return true;
    }
    return false;
  }, []);

  const rejectDocument = useCallback(
    async (caseId: string, documentId: string, reason: RejectionReason, note?: string) => {
      const result = await legalCaseService.rejectDocument(documentId, caseId, reason, note);

      if (result) {
        const updateDoc = (d: { id: string }) =>
          d.id === documentId
            ? {
                ...d,
                status: 'rejected' as const,
                rejectionReason: reason,
                rejectionNote: note,
                rejectedAt: new Date().toISOString(),
              }
            : d;

        setColumns((prev) =>
          prev.map((col) => ({
            ...col,
            cases: col.cases.map((c) =>
              c.id === caseId ? { ...c, documents: (c.documents || []).map(updateDoc as any) } : c
            ),
          }))
        );

        setSelectedCase((prev) =>
          prev?.id === caseId
            ? { ...prev, documents: (prev.documents || []).map(updateDoc as any) }
            : prev
        );

        return true;
      }
      return false;
    },
    []
  );

  // Link compartilhável
  const generateShareLink = useCallback(async (caseId: string, lawyerId: string, documentIds: string[]) => {
    try {
      const link = await shareableLinkService.createLink({
        caseId,
        documentIds,
        createdBy: lawyerId,
      });

      const url = shareableLinkService.getShareableUrl(link.token);
      return { url };
    } catch (error) {
      handleApiError(error, t);
      return null;
    }
  }, [t]);

  // DnD handlers
  const moveCase = useCallback((caseId: string, fromColumnId: string, toColumnId: string, overIndex: number) => {
    setColumns((prev) => {
      const fromColumn = prev.find((c) => c.id === fromColumnId);
      const toColumn = prev.find((c) => c.id === toColumnId);

      if (!fromColumn || !toColumn) return prev;

      const legalCase = fromColumn.cases.find((c) => c.id === caseId);
      if (!legalCase) return prev;

      return prev.map((col) => {
        if (col.id === fromColumnId) {
          return { ...col, cases: col.cases.filter((c) => c.id !== caseId) };
        }
        if (col.id === toColumnId) {
          const newCases = [...col.cases];
          const insertIndex = overIndex >= 0 ? overIndex : newCases.length;
          const newOrder = calculateNewOrder(newCases, insertIndex);
          const updatedCase = { ...legalCase, columnId: toColumnId, order: newOrder };
          newCases.splice(insertIndex, 0, updatedCase);
          return { ...col, cases: newCases };
        }
        return col;
      });
    });
  }, []);

  const reorderCase = useCallback((columnId: string, oldIndex: number, newIndex: number) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== columnId) return col;

        const cases = [...col.cases];
        const [removed] = cases.splice(oldIndex, 1);
        cases.splice(newIndex, 0, removed);

        const newOrder = calculateNewOrder(cases, newIndex);
        cases[newIndex] = { ...cases[newIndex], order: newOrder };

        return { ...col, cases };
      })
    );
  }, []);

  const persistMoveCase = useCallback(
    async (caseId: string, columnId: string, order: number) => {
      await legalCaseService.moveCase({ caseId, columnId, order });
    },
    []
  );

  return {
    // Estado
    columns,
    filteredColumns,
    lawyers,
    isLoading,
    activeCase,
    selectedCase,
    searchTerm,
    selectedLawyerIds,
    showUnassigned,

    // Ações de filtro
    setSearchTerm,
    toggleLawyer,
    toggleUnassigned,
    clearFilters,

    // Ações de caso
    selectCase,
    closeCase,
    createCase,
    updateCaseData,
    updateAssignLawyer,
    moveCaseToColumn,

    // Ações de coluna
    createColumn,
    updateColumnTitle,
    deleteColumn,

    // Ações de notificação
    addNotification,
    deleteNotification,

    // Ações de documento
    addDocument,
    deleteDocument,
    updateDocumentStatus,
    approveDocument,
    rejectDocument,

    // Link compartilhável
    generateShareLink,

    // DnD
    setActiveCase,
    moveCase,
    reorderCase,
    persistMoveCase,
    columnsRef,
  };
}
