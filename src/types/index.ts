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
  createdAt: string;
  updatedAt: string;
};

// Column (database table - customizable by user)
export type Column = {
  id: string;
  title: string;
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
