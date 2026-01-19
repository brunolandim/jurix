"use client";

import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import { useKanban } from "@/hooks";
import { KanbanColumn } from "./kanban-column";
import { KanbanCardContent } from "./kanban-card";
import { KanbanSkeleton } from "./kanban-skeleton";

export function KanbanBoard() {
  const {
    columns,
    isLoading,
    activeCase,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useKanban();

  if (isLoading) {
    return <KanbanSkeleton />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-12rem)]">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
      </div>

      <DragOverlay>
        {activeCase ? (
          <div className="rotate-3 cursor-grabbing">
            <KanbanCardContent legalCase={activeCase} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
