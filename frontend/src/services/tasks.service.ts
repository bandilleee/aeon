import { apiClient } from '@/lib/api-client';
import type { Task, CreateTaskData } from '@/types/task.types';

// 1. Define what our new C# comment looks like!
export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  createdAt: string;
  userId: string;
  userDisplayName: string;
  userInitials: string;
}

export const taskService = {
  getAllTasks: async () => {
    return await apiClient.get<Task[]>('/api/tasks');
  },

  getTaskById: async (id: string) => {
    return await apiClient.get<Task>(`/api/tasks/${id}`);
  },

  createTask: async (data: CreateTaskData) => {
    return await apiClient.post<Task>('/api/tasks', data);
  },

  updateTask: async (id: string, data: Partial<Task>) => {
    return await apiClient.put<void>(`/api/tasks/${id}`, data);
  },

  deleteTask: async (id: string) => {
    return await apiClient.delete<void>(`/api/tasks/${id}`);
  },

  // --- NEW COMMENT METHODS ---
  
  // Get all comments for a specific task
  getTaskComments: async (taskId: string) => {
    return await apiClient.get<TaskComment[]>(`/api/taskcomments/task/${taskId}`);
  },

  // Send a new comment to the database
  addTaskComment: async (data: { taskId: string; content: string; userId: string; userDisplayName: string; userInitials: string }) => {
    return await apiClient.post<TaskComment>('/api/taskcomments', data);
  }
};