"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

// Define User type inline (or import from types file)
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: string;
  status: string;
  avatarUrl?: string;
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
    requiresTwoFactor?: boolean; 
    userId?: string;
  }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  resetPassword: (params: ResetPasswordParams) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem("aeon_user");
        const token = localStorage.getItem("aeon_access_token");
        
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        // Clear corrupted data
        localStorage.removeItem("aeon_user");
        localStorage.removeItem("aeon_access_token");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5073";
      
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });

      // Handle errors
      if (!response.ok) {
        let errorMessage = "Invalid email or password";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If can't parse error, use default message
        }
        return { success: false, error: errorMessage };
      }

      // Parse successful response
      const data = await response.json();
      
      // Backend sends: { Token: "...", User: {...} }
      const token = data.Token || data.token;
      const userData = data.User || data.user;

      if (!token || !userData) {
        return { success: false, error: "Server returned invalid response" };
      }

      // Transform user data to match our interface
      const transformedUser: User = {
        id: userData.Id || userData.id,
        email: userData.Email || userData.email,
        firstName: userData.FirstName || userData.firstName || "",
        lastName: userData.LastName || userData.lastName || "",
        displayName: userData.DisplayName || userData.displayName || userData.email,
        role: userData.Role || userData.role || "member",
        status: userData.Status || userData.status || "active",
        avatarUrl: userData.AvatarUrl || userData.avatarUrl,
      };

      // Save to localStorage
      localStorage.setItem("aeon_user", JSON.stringify(transformedUser));
      localStorage.setItem("aeon_access_token", token);
      
      if (credentials.rememberMe) {
        localStorage.setItem("aeon_remember_me", "true");
      }

      // Update React state
      setUser(transformedUser);

      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: "Network error. Is the backend server running?" };
    }
  };

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

  const refreshSession = async () => {
    // TODO: Implement token refresh when needed
    const refreshToken = localStorage.getItem("aeon_refresh_token");
    if (!refreshToken) return;
  };

  const resetPassword = async (params: ResetPasswordParams) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5073";
    
    const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: params.token,
        email: params.email,
        newPassword: params.newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to reset password");
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshSession,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}