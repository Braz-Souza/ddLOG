export interface Task {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface User {
  id: string;
  pinHash: string;
  createdAt: string;
}

export interface TaskCreateRequest {
  name: string;
  description: string;
}

export interface TaskUpdateRequest {
  name?: string;
  description?: string;
  completed?: boolean;
}

export interface AuthRequest {
  pin: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'pinHash'>;
}

export interface HeatmapData {
  date: string;
  count: number;
  level: number;
}

export interface ExportOptions {
  format: 'csv' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
}