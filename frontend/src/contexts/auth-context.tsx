"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types/user.types";
import type { LoginCredentials, AuthResponse } from "@/types/auth.types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials & { recaptchaToken?: string }) => Promise<{ 
    requiresTwoFactor: boolean; 
    userId?: string;
  }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
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
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials & { recaptchaToken?: string }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5073/api";
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });

      // INSTEAD OF THROWING AN ERROR, WE RETURN IT SOFTLY
      if (!response.ok) {
        const errorMessage = await response.text();
        return { success: false, error: errorMessage || "Invalid email or password" };
      }

      const data = await response.json();

      localStorage.setItem("aeon_user", JSON.stringify(data.user));
      localStorage.setItem("aeon_access_token", data.token);
      
      if (credentials.rememberMe) {
        localStorage.setItem("aeon_remember_me", "true");
      }

      setUser(data.user);

      // Return success!
      return {
        success: true,
        requiresTwoFactor: false,
      };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: "Network error. Is the server running?" };
    }
  };

  const logout = async () => {
    try {
      // TODO: Call logout endpoint
      // await fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
      //   method: "POST",
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      // Clear auth data
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
    try {
      const refreshToken = localStorage.getItem("aeon_refresh_token");
      if (!refreshToken) return;

      // TODO: Call refresh endpoint
      // const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ refreshToken }),
      // });
      
      // Update tokens
    } catch (error) {
      console.error("Session refresh failed:", error);
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshSession,
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
