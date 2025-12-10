/**
 * Task priority levels
 */
export type TaskPriority = "low" | "medium" | "high" | "urgent";

/**
 * Task status
 */
export type TaskStatus = "todo" | "in_progress" | "in_review" | "completed" | "cancelled";

/**
 * Task information
 */
export interface Task {
  id: string;
  title: string;
  description?:  string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  
  // Creator (only they can delete)
  createdBy: string;
  createdByUser?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  
  // Collaborators
  collaborators: TaskCollaborator[];
  
  // Additional metadata
  tags?:  string[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  
  // Timestamps
  createdAt: string;
  updatedAt:  string;
  completedAt?: string;
}

/**
 * Task collaborator
 */
export interface TaskCollaborator {
  id: string;
  userId: string;
  user: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
  };
  role: "assignee" | "reviewer" | "observer";
  addedAt: string;
  addedBy:  string;
}

/**
 * Task attachment
 */
export interface TaskAttachment {
  id:  string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
}

/**
 * Task comment
 */
export interface TaskComment {
  id:  string;
  content: string;
  authorId: string;
  author: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt?:  string;
  isEdited: boolean;
}

/**
 * Create task form data
 */
export interface CreateTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  collaboratorIds?: string[];
  tags?: string[];
}