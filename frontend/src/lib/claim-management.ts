/**
 * Claim Management Utilities
 * Centralized functions for handling claim operations, notifications, and status updates
 */

interface ClaimStatusUpdate {
  claimId: string;
  newStatus: 'pending' | 'under_review' | 'verified' | 'rejected' | 'collected';
  reason?: string;
  adminNotes?: string;
}

interface StudentNotification {
  claimId: string;
  studentId: string;
  messageType: 'status_changed' | 'question_added' | 'rejected' | 'verified' | 'ready_pickup';
  content: string;
  title: string;
}

/**
 * Send notification to student about claim status change
 */
export async function notifyStudentOfStatusChange(
  notification: StudentNotification
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return { success: true };
  } catch (error) {
    console.error('[v0] Notification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update claim status and notify student
 */
export async function updateClaimStatus(update: ClaimStatusUpdate): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/claims/${update.claimId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: update.newStatus,
        reason: update.reason,
        adminNotes: update.adminNotes,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update claim status');
    }

    const updatedClaim = await response.json();

    // Generate notification based on status
    let notification: StudentNotification | null = null;

    switch (update.newStatus) {
      case 'rejected':
        notification = {
          claimId: update.claimId,
          studentId: updatedClaim.studentId,
          messageType: 'rejected',
          title: 'Claim Rejected',
          content: `Your claim for "${updatedClaim.itemName}" has been rejected. Reason: ${update.reason || 'See details in your account.'}`,
        };
        break;
      case 'verified':
        notification = {
          claimId: update.claimId,
          studentId: updatedClaim.studentId,
          messageType: 'verified',
          title: 'Claim Verified',
          content: `Your claim for "${updatedClaim.itemName}" has been verified. Your item will be available for pickup soon.`,
        };
        break;
      case 'collected':
        notification = {
          claimId: update.claimId,
          studentId: updatedClaim.studentId,
          messageType: 'ready_pickup',
          title: 'Item Ready for Pickup',
          content: `Your item "${updatedClaim.itemName}" is now ready for pickup. Please visit our office with your student ID.`,
        };
        break;
      case 'under_review':
        notification = {
          claimId: update.claimId,
          studentId: updatedClaim.studentId,
          messageType: 'status_changed',
          title: 'Claim Under Review',
          content: `Your claim for "${updatedClaim.itemName}" is now under review. We will contact you if we need additional information.`,
        };
        break;
    }

    // Send notification if applicable
    if (notification) {
      await notifyStudentOfStatusChange(notification);
    }

    return { success: true };
  } catch (error) {
    console.error('[v0] Claim status update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Add verification question to claim
 */
export async function addVerificationQuestion(
  claimId: string,
  question: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/claims/${claimId}/verification-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error('Failed to add verification question');
    }

    // Notify student
    const claim = await response.json();
    await notifyStudentOfStatusChange({
      claimId,
      studentId: claim.studentId,
      messageType: 'question_added',
      title: 'Additional Information Needed',
      content: `We need additional information about your claim for "${claim.itemName}". Please check your account for the question.`,
    });

    return { success: true };
  } catch (error) {
    console.error('[v0] Add verification question error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send message in claim conversation
 */
export async function sendClaimMessage(
  claimId: string,
  content: string,
  sender: 'student' | 'admin',
  senderName: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const response = await fetch(`/api/claims/${claimId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        sender,
        senderName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const message = await response.json();
    return { success: true, messageId: message.id };
  } catch (error) {
    console.error('[v0] Send message error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Mark claim messages as read
 */
export async function markClaimAsRead(claimId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/claims/${claimId}/mark-read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to mark as read');
    }

    return { success: true };
  } catch (error) {
    console.error('[v0] Mark as read error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Authorize release and generate reference number
 */
export async function authorizeItemRelease(
  claimId: string,
  pickupInstructions: string
): Promise<{ success: boolean; error?: string; referenceNumber?: string }> {
  try {
    const response = await fetch(`/api/claims/${claimId}/authorize-release`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'release-authorized',
        pickupInstructions,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to authorize release');
    }

    const updatedClaim = await response.json();

    // Notify student
    await notifyStudentOfStatusChange({
      claimId,
      studentId: updatedClaim.studentId,
      messageType: 'ready_pickup',
      title: 'Item Ready for Pickup',
      content: `Your item "${updatedClaim.itemName}" is ready for pickup. Reference #: ${updatedClaim.releaseInfo?.referenceNumber}. ${pickupInstructions}`,
    });

    return {
      success: true,
      referenceNumber: updatedClaim.releaseInfo?.referenceNumber,
    };
  } catch (error) {
    console.error('[v0] Authorize release error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch all claims for a student
 */
export async function fetchStudentClaims(
  studentId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ success: boolean; claims?: any[]; total?: number; error?: string }> {
  try {
    const response = await fetch(`/api/claims?studentId=${studentId}&page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch claims');
    }

    const data = await response.json();
    return {
      success: true,
      claims: data.items,
      total: data.total,
    };
  } catch (error) {
    console.error('[v0] Fetch claims error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Export claims data to CSV
 */
export function exportClaimsToCSV(claims: any[], filename = 'claims-export.csv'): void {
  const headers = ['Claim ID', 'Item Name', 'Status', 'Student Name', 'Created', 'Updated'];
  const rows = claims.map((claim) => [
    claim.id,
    claim.itemName,
    claim.status,
    claim.studentName,
    new Date(claim.createdAt).toLocaleDateString(),
    new Date(claim.updatedAt).toLocaleDateString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
