'use client';

import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { useKanban } from '@/hooks';
import { LegalCase } from '@/types';
import { KanbanColumn } from './kanban-column';
import { KanbanCardContent } from './kanban-card';
import { KanbanSkeleton } from './kanban-skeleton';
import { KanbanFilters } from './kanban-filters';
import { CaseDetailModal } from './case-detail-modal';

export function KanbanBoard() {
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);

  const {
    columns,
    filteredColumns,
    isLoading,
    activeCase,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    moveCaseToColumn,
    searchTerm,
    setSearchTerm,
    lawyers,
    selectedLawyerIds,
    toggleLawyer,
    showUnassigned,
    toggleUnassigned,
    clearFilters,
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
      <div className="mb-4">
        <KanbanFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          lawyers={lawyers}
          selectedLawyerIds={selectedLawyerIds}
          onToggleLawyer={toggleLawyer}
          onClearFilters={clearFilters}
          showUnassigned={showUnassigned}
          onToggleUnassigned={toggleUnassigned}
        />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-15rem)]">
        {filteredColumns.map((column) => (
          <KanbanColumn key={column.id} column={column} onCardClick={setSelectedCase} />
        ))}
      </div>

      <DragOverlay>
        {activeCase ? (
          <div className="rotate-3 cursor-grabbing">
            <KanbanCardContent legalCase={activeCase} />
          </div>
        ) : null}
      </DragOverlay>

      <CaseDetailModal
        legalCase={selectedCase}
        isOpen={!!selectedCase}
        onClose={() => setSelectedCase(null)}
        columns={columns}
        onColumnChange={(caseId, newColumnId) => {
          moveCaseToColumn(caseId, newColumnId);
          if (selectedCase) {
            setSelectedCase({ ...selectedCase, columnId: newColumnId });
          }
        }}
      />
    </DndContext>
  );
}
