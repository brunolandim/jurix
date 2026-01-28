import { api } from './api';
import { KanbanColumn, LegalCase, CaseNotification, NotificationType, DocumentRequest, DocumentStatus } from '@/types';

// ============ TYPES ============
export type MoveCaseParams = {
  caseId: string;
  columnId: string;
  previousId: string | null;
  nextId: string | null;
};

export type CreateCaseParams = {
  number: string;
  title: string;
  description?: string;
  client: string;
  priority: LegalCase['priority'];
  columnId: string;
  lawyer?: LegalCase['lawyer'];
  createdBy: LegalCase['createdBy'];
};

export type AddNotificationParams = {
  caseId: string;
  type: NotificationType;
  message?: string;
  date: string;
};

export type AddDocumentParams = {
  caseId: string;
  name: string;
  description?: string;
  status: DocumentStatus;
};

// ============ MOCK CONFIG ============
const USE_MOCK = true;
const MOCK_USER_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const MOCK_DELAY = 200;

// Datas para notificações mockadas (algumas no passado para aparecer como pendentes)
const pastDate1 = new Date(Date.now() - 1000 * 60 * 30).toISOString(); // 30 min atrás
const pastDate2 = new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(); // 2 horas atrás
const pastDate3 = new Date(Date.now() - 1000 * 60 * 5).toISOString(); // 5 min atrás
const pastDate4 = new Date(Date.now() - 1000 * 60 * 15).toISOString(); // 15 min atrás
const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(); // amanhã

const mockColumns: KanbanColumn[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    title: 'New',
    key: 'new',
    isDefault: true,
    order: 0,
    userId: MOCK_USER_ID,
    createdAt: '2026-01-01',
    cases: [
      {
        id: 'case-001',
        number: '0001234-12.2024.8.26.0100',
        title: 'Ação de Indenização - João Silva vs Empresa ABC',
        description: 'Processo de indenização por danos morais decorrentes de acidente de trabalho.',
        client: 'João Silva',
        priority: 'high' as const,
        columnId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        order: 1,
        lawyer: { id: 'law-001', name: 'Bruno Landim', photo: '/img/homemSpider.jpg' },
        createdBy: { id: MOCK_USER_ID, name: 'Admin', photo: '' },
        notifications: [
          {
            id: 'notif-001',
            type: 'hearing' as const,
            message: 'Audiência de conciliação na 5ª Vara Cível',
            date: pastDate1,
            caseId: 'case-001',
            lawyerId: 'law-001',
            isRead: false,
            isSent: false,
            createdAt: '2026-01-20T10:00:00Z',
          },
          {
            id: 'notif-002',
            type: 'deadline' as const,
            message: 'Prazo para apresentação de contestação',
            date: pastDate2,
            caseId: 'case-001',
            lawyerId: 'law-001',
            isRead: false,
            isSent: false,
            createdAt: '2026-01-19T10:00:00Z',
          },
        ],
        createdAt: '2026-01-15',
        updatedAt: '2026-01-20',
      },
      {
        id: 'case-002',
        number: '0005678-45.2024.8.26.0100',
        title: 'Divórcio Consensual - Maria Santos',
        description: 'Processo de divórcio consensual com partilha de bens.',
        client: 'Maria Santos',
        priority: 'medium' as const,
        columnId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        order: 2,
        lawyer: { id: 'law-001', name: 'Bruno Landim', photo: '/img/homemSpider.jpg' },
        createdBy: { id: MOCK_USER_ID, name: 'Admin', photo: '' },
        notifications: [
          {
            id: 'notif-003',
            type: 'meeting' as const,
            message: 'Reunião com cliente para assinatura dos documentos',
            date: pastDate3,
            caseId: 'case-002',
            lawyerId: 'law-001',
            isRead: false,
            isSent: false,
            createdAt: '2026-01-22T08:00:00Z',
          },
          {
            id: 'notif-004',
            type: 'task' as const,
            message: 'Preparar petição inicial',
            date: futureDate,
            caseId: 'case-002',
            lawyerId: 'law-001',
            isRead: false,
            isSent: false,
            createdAt: '2026-01-22T08:00:00Z',
          },
        ],
        createdAt: '2026-01-18',
        updatedAt: '2026-01-22',
      },
    ],
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    title: 'In Progress',
    isDefault: false,
    order: 1,
    userId: MOCK_USER_ID,
    createdAt: '2026-01-01',
    cases: [
      {
        id: 'case-003',
        number: '0009876-54.2024.8.26.0100',
        title: 'Recuperação de Crédito - Banco XYZ',
        description: 'Ação de cobrança para recuperação de crédito.',
        client: 'Banco XYZ',
        priority: 'urgent' as const,
        columnId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        order: 1,
        lawyer: { id: 'law-001', name: 'Bruno Landim', photo: '/img/homemSpider.jpg' },
        createdBy: { id: MOCK_USER_ID, name: 'Admin', photo: '' },
        notifications: [
          {
            id: 'notif-005',
            type: 'task' as const,
            message: 'Revisar petição inicial do caso',
            date: pastDate4,
            caseId: 'case-003',
            lawyerId: 'law-001',
            isRead: false,
            isSent: false,
            createdAt: '2026-01-25T14:00:00Z',
          },
        ],
        createdAt: '2026-01-10',
        updatedAt: '2026-01-25',
      },
    ],
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    title: 'Completed',
    isDefault: false,
    order: 2,
    userId: MOCK_USER_ID,
    createdAt: '2026-01-01',
    cases: [],
  },
];

