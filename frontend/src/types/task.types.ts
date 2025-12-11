/**
 * Task status
 */
export type TaskStatus = "todo" | "in_progress" | "in_review" | "completed";

/**
 * Task priority
 */
export type TaskPriority = "low" | "medium" | "high" | "urgent";

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
    initials: string;
  };
  role: "assignee" | "reviewer" | "observer";
  assignedAt: string;
}

/**
 * Task comment
 */
export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    initials: string;
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Task information
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  
  // Creator information
  createdBy: string;
  createdByUser: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    initials: string;
  };

  // Collaborators
  collaborators: TaskCollaborator[];

  // Related event (optional)
  eventId?: string;
  eventTitle?: string;

  // Comments count
  commentsCount: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/**
 * Create task form data
 */
export interface CreateTaskData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  collaboratorIds: string[];
  eventId?: string;
}

/**
 * Task filters
 */
export interface TaskFilters {
  search?: string;
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  assignee?: string | "all";
}