'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface ValidationFeedbackProps {
  error?: string;
  success?: string;
  info?: string;
  suggestion?: string;
  className?: string;
}

export function ValidationFeedback({
  error,
  success,
  info,
  suggestion,
  className = '',
}: ValidationFeedbackProps) {
  const message = error || success || info;

  if (!message) return null;

  const isError = !!error;
  const isSuccess = !!success;
  const isInfo = !!info;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className={`flex items-start gap-2 text-sm ${className}`}
      >
        {isError && (
          <>
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-red-600 font-medium">{message}</span>
              {suggestion && (
                <span className="text-red-500 text-xs">{suggestion}</span>
              )}
            </div>
          </>
        )}

        {isSuccess && (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span className="text-emerald-600 font-medium">{message}</span>
          </>
        )}

        {isInfo && !isError && (
          <>
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span className="text-blue-600 text-xs">{message}</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  className = '',
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  // Calculate strength score (Google-style simplified)
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lengthBonus: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  if (checks.length) score++;
  if (checks.lengthBonus) score++;
  if (checks.uppercase) score++;
  if (checks.lowercase) score++;
  if (checks.number) score++;
  if (checks.special) score++;

  // Determine strength level
  let strengthLabel = 'Weak';
  let strengthColor = 'from-red-500 to-red-600';
  let strengthPercent = 25;

  if (score >= 2) {
    strengthLabel = 'Fair';
    strengthColor = 'from-orange-500 to-orange-600';
    strengthPercent = 50;
  }
  if (score >= 4) {
    strengthLabel = 'Good';
    strengthColor = 'from-yellow-500 to-yellow-600';
    strengthPercent = 75;
  }
  if (score >= 5) {
    strengthLabel = 'Strong';
    strengthColor = 'from-emerald-500 to-emerald-600';
    strengthPercent = 100;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-3 rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm ${className}`}
    >
      {/* Strength Meter */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white/60">Password strength</span>
        <span className={`text-xs font-semibold ${
          score >= 5 ? 'text-emerald-400' :
          score >= 4 ? 'text-yellow-400' :
          score >= 2 ? 'text-orange-400' :
          'text-red-400'
        }`}>
          {strengthLabel}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full bg-gradient-to-r ${strengthColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${strengthPercent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Tips - Show missing items only when password is weak/fair */}
      {score < 5 && (
        <div className="space-y-1.5">
          <p className="text-xs text-white/50 font-medium">Tips for stronger password:</p>
          <div className="space-y-1 text-xs text-white/60">
            {!checks.length && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/40" />
                <span>Use at least 8 characters</span>
              </div>
            )}
            {checks.length && !checks.lengthBonus && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/40" />
                <span>12+ characters makes it even stronger</span>
              </div>
            )}
            {!checks.uppercase && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/40" />
                <span>Add an uppercase letter (A-Z)</span>
              </div>
            )}
            {!checks.lowercase && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/40" />
                <span>Add a lowercase letter (a-z)</span>
              </div>
            )}
            {!checks.number && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/40" />
                <span>Add a number (0-9)</span>
              </div>
            )}
            {!checks.special && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/40" />
                <span>Add a symbol (!@#$%^&*)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success message for strong passwords */}
      {score >= 5 && (
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Great password! You can proceed.</span>
        </div>
      )}
    </motion.div>
  );
}

interface FormSectionErrorProps {
  title: string;
  children: React.ReactNode;
}

export function FormSectionError({ title, children }: FormSectionErrorProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-900 mb-3">{title}</p>
      <div className="space-y-2 text-sm text-red-800">{children}</div>
    </div>
  );
}
