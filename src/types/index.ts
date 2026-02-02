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
  oab: string;
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

// Document Request Types
export type DocumentStatus = 'pending' | 'pending_approval' | 'rejected' | 'received';

export type RejectionReason = 'low_quality' | 'wrong_document' | 'incomplete' | 'illegible' | 'other';

export type DocumentRequest = {
  id: string;
  name: string;
  description?: string;
  status: DocumentStatus;
  caseId: string;
  requestedAt: string;
  receivedAt?: string;
  // Upload fields
  fileUrl?: string;
  uploadedAt?: string;
  // Rejection fields
  rejectionReason?: RejectionReason;
  rejectionNote?: string;
  rejectedAt?: string;
};

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
  assignee?: AuthUser;
  creator: AuthUser;
  notifications?: CaseNotification[];
  documentRequests?: DocumentRequest[];
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

// Shareable Link for Public Document Upload
// Only stores references - case and document data are fetched via JOIN
export type ShareableLink = {
  id: string;
  token: string;
  caseId: string;
  documentIds: string[];
  isExpired: boolean;
  createdAt: string;
  createdBy: { id: string; name: string };
};

// Public Document (for client view)
export type PublicDocument = {
  id: string;
  name: string;
  description?: string;
  status: DocumentStatus;
  rejectionReason?: RejectionReason;
  rejectionNote?: string;
};
