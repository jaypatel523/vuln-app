import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  summary: {
    total: number;
    overdue: number;
  };
  status: {
    TODO: number;
    IN_PROGRESS: number;
    REVIEW: number;
    DONE: number;
  };
  priority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}

export const taskApi = {
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data;
  },
  createTask: async (task: Partial<Task>): Promise<Task> => {
    const response = await api.post('/tasks', task);
    return response.data;
  },
  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}`, updates);
    return response.data;
  },
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
  getStats: async (): Promise<TaskStats> => {
    const response = await api.get('/analytics/stats');
    return response.data;
  },
  getActivity: async (): Promise<ActivityLog[]> => {
    const response = await api.get('/analytics/activity');
    return response.data;
  },
};
