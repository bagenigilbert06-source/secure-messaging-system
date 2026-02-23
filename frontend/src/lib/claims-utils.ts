/**
 * Claims Management Utilities
 * Handles verification workflows, status transitions, and audit logging
 */

import { AuditEntry, VerificationQuestion, ReleaseInfo } from '@/components/admin/inquiries-panel';

/**
 * Verification Status Constants
 */
export const VERIFICATION_STATUS = {
  PENDING: 'pending' as const,
  IN_PROGRESS: 'in-progress' as const,
  VERIFIED: 'verified' as const,
  REJECTED: 'rejected' as const,
} as const;

/**
 * Claim Status Workflow
 * Defines the valid status transitions
 */
export const CLAIM_STATUS = {
  PENDING: 'pending' as const,
  AWAITING_VERIFICATION: 'awaiting-verification' as const,
  VERIFIED: 'verified' as const,
  RELEASE_AUTHORIZED: 'release-authorized' as const,
  RELEASED: 'released' as const,
  REJECTED: 'rejected' as const,
} as const;

/**
 * Valid status transitions
 * Maps current status to allowed next statuses
 */
export const VALID_TRANSITIONS: Record<string, string[]> = {
  [CLAIM_STATUS.PENDING]: [
    CLAIM_STATUS.AWAITING_VERIFICATION,
    CLAIM_STATUS.REJECTED,
  ],
  [CLAIM_STATUS.AWAITING_VERIFICATION]: [
    CLAIM_STATUS.VERIFIED,
    CLAIM_STATUS.REJECTED,
    CLAIM_STATUS.PENDING, // Allow going back for more questions
  ],
  [CLAIM_STATUS.VERIFIED]: [
    CLAIM_STATUS.RELEASE_AUTHORIZED,
    CLAIM_STATUS.REJECTED,
  ],
  [CLAIM_STATUS.RELEASE_AUTHORIZED]: [
    CLAIM_STATUS.RELEASED,
    CLAIM_STATUS.PENDING, // Allow going back if needed
  ],
  [CLAIM_STATUS.RELEASED]: [
    // Terminal state - no transitions
  ],
  [CLAIM_STATUS.REJECTED]: [
    CLAIM_STATUS.PENDING, // Allow resubmission
  ],
};

/**
 * Check if a status transition is valid
 */
export function isValidTransition(currentStatus: string, newStatus: string): boolean {
  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}

/**
 * Verification Question Templates
 * Pre-defined questions for common scenarios
 */
export const VERIFICATION_TEMPLATES = {
  SERIAL_NUMBER: {
    id: 'tpl-serial',
    question: 'What is the serial number of your device?',
    category: 'identification',
  },
  DISTINCTIVE_FEATURES: {
    id: 'tpl-features',
    question: 'Describe any distinctive marks, scratches, or damage you expect to see on the item.',
    category: 'identification',
  },
  PURCHASE_DETAILS: {
    id: 'tpl-purchase',
    question: 'Where did you purchase this item? Do you have a receipt or proof of purchase?',
    category: 'ownership',
  },
  LOCK_SCREEN: {
    id: 'tpl-lock',
    question: 'Can you confirm the lock screen password or unlock method for this device?',
    category: 'ownership',
  },
  CONDITION: {
    id: 'tpl-condition',
    question: 'What condition was the item in when you found it? Any damage or wear visible?',
    category: 'verification',
  },
} as const;

/**
 * Create a new verification question
 */
