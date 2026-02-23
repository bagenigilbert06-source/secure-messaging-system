/**
 * Token Manager - Handles secure token storage and management
 * In production, tokens are stored in HTTP-only cookies via API routes
 * In client-side, we keep access token in memory for security
 */

import { apiClient } from './api-client';

export interface TokenPayload {
  exp: number;
  iat: number;
  sub: string;
  email: string;
  role: string;
  student_id?: string;
}

class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenRefreshInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize token manager (called after login)
   * Access token is kept in memory, refresh token should come from HTTP-only cookie
   */
  initializeTokens(accessToken: string, refreshToken?: string) {
    console.log('[v0] TokenManager.initializeTokens() - Initializing tokens');
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
      console.log('[v0] TokenManager.initializeTokens() - Both access and refresh tokens set');
    } else {
      console.log('[v0] TokenManager.initializeTokens() - Only access token set');
    }

    // Set up automatic token refresh (refresh 5 minutes before expiry)
    this.setupTokenRefresh();

    // Update API client
    apiClient.setAuthToken(accessToken, refreshToken);
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Parse JWT token to extract payload
   */
  private parseToken(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      return payload as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const payload = this.parseToken(token);
    if (!payload) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  }

  /**
   * Get time until token expiration (in seconds)
   */
  getTimeUntilExpiry(token: string): number {
    const payload = this.parseToken(token);
    if (!payload) return 0;

    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - now);
  }

  /**
   * Setup automatic token refresh before expiry
   */
  private setupTokenRefresh() {
    if (!this.accessToken) {
      console.log('[v0] TokenManager.setupTokenRefresh() - No token available');
      return;
    }

    // Clear existing interval
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      console.log('[v0] TokenManager.setupTokenRefresh() - Cleared existing refresh interval');
    }

    const timeUntilExpiry = this.getTimeUntilExpiry(this.accessToken);
    console.log('[v0] TokenManager.setupTokenRefresh() - Time until expiry:', Math.round(timeUntilExpiry / 60), 'minutes');

    // Refresh 5 minutes before expiry, or in 10 minutes if token lasts longer
    const refreshDelay = Math.max(0, (timeUntilExpiry - 300) * 1000);

    if (refreshDelay > 0) {
      console.log('[v0] TokenManager.setupTokenRefresh() - Scheduling refresh in', Math.round(refreshDelay / 1000 / 60), 'minutes');
      this.tokenRefreshInterval = setTimeout(() => {
        console.log('[v0] TokenManager - Automatic token refresh triggered');
        this.refreshAccessToken();
      }, refreshDelay);
    }
  }

  /**
   * Refresh access token
   * In production: Call /api/auth/refresh endpoint which uses HTTP-only cookie
   */
  async refreshAccessToken(): Promise<boolean> {
    try {
      console.log('[v0] TokenManager.refreshAccessToken() - Attempting token refresh');
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies
      });

      console.log('[v0] TokenManager.refreshAccessToken() - Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[v0] TokenManager.refreshAccessToken() - Token refreshed successfully');
        this.accessToken = data.access_token;
        apiClient.setAuthToken(data.access_token);

        // Setup next refresh
        this.setupTokenRefresh();
        return true;
      }

      console.warn('[v0] TokenManager.refreshAccessToken() - Refresh failed, clearing tokens');
      this.clearTokens();
      return false;
    } catch (error) {
      console.error('[v0] TokenManager.refreshAccessToken() - Error:', error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Clear all tokens (called on logout)
   */
  clearTokens() {
    console.log('[v0] TokenManager.clearTokens() - Clearing all tokens');
    this.accessToken = null;
    this.refreshToken = null;
    apiClient.clearAuthToken();

    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
      console.log('[v0] TokenManager.clearTokens() - Cleared refresh interval');
    }

    // Call logout endpoint to clear HTTP-only cookie
    console.log('[v0] TokenManager.clearTokens() - Calling logout endpoint');
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(err => console.error('[v0] TokenManager.clearTokens() - Logout error:', err));
  }

  /**
   * Get token info (decoded payload)
   */
  getTokenInfo(token?: string): TokenPayload | null {
    const tokenToCheck = token || this.accessToken;
    if (!tokenToCheck) return null;
    return this.parseToken(tokenToCheck);
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    const info = this.getTokenInfo();
    return info?.role === role;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.accessToken) return false;
    return !this.isTokenExpired(this.accessToken);
  }

  /**
   * Get user email from token
   */
  getUserEmail(): string | null {
    const info = this.getTokenInfo();
    return info?.email || null;
  }

  /**
   * Get user ID from token
   */
  getUserId(): string | null {
    const info = this.getTokenInfo();
    return info?.sub || null;
  }

  /**
   * Get student ID from token
   */
  getStudentId(): string | null {
    const info = this.getTokenInfo();
    return info?.student_id || null;
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();

// Export type
// TokenPayload is already exported where it is declared above as:
// export interface TokenPayload { ... }
