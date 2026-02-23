'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ChevronRight } from 'lucide-react';

interface InquiryCardProps {
  id: string;
  itemName: string;
  message: string;
  status: 'pending' | 'replied' | 'resolved';
  createdAt: string;
  repliesCount: number;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

const statusConfig = {
  pending: {
    badge: 'bg-amber-500/20 text-amber-700',
    label: 'Pending',
  },
  replied: {
    badge: 'bg-blue-500/20 text-blue-700',
    label: 'Replied',
  },
  resolved: {
    badge: 'bg-emerald-500/20 text-emerald-700',
    label: 'Resolved',
  },
};

const InquiryCard = memo(function InquiryCard({
  id,
  itemName,
  message,
  status,
  createdAt,
  repliesCount,
  isSelected,
  onClick,
  index,
}: InquiryCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <motion.button
      key={id}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 inquiry-card ${
        isSelected ? 'bg-slate-100 dark:bg-slate-800' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{itemName}</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
            {message}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className={`inline-block px-2 py-1 rounded-full ${statusInfo.badge}`}>
              {statusInfo.label}
            </span>
            <span>{new Date(createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {repliesCount} replies
            </span>
          </div>
        </div>
        <ChevronRight
          className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
            isSelected ? 'rotate-90' : ''
          }`}
        />
      </div>
    </motion.button>
  );
});

export default InquiryCard;