// ============ HELPERS ============
const delay = (ms = MOCK_DELAY) => new Promise((r) => setTimeout(r, ms));
const uuid = () => crypto.randomUUID();
const today = () => new Date().toISOString().split('T')[0];
const now = () => new Date().toISOString();

const findColumn = (id: string) => mockColumns.find((c) => c.id === id);
const findColumnIndex = (id: string) => mockColumns.findIndex((c) => c.id === id);

const findCaseInColumns = (caseId: string) => {
  for (const col of mockColumns) {
    const caseItem = col.cases.find((c) => c.id === caseId);
    if (caseItem) return { column: col, case: caseItem };
  }
  return null;
};

const findCaseWithIndex = (caseId: string) => {
  for (const col of mockColumns) {
    const index = col.cases.findIndex((c) => c.id === caseId);
    if (index !== -1) return { column: col, index, case: col.cases[index] };
  }
  return null;
};

const calculateOrder = (cases: LegalCase[], previousId: string | null, nextId: string | null): number => {
  const prevOrder = previousId ? (cases.find((c) => c.id === previousId)?.order ?? null) : null;
  const nextOrder = nextId ? (cases.find((c) => c.id === nextId)?.order ?? null) : null;

  if (prevOrder === null && nextOrder === null) return 1.0;
  if (prevOrder === null) return nextOrder! / 2;
  if (nextOrder === null) return prevOrder + 1.0;
  return (prevOrder + nextOrder) / 2;
};

const sortByOrder = (columns: KanbanColumn[]) =>
  columns.map((col) => ({ ...col, cases: [...col.cases].sort((a, b) => a.order - b.order) }));

