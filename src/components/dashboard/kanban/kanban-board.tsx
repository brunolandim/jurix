'use client';

import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useKanban, useAuth } from '@/hooks';
import { Button } from '@/components/ui';
import { KanbanColumn } from './kanban-column';
import { KanbanCardContent } from './kanban-card';
import { KanbanSkeleton } from './kanban-skeleton';
import { KanbanFilters } from './kanban-filters';
import { CaseDetailModal, CreateCaseModal } from './modal';
import { AddColumn } from './add-column';

export function KanbanBoard() {
  const t = useTranslations('kanban');
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    updateColumnTitle,
    createColumn,
    deleteColumn,
    createCase,
    addNotification,
    deleteNotification,
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
      <div className="mb-4 flex items-center justify-between gap-4">
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
        <Button
          color="primary"
          startContent={<Plus size={18} />}
          onPress={() => setIsCreateModalOpen(true)}
        >
          {t('createCase.button')}
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-15rem)]">
        {filteredColumns.map((column) => {
          const originalColumn = columns.find((c) => c.id === column.id);
          const totalCount = originalColumn?.cases.length ?? 0;

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              totalCount={totalCount}
              onCardClick={selectCase}
              onColumnTitleUpdate={updateColumnTitle}
              onColumnDelete={deleteColumn}
            />
          );
        })}
        <AddColumn onCreateColumn={createColumn} />
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
          onAddNotification={addNotification}
          onDeleteNotification={deleteNotification}
        />
      )}

      {user && (
        <CreateCaseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          lawyers={lawyers}
          currentUser={{
            id: user.id,
            name: user.name,
            photo: user.photo,
          }}
          onCreateCase={createCase}
        />
      )}
    </DndContext>
  );
}
