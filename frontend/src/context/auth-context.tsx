'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export interface User {
  id: string;
  email: string;
  name?: string;
  student_id?: string;
  student_type?: string;
  department?: string;
  phone?: string;
  hostel?: string;
  room_number?: string;
  role: string;
  is_verified: boolean;
  email_verified: boolean;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string, isStudentId?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if user is already authenticated on app load
   */
  const checkAuth = useCallback(async () => {
    try {
      console.log('[v0] AuthContext.checkAuth() - Starting auth check');
      setLoading(true);
      setError(null);

      // Check if we have an access token in localStorage
      const accessToken = localStorage.getItem('access_token');
      const userJson = localStorage.getItem('user');

      console.log('[v0] AuthContext.checkAuth() - Token in storage:', !!accessToken);
      console.log('[v0] AuthContext.checkAuth() - User in storage:', !!userJson);

      if (accessToken && userJson) {
        try {
          const userData = JSON.parse(userJson);
          console.log('[v0] AuthContext.checkAuth() - Parsed user:', userData.email);
          
          // Set auth token on API client immediately
          apiClient.setAuthToken(accessToken);
          
          setUser(userData);
          setIsAuthenticated(true);

          // Try to refresh the token to ensure it's still valid
          console.log('[v0] AuthContext.checkAuth() - Attempting token refresh');
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });

          console.log('[v0] AuthContext.checkAuth() - Token refresh response:', refreshResponse.status);

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            console.log('[v0] AuthContext.checkAuth() - Token refreshed successfully');
            localStorage.setItem('access_token', refreshData.access_token);
            // Update the API client with the new token
            apiClient.setAuthToken(refreshData.access_token);
          } else {
            console.warn('[v0] AuthContext.checkAuth() - Token refresh failed, clearing auth');
            // Refresh failed, clear auth
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error('[v0] AuthContext.checkAuth() - Failed to parse user data:', err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('[v0] AuthContext.checkAuth() - No token/user in storage, setting unauthenticated');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('[v0] AuthContext.checkAuth() - Auth check failed:', err);
      setError(err instanceof Error ? err.message : 'Auth check failed');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      console.log('[v0] AuthContext.checkAuth() - Complete');
    }
  }, []);

  /**
   * Handle user login
   */
  const login = useCallback(async (identifier: string, password: string, isStudentId = false) => {
    try {
      console.log('[v0] AuthContext.login() - Starting login with:', isStudentId ? 'student_id' : 'email', identifier);
      setLoading(true);
      setError(null);

      // Prepare request body based on identifier type
      const body = isStudentId 
        ? { student_id: identifier, password }
        : { email: identifier, password };

      console.log('[v0] AuthContext.login() - Sending login request to /api/auth/login');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      console.log('[v0] AuthContext.login() - Response status:', response.status);
      const data = await response.json();

      if (!response.ok) {
        console.error('[v0] AuthContext.login() - Login failed:', data.error);
        throw new Error(data.error || 'Login failed');
      }

      console.log('[v0] AuthContext.login() - Login successful, storing tokens');
      // Store tokens and user data
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Set auth token on API client so all subsequent requests include it
      apiClient.setAuthToken(data.access_token);

      console.log('[v0] AuthContext.login() - User authenticated:', data.user.email, 'Role:', data.user.role);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      console.error('[v0] AuthContext.login() - Error:', errorMessage);
      setError(errorMessage);
      setUser(null);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
      console.log('[v0] AuthContext.login() - Complete');
    }
  }, []);

  /**
   * Handle user logout
   */
  const logout = useCallback(async () => {
    try {
      console.log('[v0] AuthContext.logout() - Starting logout');
      setLoading(true);
      setError(null);

      // Clear local storage and API client auth
      console.log('[v0] AuthContext.logout() - Clearing local storage and API client');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      apiClient.clearAuthToken();

      // Call logout endpoint to clear cookies
      console.log('[v0] AuthContext.logout() - Calling /api/auth/logout');
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      }).catch(err => console.error('[v0] Logout endpoint error:', err));

      console.log('[v0] AuthContext.logout() - User logged out successfully');
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('[v0] AuthContext.logout() - Error:', err);
      // Still clear local state even if endpoint fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      console.log('[v0] AuthContext.logout() - Complete');
    }
  }, []);

  /**
   * Initialize auth on mount - runs ONCE only
   */
  useEffect(() => {
    console.log('[v0] AuthContext - useEffect mount - Initializing auth on component mount');
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        console.log('[v0] AuthContext.initAuth() - Starting');
        setLoading(true);
        setError(null);

        const accessToken = localStorage.getItem('access_token');
        const userJson = localStorage.getItem('user');

        console.log('[v0] AuthContext.initAuth() - Found token:', !!accessToken, 'Found user:', !!userJson);

        if (accessToken && userJson) {
          try {
            const userData = JSON.parse(userJson);
            console.log('[v0] AuthContext.initAuth() - Parsed user:', userData.email);
            apiClient.setAuthToken(accessToken);
            
            if (isMounted) {
              setUser(userData);
              setIsAuthenticated(true);

              // Try to refresh the token to ensure it's still valid
              try {
                console.log('[v0] AuthContext.initAuth() - Attempting token refresh on mount');
                const refreshResponse = await fetch('/api/auth/refresh', {
                  method: 'POST',
                  credentials: 'include',
                });

                console.log('[v0] AuthContext.initAuth() - Refresh response status:', refreshResponse.status);

                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json();
                  console.log('[v0] AuthContext.initAuth() - Token refreshed on mount');
                  localStorage.setItem('access_token', refreshData.access_token);
                  // Update the API client with the new token
                  apiClient.setAuthToken(refreshData.access_token);
                } else {
                  console.warn('[v0] AuthContext.initAuth() - Refresh failed on mount');
                  // Refresh failed, clear auth
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('user');
                  apiClient.clearAuthToken();
                  setUser(null);
                  setIsAuthenticated(false);
                }
              } catch (err) {
                console.error('[v0] AuthContext.initAuth() - Token refresh failed:', err);
              }
            }
          } catch (err) {
            console.error('[v0] AuthContext.initAuth() - Failed to parse user data:', err);
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            apiClient.clearAuthToken();
            if (isMounted) {
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } else {
          console.log('[v0] AuthContext.initAuth() - No token/user found, setting unauthenticated');
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('[v0] AuthContext.initAuth() - Initialization failed:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Auth initialization failed');
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('[v0] AuthContext.initAuth() - Complete');
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - runs once on mount

  /**
   * Listen for localStorage changes (e.g., after registration)
   * Do NOT call checkAuth here to avoid refresh loops
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Only update if access_token changed
      if (e.key === 'access_token' || e.key === 'user') {
        // Simple re-initialization without recursive calls
        const accessToken = localStorage.getItem('access_token');
        const userJson = localStorage.getItem('user');

        if (accessToken && userJson) {
          try {
            const userData = JSON.parse(userJson);
            apiClient.setAuthToken(accessToken);
            setUser(userData);
            setIsAuthenticated(true);
          } catch (err) {
            console.error('[AuthContext] Storage change parse error:', err);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          apiClient.clearAuthToken();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // Empty dependency array

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, error, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
