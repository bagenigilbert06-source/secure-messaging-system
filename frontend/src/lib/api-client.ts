/**
 * Centralized API Client for Backend Communication
 * Handles authentication, retry logic, error handling, and request/response interceptors
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const REQUEST_TIMEOUT = 30000; // 30 seconds

interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
}

interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}

class ApiClient {
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private initialized: boolean = false;

  /**
   * Initialize token from localStorage if available
   * Call this on component mount to ensure token is loaded
   */
  initializeFromStorage() {
    if (this.initialized) return;
    
    const token = localStorage.getItem('access_token');
    if (token) {
      this.authToken = token;
      console.log('[v0] ApiClient.initializeFromStorage() - Token loaded from localStorage');
    }
    this.initialized = true;
  }

  /**
   * Set authentication token (called after login)
   */
  setAuthToken(token: string, refreshToken?: string) {
    this.authToken = token;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
  }

  /**
   * Clear authentication tokens (called on logout)
   */
  clearAuthToken() {
    this.authToken = null;
    this.refreshToken = null;
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Make HTTP request with automatic retry and error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      timeout = REQUEST_TIMEOUT,
      retries = 3,
      skipAuth = false,
      ...fetchOptions
    } = options;

    const url = `${API_BASE_URL}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const headers = new Headers(fetchOptions.headers);
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json');
        }

        // Add authorization header if token exists and not skipped
        if (this.authToken && !skipAuth) {
          headers.set('Authorization', `Bearer ${this.authToken}`);
        }

        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
          credentials: 'include', // Send cookies with requests
        });

        clearTimeout(timeoutId);

        // Handle success
        if (response.ok) {
          const data = await response.json();
          return data as T;
        }

        // Handle token expiration - attempt refresh
        if (response.status === 401 && this.refreshToken && !skipAuth) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry original request with new token
            continue;
          }
          // If refresh fails, clear tokens and return error
          this.clearAuthToken();
        }

        // Handle other errors
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          errorData.message || errorData.error || `HTTP ${response.status}`
        ) as Error & { status?: number; data?: unknown };
        error.status = response.status;
        error.data = errorData;

        throw error;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (error instanceof Error) {
          const status = (error as Error & { status?: number }).status;
          if (status && status >= 400 && status < 500 && status !== 429) {
            throw error;
          }
        }

        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          const delayMs = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError || new Error('Request failed after multiple retries');
  }

  /**
   * Attempt to refresh the access token using refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.refreshToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.authToken = data.access_token;
        if (data.refresh_token) {
          this.refreshToken = data.refresh_token;
        }
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export type for API errors
export type { ApiError };