export function createVerificationQuestion(
  question: string,
  id?: string
): VerificationQuestion {
  return {
    id: id || `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    question,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate pickup reference number
 */
export function generateReferenceNumber(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `REF-${timestamp}-${random}`;
}

/**
 * Create audit trail entry
 */
export function createAuditEntry(
  action: string,
  performedBy: string,
  details?: string,
  previousValue?: string,
  newValue?: string
): AuditEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    action,
    performedBy,
    timestamp: new Date().toISOString(),
    details,
    previousValue,
    newValue,
  };
}

/**
 * Verification Response Validator
 * Validates student responses to verification questions
 */
export const VALIDATION_RULES = {
  SERIAL_NUMBER: {
    minLength: 5,
    maxLength: 50,
    pattern: /^[A-Za-z0-9\-\_]+$/,
    description: 'Serial number should be 5-50 alphanumeric characters',
  },
  DISTINCTIVE_FEATURES: {
    minLength: 20,
    maxLength: 500,
    description: 'Please provide detailed description (20-500 characters)',
  },
  PURCHASE_DETAILS: {
    minLength: 10,
    maxLength: 300,
    description: 'Provide store/website name and approximate purchase date',
  },
} as const;

/**
 * Validate a verification response
 */
export function validateResponse(
  question: string,
  answer: string
): { valid: boolean; error?: string } {
  if (!answer || answer.trim().length === 0) {
    return { valid: false, error: 'Response cannot be empty' };
  }

  // Check question type and apply rules
  if (question.toLowerCase().includes('serial')) {
    const rule = VALIDATION_RULES.SERIAL_NUMBER;
    if (answer.length < rule.minLength || answer.length > rule.maxLength) {
      return { valid: false, error: rule.description };
    }
    if (!rule.pattern.test(answer)) {
      return { valid: false, error: 'Invalid serial number format' };
    }
  }

  if (question.toLowerCase().includes('distinctive') || question.toLowerCase().includes('describe')) {
    const rule = VALIDATION_RULES.DISTINCTIVE_FEATURES;
    if (answer.length < rule.minLength || answer.length > rule.maxLength) {
      return { valid: false, error: rule.description };
    }
  }

  if (question.toLowerCase().includes('purchase') || question.toLowerCase().includes('receipt')) {
    const rule = VALIDATION_RULES.PURCHASE_DETAILS;
    if (answer.length < rule.minLength || answer.length > rule.maxLength) {
      return { valid: false, error: rule.description };
    }
  }

  return { valid: true };
}

/**
 * Status descriptions for UI
 */
export const STATUS_DESCRIPTIONS: Record<string, string> = {
  [CLAIM_STATUS.PENDING]: 'Claim submitted, awaiting initial review',
  [CLAIM_STATUS.AWAITING_VERIFICATION]: 'Verification questions sent to student',
  [CLAIM_STATUS.VERIFIED]: 'Ownership successfully verified',
  [CLAIM_STATUS.RELEASE_AUTHORIZED]: 'Ready for pickup or delivery',
  [CLAIM_STATUS.RELEASED]: 'Item handed over to student',
  [CLAIM_STATUS.REJECTED]: 'Claim could not be verified',
};

/**
 * Notification templates for different claim events
 */
export const NOTIFICATION_TEMPLATES = {
  CLAIM_RECEIVED: {
    subject: 'Claim Received - [ITEM_NAME]',
    body: 'Thank you for submitting your claim for [ITEM_NAME]. We have received it and will review it shortly.',
  },
  VERIFICATION_QUESTIONS: {
    subject: 'Verification Required - [ITEM_NAME]',
    body: 'We need some additional information to verify your claim. Please respond to our questions as soon as possible.',
  },
  CLAIM_VERIFIED: {
    subject: 'Claim Verified - [ITEM_NAME]',
    body: 'Congratulations! Your claim for [ITEM_NAME] has been verified. Your item is ready for pickup.',
  },
  CLAIM_REJECTED: {
    subject: 'Claim Status Update - [ITEM_NAME]',
    body: 'Unfortunately, we were unable to verify your claim for [ITEM_NAME]. [REASON]',
  },
  READY_FOR_PICKUP: {
    subject: 'Item Ready for Pickup - [ITEM_NAME]',
    body: 'Your item is ready for pickup! Reference: [REF_NUMBER]. [INSTRUCTIONS]',
  },
} as const;

/**
 * Generate pickup instructions text
 */
export function generatePickupInstructions(options: {
  location?: string;
  hours?: string;
  contactInfo?: string;
  additionalNotes?: string;
}): string {
  const lines = [];
  
  if (options.location) {
    lines.push(`Pickup Location: ${options.location}`);
  }
  
  if (options.hours) {
    lines.push(`Office Hours: ${options.hours}`);
  }
  
  if (options.contactInfo) {
    lines.push(`Contact: ${options.contactInfo}`);
  }
  
  lines.push('Please bring your valid student ID.');
  
  if (options.additionalNotes) {
    lines.push(`\nAdditional Information: ${options.additionalNotes}`);
  }
  
  return lines.join('\n');
}

/**
 * Calculate claim metrics for reporting
 */
export interface ClaimMetrics {
  totalClaims: number;
  pendingClaims: number;
  awaitingVerificationClaims: number;
  verifiedClaims: number;
  releaseAuthorizedClaims: number;
  releasedClaims: number;
  rejectedClaims: number;
  averageVerificationTime: number; // in hours
  verificationSuccessRate: number; // percentage
}

/**
 * Calculate verification time in hours
 */
export function calculateVerificationTime(
  submittedAt: string,
  verifiedAt: string
): number {
  const submitted = new Date(submittedAt).getTime();
  const verified = new Date(verifiedAt).getTime();
  return Math.round((verified - submitted) / (1000 * 60 * 60) * 10) / 10;
}

/**
 * Export audit trail as CSV
 */
export function exportAuditTrailCSV(auditTrail: AuditEntry[]): string {
  const headers = ['Timestamp', 'Action', 'Performed By', 'Details'];
  const rows = auditTrail.map(entry => [
    new Date(entry.timestamp).toLocaleString(),
    entry.action,
    entry.performedBy,
    entry.details || '',
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
  
  return csvContent;
}

/**
 * Download audit trail as file
 */
export function downloadAuditTrail(
  auditTrail: AuditEntry[],
  claimId: string
): void {
  const csv = exportAuditTrailCSV(auditTrail);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `claim-${claimId}-audit.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
}
