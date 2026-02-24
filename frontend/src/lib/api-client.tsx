// frontend/lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073';

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

  /**
   * NEW: Automatically check local storage when we ask for the token!
   */
  getAccessToken(): string | null {
    // If we don't have it in memory, check the browser's storage
    if (!this.accessToken && typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('aeon_access_token');
    }
    return this.accessToken;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('aeon_access_token', token);
      } else {
        localStorage.removeItem('aeon_access_token');
      }
    }
  }

  clearAuth() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aeon_access_token');
      localStorage.removeItem('aeon_user');
    }
  }

  private async fetchWithAuth<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Grab the wristband (from memory or storage)
    const token = this.getAccessToken();

    // If we have it, wear it!
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If the bouncer kicks us out, stop immediately and throw a readable error
    if (response.status === 401) {
      this.clearAuth();
      throw new Error("Session expired or unauthorized. Please log in again.");
    }

    // Safely parse the JSON response
    return response.json();
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    return this.fetchWithAuth<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    return this.fetchWithAuth<T>(url, {
      method: 'GET',
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    return this.fetchWithAuth<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    return this.fetchWithAuth<T>(url, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.success && response.data !== undefined;
}