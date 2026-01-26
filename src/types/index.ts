export type User = {
  id: string;
  name: string;
  email: string;
};

export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  photo: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

// Case Types
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

// Notification Types
export type NotificationType = 'hearing' | 'deadline' | 'meeting' | 'task' | 'other';

export type CaseNotification = {
  id: string;
  type: NotificationType;
  message?: string;
  date: string; // ISO date string - quando a notificação deve aparecer
  caseId: string;
  lawyerId?: string; // Advogado responsável (para envio)

  // Controle de leitura (frontend)
  isRead: boolean; // Se o usuário viu/confirmou
  readAt?: string; // Quando marcou como lida

  // Controle de envio (backend job)
  isSent: boolean; // Se o job já enviou (email/SMS)
  sentAt?: string; // Quando foi enviada

  createdAt: string;
};

export type LegalCase = {
  id: string;
  number: string;
  title: string;
  description?: string;
  client: string;
  priority: CasePriority;
  columnId: string;
  order: number;
  lawyer?: { id: string; photo: string; name: string };
  createdBy: { id: string; photo: string; name: string };
  notifications?: CaseNotification[];
  createdAt: string;
  updatedAt: string;
};

// Column (database table - customizable by user)
export type Column = {
  id: string;
  title: string;
  key?: string; // Chave de tradução para colunas padrão (ex: "new")
  isDefault?: boolean; // Coluna padrão não pode ser deletada
  order: number;
  userId: string;
  createdAt: string;
};

// Kanban (frontend - column with its cases)
export type KanbanColumn = Column & {
  cases: LegalCase[];
};

// Lawyer
export type Lawyer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  oab: string; // Registro OAB
  specialty?: string;
  active: boolean;
  createdAt: string;
};
