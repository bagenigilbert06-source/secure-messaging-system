/**
 * API Service Layer
 * Direct API calls to Flask backend using access token from localStorage
 * Simpler, faster, and no middleware complexity
 */

// Direct Flask backend URL
const FLASK_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Get authorization headers with token from localStorage
 */
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
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
 * Verify email with OTP code
 */
export async function verifyEmailWithOTP(email: string, otpCode: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch('/api/auth/verify-email-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        otp_code: otpCode.trim(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify email');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to verify email',
    };
  }
}

/**
 * Resend OTP verification code
 */
export async function resendVerificationOTP(email: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch('/api/auth/resend-verification-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to resend OTP');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to resend OTP',
    };
  }
}

/**
 * Fetch user profile
 */
export async function fetchUserProfile(): Promise<ApiResponse<any>> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    if (!token) {
      return {
        error: 'No authentication token available',
      };
    }

    // Use Next.js API route instead of calling Flask directly
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch profile');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('[fetchUserProfile] Error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch profile',
    };
  }
}

/**
 * Fetch all unclaimed items (found items)
 */
export async function fetchFoundItems(
  page: number = 1,
  perPage: number = 100,
  category?: string,
  search?: string
): Promise<ApiResponse<any>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

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
 * Fetch user's reported items (lost items)
 */
export async function fetchUserItems(
  page: number = 1,
  perPage: number = 10,
  status?: string
): Promise<ApiResponse<any>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (status) params.append('status', status);

    const response = await fetch(`${FLASK_API_BASE}/api/items/my-items?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch your items');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch your items',
    };
  }
}

/**
 * Fetch user's claimed items
 */
export async function fetchUserClaims(
  page: number = 1,
  perPage: number = 10,
  status?: string
): Promise<ApiResponse<any>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (status) params.append('status', status);

    const response = await fetch(`${FLASK_API_BASE}/api/items/my-claims?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch your claims');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch your claims',
    };
  }
}

/**
 * Fetch user's messages
 */
export async function fetchUserMessages(
  page: number = 1,
  perPage: number = 10
): Promise<ApiResponse<any>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await fetch(`${FLASK_API_BASE}/api/messages?${params.toString()}`, {
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
 * Claim an item
 */
export async function claimItem(itemId: string, claimNotes?: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/items/${itemId}/claim`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ claim_notes: claimNotes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to claim item');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to claim item',
    };
  }
}

/**
 * Collect an item (mark as collected)
 */
export async function collectItem(itemId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/items/${itemId}/collect`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to collect item');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to collect item',
    };
  }
}

/**
 * Get item statistics
 */
export async function fetchItemStats(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/items/stats`, {
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
 * Fetch item categories
 */
export async function fetchCategories(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/items/categories`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch categories');
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
 * Send a new message to admin or user
 */
export async function sendMessage(
  recipientId: string,
  subject: string,
  content: string,
  messageType: string = 'inquiry',
  itemId?: string
): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        recipient_id: recipientId,
        subject,
        content,
        message_type: messageType,
        item_id: itemId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to send message',
    };
  }
}

/**
 * Mark a single message as read
 */
export async function markMessageAsRead(messageId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/messages/${messageId}/mark-as-read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to mark message as read');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to mark message as read',
    };
  }
}

/**
 * Mark multiple messages as read
 */
export async function markMultipleMessagesAsRead(messageIds: string[]): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/messages/mark-as-read-bulk`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message_ids: messageIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to mark messages as read');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to mark messages as read',
    };
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete message');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete message',
    };
  }
}

/**
 * Get unread message count
 */
export async function getUnreadMessageCount(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${FLASK_API_BASE}/api/messages/unread-count`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch unread count');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch unread count',
    };
  }
}

/**
 * Get message thread with a specific user/admin
 */
export async function getThreadMessages(
  recipientId: string,
  page: number = 1,
  perPage: number = 20
): Promise<ApiResponse<any>> {
  try {
    const params = new URLSearchParams({
      recipient_id: recipientId,
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await fetch(`${FLASK_API_BASE}/api/messages/thread?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch thread');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch thread',
    };
  }
}

/**
 * Get all conversations (list of all people you've messaged)
 */
export async function getConversationList(
  page: number = 1,
  perPage: number = 20
): Promise<ApiResponse<any>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await fetch(`${FLASK_API_BASE}/api/messages/conversations?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch conversations');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch conversations',
    };
  }
}
