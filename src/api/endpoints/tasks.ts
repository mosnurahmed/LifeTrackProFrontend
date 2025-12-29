/**
 * Tasks API Endpoints
 */

import client from '../client';

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  completedAt?: string;
  reminder?: {
    enabled: boolean;
    time: string;
    sent: boolean;
  };
  repeat?: {
    enabled: boolean;
    interval: 'daily' | 'weekly' | 'monthly';
    endDate?: string;
  };
  subtasks: Array<{
    _id: string;
    title: string;
    completed: boolean;
    completedAt?: string;
  }>;
  tags: string[];
  isOverdue: boolean;
  subtaskProgress: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  status?: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  reminder?: {
    enabled: boolean;
    time: string;
  };
  repeat?: {
    enabled: boolean;
    interval: 'daily' | 'weekly' | 'monthly';
    endDate?: string;
  };
  tags?: string[];
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  dueToday: number;
}

export const tasksApi = {
  // Get all tasks
  getAll: (params?: {
    status?: string;
    priority?: string;
    tags?: string;
    dueDate?: 'today' | 'upcoming' | 'overdue';
    search?: string;
  }) => client.get('/tasks', { params }),

  // Get single task
  getById: (id: string) => client.get(`/tasks/${id}`),

  // Create task
  create: (data: CreateTaskData) => client.post('/tasks', data),

  // Update task
  update: (id: string, data: Partial<CreateTaskData>) =>
    client.put(`/tasks/${id}`, data),

  // Delete task
  delete: (id: string) => client.delete(`/tasks/${id}`),

  // Update task status
  updateStatus: (id: string, status: 'todo' | 'in_progress' | 'completed' | 'cancelled') =>
    client.patch(`/tasks/${id}/status`, { status }),

  // Get statistics
  getStats: () => client.get('/tasks/stats'),

  // Subtasks
  addSubtask: (taskId: string, title: string) =>
    client.post(`/tasks/${taskId}/subtasks`, { title }),

  updateSubtask: (
    taskId: string,
    subtaskId: string,
    data: { title?: string; completed?: boolean },
  ) => client.put(`/tasks/${taskId}/subtasks/${subtaskId}`, data),

  deleteSubtask: (taskId: string, subtaskId: string) =>
    client.delete(`/tasks/${taskId}/subtasks/${subtaskId}`),
};

export default tasksApi;