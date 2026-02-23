import { apiClient } from '@/lib/api-client';
import type { Task, CreateTaskData } from '@/types/task.types';

export const taskService = {
  // 1. GET ALL: Read all tasks
  getAllTasks: async () => {
    // Note: We use the apiClient.get method here!
    const response = await apiClient.get<Task[]>('/api/tasks');
    return response;
  },

  // 2. GET ONE: Read a specific task by ID
  getTaskById: async (id: string) => {
    const response = await apiClient.get<Task>(`/api/tasks/${id}`);
    return response;
  },

  // 3. CREATE: Make a new task
  createTask: async (data: CreateTaskData) => {
    const response = await apiClient.post<Task>('/api/tasks', data);
    return response;
  },

  // 4. UPDATE: Change an existing task
  updateTask: async (id: string, data: Partial<Task>) => {
    const response = await apiClient.put<void>(`/api/tasks/${id}`, data);
    return response;
  },

  // 5. DELETE: Remove a task completely
  deleteTask: async (id: string) => {
    const response = await apiClient.delete<void>(`/api/tasks/${id}`);
    return response;
  }
};