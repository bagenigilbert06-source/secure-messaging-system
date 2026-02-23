'use client';

import { CheckCircle, Circle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'unread' | 'read' | 'replied';
  className?: string;
  showLabel?: boolean;
}

export function StatusBadge({
  status,
  className,
  showLabel = false,
}: StatusBadgeProps) {
  const statusConfig = {
    unread: {
      icon: Circle,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-950/30',
      borderColor: 'border-teal-200 dark:border-teal-800',
      label: 'Unread',
      ariaLabel: 'Message is unread',
    },
    read: {
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      label: 'Read',
      ariaLabel: 'Message has been read',
    },
    replied: {
      icon: CheckCircle2,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
      label: 'Replied',
      ariaLabel: 'Reply has been sent',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  if (showLabel) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border',
          config.bgColor,
          config.borderColor,
          className
        )}
        role="status"
        aria-label={config.ariaLabel}
      >
        <Icon className={cn('h-3 w-3', config.color)} />
        <span className={cn('text-gray-700 dark:text-gray-300')}>{config.label}</span>
      </div>
    );
  }

  return (
    <div role="status" aria-label={config.ariaLabel} className="flex items-center justify-center">
      <Icon
        className={cn('h-4 w-4', config.color, className)}
        strokeWidth={2.5}
      />
    </div>
  );
}
