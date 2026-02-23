// frontend/lib/api-client.ts
import type { AuthResult, LoginResult, UserDto } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5251';

interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  /**
   * Set access token in memory (called after login/refresh)
   */
  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Clear all auth state
   */
  clearAuth() {
    this.accessToken = null;
    this.refreshPromise = null;
  }

  /**
   * Make authenticated request with automatic token refresh
   */
  private async fetchWithAuth<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Add access token if available
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies (refresh token)
    });

    // If 401 and we have a token, try refreshing
    if (response.status === 401 && this.accessToken) {
      const newToken = await this.refreshAccessToken();
      
      if (newToken) {
        // Retry request with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });
      } else {
        // Refresh failed, clear auth
        this.clearAuth();
      }
    }

    return response.json();
  }

  /**
   * Refresh access token using HttpOnly refresh token cookie
   * Prevents concurrent refresh requests
   */
  private async refreshAccessToken(): Promise<string | null> {
    // If refresh already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
          method: 'POST',
          credentials: 'include', // Send refresh token cookie
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          return null;
        }

        const result: ApiResponse<AuthResult> = await response.json();
        
        if (result.success && result.data?.accessToken) {
          this.setAccessToken(result.data.accessToken);
          return result.data.accessToken;
        }

        return null;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    return this.fetchWithAuth<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    return this.fetchWithAuth<T>(url, {
      method: 'GET',
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    return this.fetchWithAuth<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    return this.fetchWithAuth<T>(url, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export helper to check if response was successful
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.success && response.data !== undefined;
}