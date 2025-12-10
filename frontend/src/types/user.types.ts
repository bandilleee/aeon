/**
 * User roles in the system
 */
export type UserRole = "admin" | "member";

/**
 * User account status
 */
export type UserStatus = "pending" | "active" | "suspended" | "deactivated";

/**
 * Base user information
 */
export interface User {
  id:  string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  createdAt:  string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * User profile with additional details
 */
export interface UserProfile extends User {
  bio?:  string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  timezone?: string;
  notificationPreferences:  NotificationPreferences;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  emailNotifications: boolean;
  eventReminders: boolean;
  taskAssignments: boolean;
  memberUpdates: boolean;
  systemAnnouncements: boolean;
}

/**
 * Access request from new users
 */
export interface AccessRequest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}