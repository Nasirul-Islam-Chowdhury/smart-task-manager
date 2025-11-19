import axios from 'axios';
import type { AuthResponse, Team, Project, Task, ActivityLog, DashboardStats, MemberWorkload } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
};

// Team APIs
export const teamAPI = {
  getAll: () => api.get<Team[]>('/teams'),
  getById: (id: string) => api.get<Team>(`/teams/${id}`),
  create: (data: { name: string; members: any[] }) => api.post<Team>('/teams', data),
  update: (id: string, data: { name?: string; members?: any[] }) =>
    api.put<Team>(`/teams/${id}`, data),
  delete: (id: string) => api.delete(`/teams/${id}`),
};

// Project APIs
export const projectAPI = {
  getAll: () => api.get<Project[]>('/projects'),
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (data: { name: string; description?: string; team: string }) =>
    api.post<Project>('/projects', data),
  update: (id: string, data: { name?: string; description?: string; team?: string }) =>
    api.put<Project>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Task APIs
export const taskAPI = {
  getAll: (params?: { project?: string; member?: string; status?: string }) =>
    api.get<Task[]>('/tasks', { params }),
  getById: (id: string) => api.get<Task>(`/tasks/${id}`),
  getWorkload: (projectId: string) => api.get<MemberWorkload[]>(`/tasks/workload/${projectId}`),
  create: (data: {
    title: string;
    description?: string;
    project: string;
    assignedMember?: string | null;
    priority?: string;
    status?: string;
  }) => api.post<Task>('/tasks', data),
  update: (
    id: string,
    data: {
      title?: string;
      description?: string;
      assignedMember?: string | null;
      priority?: string;
      status?: string;
    }
  ) => api.put<Task>(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  autoAssign: (projectId: string, taskId: string) =>
    api.post<Task>(`/tasks/auto-assign/${projectId}`, { taskId }),
  reassign: (projectId: string) => api.post(`/tasks/reassign/${projectId}`),
};

// Activity Log APIs
export const activityLogAPI = {
  getRecent: (limit?: number) => api.get<ActivityLog[]>('/activity-logs', { params: { limit } }),
  getByProject: (projectId: string, limit?: number) =>
    api.get<ActivityLog[]>(`/activity-logs/project/${projectId}`, { params: { limit } }),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
};

export default api;
