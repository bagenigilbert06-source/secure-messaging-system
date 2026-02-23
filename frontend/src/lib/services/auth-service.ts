/**
 * Authentication Service
 * Handles all auth-related API calls to backend
 */

import { apiClient } from '../api-client';

export interface RegisterPayload {
  name: string;
  email: string;
  student_id: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    name: string;
    email: string;
    student_id: string;
    role: string;
    department: string;
    is_active: boolean;
    is_verified: boolean;
    email_verified: boolean;
    created_at: string;
    last_login: string | null;
  };
}

export interface VerifyEmailPayload {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: AuthResponse['user'];
}

class AuthService {
  /**
   * Register new user
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', payload, {
      skipAuth: true,
    });
  }

  /**
   * Login with email and password
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', payload, {
      skipAuth: true,
    });
  }

  /**
   * Logout (clear tokens on backend)
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local cleanup even if API call fails
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(payload: VerifyEmailPayload): Promise<VerifyEmailResponse> {
    return apiClient.post<VerifyEmailResponse>('/auth/verify', payload, {
      skipAuth: true,
    });
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ access_token: string; expires_in: number }> {
    return apiClient.post('/auth/refresh');
  }

  /**
   * Get current user (requires auth)
   */
  async getCurrentUser(): Promise<AuthResponse['user']> {
    return apiClient.get<AuthResponse['user']>('/auth/me');
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return apiClient.post('/auth/forgot-password', { email }, {
      skipAuth: true,
    });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post(
      '/auth/reset-password',
      { token, new_password: newPassword },
      { skipAuth: true }
    );
  }

  /**
   * Change password (requires auth)
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }
}

// Export singleton instance
export const authService = new AuthService();
