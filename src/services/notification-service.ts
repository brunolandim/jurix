import { CaseNotification, LegalCase } from '@/types';

// ============ TYPES ============
export type NotificationWithCase = CaseNotification & {
  case: Pick<LegalCase, 'id' | 'number' | 'title'>;
};

// ============ MOCK CONFIG ============
const USE_MOCK = true;
const MOCK_DELAY = 300;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============ MOCK DATA STORE ============
// Em produção, isso viria do banco de dados
// Estrutura: notificações com referência ao caso e advogado
// IMPORTANTE: Estes dados devem estar sincronizados com kanban-service.ts

// Mesmas datas usadas no kanban-service
const pastDate1 = new Date(Date.now() - 1000 * 60 * 30).toISOString(); // 30 min atrás
const pastDate2 = new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(); // 2 horas atrás
const pastDate3 = new Date(Date.now() - 1000 * 60 * 5).toISOString(); // 5 min atrás
const pastDate4 = new Date(Date.now() - 1000 * 60 * 15).toISOString(); // 15 min atrás

let mockNotifications: NotificationWithCase[] = [
  // Notificações do case-001 (Bruno Landim)
  {
    id: 'notif-001',
    type: 'hearing',
    message: 'Audiência de conciliação na 5ª Vara Cível',
    date: pastDate1,
    caseId: 'case-001',
    lawyerId: 'law-001',
    isRead: false,
    isSent: false,
    createdAt: '2026-01-20T10:00:00Z',
    case: {
      id: 'case-001',
      number: '0001234-12.2024.8.26.0100',
      title: 'Ação de Indenização - João Silva vs Empresa ABC',
    },
  },
  {
    id: 'notif-002',
    type: 'deadline',
    message: 'Prazo para apresentação de contestação',
    date: pastDate2,
    caseId: 'case-001',
    lawyerId: 'law-001',
    isRead: false,
    isSent: false,
    createdAt: '2026-01-19T10:00:00Z',
    case: {
      id: 'case-001',
      number: '0001234-12.2024.8.26.0100',
      title: 'Ação de Indenização - João Silva vs Empresa ABC',
    },
  },
  // Notificações do case-002 (Bruno Landim)
  {
    id: 'notif-003',
    type: 'meeting',
    message: 'Reunião com cliente para assinatura dos documentos',
    date: pastDate3,
    caseId: 'case-002',
    lawyerId: 'law-001',
    isRead: false,
    isSent: false,
    createdAt: '2026-01-22T08:00:00Z',
    case: {
      id: 'case-002',
      number: '0005678-45.2024.8.26.0100',
      title: 'Divórcio Consensual - Maria Santos',
    },
  },
  // Notificações do case-003 (Bruno Landim)
  {
    id: 'notif-005',
    type: 'task',
    message: 'Revisar petição inicial do caso',
    date: pastDate4,
    caseId: 'case-003',
    lawyerId: 'law-001',
    isRead: false,
    isSent: false,
    createdAt: '2026-01-25T14:00:00Z',
    case: {
      id: 'case-003',
      number: '0009876-54.2024.8.26.0100',
      title: 'Recuperação de Crédito - Banco XYZ',
    },
  },
];

// ============ SERVICE ============
export const notificationService = {
  /**
   * GET /api/notifications
   * Busca notificações pendentes do advogado logado
   * - Filtra por lawyerId
   * - Apenas notificações não lidas (isRead = false)
   * - Apenas notificações com data <= agora
   */
  async getMyNotifications(lawyerId: string): Promise<NotificationWithCase[]> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);

      const now = new Date();
      return mockNotifications
        .filter((n) => {
          const notificationDate = new Date(n.date);
          return n.lawyerId === lawyerId && !n.isRead && notificationDate <= now;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Em produção: GET /api/notifications?lawyerId={lawyerId}
    const response = await fetch(`/api/notifications?lawyerId=${lawyerId}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  /**
   * PATCH /api/notifications/:id/read
   * Marca uma notificação como lida
   */
  async markAsRead(notificationId: string, lawyerId: string): Promise<boolean> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);

      const index = mockNotifications.findIndex(
        (n) => n.id === notificationId && n.lawyerId === lawyerId
      );

      if (index === -1) return false;

      mockNotifications[index] = {
        ...mockNotifications[index],
        isRead: true,
        readAt: new Date().toISOString(),
      };

      return true;
    }

    // Em produção: PATCH /api/notifications/:id/read
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
    return response.ok;
  },

  /**
   * PATCH /api/notifications/read-all
   * Marca todas as notificações do advogado como lidas
   */
  async markAllAsRead(lawyerId: string): Promise<boolean> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);

      const now = new Date().toISOString();
      mockNotifications = mockNotifications.map((n) => {
        if (n.lawyerId === lawyerId && !n.isRead) {
          return { ...n, isRead: true, readAt: now };
        }
        return n;
      });

      return true;
    }

    // Em produção: PATCH /api/notifications/read-all
    const response = await fetch('/api/notifications/read-all', {
      method: 'PATCH',
    });
    return response.ok;
  },

  /**
   * POST /api/notifications
   * Cria uma nova notificação (usado pelo kanban ao adicionar notificação ao caso)
   */
  async create(
    data: Omit<NotificationWithCase, 'id' | 'createdAt' | 'isRead' | 'isSent' | 'readAt' | 'sentAt'>
  ): Promise<NotificationWithCase> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);

      const newNotification: NotificationWithCase = {
        ...data,
        id: crypto.randomUUID(),
        isRead: false,
        isSent: false,
        createdAt: new Date().toISOString(),
      };

      mockNotifications.push(newNotification);
      return newNotification;
    }

    // Em produção: POST /api/notifications
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create notification');
    return response.json();
  },

  /**
   * DELETE /api/notifications/:id
   * Remove uma notificação
   */
  async delete(notificationId: string): Promise<boolean> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);

      const index = mockNotifications.findIndex((n) => n.id === notificationId);
      if (index === -1) return false;

      mockNotifications.splice(index, 1);
      return true;
    }

    // Em produção: DELETE /api/notifications/:id
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });
    return response.ok;
  },
};
