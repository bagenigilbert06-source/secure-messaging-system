'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Tag,
  User,
  FileText,
  Lock,
  Shield,
  ChevronLeft,
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'student' | 'admin';
  senderName: string;
  timestamp: string;
  readAt?: string;
}

interface ClaimItem {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  dateFound: string;
  imageUrl?: string;
  itemNumber?: string;
}

interface ClaimConversationThreadProps {
  claimId: string;
  itemId: string;
  item: ClaimItem;
  status: 'pending' | 'under_review' | 'verified' | 'rejected' | 'collected';
  messages: Message[];
  studentId: string;
  studentName: string;
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  isLoading?: boolean;
  rejectionReason?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending Verification',
    color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
    icon: Clock,
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-orange-500/20 border-orange-500/30 text-orange-300',
    icon: AlertCircle,
  },
  verified: {
    label: 'Verified & Approved',
    color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-500/20 border-red-500/30 text-red-300',
    icon: AlertCircle,
  },
  collected: {
    label: 'Item Collected',
    color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    icon: CheckCircle2,
  },
};

export default function ClaimConversationThread({
  claimId,
  itemId,
  item,
  status,
  messages,
  studentId,
  studentName,
  onSendMessage,
  onBack,
  isLoading = false,
  rejectionReason,
}: ClaimConversationThreadProps) {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim() && !isLoading) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="h-full flex flex-col bg-card rounded-2xl liquid-glass overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-white/10 p-4 md:p-6 space-y-4">
        {/* Back Button & Status */}
        <div className="flex items-center gap-3 justify-between">
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </motion.button>
          )}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.color}`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-xs font-semibold">{config.label}</span>
          </div>
        </div>

        {/* Item Summary Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover border border-white/10"
              />
            )}
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">{item.name}</h3>
              <p className="text-xs text-white/50 line-clamp-2">{item.description}</p>
            </div>
          </div>

          {/* Item Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-white/60">
              <Tag className="w-3 h-3 text-white/40" />
              <span>{item.category}</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Calendar className="w-3 h-3 text-white/40" />
              <span>{item.dateFound}</span>
            </div>
            <div className="col-span-2 flex items-center gap-2 text-white/60">
              <MapPin className="w-3 h-3 text-white/40" />
              <span>{item.location}</span>
            </div>
          </div>
        </div>

        {/* Rejection Notice */}
        {status === 'rejected' && rejectionReason && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 space-y-2"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-semibold text-red-300">Claim Not Verified</span>
            </div>
            <p className="text-xs text-red-200/80">{rejectionReason}</p>
          </motion.div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-3"
            >
              <MessageCircle className="w-12 h-12 text-white/20" />
              <div>
                <p className="text-sm font-medium text-white/60">No messages yet</p>
                <p className="text-xs text-white/40">Start the conversation below</p>
              </div>
            </motion.div>
          ) : (
            messages.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex ${message.sender === 'admin' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg border ${
                    message.sender === 'admin'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                      : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-white/70">
                      {message.sender === 'admin' ? 'Security Office' : 'You'}
                    </span>
                    {message.readAt && message.sender === 'student' && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <span className="text-xs text-white/40 mt-2 block">
                    {new Date(message.timestamp).toLocaleDateString()} {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {status !== 'collected' && status !== 'rejected' && (
        <div className="border-t border-white/10 p-4 md:p-6 space-y-3 bg-white/[0.03]">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            rows={3}
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isLoading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/30 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Sending...' : 'Send Message'}
          </motion.button>
        </div>
      )}

      {/* Status Message for Completed Claims */}
      {(status === 'collected' || status === 'rejected') && (
        <div className="border-t border-white/10 p-4 md:p-6 text-center text-sm text-white/60">
          {status === 'collected' ? (
            'Item has been collected. Conversation closed.'
          ) : (
            'Claim was not verified. Contact Security Office for more information.'
          )}
        </div>
      )}
    </motion.div>
  );
}

import { MessageCircle } from 'lucide-react';
