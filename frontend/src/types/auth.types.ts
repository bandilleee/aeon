import { User, UserRole } from "./user.types";

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Access request form data
 */
export interface AccessRequestData {
  email: string;
  firstName: string;
  lastName: string;
  reason: string;
}

/**
 * Access request status
 */
export type AccessRequestStatus = "pending" | "approved" | "rejected";

/**
 * Access request (for admin view)
 */
export interface AccessRequest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  reason: string;
  status: AccessRequestStatus;
  
  // Timestamps
  requestedAt: string;
  reviewedAt?: string;
  
  // Review info
  reviewedBy?: {
    id: string;
    displayName: string;
  };
  rejectionReason?: string;
}

/**
 * Authentication response from login
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  requiresPasswordChange: boolean; // TRUE if using temp password
}

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresPasswordChange: boolean;
  error: string | null;
}

/**
 * Session information
 */
export interface Session {
  id: string;
  userId: string;
  device: string;
  browser: string;
  ipAddress: string;
  location?: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

/**
 * Approve access request payload
 */
export interface ApproveAccessPayload {
  requestId: string;
  role?:  UserRole; // Default to "member"
}

/**
 * Reject access request payload
 */
export interface RejectAccessPayload {
  requestId: string;
  reason:  string;
}