// ============ SERVICE ============
export const kanbanService = {
  async getColumns(): Promise<KanbanColumn[]> {
    if (USE_MOCK) {
      await delay(500);
      return sortByOrder(mockColumns);
    }
    const res = await api.get<KanbanColumn[]>('/kanban/columns');
    return res.success ? sortByOrder(res.data) : [];
  },

  async moveCase({ caseId, columnId, previousId, nextId }: MoveCaseParams): Promise<LegalCase | null> {
    if (USE_MOCK) {
      await delay();
      const found = findCaseInColumns(caseId);
      const target = findColumn(columnId);
      if (!found || !target) return null;
      return { ...found.case, columnId, order: calculateOrder(target.cases, previousId, nextId) };
    }
    const res = await api.put<LegalCase>(`/kanban/cases/${caseId}/move`, { columnId, previousId, nextId });
    return res.success ? res.data : null;
  },

  async createColumn(title: string): Promise<KanbanColumn | null> {
    if (USE_MOCK) {
      await delay();
      const col: KanbanColumn = {
        id: uuid(),
        title,
        order: mockColumns.length,
        userId: MOCK_USER_ID,
        createdAt: now(),
        cases: [],
      };
      mockColumns.push(col);
      return col;
    }
    const res = await api.post<KanbanColumn>('/kanban/columns', { title });
    return res.success ? res.data : null;
  },

  async updateColumn(id: string, title: string): Promise<KanbanColumn | null> {
    if (USE_MOCK) {
      await delay();
      const idx = findColumnIndex(id);
      if (idx === -1) return null;
      mockColumns[idx] = { ...mockColumns[idx], title };
      return mockColumns[idx];
    }
    const res = await api.put<KanbanColumn>(`/kanban/columns/${id}`, { title });
    return res.success ? res.data : null;
  },

  async deleteColumn(id: string): Promise<boolean> {
    if (USE_MOCK) {
      await delay();
      const idx = findColumnIndex(id);
      if (idx === -1) return false;
      mockColumns.splice(idx, 1);
      return true;
    }
    const res = await api.delete(`/kanban/columns/${id}`);
    return res.success;
  },

  async updateCase(id: string, data: Partial<Omit<LegalCase, 'id'>>): Promise<LegalCase | null> {
    if (USE_MOCK) {
      await delay();
      const found = findCaseWithIndex(id);
      if (!found) return null;
      const updated = { ...found.case, ...data, updatedAt: today() };
      found.column.cases[found.index] = updated;
      return updated;
    }
    const res = await api.patch<LegalCase>(`/kanban/cases/${id}`, data);
    return res.success ? res.data : null;
  },

  async createCase(params: CreateCaseParams): Promise<LegalCase | null> {
    if (USE_MOCK) {
      await delay();
      const col = findColumn(params.columnId);
      if (!col) return null;
      const maxOrder = col.cases.length > 0 ? Math.max(...col.cases.map((c) => c.order)) : 0;
      const newCase: LegalCase = {
        id: uuid(),
        ...params,
        order: maxOrder + 1,
        createdAt: today(),
        updatedAt: today(),
      };
      col.cases.push(newCase);
      return newCase;
    }
    const res = await api.post<LegalCase>('/kanban/cases', params);
    return res.success ? res.data : null;
  },

  async addNotification(params: AddNotificationParams): Promise<CaseNotification | null> {
    if (USE_MOCK) {
      await delay();
      return {
        id: uuid(),
        ...params,
        isRead: false,
        isSent: false,
        createdAt: now(),
      };
    }
    const res = await api.post<CaseNotification>(`/kanban/cases/${params.caseId}/notifications`, params);
    return res.success ? res.data : null;
  },

  async deleteNotification(caseId: string, notificationId: string): Promise<boolean> {
    if (USE_MOCK) {
      await delay();
      return true;
    }
    const res = await api.delete(`/kanban/cases/${caseId}/notifications/${notificationId}`);
    return res.success;
  },

  async addDocument(params: AddDocumentParams): Promise<DocumentRequest | null> {
    if (USE_MOCK) {
      await delay();
      return {
        id: uuid(),
        ...params,
        requestedAt: now(),
      };
    }
    const res = await api.post<DocumentRequest>(`/kanban/cases/${params.caseId}/documents`, params);
    return res.success ? res.data : null;
  },

  async deleteDocument(caseId: string, documentId: string): Promise<boolean> {
    if (USE_MOCK) {
      await delay();
      return true;
    }
    const res = await api.delete(`/kanban/cases/${caseId}/documents/${documentId}`);
    return res.success;
  },

  async updateDocumentStatus(caseId: string, documentId: string, status: DocumentStatus): Promise<DocumentRequest | null> {
    if (USE_MOCK) {
      await delay();
      return {
        id: documentId,
        name: '',
        status,
        caseId,
        requestedAt: now(),
        receivedAt: status === 'received' ? now() : undefined,
      };
    }
    const res = await api.patch<DocumentRequest>(`/kanban/cases/${caseId}/documents/${documentId}`, { status });
    return res.success ? res.data : null;
  },
};
