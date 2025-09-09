import axios from 'axios';
import type { Task, TaskCreateRequest, TaskUpdateRequest, AuthResponse, HeatmapData } from '../types';

const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication interceptors
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      // Don't redirect here, let the app handle authentication state
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const authApi = {
  getStatus: async (): Promise<ApiResponse<{ hasUser: boolean; requiresSetup: boolean }>> => {
    const response = await api.get('/auth/status');
    return response.data;
  },

  setup: async (pin: string): Promise<ApiResponse<{ message: string; userId: string }>> => {
    const response = await api.post('/auth/setup', { pin });
    return response.data;
  },

  login: async (pin: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/login', { pin });
    return response.data;
  },
};

export const taskApi = {
  create: async (task: TaskCreateRequest): Promise<ApiResponse<Task>> => {
    const response = await api.post('/tasks', task);
    return response.data;
  },

  getAll: async (date?: string): Promise<ApiResponse<Task[]>> => {
    const params = date ? { date } : {};
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  getToday: async (): Promise<ApiResponse<Task[]>> => {
    const response = await api.get('/tasks/today');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Task>> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  update: async (id: string, updates: TaskUpdateRequest): Promise<ApiResponse<Task>> => {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data;
  },

  patch: async (id: string, updates: Partial<TaskUpdateRequest>): Promise<ApiResponse<Task>> => {
    const response = await api.patch(`/tasks/${id}`, updates);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  getHeatmapData: async (startDate?: string, endDate?: string): Promise<ApiResponse<HeatmapData[]>> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/tasks/heatmap?${params.toString()}`);
    return response.data;
  },

  exportCSV: async (startDate?: string, endDate?: string): Promise<void> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/tasks/export/csv?${params.toString()}`, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const start = startDate || sevenDaysAgo.toISOString().split('T')[0];
    const end = endDate || today;
    
    link.href = url;
    link.download = `tarefas_${start}_${end}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  exportPDF: async (startDate?: string, endDate?: string): Promise<void> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/tasks/export/pdf?${params.toString()}`, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const start = startDate || sevenDaysAgo.toISOString().split('T')[0];
    const end = endDate || today;
    
    link.href = url;
    link.download = `tarefas_${start}_${end}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};