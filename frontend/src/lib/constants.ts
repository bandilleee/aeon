/**
 * Application-wide constants
 */

export const APP_NAME = "Aeon";
export const APP_DESCRIPTION = "Enterprise Community Management Platform";
export const APP_VERSION = "1.0.0";

/**
 * API Configuration
 * Will be connected to your C# backend later
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

/**
 * Authentication constants
 */
export const AUTH_CONFIG = {
  TOKEN_KEY: "aeon_access_token",
  REFRESH_TOKEN_KEY: "aeon_refresh_token",
  USER_KEY: "aeon_user",
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

/**
 * File upload limits
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "application/msword", "application/vnd. openxmlformats-officedocument.wordprocessingml.document"],
};

/**
 * Event status labels and colors
 */
export const EVENT_STATUS_CONFIG = {
  draft: { label: "Draft", color: "text-aeon-text-muted", bgColor: "bg-aeon-bg-tertiary" },
  pending_approval: { label: "Pending Approval", color:  "text-aeon-accent-warning", bgColor: "bg-aeon-accent-warning/20" },
  approved: { label:  "Approved", color: "text-aeon-accent-success", bgColor: "bg-aeon-accent-success/20" },
  rejected: { label: "Rejected", color: "text-aeon-accent-danger", bgColor:  "bg-aeon-accent-danger/20" },
  cancelled: { label:  "Cancelled", color: "text-aeon-text-muted", bgColor: "bg-aeon-bg-tertiary" },
  completed: { label: "Completed", color: "text-aeon-accent-info", bgColor: "bg-aeon-accent-info/20" },
} as const;

/**
 * Task priority labels and colors
 */
export const TASK_PRIORITY_CONFIG = {
  low:  { label: "Low", color: "text-aeon-text-secondary", bgColor: "bg-aeon-bg-tertiary" },
  medium: { label:  "Medium", color:  "text-aeon-accent-info", bgColor: "bg-aeon-accent-info/20" },
  high: { label: "High", color: "text-aeon-accent-warning", bgColor: "bg-aeon-accent-warning/20" },
  urgent: { label: "Urgent", color: "text-aeon-accent-danger", bgColor: "bg-aeon-accent-danger/20" },
} as const;

/**
 * Task status labels and colors
 */
export const TASK_STATUS_CONFIG = {
  todo: { label:  "To Do", color: "text-aeon-text-secondary", bgColor: "bg-aeon-bg-tertiary" },
  in_progress: { label:  "In Progress", color: "text-aeon-accent-info", bgColor: "bg-aeon-accent-info/20" },
  in_review: { label: "In Review", color: "text-aeon-accent-warning", bgColor:  "bg-aeon-accent-warning/20" },
  completed: { label:  "Completed", color: "text-aeon-accent-success", bgColor: "bg-aeon-accent-success/20" },
  cancelled: { label: "Cancelled", color:  "text-aeon-text-muted", bgColor: "bg-aeon-bg-tertiary" },
} as const;

/**
 * User status labels
 */
export const USER_STATUS_CONFIG = {
  pending: { label: "Pending", color:  "text-aeon-accent-warning", bgColor: "bg-aeon-accent-warning/20" },
  active:  { label: "Active", color: "text-aeon-accent-success", bgColor: "bg-aeon-accent-success/20" },
  suspended: { label: "Suspended", color:  "text-aeon-accent-danger", bgColor: "bg-aeon-accent-danger/20" },
  deactivated:  { label: "Deactivated", color: "text-aeon-text-muted", bgColor:  "bg-aeon-bg-tertiary" },
} as const;