import { api } from './api';
import { KanbanColumn, LegalCase } from '@/types';

export type MoveCaseParams = {
  caseId: string;
  columnId: string;
  previousId: string | null; // ID of card above (null if first)
  nextId: string | null; // ID of card below (null if last)
};

const mockColumns: KanbanColumn[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    title: 'New',
    order: 0,
    userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    createdAt: '2026-01-01',
    cases: [
      {
        id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        number: '0001234-12.2024.8.26.0100',
        title: 'Compensation Claim for Moral Damages',
        description: `Ação de indenização por danos morais movida pelo cliente João Silva contra a empresa XYZ Ltda.

Fatos:
1. O cliente foi negativado indevidamente nos órgãos de proteção ao crédito
2. A negativação ocorreu após o pagamento integral da dívida
3. O cliente sofreu constrangimentos ao tentar realizar compras

Pedidos:
- Indenização por danos morais no valor de R$ 20.000,00
- Retirada imediata do nome dos cadastros de inadimplentes
- Custas processuais e honorários advocatícios`,
        client: 'João Silva',
        priority: 'high',
        columnId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        order: 1.0,
        lawyer: { id: 'law-001', name: 'Dr. Bruno Landim', photo: '/img/homemSpider.jpg' },
        createdBy: { id: 'law-002', name: 'Ygor da Silva', photo: '' },
        createdAt: '2026-01-10',
        updatedAt: '2026-01-19',
      },
      {
        id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
        number: '0005678-45.2024.8.26.0100',
        title: 'Appeal',
        description:
          'Recurso de apelação contra sentença desfavorável em primeira instância. Aguardando prazo para contrarrazões.',
        client: 'Maria Santos',
        priority: 'urgent',
        columnId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        order: 2.0,
        createdBy: { id: 'law-001', name: 'Dr. Bruno Landim', photo: '/img/homemSpider.jpg' },
        createdAt: '2026-01-12',
        updatedAt: '2026-01-18',
      },
    ],
  },
  {
    id: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    title: 'In Progress',
    order: 1,
    userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    createdAt: '2026-01-01',
    cases: [
      {
        id: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
        number: '0009012-78.2024.8.26.0100',
        title: 'Extrajudicial Title Execution',
        client: 'ABC Company Ltd',
        priority: 'medium',
        columnId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
        order: 1.0,
        lawyer: { id: 'law-001', name: 'Dr. Bruno Landim', photo: '/img/homemSpider.jpg' },
        createdAt: '2026-01-05',
        updatedAt: '2026-01-17',
      },
    ],
  },
  {
    id: 'f6a7b8c9-d0e1-2345-f012-456789012345',
    title: 'Waiting',
    order: 2,
    userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    createdAt: '2026-01-01',
    cases: [
      {
        id: 'a7b8c9d0-e1f2-3456-0123-567890123456',
        number: '0003456-90.2024.8.26.0100',
        title: 'Writ of Mandamus',
        client: 'Pedro Oliveira',
        priority: 'low',
        columnId: 'f6a7b8c9-d0e1-2345-f012-456789012345',
        order: 1.0,
        createdAt: '2026-01-08',
        updatedAt: '2026-01-15',
      },
      {
        id: 'a7b8c9d0-e1f2-3456-0123-567890123452',
        number: '0003457-91.2024.8.26.0100',
        title: 'Labor Lawsuit',
        client: 'Carlos Mendes',
        priority: 'medium',
        columnId: 'f6a7b8c9-d0e1-2345-f012-456789012345',
        order: 2.0,
        createdAt: '2026-01-08',
        updatedAt: '2026-01-15',
      },
      {
        id: 'a7b8c9d0-e1f2-3456-0123-567890123453',
        number: '0003458-92.2024.8.26.0100',
        title: 'Ordinary Appeal',
        client: 'Ana Paula Costa',
        priority: 'high',
        columnId: 'f6a7b8c9-d0e1-2345-f012-456789012345',
        order: 3.0,
        createdAt: '2026-01-08',
        updatedAt: '2026-01-15',
      },
    ],
  },
  {
    id: 'b8c9d0e1-f2a3-4567-1234-678901234567',
    title: 'Completed',
    order: 3,
    userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    createdAt: '2026-01-01',
    cases: [],
  },
];

const USE_MOCK = true;

function calculateNewOrder(cases: LegalCase[], previousId: string | null, nextId: string | null): number {
  const previous = previousId ? cases.find((c) => c.id === previousId) : null;
  const next = nextId ? cases.find((c) => c.id === nextId) : null;

  const previousOrder = previous?.order ?? null;
  const nextOrder = next?.order ?? null;

  // First card in list
  if (previousOrder === null && nextOrder === null) {
    return 1.0;
  }

  // Insert at beginning (before first)
  if (previousOrder === null && nextOrder !== null) {
    return nextOrder / 2;
  }

  // Insert at end (after last)
  if (previousOrder !== null && nextOrder === null) {
    return previousOrder + 1.0;
  }

  // Insert in middle (between two cards)
  return (previousOrder! + nextOrder!) / 2;
}

function sortCasesByOrder(columns: KanbanColumn[]): KanbanColumn[] {
  return columns.map((col) => ({
    ...col,
    cases: [...col.cases].sort((a, b) => a.order - b.order),
  }));
}

export const kanbanService = {
  async getColumns(): Promise<KanbanColumn[]> {
    if (USE_MOCK) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return sortCasesByOrder(mockColumns);
    }

    const response = await api.get<KanbanColumn[]>('/kanban/columns');
    return response.success ? sortCasesByOrder(response.data) : [];
  },

  async moveCase(params: MoveCaseParams): Promise<LegalCase | null> {
    const { caseId, columnId, previousId, nextId } = params;

    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Find the case
      let legalCase: LegalCase | null = null;
      for (const col of mockColumns) {
        const found = col.cases.find((c) => c.id === caseId);
        if (found) {
          legalCase = found;
          break;
        }
      }
      if (!legalCase) return null;

      // Find target column
      const targetColumn = mockColumns.find((c) => c.id === columnId);
      if (!targetColumn) return null;

      // Calculate new order based on neighbors
      const newOrder = calculateNewOrder(targetColumn.cases, previousId, nextId);

      return { ...legalCase, columnId, order: newOrder };
    }

    const response = await api.put<LegalCase>(`/kanban/cases/${caseId}/move`, {
      columnId,
      previousId,
      nextId,
    });
    return response.success ? response.data : null;
  },

  async createColumn(title: string): Promise<KanbanColumn | null> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const newColumn: KanbanColumn = {
        id: crypto.randomUUID(),
        title,
        order: mockColumns.length,
        userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        createdAt: new Date().toISOString(),
        cases: [],
      };
      return newColumn;
    }

    const response = await api.post<KanbanColumn>('/kanban/columns', { title });
    return response.success ? response.data : null;
  },

  async updateColumn(id: string, title: string): Promise<KanbanColumn | null> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const column = mockColumns.find((c) => c.id === id);
      return column ? { ...column, title } : null;
    }

    const response = await api.put<KanbanColumn>(`/kanban/columns/${id}`, { title });
    return response.success ? response.data : null;
  },

  async deleteColumn(id: string): Promise<boolean> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return true;
    }

    const response = await api.delete(`/kanban/columns/${id}`);
    return response.success;
  },
};
