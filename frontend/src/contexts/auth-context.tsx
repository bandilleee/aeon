"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types/user.types";
import type { LoginCredentials } from "@/types/auth.types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials & { recaptchaToken?: string }) => Promise<{ 
    success: boolean;
    error?: string;
    requiresTwoFactor?: boolean; 
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
      // NOTE: Base URL is the port. We manually append /api to the fetch path!
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5073";
      
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });

      if (!response.ok) {
        // If it's a 401 Unauthorized, the backend usually sends a JSON error message.
        try {
          const errorData = await response.json();
          return { success: false, error: errorData.message || "Invalid email or password" };
        } catch {
          return { success: false, error: "Invalid email or password" };
        }
      }

      // Read the successful ApiResponse wrapper!
      const apiResponse = await response.json();
      
      // If the backend wrapped it in { success: true, data: { ... } }
      const token = apiResponse.data?.token || apiResponse.token;
      const userData = apiResponse.data?.user || apiResponse.user;

      if (!token || !userData) {
         return { success: false, error: "Server returned an invalid response format." };
      }

      // Save to storage
      localStorage.setItem("aeon_user", JSON.stringify(userData));
      localStorage.setItem("aeon_access_token", token);
      
      if (credentials.rememberMe) {
        localStorage.setItem("aeon_remember_me", "true");
      }

      // Set React state
      setUser(userData);

      return {
        success: true,
        requiresTwoFactor: false, // You can hook this up to real TOTP logic later
      };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: "Network error. Is the server running?" };
    }
  };

  const logout = async () => {
    try {
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
      // TODO: Implement actual refresh logic here when needed
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