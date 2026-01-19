"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanColumn as KanbanColumnType } from "@/types";
import { KanbanCard } from "./kanban-card";

type KanbanColumnProps = {
  column: KanbanColumnType;
};

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const caseIds = column.cases.map((c) => c.id);

  return (
    <div className="shrink-0 w-72 bg-default-100 rounded-lg flex flex-col max-h-full">
      <div className="p-3 border-b border-default-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{column.title}</h3>
          <span className="text-xs bg-default-200 px-2 py-1 rounded-full">
            {column.cases.length}
          </span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 p-2 space-y-2 overflow-y-auto min-h-48 transition-colors ${
          isOver ? "bg-default-200/50" : ""
        }`}
      >
        <SortableContext items={caseIds} strategy={verticalListSortingStrategy}>
          {column.cases.map((legalCase) => (
            <KanbanCard key={legalCase.id} legalCase={legalCase} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
