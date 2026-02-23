// Claim Message Utilities

export interface ClaimMessage {
  id: string;
  claimId: string;
  content: string;
  sender: 'student' | 'admin';
  senderName: string;
  timestamp: string;
  readAt?: string;
}

export interface ClaimConversation {
  id: string;
  itemId: string;
  studentId: string;
  status: 'pending' | 'under_review' | 'verified' | 'rejected' | 'collected';
  messages: ClaimMessage[];
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

// Format message timestamp
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

// Get unread message count
export const getUnreadCount = (messages: ClaimMessage[], userId: string): number => {
  return messages.filter((msg) => msg.sender !== 'student' && !msg.readAt).length;
};

// Sort messages by timestamp
export const sortMessages = (messages: ClaimMessage[]): ClaimMessage[] => {
  return [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
};

// Group messages by date
export const groupMessagesByDate = (
  messages: ClaimMessage[]
): Record<string, ClaimMessage[]> => {
  const grouped: Record<string, ClaimMessage[]> = {};

  messages.forEach((msg) => {
    const date = new Date(msg.timestamp).toDateString();
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(msg);
  });

  return grouped;
};

// Check if student can edit/delete message
export const canEditMessage = (message: ClaimMessage, userId: string, status: string): boolean => {
  // Students cannot edit/delete messages
  if (message.sender === 'student') {
    return false;
  }

  // Only within certain statuses
  if (['rejected', 'collected'].includes(status)) {
    return false;
  }

  return true;
};

// Generate claim status label
export const getClaimStatusLabel = (
  status: 'pending' | 'under_review' | 'verified' | 'rejected' | 'collected'
): string => {
  const labels = {
    pending: 'Pending Verification',
    under_review: 'Under Review',
    verified: 'Verified & Approved',
    rejected: 'Rejected',
    collected: 'Item Collected',
  };
  return labels[status];
};

// Check if conversation is active
export const isConversationActive = (
  status: 'pending' | 'under_review' | 'verified' | 'rejected' | 'collected'
): boolean => {
  return !['rejected', 'collected'].includes(status);
};

// Format claim for display
export const formatClaimForDisplay = (claim: ClaimConversation) => {
  const lastMessage = claim.messages[claim.messages.length - 1];
  const unreadCount = getUnreadCount(claim.messages, '');

  return {
    ...claim,
    lastMessage,
    unreadCount,
    lastMessageTime: lastMessage ? formatMessageTime(lastMessage.timestamp) : '',
  };
};

// Validate message content
export const validateMessageContent = (content: string): { valid: boolean; error?: string } => {
  if (!content || !content.trim()) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (content.trim().length > 5000) {
    return { valid: false, error: 'Message cannot exceed 5000 characters' };
  }

  return { valid: true };
};

// Create automatic rejection message
export const createRejectionNotification = (reason: string): string => {
  return `Your claim has been reviewed and unfortunately cannot be verified. Reason: ${reason}. If you believe this is an error, please contact the Security Office.`;
};

// Create verification approved message
export const createVerificationApprovedMessage = (referenceNumber?: string): string => {
  let message = 'Your claim has been verified and approved! You can now collect your item.';
  if (referenceNumber) {
    message += ` Reference number: ${referenceNumber}`;
  }
  return message;
};

// Create generic notification templates
export const notificationTemplates = {
  claimSubmitted: 'Your claim has been submitted for verification. You will hear from us shortly.',
  claimUnderReview: 'Your claim is currently under review. We may need additional information.',
  verificationQuestion: 'We need some additional information to verify ownership of this item.',
  claimApproved:
    'Congratulations! Your claim has been verified. Your item is ready for collection.',
  claimRejected: 'Unfortunately, we were unable to verify your claim. Please contact the Security Office for details.',
  itemCollected: 'Item has been marked as collected. Thank you for using our service.',
};

// Export all utilities as a namespace
export const ClaimMessageUtils = {
  formatMessageTime,
  getUnreadCount,
  sortMessages,
  groupMessagesByDate,
  canEditMessage,
  getClaimStatusLabel,
  isConversationActive,
  formatClaimForDisplay,
  validateMessageContent,
  createRejectionNotification,
  createVerificationApprovedMessage,
  notificationTemplates,
};
