'use client';

import { useCallback, useRef, RefObject } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn, LegalCase } from '@/types';

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

type UseDndKanbanParams = {
  columnsRef: RefObject<KanbanColumn[]>;
  setActiveCase: (legalCase: LegalCase | null) => void;
  moveCase: (caseId: string, fromColumnId: string, toColumnId: string, overIndex: number) => void;
  reorderCase: (columnId: string, oldIndex: number, newIndex: number) => void;
  persistMoveCase: (caseId: string, columnId: string, order: number) => Promise<void>;
};

export function useDndKanban({
  columnsRef,
  setActiveCase,
  moveCase,
  reorderCase,
  persistMoveCase,
}: UseDndKanbanParams) {
  const originColumnIdRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = useCallback(
    (caseId: string): KanbanColumn | undefined => {
      return columnsRef.current.find((col) => col.cases.some((c) => c.id === caseId));
    },
    [columnsRef]
  );

  const findCase = useCallback(
    (caseId: string): LegalCase | undefined => {
      for (const col of columnsRef.current) {
        const legalCase = col.cases.find((c) => c.id === caseId);
        if (legalCase) return legalCase;
      }
      return undefined;
    },
    [columnsRef]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const activeId = event.active.id as string;
      const legalCase = findCase(activeId);
      setActiveCase(legalCase || null);
      originColumnIdRef.current = findColumn(activeId)?.id ?? null;
    },
    [findCase, findColumn, setActiveCase]
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
        overColumn = columnsRef.current.find((col) => col.id === overId);
      }

      if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
        return;
      }

      const overIndex = overColumn.cases.findIndex((c) => c.id === overId);
      const insertIndex = overIndex >= 0 ? overIndex : overColumn.cases.length;

      moveCase(activeId, activeColumn.id, overColumn.id, insertIndex);
    },
    [findColumn, moveCase, columnsRef]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveCase(null);

      const originColumnId = originColumnIdRef.current;
      originColumnIdRef.current = null;

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;
      const currentColumns = columnsRef.current;

      const findColumnCurrent = (caseId: string) =>
        currentColumns.find((col) => col.cases?.some((c) => c.id === caseId));

      const activeColumn = findColumnCurrent(activeId);
      let overColumn = findColumnCurrent(overId);

      if (!overColumn) {
        overColumn = currentColumns.find((col) => col.id === overId);
      }

      if (!activeColumn || !overColumn) return;

      let newOrder: number;

      if (activeColumn.id === overColumn.id) {
        // Reordering within same column
        const cases = activeColumn.cases || [];
        const oldIndex = cases.findIndex((c) => c.id === activeId);
        const newIndex = cases.findIndex((c) => c.id === overId);

        if (oldIndex !== newIndex && newIndex !== -1) {
          // Calculate order based on target position
          const targetIndex = newIndex;
          newOrder = calculateNewOrder(cases, targetIndex);
          reorderCase(activeColumn.id, oldIndex, newIndex);
        } else if (activeColumn.id !== originColumnId) {
          // Card was moved cross-column by handleDragOver but over.id is the card itself
          // (happens when dropping at first position)
          newOrder = cases.length <= 1 ? 1 : calculateNewOrder(cases, oldIndex);
        } else {
          return; // No change
        }
      } else {
        // Moving to different column
        const targetCases = overColumn.cases || [];
        newOrder = targetCases.length > 0 ? Math.max(...targetCases.map(c => c.order || 1)) + 1 : 1;
      }

      persistMoveCase(activeId, overColumn.id, newOrder);
    },
    [columnsRef, setActiveCase, reorderCase, persistMoveCase]
  );

  return {
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
