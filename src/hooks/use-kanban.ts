'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn, LegalCase, Lawyer } from '@/types';
import { kanbanService, lawyerService } from '@/services';

const FILTERS_STORAGE_KEY = 'jurix-kanban-filters';

type StoredFilters = {
  selectedLawyerIds: string[];
  showUnassigned: boolean;
};

function loadFiltersFromStorage(): StoredFilters {
  if (typeof window === 'undefined') {
    return { selectedLawyerIds: [], showUnassigned: false };
  }
  try {
    const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        selectedLawyerIds: Array.isArray(parsed.selectedLawyerIds) ? parsed.selectedLawyerIds : [],
        showUnassigned: Boolean(parsed.showUnassigned),
      };
    }
  } catch {}
  return { selectedLawyerIds: [], showUnassigned: false };
}

function saveFiltersToStorage(filters: StoredFilters): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  } catch {}
}

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

export function useKanban() {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCase, setActiveCase] = useState<LegalCase | null>(null);
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLawyerIds, setSelectedLawyerIds] = useState<string[]>(
    () => loadFiltersFromStorage().selectedLawyerIds ?? []
  );
  const [showUnassigned, setShowUnassigned] = useState<boolean>(() => loadFiltersFromStorage().showUnassigned ?? false);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);

  const columnsRef = useRef<KanbanColumn[]>([]);
  const selectedCaseRef = useRef<LegalCase | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateColumns = useCallback((updater: KanbanColumn[] | ((prev: KanbanColumn[]) => KanbanColumn[])) => {
    setColumns((prev) => {
      const newValue = typeof updater === 'function' ? updater(prev) : updater;
      columnsRef.current = newValue;
      return newValue;
    });
  }, []);

  useEffect(() => {
    Promise.all([kanbanService.getColumns(), lawyerService.getLawyers()]).then(([columnsData, lawyersData]) => {
      updateColumns(columnsData);
      setLawyers(lawyersData);
      setIsLoading(false);
    });
  }, [updateColumns]);

  useEffect(() => {
    saveFiltersToStorage({ selectedLawyerIds, showUnassigned });
  }, [selectedLawyerIds, showUnassigned]);

  const findColumn = useCallback(
    (caseId: string): KanbanColumn | undefined => {
      return columns.find((col) => col.cases.some((c) => c.id === caseId));
    },
    [columns]
  );

  const findCase = useCallback(
    (caseId: string): LegalCase | undefined => {
      for (const col of columns) {
        const legalCase = col.cases.find((c) => c.id === caseId);
        if (legalCase) return legalCase;
      }
      return undefined;
    },
    [columns]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const legalCase = findCase(event.active.id as string);
      setActiveCase(legalCase || null);
    },
    [findCase]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeColumn = findColumn(activeId);
      let overColumn = findColumn(overId);

      if (!overColumn) {
        overColumn = columns.find((col) => col.id === overId);
      }

      if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
        return;
      }

      updateColumns((prev) => {
        const activeCase = activeColumn.cases.find((c) => c.id === activeId);
        if (!activeCase) return prev;

        return prev.map((col) => {
          if (col.id === activeColumn.id) {
            return {
              ...col,
              cases: col.cases.filter((c) => c.id !== activeId),
            };
          }
          if (col.id === overColumn!.id) {
            const overIndex = col.cases.findIndex((c) => c.id === overId);
            const newCases = [...col.cases];
            const insertIndex = overIndex >= 0 ? overIndex : newCases.length;

            const newOrder = calculateNewOrder(newCases, insertIndex);
            const newCase = {
              ...activeCase,
              columnId: col.id,
              order: newOrder,
            };

            newCases.splice(insertIndex, 0, newCase);

            return {
              ...col,
              cases: newCases,
            };
          }
          return col;
        });
      });
    },
    [columns, findColumn, updateColumns]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveCase(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;
      const currentColumns = columnsRef.current;

      const findColumnCurrent = (caseId: string) =>
        currentColumns.find((col) => col.cases.some((c) => c.id === caseId));

      const activeColumn = findColumnCurrent(activeId);
      let overColumn = findColumnCurrent(overId);

      if (!overColumn) {
        overColumn = currentColumns.find((col) => col.id === overId);
      }

      if (!activeColumn || !overColumn) return;

      if (activeColumn.id === overColumn.id) {
        const oldIndex = activeColumn.cases.findIndex((c) => c.id === activeId);
        const newIndex = activeColumn.cases.findIndex((c) => c.id === overId);

        if (oldIndex !== newIndex && newIndex !== -1) {
          updateColumns((prev) =>
            prev.map((col) => {
              if (col.id === activeColumn.id) {
                const reordered = arrayMove(col.cases, oldIndex, newIndex);
                const newOrder = calculateNewOrder(reordered, newIndex);

                reordered[newIndex] = {
                  ...reordered[newIndex],
                  order: newOrder,
                };

                return { ...col, cases: reordered };
              }
              return col;
            })
          );
        }
      }

      const updatedColumn = columnsRef.current.find((c) => c.id === overColumn.id);
      if (!updatedColumn) return;

      const cases = updatedColumn.cases;
      const currentIndex = cases.findIndex((c) => c.id === activeId);
      if (currentIndex === -1) return;

      const previousId = currentIndex > 0 ? cases[currentIndex - 1].id : null;
      const nextId = currentIndex < cases.length - 1 ? cases[currentIndex + 1].id : null;

      kanbanService.moveCase({
        caseId: activeId,
        columnId: updatedColumn.id,
        previousId,
        nextId,
      });
    },
    [updateColumns]
  );

  const filteredColumns = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    const hasLawyerFilter = selectedLawyerIds.length > 0 || showUnassigned;

    return columns.map((col) => ({
      ...col,
      cases: col.cases.filter((c) => {
        const matchesSearch =
          !search ||
          c.number.toLowerCase().includes(search) ||
          c.title.toLowerCase().includes(search) ||
          c.client.toLowerCase().includes(search) ||
          (c.lawyer && c.lawyer.name.toLowerCase().includes(search));

        if (!hasLawyerFilter) {
          return matchesSearch;
        }

        const matchesSelectedLawyer = c.lawyer && selectedLawyerIds.includes(c.lawyer.id);
        const matchesUnassigned = showUnassigned && !c.lawyer;

        return matchesSearch && (matchesSelectedLawyer || matchesUnassigned);
      }),
    }));
  }, [columns, searchTerm, selectedLawyerIds, showUnassigned]);

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

  const moveCaseToColumn = useCallback(
    (caseId: string, newColumnId: string) => {
      const sourceColumn = columns.find((col) => col.cases.some((c) => c.id === caseId));
      if (!sourceColumn || sourceColumn.id === newColumnId) return;

      const legalCase = sourceColumn.cases.find((c) => c.id === caseId);
      if (!legalCase) return;

      updateColumns((prev) =>
        prev.map((col) => {
          if (col.id === sourceColumn.id) {
            return { ...col, cases: col.cases.filter((c) => c.id !== caseId) };
          }
          if (col.id === newColumnId) {
            const newOrder = col.cases.length > 0 ? Math.max(...col.cases.map((c) => c.order)) + 1 : 1;
            return {
              ...col,
              cases: [...col.cases, { ...legalCase, columnId: newColumnId, order: newOrder }],
            };
          }
          return col;
        })
      );

      const targetColumn = columns.find((c) => c.id === newColumnId);
      const lastCase = targetColumn?.cases[targetColumn.cases.length - 1];
      kanbanService.moveCase({
        caseId,
        columnId: newColumnId,
        previousId: lastCase?.id || null,
        nextId: null,
      });
    },
    [columns, updateColumns]
  );

  const updateCaseData = useCallback(
    async (caseId: string, data: Partial<LegalCase>): Promise<boolean> => {
      const previousColumns = columnsRef.current;
      const previousSelectedCase = selectedCaseRef.current;

      updateColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cases: col.cases.map((c) => (c.id === caseId ? { ...c, ...data } : c)),
        }))
      );

      if (selectedCaseRef.current?.id === caseId) {
        const updatedCase = { ...selectedCaseRef.current, ...data };
        setSelectedCase(updatedCase);
        selectedCaseRef.current = updatedCase;
      }

      try {
        const result = await kanbanService.updateCase(caseId, data);

        if (!result) {
          updateColumns(previousColumns);
          setSelectedCase(previousSelectedCase);
          selectedCaseRef.current = previousSelectedCase;
          return false;
        }

        return true;
      } catch {
        updateColumns(previousColumns);
        setSelectedCase(previousSelectedCase);
        selectedCaseRef.current = previousSelectedCase;
        return false;
      }
    },
    [updateColumns]
  );

  const selectCase = useCallback((legalCase: LegalCase | null) => {
    setSelectedCase(legalCase);
    selectedCaseRef.current = legalCase;
  }, []);

  const closeCase = useCallback(() => {
    setSelectedCase(null);
    selectedCaseRef.current = null;
  }, []);

  return {
    columns,
    filteredColumns,
    isLoading,
    activeCase,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    moveCaseToColumn,
    updateCaseData,
    // Selected case
    selectedCase,
    selectCase,
    closeCase,
    // Filters
    searchTerm,
    setSearchTerm,
    lawyers,
    selectedLawyerIds,
    toggleLawyer,
    showUnassigned,
    toggleUnassigned,
    clearFilters,
  };
}
