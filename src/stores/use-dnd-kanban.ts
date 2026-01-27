'use client';

import { useEffect, useCallback, useRef } from 'react';
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
import { useColumns, useKanbanActions } from './selectors';
import { KanbanColumn, LegalCase } from '@/types';

/**
 * Hook for drag-and-drop functionality only.
 * State and actions are managed by Zustand store.
 */
export function useDndKanban() {
  const columns = useColumns();
  const kanbanActions = useKanbanActions();

  // Ref to access current columns in callbacks without stale closures
  const columnsRef = useRef<KanbanColumn[]>([]);

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  // DnD sensors - must be React hooks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = useCallback((caseId: string): KanbanColumn | undefined => {
    return columnsRef.current.find((col) => col.cases.some((c) => c.id === caseId));
  }, []);

  const findCase = useCallback((caseId: string): LegalCase | undefined => {
    for (const col of columnsRef.current) {
      const legalCase = col.cases.find((c) => c.id === caseId);
      if (legalCase) return legalCase;
    }
    return undefined;
  }, []);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const legalCase = findCase(event.active.id as string);
      kanbanActions.setActiveCase(legalCase || null);
    },
    [findCase, kanbanActions]
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

      kanbanActions.moveCase(activeId, activeColumn.id, overColumn.id, insertIndex);
    },
    [findColumn, kanbanActions]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      kanbanActions.setActiveCase(null);

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

      // Reorder within same column
      if (activeColumn.id === overColumn.id) {
        const oldIndex = activeColumn.cases.findIndex((c) => c.id === activeId);
        const newIndex = activeColumn.cases.findIndex((c) => c.id === overId);

        if (oldIndex !== newIndex && newIndex !== -1) {
          kanbanActions.reorderCase(activeColumn.id, oldIndex, newIndex);
        }
      }

      // Persist to backend
      const updatedColumn = columnsRef.current.find((c) => c.id === overColumn!.id);
      if (!updatedColumn) return;

      const cases = updatedColumn.cases;
      const currentIndex = cases.findIndex((c) => c.id === activeId);
      if (currentIndex === -1) return;

      const previousId = currentIndex > 0 ? cases[currentIndex - 1].id : null;
      const nextId = currentIndex < cases.length - 1 ? cases[currentIndex + 1].id : null;

      kanbanActions.persistMoveCase(activeId, updatedColumn.id, previousId, nextId);
    },
    [kanbanActions]
  );

  return {
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
