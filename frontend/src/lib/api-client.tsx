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

  getAccessToken(): string | null {
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

    const token = this.getAccessToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearAuth();
      throw new Error("Session expired or unauthorized. Please log in again.");
    }

    return response.json();
  }

  // --- ENSURE ENDPOINTS ARE PROPERLY FORMATTED ---
  // If a service passes "/tasks", it becomes "http://localhost:5073/tasks" which is a 404!
  // It needs to be "http://localhost:5073/api/tasks".
  // This helper ensures the endpoint starts with /api if it isn't already there.
  private formatEndpoint(endpoint: string): string {
    if (!endpoint.startsWith('/api/')) {
      // If it starts with a slash, just insert 'api'
      if (endpoint.startsWith('/')) {
        return `/api${endpoint}`;
      }
      // Otherwise, add '/api/'
      return `/api/${endpoint}`;
    }
    return endpoint;
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const formattedEndpoint = this.formatEndpoint(endpoint);
    const url = `${API_BASE_URL}${formattedEndpoint}`;
    return this.fetchWithAuth<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const formattedEndpoint = this.formatEndpoint(endpoint);
    const url = `${API_BASE_URL}${formattedEndpoint}`;
    return this.fetchWithAuth<T>(url, {
      method: 'GET',
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const formattedEndpoint = this.formatEndpoint(endpoint);
    const url = `${API_BASE_URL}${formattedEndpoint}`;
    return this.fetchWithAuth<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const formattedEndpoint = this.formatEndpoint(endpoint);
    const url = `${API_BASE_URL}${formattedEndpoint}`;
    return this.fetchWithAuth<T>(url, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.success && response.data !== undefined;
}