"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: string;
  status: string;
  avatarUrl?: string;
  mustChangePassword?: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface ResetPasswordParams {
  token: string;
  email: string;
  newPassword: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{
    success: boolean;
    error?: string;
    requiresPasswordChange?: boolean;
  }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  resetPassword: (params: ResetPasswordParams) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router                    = useRouter();
  const [user, setUser]           = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Rehydrate from localStorage on mount ───────────────────────────────
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("aeon_user");
      const token      = localStorage.getItem("aeon_access_token");
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("aeon_user");
      localStorage.removeItem("aeon_access_token");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── LOGIN ───────────────────────────────────────────────────────────────
  const login = async (credentials: LoginCredentials) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5073";

      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          email:    credentials.email,
          password: credentials.password,
        }),
      });

      // Parse response body regardless of status
      let data: any;
      try {
        data = await response.json();
      } catch {
        return {
          success: false,
          error:   "Server returned an invalid response. Is the backend running?",
        };
      }

      // Handle HTTP errors (401, 400, 403, etc.)
      if (!response.ok) {
        const msg =
          data?.message ||
          data?.error?.message ||
          data?.Error?.message ||
          "Invalid email or password.";
        return { success: false, error: msg };
      }

      // Backend returns PascalCase: { Token, User: { Id, Email, ... } }
      // Also accept camelCase just in case
      const token   = data.Token   ?? data.token;
      const rawUser = data.User    ?? data.user;

      if (!token || !rawUser) {
        console.error("Unexpected login response shape:", data);
        return {
          success: false,
          error:   "Unexpected response from server.",
        };
      }

      // Normalize to camelCase for the frontend
      const normalizedUser: User = {
        id:                  String(rawUser.Id            ?? rawUser.id            ?? ""),
        email:               rawUser.Email                ?? rawUser.email         ?? "",
        firstName:           rawUser.FirstName            ?? rawUser.firstName     ?? "",
        lastName:            rawUser.LastName             ?? rawUser.lastName      ?? "",
        displayName:         rawUser.DisplayName          ?? rawUser.displayName   ??
          `${rawUser.FirstName ?? rawUser.firstName ?? ""} ${rawUser.LastName ?? rawUser.lastName ?? ""}`.trim(),
        role:                rawUser.Role                 ?? rawUser.role          ?? "member",
        status:              rawUser.Status               ?? rawUser.status        ?? "active",
        avatarUrl:           rawUser.AvatarUrl            ?? rawUser.avatarUrl,
        mustChangePassword:  rawUser.MustChangePassword   ?? rawUser.mustChangePassword ?? false,
      };

      // Persist to localStorage
      localStorage.setItem("aeon_access_token", token);
      localStorage.setItem("aeon_user", JSON.stringify(normalizedUser));
      if (credentials.rememberMe) {
        localStorage.setItem("aeon_remember_me", "true");
      }

      setUser(normalizedUser);

      // Role-based redirect
      if (normalizedUser.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

      // Role-based redirect — AFTER the normalizedUser is set
      if (normalizedUser.mustChangePassword) {
        router.push("/set-password");
      } else if (normalizedUser.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

      return {
        success:                true,
        requiresPasswordChange: normalizedUser.mustChangePassword,
      };
    } catch (error: any) {
      console.error("Login error:", error);
      if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("ERR_CONNECTION_REFUSED")
      ) {
        return {
          success: false,
          error:   "Cannot connect to server. Is the backend running on port 5073?",
        };
      }
      return { success: false, error: error?.message || "Login failed." };
    }
  };

  // ─── LOGOUT ──────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      localStorage.removeItem("aeon_user");
      localStorage.removeItem("aeon_access_token");
      localStorage.removeItem("aeon_refresh_token");
      localStorage.removeItem("aeon_remember_me");
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // ─── REFRESH SESSION ─────────────────────────────────────────────────────
  const refreshSession = async () => {
    // JWT is valid for 7 days — no refresh needed for MVP
  };

  // ─── RESET PASSWORD ──────────────────────────────────────────────────────
  const resetPassword = async (params: ResetPasswordParams) => {
    const baseUrl  = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5073";
    const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        token:       params.token,
        email:       params.email,
        newPassword: params.newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.message || errorData?.error?.message || "Failed to reset password."
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshSession,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}