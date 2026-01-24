'use client';

import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { useKanban } from '@/hooks';
import { KanbanColumn } from './kanban-column';
import { KanbanCardContent } from './kanban-card';
import { KanbanSkeleton } from './kanban-skeleton';
import { KanbanFilters } from './kanban-filters';
import { CaseDetailModal } from './case-detail-modal';

export function KanbanBoard() {
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
    updateCaseData,
    selectedCase,
    selectCase,
    closeCase,
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
          <KanbanColumn key={column.id} column={column} onCardClick={selectCase} />
        ))}
      </div>

      <DragOverlay>
        {activeCase ? (
          <div className="rotate-3 cursor-grabbing">
            <KanbanCardContent legalCase={activeCase} />
          </div>
        ) : null}
      </DragOverlay>

      {selectedCase && (
        <CaseDetailModal
          legalCase={selectedCase}
          isOpen={!!selectedCase}
          onClose={closeCase}
          columns={columns}
          lawyers={lawyers}
          onColumnChange={(caseId, newColumnId) => {
            moveCaseToColumn(caseId, newColumnId);
            updateCaseData(caseId, { columnId: newColumnId });
          }}
          onDescriptionChange={(caseId, newDescription) => updateCaseData(caseId, { description: newDescription })}
          onLawyerChange={(caseId, newLawyer) => updateCaseData(caseId, { lawyer: newLawyer })}
        />
      )}
    </DndContext>
  );
}
