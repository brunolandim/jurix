export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
  status?: number;
  code?: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  photo: string;
  oab: string;
  organizationId: string;
};

export type User = Lawyer;

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthState = {
  user: Lawyer | null;
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
  fileUrl?: string;
  uploadedAt?: string;
  rejectionReason?: RejectionReason;
  rejectionNote?: string;
  rejectedAt?: string;
};

export type CaseNotification = {
  id: string;
  type: NotificationType;
  message?: string;
  date: string;
  caseId: string;
  lawyerId?: string;
  isRead: boolean;
  readAt?: string;

  isSent: boolean;
  sentAt?: string;
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
  createdBy: string;
  assignedTo: string;
  assignee?: Lawyer;
  creator: Lawyer;
  notifications?: CaseNotification[];
  documents?: DocumentRequest[];
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
  role?: 'owner' | 'admin' | 'lawyer';
  avatarColor?: string;
};

export type ShareableLink = {
  id: string;
  token: string;
  caseId: string;
  documentIds: string[];
  isExpired: boolean;
  createdAt: string;
  createdBy: string;
  creator: Lawyer;
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

export type PlanType = 'pro' | 'business' | 'enterprise';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';

export type PlanLimits = {
  lawyers: number | null;
  activeCases: number | null;
  documents: number | null;
  shareLinks: number | null;
};

export type Plan = {
  name: string;
  type: PlanType;
  price: number;
  limits: PlanLimits;
};

export type UsageInfo = {
  current: number;
  limit: number | null;
};

export type SubscriptionInfo = {
  subscription: {
    id: string;
    plan: string;
    status: SubscriptionStatus;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    trialEnd: string | null;
    cancelAtPeriodEnd: boolean;
    canceledAt: string | null;
  } | null;
  plan: PlanType | null;
  status: SubscriptionStatus | null;
  usage: {
    lawyers: UsageInfo;
    activeCases: UsageInfo;
    documents: UsageInfo;
    shareLinks: UsageInfo;
  };
  trialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
};
