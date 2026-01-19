"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn, LegalCase } from "@/types";
import { kanbanService } from "@/services";

// Calculate fractional order based on neighbors
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

  // Ref for most recent state (avoids stale closure)
  const columnsRef = useRef<KanbanColumn[]>([]);

  // Sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper to update state AND ref synchronously
  const updateColumns = useCallback(
    (updater: KanbanColumn[] | ((prev: KanbanColumn[]) => KanbanColumn[])) => {
      setColumns((prev) => {
        const newValue = typeof updater === "function" ? updater(prev) : updater;
        columnsRef.current = newValue;
        return newValue;
      });
    },
    []
  );

  // Load columns from backend
  useEffect(() => {
    kanbanService.getColumns().then((data) => {
      updateColumns(data);
      setIsLoading(false);
    });
  }, [updateColumns]);

  // Find column containing a case
  const findColumn = useCallback(
    (caseId: string): KanbanColumn | undefined => {
      return columns.find((col) => col.cases.some((c) => c.id === caseId));
    },
    [columns]
  );

  // Find case by ID
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

  // Handler: drag start
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const legalCase = findCase(event.active.id as string);
      setActiveCase(legalCase || null);
    },
    [findCase]
  );

  // Handler: drag over another element
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

  // Handler: drop element
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

      // Reorder within same column
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

      // Send to backend
      const updatedColumn = columnsRef.current.find((c) => c.id === overColumn.id);
      if (!updatedColumn) return;

      const cases = updatedColumn.cases;
      const currentIndex = cases.findIndex((c) => c.id === activeId);
      if (currentIndex === -1) return;

      const previousId = currentIndex > 0 ? cases[currentIndex - 1].id : null;
      const nextId =
        currentIndex < cases.length - 1 ? cases[currentIndex + 1].id : null;

      kanbanService.moveCase({
        caseId: activeId,
        columnId: updatedColumn.id,
        previousId,
        nextId,
      });
    },
    [updateColumns]
  );

  return {
    columns,
    isLoading,
    activeCase,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
