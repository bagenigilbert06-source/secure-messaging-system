/**
 * Auth Validation Utilities
 * Provides client-side validation for auth fields with detailed error messages
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

export interface FormErrors {
  fullName?: string;
  email?: string;
  signupEmail?: string;
  signinEmail?: string;
  password?: string;
  signupPassword?: string;
  confirmPassword?: string;
  phone?: string;
  studentId?: string;
  campus?: string;
  signinPassword?: string;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (!email.toLowerCase().endsWith('@zetech.ac.ke')) {
    return {
      isValid: false,
      error: 'Only @zetech.ac.ke email addresses are allowed',
      suggestion: 'Make sure you\'re using your university email',
    };
  }

  return { isValid: true };
};

// Password validation - Google-style (simple & user-friendly)
// Only requires minimum length, encourages complexity but doesn't enforce it
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
      suggestion: 'Use a mix of letters, numbers, and symbols for better security',
    };
  }

  // Password is valid with just 8+ characters
  // Strength indicators are shown in the UI for user awareness
  return { isValid: true };
};

// Confirm password validation
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
};

// Full name validation
export const validateFullName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Full name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (name.trim().length > 100) {
    return {
      isValid: false,
      error: 'Name must be less than 100 characters',
    };
  }

  return { isValid: true };
};

// Phone number validation (Kenyan format)
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Accept various Kenyan phone formats
  const phoneRegex = /^(\+254|0)?[17][0-9]{8}$/;
  const cleanPhone = phone.replace(/\s+/g, '');

  if (!phoneRegex.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Please enter a valid Kenyan phone number',
      suggestion: 'Format: +254712345678 or 0712345678',
    };
  }

  return { isValid: true };
};

// Student ID validation (format: CODE-LEVEL-NUMBER/YEAR)
export const validateStudentId = (studentId: string): ValidationResult => {
  if (!studentId) {
    return { isValid: false, error: 'Student ID is required' };
  }

  // Format: BIT-01-1234/2024
  const studentIdRegex = /^[A-Z]{2,4}-\d{2}-\d{3,4}\/\d{4}$/i;

  if (!studentIdRegex.test(studentId.toUpperCase())) {
    return {
      isValid: false,
      error: 'Invalid student ID format',
      suggestion: 'Format: BIT-01-1234/2024',
    };
  }

  return { isValid: true };
};

// Campus selection validation
export const validateCampus = (campus: string): ValidationResult => {
  if (!campus) {
    return { isValid: false, error: 'Please select a campus' };
  }

  return { isValid: true };
};

// Get password strength (for UI feedback - Google-style simplified)
export const getPasswordStrength = (
  password: string
): { strength: 'weak' | 'fair' | 'good' | 'strong'; percent: number; description: string } => {
  // Base: 8 characters = fair password
  if (password.length < 8) {
    return { strength: 'weak', percent: 25, description: 'Too short' };
  }

  let score = 0;
  const checks = [
    { test: /[A-Z]/.test(password), weight: 1 }, // uppercase
    { test: /[a-z]/.test(password), weight: 1 }, // lowercase
    { test: /\d/.test(password), weight: 1 }, // number
    { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), weight: 1 }, // special
  ];

  checks.forEach(({ test }) => {
    if (test) score++;
  });

  // Add length bonus
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  if (score <= 1) return { strength: 'weak', percent: 35, description: 'Weak' };
  if (score <= 3) return { strength: 'fair', percent: 55, description: 'Fair' };
  if (score <= 4) return { strength: 'good', percent: 75, description: 'Good' };
  return { strength: 'strong', percent: 100, description: 'Strong' };
};
