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
  email:  string;
  firstName: string;
  lastName: string;
  reason: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken:  string;
  expiresAt: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Session information
 */
export interface Session {
  id:  string;
  userId: string;
  device:  string;
  browser: string;
  ipAddress: string;
  location?:  string;
  createdAt: string;
  lastActiveAt:  string;
  isCurrent: boolean;
}