/**
 * Admin API Service Layer
 * Direct API calls to Flask backend for admin operations using access token from localStorage
 */

const FLASK_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Get authorization headers with token from localStorage
 */
function getAuthHeaders(contentType: string = 'application/json'): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': contentType,
  };

  // Get token from localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Create a new item (record found item)
 */
export async function createItem(formData: FormData): Promise<ApiResponse<any>> {
  try {
    const headers: HeadersInit = {};

    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${FLASK_API_BASE}/api/items`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create item');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create item',
    };
  }
}

/**
 * Update item status
 */
export async function updateItemStatus(itemId: string, status: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/items/${itemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update item');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update item',
    };
  }
}

/**
 * Delete an item
 */
export async function deleteItem(itemId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/items/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete item');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete item',
    };
  }
}

/**
 * Get all items (admin view)
 */
export async function getAllItems(
  page: number = 1,
  perPage: number = 50,
  status?: string,
  category?: string,
  search?: string
): Promise<ApiResponse<any>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const response = await fetch(`${FLASK_API_BASE}/api/items?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch items');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch items',
    };
  }
}

/**
 * Respond to a message from a student
 */
export async function replyToMessage(messageId: string, reply: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/messages/${messageId}/reply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content: reply }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send reply');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to send reply',
    };
  }
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/dashboard/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch statistics');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch statistics',
    };
  }
}

/**
 * Get recent activity (registrations, items, messages)
 */
export async function getRecentActivity(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/dashboard/recent-activity`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch recent activity');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch recent activity',
    };
  }
}

/**
 * Get all users with filtering
 */
export async function getAllUsers(
  page: number = 1,
  perPage: number = 20,
  search?: string,
  status?: string
): Promise<ApiResponse<any>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await fetch(`${FLASK_API_BASE}/api/admin/users?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch users');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch users',
    };
  }
}

/**
 * Get user details with activity stats
 */
export async function getUserDetails(userId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user details');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch user details',
    };
  }
}

/**
 * Verify a user account
 */
export async function verifyUser(userId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/users/${userId}/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify user');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to verify user',
    };
  }
}

/**
 * Deactivate a user
 */
export async function deactivateUser(userId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/users/${userId}/deactivate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to deactivate user');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to deactivate user',
    };
  }
}

/**
 * Activate a user
 */
export async function activateUser(userId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/users/${userId}/activate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to activate user');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to activate user',
    };
  }
}

/**
 * Create a new user (admin)
 */
export async function createUser(userData: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create user',
    };
  }
}

/**
 * Update an existing user (admin)
 */
export async function updateUser(userId: string, userData: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update user',
    };
  }
}

/**
 * Get admin items with advanced filtering
 */
export async function getAdminItems(
  page: number = 1,
  perPage: number = 50,
  status?: string,
  category?: string,
  department?: string,
  dateFrom?: string,
  dateTo?: string,
  search?: string
): Promise<ApiResponse<any>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (department) params.append('department', department);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    if (search) params.append('search', search);

    const response = await fetch(`${FLASK_API_BASE}/api/admin/items?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch admin items');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch admin items',
    };
  }
}

/**
 * Update item with admin privileges
 */
export async function updateAdminItem(itemId: string, itemData: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/items/${itemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update item');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update item',
    };
  }
}

/**
 * Delete item with admin privileges
 */
export async function deleteAdminItem(itemId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/items/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete item');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete item',
    };
  }
}

/**
 * Get admin messages with filtering
 */
export async function getAdminMessages(
  page: number = 1,
  perPage: number = 50,
  status?: string
): Promise<ApiResponse<any>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (status) params.append('status', status);

    const response = await fetch(`${FLASK_API_BASE}/api/admin/messages?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch messages');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch messages',
    };
  }
}

/**
 * Get admin reports - items by category
 */
export async function getItemsByCategoryReport(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/reports/items-by-category`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch category report');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch category report',
    };
  }
}

/**
 * Get admin reports - user activity
 */
export async function getUserActivityReport(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/reports/user-activity`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch activity report');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch activity report',
    };
  }
}

// ==================== CATEGORIES ====================

/**
 * Get all categories
 */
export async function getCategories(page: number = 1, perPage: number = 20): Promise<ApiResponse<any>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await fetch(`${FLASK_API_BASE}/api/admin/categories?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch categories',
    };
  }
}

/**
 * Create a new category
 */
export async function createCategory(categoryData: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      throw new Error('Failed to create category');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create category',
    };
  }
}

/**
 * Update a category
 */
export async function updateCategory(categoryId: string, categoryData: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/categories/${categoryId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      throw new Error('Failed to update category');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update category',
    };
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/categories/${categoryId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete category');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete category',
    };
  }
}

// ==================== DEPARTMENTS ====================

/**
 * Get all departments
 */
export async function getDepartments(page: number = 1, perPage: number = 20): Promise<ApiResponse<any>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await fetch(`${FLASK_API_BASE}/api/admin/departments?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch departments');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch departments',
    };
  }
}

/**
 * Create a new department
 */
export async function createDepartment(deptData: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/departments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(deptData),
    });

    if (!response.ok) {
      throw new Error('Failed to create department');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create department',
    };
  }
}

/**
 * Update a department
 */
export async function updateDepartment(deptId: string, deptData: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/departments/${deptId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(deptData),
    });

    if (!response.ok) {
      throw new Error('Failed to update department');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update department',
    };
  }
}

/**
 * Delete a department
 */
export async function deleteDepartment(deptId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/departments/${deptId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete department');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete department',
    };
  }
}

// ==================== STORAGE LOCATIONS ====================

/**
 * Get all storage locations
 */
export async function getLocations(page: number = 1, perPage: number = 20, departmentId?: string): Promise<ApiResponse<any>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (departmentId) params.append('department_id', departmentId);

    const response = await fetch(`${FLASK_API_BASE}/api/admin/locations?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch locations',
    };
  }
}

/**
 * Create a new storage location
 */
export async function createLocation(locData: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/locations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(locData),
    });

    if (!response.ok) {
      throw new Error('Failed to create location');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create location',
    };
  }
}

/**
 * Update a storage location
 */
export async function updateLocation(locId: string, locData: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/locations/${locId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(locData),
    });

    if (!response.ok) {
      throw new Error('Failed to update location');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update location',
    };
  }
}

/**
 * Delete a storage location
 */
export async function deleteLocation(locId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/locations/${locId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete location');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete location',
    };
  }
}

// ==================== ACTIVITY LOGS ====================

/**
 * Get activity logs
 */
export async function getActivityLogs(
  page: number = 1,
  perPage: number = 50,
  actionType?: string,
  entityType?: string
): Promise<ApiResponse<any>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (actionType) params.append('action_type', actionType);
    if (entityType) params.append('entity_type', entityType);

    const response = await fetch(`${FLASK_API_BASE}/api/admin/activity-logs?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch activity logs');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch activity logs',
    };
  }
}

// ==================== DELETE USER ====================

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete user',
    };
  }
}

// ==================== MESSAGE MANAGEMENT ====================

/**
 * Edit an admin message
 */
export async function editMessage(messageId: string, content: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/admin/messages/${messageId}/edit`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to edit message');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to edit message',
    };
  }
}


