export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface UserSummary {
  id: string;
  email: string;
  full_name: string;
  name?: string;
  avatar_url?: string | null;
  role?: 'admin' | 'member';
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_by?: string | null;
  assigned_to?: string | null;
  assignee?: UserSummary | null;
  creator?: UserSummary | null;
  created_at: string;
  updated_at: string;
}

export type TaskInsert = {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  created_by?: string | null;
  assigned_to?: string | null;
};

export type TaskUpdate = Partial<TaskInsert>;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
