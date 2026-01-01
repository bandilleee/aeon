/**
 * Admin User Management Types
 * Enterprise-grade user management for community leaders
 */

/**
 * System roles - simplified for single community
 */
export type SystemRole = 
  | "admin"            // Admin portal access, can manage leaders
  | "community_leader" // Can manage their community
  | "moderator"        // Limited moderation capabilities
  | "viewer";          // Read-only access

/**
 * User account status
 */
export type AccountStatus = 
  | "active"           // Fully active account
  | "pending"          // Awaiting activation
  | "suspended"        // Temporarily suspended
  | "locked"           // Locked due to security (failed logins, etc.)
  | "deactivated";     // Permanently deactivated

/**
 * Two-factor authentication status
 */
export type TwoFactorStatus = "disabled" | "enabled" | "enforced";

/**
 * Admin permissions - granular access control
 */
export interface AdminPermissions {
  // User Management
  users_view: boolean;
  users_create: boolean;
  users_edit: boolean;
  users_delete:  boolean;
  // Event Management
  events_view: boolean;
  events_approve: boolean;
  events_edit_all: boolean;
  events_delete:  boolean;
  // Task Management
  tasks_view: boolean;
  tasks_manage_all: boolean;
  // Access Requests
  access_requests_view: boolean;
  access_requests_manage: boolean;
  // System Settings
  system_settings:  boolean;
  audit_logs: boolean;
  // Member Management
  members_view: boolean;
  members_manage: boolean;
  // Reports & Analytics
  reports_view: boolean;
  reports_export: boolean;
}

/**
 * Predefined permission templates
 */
export const ROLE_PERMISSIONS: Record<SystemRole, AdminPermissions> = {
  admin: {
    users_view: true,
    users_create: true,
    users_edit: true,
    users_delete: true,
    events_view:  true,
    events_approve: true,
    events_edit_all: true,
    events_delete: true,
    tasks_view: true,
    tasks_manage_all: true,
    access_requests_view: true,
    access_requests_manage: true,
    system_settings: true,
    audit_logs:  true,
    members_view: true,
    members_manage: true,
    reports_view: true,
    reports_export: true,
  },
  community_leader: {
    users_view:  false,
    users_create: false,
    users_edit:  false,
    users_delete: false,
    events_view: true,
    events_approve: false,
    events_edit_all: false,
    events_delete: false,
    tasks_view:  true,
    tasks_manage_all: false,
    access_requests_view: false,
    access_requests_manage: false,
    system_settings: false,
    audit_logs:  false,
    members_view: true,
    members_manage: true,
    reports_view:  true,
    reports_export: false,
  },
  moderator: {
    users_view: false,
    users_create: false,
    users_edit: false,
    users_delete:  false,
    events_view: true,
    events_approve: false,
    events_edit_all: false,
    events_delete: false,
    tasks_view: true,
    tasks_manage_all: false,
    access_requests_view: true,
    access_requests_manage: false,
    system_settings: false,
    audit_logs:  false,
    members_view: true,
    members_manage: false,
    reports_view: false,
    reports_export: false,
  },
  viewer: {
    users_view: false,
    users_create: false,
    users_edit: false,
    users_delete: false,
    events_view:  true,
    events_approve: false,
    events_edit_all: false,
    events_delete: false,
    tasks_view: true,
    tasks_manage_all: false,
    access_requests_view: false,
    access_requests_manage: false,
    system_settings: false,
    audit_logs:  false,
    members_view: true,
    members_manage: false,
    reports_view:  false,
    reports_export: false,
  },
};

/**
 * Login activity record
 */
export interface LoginActivity {
  id: string;
  timestamp: string;
  ipAddress: string;
  location?:  string;
  device:  string;
  browser: string;
  status: "success" | "failed" | "blocked";
  failureReason?: string;
}

/**
 * Active session
 */
export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location?: string;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}

/**
 * Admin User - Full user profile for admin management
 */
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  initials: string;
  avatarUrl?: string;
  phone?: string;
  // Role & Permissions
  role:  SystemRole;
  permissions: AdminPermissions;
  customPermissions:  boolean;
  // Status
  status: AccountStatus;
  statusReason?: string;
  statusChangedAt?: string;
  statusChangedBy?: string;
  // Security
  twoFactorStatus: TwoFactorStatus;
  passwordLastChanged?:  string;
  mustChangePassword: boolean;
  failedLoginAttempts: number;
  lockedUntil?:  string;
  // Activity
  lastLoginAt?: string;
  lastActiveAt?: string;
  loginCount: number;
  // Metadata
  createdAt: string;
  createdBy?:  string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
}

/**
 * Create user payload
 */
export interface CreateUserPayload {
  email:  string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: SystemRole;
  sendInvite: boolean;
  temporaryPassword?:  string;
  mustChangePassword: boolean;
  notes?: string;
  tags?: string[];
}

/**
 * Update user payload
 */
export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: SystemRole;
  permissions?:  Partial<AdminPermissions>;
  notes?: string;
  tags?: string[];
}

/**
 * Bulk action types
 */
export type BulkAction = 
  | "activate"
  | "suspend"
  | "deactivate"
  | "reset_password"
  | "enable_2fa"
  | "send_notification"
  | "export"
  | "change_role";

/**
 * User activity log entry
 */
export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  ipAddress?:  string;
  timestamp: string;
  performedBy?:  {
    id: string;
    displayName: string;
  };
}

/**
 * User filter options
 */
export interface UserFilters {
  search?:  string;
  role?: SystemRole | "all";
  status?: AccountStatus | "all";
  twoFactorStatus?:  TwoFactorStatus | "all";
  dateRange?: {
    start: string;
    end:  string;
  };
  hasCustomPermissions?: boolean;
  tags?: string[];
}

/**
 * User sort options
 */
export type UserSortField = 
  | "displayName"
  | "email"
  | "role"
  | "status"
  | "lastLoginAt"
  | "createdAt";

export interface UserSort {
  field: UserSortField;
  direction: "asc" | "desc";
}