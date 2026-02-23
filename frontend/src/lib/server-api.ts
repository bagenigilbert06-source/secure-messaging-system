/**
 * Server-Side API Wrapper
 * For use in Server Components only
 * Makes direct requests to backend with proper authentication
 */

import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:5000';

interface ApiErrorResponse {
  error: string;
  message?: string;
}

/**
 * Get authorization headers from request cookies
 * Handles both access token and refresh token scenarios
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Get the access token from auth cookie if available
  const accessToken = cookieStore.get('auth_access_token')?.value;
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
}

/**
 * Generic fetch wrapper for server-side requests
 */
async function serverFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  const mergedHeaders = {
    ...headers,
    ...options.headers,
  };

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    let errorMessage = 'API request failed';
    try {
      const error = (await response.json()) as ApiErrorResponse;
      errorMessage = error.error || error.message || errorMessage;
    } catch {
      errorMessage = `API Error: ${response.status}`;
    }
    console.error('[v0] serverFetch() - Error:', errorMessage, 'Endpoint:', endpoint);
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Fetch authenticated user profile
 */
export async function getServerUser() {
  try {
    const data = await serverFetch('/api/auth/me');
    return data;
  } catch (error) {
    console.error('[ServerAPI] Failed to fetch user:', error);
    return null;
  }
}

/**
 * Fetch unclaimed/found items
 */
export async function getServerFoundItems(
  page: number = 1,
  perPage: number = 12,
  category?: string,
  search?: string
) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const data = await serverFetch(`/api/items?${params.toString()}`);
    return data;
  } catch (error) {
    console.error('[ServerAPI] Failed to fetch found items:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Fetch user's reported items (losses)
 */
export async function getServerUserItems(
  page: number = 1,
  perPage: number = 10,
  status?: string
) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (status) params.append('status', status);

    const data = await serverFetch(`/api/items/my-items?${params.toString()}`);
    return data;
  } catch (error) {
    console.error('[ServerAPI] Failed to fetch user items:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Fetch user's claimed items
 */
export async function getServerUserClaims(
  page: number = 1,
  perPage: number = 10,
  status?: string
) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (status) params.append('status', status);

    const data = await serverFetch(`/api/items/my-claims?${params.toString()}`);
    return data;
  } catch (error) {
    console.error('[ServerAPI] Failed to fetch user claims:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Fetch user messages
 */
export async function getServerUserMessages(
  page: number = 1,
  perPage: number = 10
) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const data = await serverFetch(`/api/messages?${params.toString()}`);
    return data;
  } catch (error) {
    console.error('[ServerAPI] Failed to fetch messages:', error);
    return { messages: [], total: 0 };
  }
}

/**
 * Fetch user conversations (for messaging interface)
 */
export async function getServerConversations() {
  try {
    console.log('[v0] getServerConversations() - Fetching conversations');
    const data = await serverFetch('/api/messages/conversations');
    console.log('[v0] getServerConversations() - Fetched', data?.conversations?.length || 0, 'conversations');
    return data;
  } catch (error) {
    console.error('[ServerAPI] Failed to fetch conversations:', error);
    return { conversations: [] };
  }
}

/**
 * Fetch item categories
 */
export async function getServerCategories() {
  try {
    const data = await serverFetch('/api/items/categories');
    return data;
  } catch (error) {
    console.error('[ServerAPI] Failed to fetch categories:', error);
    return { categories: [] };
  }
}

/**
 * Fetch item statistics
 */
export async function getServerItemStats() {
  try {
    const data = await serverFetch('/api/items/stats');
    return data;
  } catch (error) {
    console.error('[ServerAPI] Failed to fetch stats:', error);
    return { total_items: 0, unclaimed_items: 0, claimed_items: 0 };
  }
}

/**
 * Admin: Get dashboard statistics
 */
export async function getServerAdminDashboardStats() {
  try {
    const data = await serverFetch('/api/admin/dashboard/stats');
    return data;
  } catch (error) {
    console.error('[ServerAPI] Failed to fetch admin stats:', error);
    return {
      total_users: 0,
      total_items: 0,
      total_messages: 0,
      items_by_department: [],
      items_by_status: {},
    };
  }
}

/**
 * Admin: Get recent activity
 */
export async function getServerAdminRecentActivity() {
  try {
    const data = await serverFetch('/api/admin/dashboard/recent-activity');
    return data;
  } catch (error) {
    console.error('[ServerAPI] Failed to fetch recent activity:', error);
    return {
      recent_registrations: [],
      recent_items: [],
      recent_messages: [],
    };
  }
}

/**
 * Admin: Get all users
 */
export async function getServerAdminUsers(
  page: number = 1,
  perPage: number = 20,
  search?: string,
  status?: string
) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const data = await serverFetch(`/api/admin/users?${params.toString()}`);
    return data;
  } catch (error) {
    console.error('[ServerAPI] Failed to fetch admin users:', error);
    return { users: [], total: 0, pages: 0 };
  }
}

/**
 * Admin: Get all items with filtering
 */
export async function getServerAdminItems(
  page: number = 1,
  perPage: number = 50,
  status?: string,
  category?: string,
  department?: string
) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (department) params.append('department', department);

    const data = await serverFetch(`/api/admin/items?${params.toString()}`);
    return data;
  } catch (error) {
    console.error('[ServerAPI] Failed to fetch admin items:', error);
    return { items: [], total: 0, pages: 0 };
  }
}

/**
 * Admin: Get all messages
 */
export async function getServerAdminMessages(
  page: number = 1,
  perPage: number = 50,
  status?: string
) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (status) params.append('status', status);

    const data = await serverFetch(`/api/admin/messages?${params.toString()}`);
    return data;
  } catch (error) {
    console.error('[ServerAPI] Failed to fetch admin messages:', error);
    return { messages: [], total: 0, pages: 0 };
  }
}

/**
 * Admin: Get items by category report
 */
export async function getServerAdminCategoryReport() {
  try {
    const data = await serverFetch('/api/admin/reports/items-by-category');
    return data;
  } catch (error) {
    console.error('[ServerAPI] Failed to fetch category report:', error);
    return { categories: [] };
  }
}
