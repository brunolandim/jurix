import { StateCreator } from 'zustand';
import { KanbanColumn, LegalCase, CaseNotification, NotificationType, DocumentRequest, DocumentStatus } from '@/types';
import { kanbanService, CreateCaseParams, shareableLinkService } from '@/services';

export interface KanbanSlice {
  kanban: {
    columns: KanbanColumn[];
    isLoading: boolean;
    activeCase: LegalCase | null;
    selectedCase: LegalCase | null;
  };
  kanbanActions: {
    // Initialization
    fetchColumns: () => Promise<void>;

    // Drag and drop
    setActiveCase: (legalCase: LegalCase | null) => void;
    moveCase: (
      caseId: string,
      fromColumnId: string,
      toColumnId: string,
      overIndex: number
    ) => void;
    reorderCase: (columnId: string, oldIndex: number, newIndex: number) => void;
    persistMoveCase: (
      caseId: string,
      columnId: string,
      previousId: string | null,
      nextId: string | null
    ) => Promise<void>;

    // Case selection
    selectCase: (legalCase: LegalCase | null) => void;
    closeCase: () => void;

    // Case CRUD
    createCase: (params: Omit<CreateCaseParams, 'columnId'>) => Promise<LegalCase | null>;
    updateCaseData: (caseId: string, data: Partial<LegalCase>) => Promise<boolean>;
    moveCaseToColumn: (caseId: string, newColumnId: string) => void;

    // Column CRUD
    createColumn: (title: string) => Promise<boolean>;
    updateColumnTitle: (columnId: string, newTitle: string) => Promise<boolean>;
    deleteColumn: (
      columnId: string
    ) => Promise<{ success: boolean; error?: 'default' | 'has_cases' }>;

    // Notifications
    addNotification: (
      caseId: string,
      data: { type: NotificationType; message?: string; date: string }
    ) => Promise<CaseNotification | null>;
    deleteNotification: (caseId: string, notificationId: string) => Promise<boolean>;

    // Documents
    addDocument: (
      caseId: string,
      data: { name: string; description?: string; status: DocumentStatus }
    ) => Promise<DocumentRequest | null>;
    deleteDocument: (caseId: string, documentId: string) => Promise<boolean>;
    updateDocumentStatus: (caseId: string, documentId: string, status: DocumentStatus) => Promise<boolean>;

    // Shareable Links
    generateShareLink: (caseId: string, documentIds: string[]) => Promise<{ url: string } | null>;
  };
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

export const createKanbanSlice: StateCreator<KanbanSlice, [], [], KanbanSlice> = (set, get) => ({
  kanban: {
    columns: [],
    isLoading: true,
    activeCase: null,
    selectedCase: null,
  },
  kanbanActions: {
    fetchColumns: async () => {
      const columns = await kanbanService.getColumns();
      set({ kanban: { ...get().kanban, columns, isLoading: false } });
    },

    setActiveCase: (legalCase) => {
      set({ kanban: { ...get().kanban, activeCase: legalCase } });
    },

    moveCase: (caseId, fromColumnId, toColumnId, overIndex) => {
      set((state) => {
        const fromColumn = state.kanban.columns.find((c) => c.id === fromColumnId);
        const toColumn = state.kanban.columns.find((c) => c.id === toColumnId);

        if (!fromColumn || !toColumn) return state;

        const legalCase = fromColumn.cases.find((c) => c.id === caseId);
        if (!legalCase) return state;

        const newColumns = state.kanban.columns.map((col) => {
          if (col.id === fromColumnId) {
            return {
              ...col,
              cases: col.cases.filter((c) => c.id !== caseId),
            };
          }
          if (col.id === toColumnId) {
            const newCases = [...col.cases];
            const insertIndex = overIndex >= 0 ? overIndex : newCases.length;
            const newOrder = calculateNewOrder(newCases, insertIndex);
            const updatedCase = { ...legalCase, columnId: toColumnId, order: newOrder };
            newCases.splice(insertIndex, 0, updatedCase);
            return { ...col, cases: newCases };
          }
          return col;
        });

        return { kanban: { ...state.kanban, columns: newColumns } };
      });
    },

    reorderCase: (columnId, oldIndex, newIndex) => {
      set((state) => {
        const newColumns = state.kanban.columns.map((col) => {
          if (col.id !== columnId) return col;

          const cases = [...col.cases];
          const [removed] = cases.splice(oldIndex, 1);
          cases.splice(newIndex, 0, removed);

          const newOrder = calculateNewOrder(cases, newIndex);
          cases[newIndex] = { ...cases[newIndex], order: newOrder };

          return { ...col, cases };
        });

        return { kanban: { ...state.kanban, columns: newColumns } };
      });
    },

    persistMoveCase: async (caseId, columnId, previousId, nextId) => {
      await kanbanService.moveCase({ caseId, columnId, previousId, nextId });
    },

    selectCase: (legalCase) => {
      set({ kanban: { ...get().kanban, selectedCase: legalCase } });
    },

    closeCase: () => {
      set({ kanban: { ...get().kanban, selectedCase: null } });
    },

    createCase: async (params) => {
      const columns = get().kanban.columns;
      const firstColumn = columns[0];
      if (!firstColumn) return null;

      try {
        const newCase = await kanbanService.createCase({
          ...params,
          columnId: firstColumn.id,
        });

        if (newCase) {
          set((state) => ({
            kanban: {
              ...state.kanban,
              columns: state.kanban.columns.map((col) =>
                col.id === firstColumn.id ? { ...col, cases: [...col.cases, newCase] } : col
              ),
            },
          }));
          return newCase;
        }
        return null;
      } catch {
        return null;
      }
    },

    updateCaseData: async (caseId, data) => {
      const previousColumns = get().kanban.columns;
      const previousSelectedCase = get().kanban.selectedCase;

      // Optimistic update
      set((state) => {
        const newColumns = state.kanban.columns.map((col) => ({
          ...col,
          cases: col.cases.map((c) => (c.id === caseId ? { ...c, ...data } : c)),
        }));

        const newSelectedCase =
          state.kanban.selectedCase?.id === caseId
            ? { ...state.kanban.selectedCase, ...data }
            : state.kanban.selectedCase;

        return {
          kanban: {
            ...state.kanban,
            columns: newColumns,
            selectedCase: newSelectedCase,
          },
        };
      });

      try {
        const result = await kanbanService.updateCase(caseId, data);
        if (!result) {
          // Rollback
          set((state) => ({
            kanban: {
              ...state.kanban,
              columns: previousColumns,
              selectedCase: previousSelectedCase,
            },
          }));
          return false;
        }
        return true;
      } catch {
        // Rollback
        set((state) => ({
          kanban: {
            ...state.kanban,
            columns: previousColumns,
            selectedCase: previousSelectedCase,
          },
        }));
        return false;
      }
    },

    moveCaseToColumn: (caseId, newColumnId) => {
      const columns = get().kanban.columns;
      const sourceColumn = columns.find((col) => col.cases.some((c) => c.id === caseId));
      if (!sourceColumn || sourceColumn.id === newColumnId) return;

      const legalCase = sourceColumn.cases.find((c) => c.id === caseId);
      if (!legalCase) return;

      set((state) => {
        const targetColumn = state.kanban.columns.find((c) => c.id === newColumnId);
        const newOrder =
          targetColumn && targetColumn.cases.length > 0
            ? Math.max(...targetColumn.cases.map((c) => c.order)) + 1
            : 1;

        const newColumns = state.kanban.columns.map((col) => {
          if (col.id === sourceColumn.id) {
            return { ...col, cases: col.cases.filter((c) => c.id !== caseId) };
          }
          if (col.id === newColumnId) {
            return {
              ...col,
              cases: [...col.cases, { ...legalCase, columnId: newColumnId, order: newOrder }],
            };
          }
          return col;
        });

        // Update selectedCase if it's the one being moved
        const newSelectedCase =
          state.kanban.selectedCase?.id === caseId
            ? { ...state.kanban.selectedCase, columnId: newColumnId }
            : state.kanban.selectedCase;

        return {
          kanban: {
            ...state.kanban,
            columns: newColumns,
            selectedCase: newSelectedCase,
          },
        };
      });

      // Persist
      const targetColumn = columns.find((c) => c.id === newColumnId);
      const lastCase = targetColumn?.cases[targetColumn.cases.length - 1];
      kanbanService.moveCase({
        caseId,
        columnId: newColumnId,
        previousId: lastCase?.id || null,
        nextId: null,
      });
    },

    createColumn: async (title) => {
      try {
        const newColumn = await kanbanService.createColumn(title);
        if (newColumn) {
          set((state) => ({
            kanban: {
              ...state.kanban,
              columns: [...state.kanban.columns, newColumn],
            },
          }));
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },

    updateColumnTitle: async (columnId, newTitle) => {
      const previousColumns = get().kanban.columns;

      // Optimistic update
      set((state) => ({
        kanban: {
          ...state.kanban,
          columns: state.kanban.columns.map((col) =>
            col.id === columnId ? { ...col, title: newTitle } : col
          ),
        },
      }));

      try {
        const result = await kanbanService.updateColumn(columnId, newTitle);
        if (!result) {
          set((state) => ({
            kanban: { ...state.kanban, columns: previousColumns },
          }));
          return false;
        }
        return true;
      } catch {
        set((state) => ({
          kanban: { ...state.kanban, columns: previousColumns },
        }));
        return false;
      }
    },

    deleteColumn: async (columnId) => {
      const column = get().kanban.columns.find((c) => c.id === columnId);

      if (!column) return { success: false };
      if (column.isDefault) return { success: false, error: 'default' };
      if (column.cases.length > 0) return { success: false, error: 'has_cases' };

      const previousColumns = get().kanban.columns;

      // Optimistic update
      set((state) => ({
        kanban: {
          ...state.kanban,
          columns: state.kanban.columns.filter((c) => c.id !== columnId),
        },
      }));

      try {
        const success = await kanbanService.deleteColumn(columnId);
        if (!success) {
          set((state) => ({
            kanban: { ...state.kanban, columns: previousColumns },
          }));
          return { success: false };
        }
        return { success: true };
      } catch {
        set((state) => ({
          kanban: { ...state.kanban, columns: previousColumns },
        }));
        return { success: false };
      }
    },

    addNotification: async (caseId, data) => {
      try {
        const newNotification = await kanbanService.addNotification({ caseId, ...data });

        if (newNotification) {
          set((state) => {
            const updatedColumns = state.kanban.columns.map((col) => ({
              ...col,
              cases: col.cases.map((c) =>
                c.id === caseId
                  ? { ...c, notifications: [...(c.notifications || []), newNotification] }
                  : c
              ),
            }));

            const updatedSelectedCase =
              state.kanban.selectedCase?.id === caseId
                ? {
                    ...state.kanban.selectedCase,
                    notifications: [
                      ...(state.kanban.selectedCase.notifications || []),
                      newNotification,
                    ],
                  }
                : state.kanban.selectedCase;

            return {
              kanban: {
                ...state.kanban,
                columns: updatedColumns,
                selectedCase: updatedSelectedCase,
              },
            };
          });

          return newNotification;
        }
        return null;
      } catch {
        return null;
      }
    },

    deleteNotification: async (caseId, notificationId) => {
      try {
        const success = await kanbanService.deleteNotification(caseId, notificationId);

        if (success) {
          set((state) => {
            const updatedColumns = state.kanban.columns.map((col) => ({
              ...col,
              cases: col.cases.map((c) =>
                c.id === caseId
                  ? {
                      ...c,
                      notifications: (c.notifications || []).filter(
                        (n) => n.id !== notificationId
                      ),
                    }
                  : c
              ),
            }));

            const updatedSelectedCase =
              state.kanban.selectedCase?.id === caseId
                ? {
                    ...state.kanban.selectedCase,
                    notifications: (state.kanban.selectedCase.notifications || []).filter(
                      (n) => n.id !== notificationId
                    ),
                  }
                : state.kanban.selectedCase;

            return {
              kanban: {
                ...state.kanban,
                columns: updatedColumns,
                selectedCase: updatedSelectedCase,
              },
            };
          });
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },

    addDocument: async (caseId, data) => {
      try {
        const newDocument = await kanbanService.addDocument({ caseId, ...data });

        if (newDocument) {
          set((state) => {
            const updatedColumns = state.kanban.columns.map((col) => ({
              ...col,
              cases: col.cases.map((c) =>
                c.id === caseId
                  ? { ...c, documentRequests: [...(c.documentRequests || []), newDocument] }
                  : c
              ),
            }));

            const updatedSelectedCase =
              state.kanban.selectedCase?.id === caseId
                ? {
                    ...state.kanban.selectedCase,
                    documentRequests: [
                      ...(state.kanban.selectedCase.documentRequests || []),
                      newDocument,
                    ],
                  }
                : state.kanban.selectedCase;

            return {
              kanban: {
                ...state.kanban,
                columns: updatedColumns,
                selectedCase: updatedSelectedCase,
              },
            };
          });

          return newDocument;
        }
        return null;
      } catch {
        return null;
      }
    },

    deleteDocument: async (caseId, documentId) => {
      try {
        const success = await kanbanService.deleteDocument(caseId, documentId);

        if (success) {
          set((state) => {
            const updatedColumns = state.kanban.columns.map((col) => ({
              ...col,
              cases: col.cases.map((c) =>
                c.id === caseId
                  ? {
                      ...c,
                      documentRequests: (c.documentRequests || []).filter(
                        (d) => d.id !== documentId
                      ),
                    }
                  : c
              ),
            }));

            const updatedSelectedCase =
              state.kanban.selectedCase?.id === caseId
                ? {
                    ...state.kanban.selectedCase,
                    documentRequests: (state.kanban.selectedCase.documentRequests || []).filter(
                      (d) => d.id !== documentId
                    ),
                  }
                : state.kanban.selectedCase;

            return {
              kanban: {
                ...state.kanban,
                columns: updatedColumns,
                selectedCase: updatedSelectedCase,
              },
            };
          });
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },

    updateDocumentStatus: async (caseId, documentId, status) => {
      try {
        const result = await kanbanService.updateDocumentStatus(caseId, documentId, status);

        if (result) {
          set((state) => {
            const updatedColumns = state.kanban.columns.map((col) => ({
              ...col,
              cases: col.cases.map((c) =>
                c.id === caseId
                  ? {
                      ...c,
                      documentRequests: (c.documentRequests || []).map((d) =>
                        d.id === documentId
                          ? { ...d, status, receivedAt: status === 'received' ? new Date().toISOString() : undefined }
                          : d
                      ),
                    }
                  : c
              ),
            }));

            const updatedSelectedCase =
              state.kanban.selectedCase?.id === caseId
                ? {
                    ...state.kanban.selectedCase,
                    documentRequests: (state.kanban.selectedCase.documentRequests || []).map((d) =>
                      d.id === documentId
                        ? { ...d, status, receivedAt: status === 'received' ? new Date().toISOString() : undefined }
                        : d
                    ),
                  }
                : state.kanban.selectedCase;

            return {
              kanban: {
                ...state.kanban,
                columns: updatedColumns,
                selectedCase: updatedSelectedCase,
              },
            };
          });
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },

    generateShareLink: async (caseId, documentIds) => {
      try {
        // Find the case in the columns
        const columns = get().kanban.columns;
        let legalCase: LegalCase | null = null;

        for (const col of columns) {
          const found = col.cases.find((c) => c.id === caseId);
          if (found) {
            legalCase = found;
            break;
          }
        }

        if (!legalCase) return null;

        // Create the shareable link
        const link = await shareableLinkService.createLink({
          legalCase,
          documentIds,
          createdBy: legalCase.createdBy,
        });

        const url = shareableLinkService.getShareableUrl(link.token);
        return { url };
      } catch {
        return null;
      }
    },
  },
});
