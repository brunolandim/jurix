'use client';

import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts';
import { useKanban, useDndKanban } from '@/hooks';
import { Button } from '@/components/ui';
import { KanbanColumn } from './kanban-column';
import { KanbanCardContent } from './kanban-card';
import { KanbanSkeleton } from './kanban-skeleton';
import { KanbanFilters } from './kanban-filters';
import { CaseDetailModal, CreateCaseModal } from './modal';

export function KanbanBoard() {
  const t = useTranslations('kanban');
  const { user, isAuthenticated } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    columns,
    filteredColumns,
    lawyers,
    isLoading,
    activeCase,
    selectedCase,
    searchTerm,
    selectedLawyerIds,
    showUnassigned,
    setSearchTerm,
    toggleLawyer,
    toggleUnassigned,
    clearFilters,
    selectCase,
    closeCase,
    createCase,
    updateCaseData,
    updateAssignLawyer,
    moveCaseToColumn,
    createColumn,
    updateColumnTitle,
    deleteColumn,
    addNotification,
    deleteNotification,
    addDocument,
    deleteDocument,
    updateDocumentStatus,
    approveDocument,
    rejectDocument,
    generateShareLink,
    setActiveCase,
    moveCase,
    reorderCase,
    persistMoveCase,
    columnsRef,
  } = useKanban(isAuthenticated);

  const { sensors, handleDragStart, handleDragOver, handleDragEnd } = useDndKanban({
    columnsRef,
    setActiveCase,
    moveCase,
    reorderCase,
    persistMoveCase,
  });

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
      <div className="flex flex-col h-full min-h-0">
        <div className="mb-4 flex items-center justify-between gap-4 shrink-0">
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
          <Button color="primary" startContent={<Plus size={18} />} onPress={() => setIsCreateModalOpen(true)}>
            {t('createCase.button')}
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto  flex-1 min-h-0">
          {filteredColumns.map((column) => {
            const originalColumn = columns.find((c) => c.id === column.id);
            const totalCount = originalColumn?.cases?.length ?? 0;

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
          user={user}
          onColumnChange={(caseId, newColumnId) => {
            moveCaseToColumn(caseId, newColumnId);
            updateCaseData(caseId, { columnId: newColumnId });
          }}
          onTitleChange={(caseId, newTitle) => updateCaseData(caseId, { title: newTitle })}
          onDescriptionChange={(caseId, newDescription) => updateCaseData(caseId, { description: newDescription })}
          onLawyerChange={(caseId, newLawyer) => updateAssignLawyer(caseId, newLawyer)}
          onAddNotification={addNotification}
          onDeleteNotification={deleteNotification}
          onAddDocument={addDocument}
          onDeleteDocument={deleteDocument}
          onDocumentStatusChange={updateDocumentStatus}
          onApproveDocument={approveDocument}
          onRejectDocument={rejectDocument}
          onGenerateShareLink={generateShareLink}
          onClientPhoneChange={async (caseId, phone) => {
            const result = await updateCaseData(caseId, { clientPhone: phone });
            return !!result;
          }}
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
            photo: user.photo || '',
          }}
          onCreateCase={createCase}
        />
      )}
    </DndContext>
  );
}

// Import AddColumn locally to avoid circular dependency
import { AddColumn } from './add-column';
