'use client';

import React, { useState, useCallback, useMemo, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  Loader,
  User,
  Mail,
  Phone,
  Shield,
  X,
  Copy,
  Filter,
  Inbox,
  MapPin,
  Calendar,
  Tag,
} from 'lucide-react';

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  idNumber?: string;
}

interface ItemInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  dateFound: string;
  imageUrl?: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'student' | 'admin';
  senderName: string;
  timestamp: string;
  readAt?: string;
}

interface ClaimConversation {
  id: string;
  claimId: string;
  studentInfo: StudentInfo;
  itemInfo: ItemInfo;
  status: 'pending' | 'under_review' | 'verified' | 'rejected' | 'collected';
  messages: Message[];
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  referenceNumber?: string;
}

interface AdminClaimConversationsProps {
  conversations?: ClaimConversation[];
  isLoading?: boolean;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
    icon: Clock,
    description: 'Awaiting initial review',
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-orange-500/20 border-orange-500/30 text-orange-300',
    icon: AlertCircle,
    description: 'Verification in progress',
  },
  verified: {
    label: 'Verified',
    color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    icon: CheckCircle2,
    description: 'Ready for collection',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-500/20 border-red-500/30 text-red-300',
    icon: AlertCircle,
    description: 'Could not verify',
  },
  collected: {
    label: 'Collected',
    color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    icon: CheckCircle2,
    description: 'Item handed over',
  },
};

const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function AdminClaimConversations({
  conversations = [],
  isLoading = false,
}: AdminClaimConversationsProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | keyof typeof statusConfig>('all');
  const [replyText, setReplyText] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const matchesSearch =
        conv.studentInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.studentInfo.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.itemInfo.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = filterStatus === 'all' || conv.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [conversations, searchQuery, filterStatus]);

  // Stats
  const stats = useMemo(
    () => ({
      total: conversations.length,
      pending: conversations.filter((c) => c.status === 'pending').length,
      underReview: conversations.filter((c) => c.status === 'under_review').length,
      verified: conversations.filter((c) => c.status === 'verified').length,
      rejected: conversations.filter((c) => c.status === 'rejected').length,
      collected: conversations.filter((c) => c.status === 'collected').length,
      unread: conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    }),
    [conversations]
  );

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);
  const config = selectedConversation ? statusConfig[selectedConversation.status] : null;
  const StatusIcon = config?.icon;

  const handleSendReply = useCallback(async () => {
    if (!selectedConversation || !replyText.trim() || sendingId) return;

    setSendingId(selectedConversation.id);
    try {
      const response = await fetch(`/api/claims/${selectedConversation.claimId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText }),
      });

      if (response.ok) {
        startTransition(() => {
          setReplyText('');
        });
      }
    } catch (error) {
      console.error('[v0] Error sending reply:', error);
    } finally {
      setSendingId(null);
    }
  }, [selectedConversation, replyText, sendingId]);

  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      if (!selectedConversation) return;

      setSendingId(selectedConversation.id);
      try {
        const response = await fetch(`/api/claims/${selectedConversation.claimId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
          console.log('[v0] Status updated to:', newStatus);
        }
      } catch (error) {
        console.error('[v0] Error updating status:', error);
      } finally {
        setSendingId(null);
      }
    },
    [selectedConversation]
  );

  const handleRejectClaim = useCallback(async () => {
    if (!selectedConversation || !rejectionReason.trim()) return;

    setSendingId(selectedConversation.id);
    try {
      const response = await fetch(`/api/claims/${selectedConversation.claimId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          reason: rejectionReason,
          message: `Your claim has been reviewed and unfortunately cannot be verified. Reason: ${rejectionReason}`,
        }),
      });

      if (response.ok) {
        setShowRejectionDialog(false);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('[v0] Error rejecting claim:', error);
    } finally {
      setSendingId(null);
    }
  }, [selectedConversation, rejectionReason]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex gap-4">
      {/* Left Panel - Conversations List */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-96 flex flex-col space-y-4 lg:border-r lg:border-white/10 lg:pr-4"
      >
        {/* Header */}
        <div className="space-y-3">
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-white">Claims Conversations</h2>
            <p className="text-xs lg:text-sm text-white/50">Manage student ownership verification</p>
          </div>

          {/* Stats */}
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total', value: stats.total, icon: Inbox },
              { label: 'Pending', value: stats.pending, icon: Clock },
              { label: 'Verified', value: stats.verified, icon: CheckCircle2 },
            ].map((stat) => {
              const StatIcon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  className="bg-slate-800/40 border border-white/10 rounded-lg p-2.5 text-center"
                >
                  <div className="flex items-center justify-center mb-1">
                    <StatIcon className="w-3.5 h-3.5 text-white/60" />
                  </div>
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/40">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Search and Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search by student or item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-700/30 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'under_review', 'verified', 'rejected', 'collected'] as const).map((status) => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterStatus === status
                      ? 'bg-emerald-500/30 border border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-700/20 border border-white/10 text-white/60 hover:text-white/80'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader className="w-6 h-6 text-white/40 animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-white/20" />
              <p className="text-sm">No conversations found</p>
            </div>
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-2">
              <AnimatePresence>
                {filteredConversations.map((conv) => {
                  const convConfig = statusConfig[conv.status];
                  const ConvStatusIcon = convConfig.icon;
                  const isSelected = selectedConversationId === conv.id;

                  return (
                    <motion.button
                      key={conv.id}
                      variants={fadeInUp}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedConversationId(conv.id)}
                      className={`w-full p-3 rounded-lg border transition-all text-left ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-500/30'
                          : 'bg-slate-800/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-white truncate">{conv.studentInfo.name}</h3>
                          <p className="text-xs text-white/50 truncate">{conv.itemInfo.name}</p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="flex-shrink-0 bg-emerald-500/30 px-2 py-1 rounded-full">
                            <span className="text-xs font-semibold text-emerald-300">{conv.unreadCount}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-semibold ${convConfig.color}`}>
                          <ConvStatusIcon className="w-3 h-3" />
                          {convConfig.label}
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? 'text-emerald-300' : 'text-white/40'
                          }`}
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Right Panel - Conversation Details */}
      {selectedConversation && config && StatusIcon ? (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="hidden lg:flex flex-1 flex-col bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl liquid-glass overflow-hidden"
        >
          {/* Header */}
          <div className="border-b border-white/10 p-4 space-y-4">
            {/* Status and Student Info */}
            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.color}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="text-xs font-semibold">{config.label}</span>
              </div>
              <button onClick={() => setSelectedConversationId(null)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Card */}
            <div className="bg-slate-800/40 border border-white/10 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-white/60" />
                <h3 className="text-sm font-semibold text-white">{selectedConversation.studentInfo.name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-white/60">
                  <Mail className="w-3 h-3 text-white/40" />
                  <span className="truncate">{selectedConversation.studentInfo.email}</span>
                </div>
                {selectedConversation.studentInfo.phone && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Phone className="w-3 h-3 text-white/40" />
                    <span>{selectedConversation.studentInfo.phone}</span>
                  </div>
                )}
                {selectedConversation.studentInfo.idNumber && (
                  <div className="flex items-center gap-2 text-white/60 col-span-2">
                    <Shield className="w-3 h-3 text-white/40" />
                    <span>ID: {selectedConversation.studentInfo.idNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Item Card */}
            <div className="bg-slate-800/40 border border-white/10 rounded-lg p-3 space-y-2">
              <h4 className="text-xs font-semibold text-white/70 uppercase">Item Details</h4>
              <div className="space-y-1 text-xs text-white/70">
                <p>
                  <strong className="text-white">{selectedConversation.itemInfo.name}</strong>
                </p>
                <p className="line-clamp-2">{selectedConversation.itemInfo.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-white/60">
                  <Tag className="w-3 h-3 text-white/40" />
                  {selectedConversation.itemInfo.category}
                </div>
                <div className="flex items-center gap-1 text-white/60">
                  <Calendar className="w-3 h-3 text-white/40" />
                  {selectedConversation.itemInfo.dateFound}
                </div>
                <div className="col-span-2 flex items-center gap-1 text-white/60">
                  <MapPin className="w-3 h-3 text-white/40" />
                  {selectedConversation.itemInfo.location}
                </div>
              </div>
            </div>

            {/* Reference Number (if verified) */}
            {selectedConversation.referenceNumber && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70">Reference Number</p>
                  <p className="text-sm font-mono font-bold text-emerald-300">{selectedConversation.referenceNumber}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => copyToClipboard(selectedConversation.referenceNumber!)}
                  className="text-emerald-300 hover:text-emerald-200"
                >
                  <Copy className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* Rejection Reason */}
            {selectedConversation.status === 'rejected' && selectedConversation.rejectionReason && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-xs text-white/70 mb-1">Rejection Reason</p>
                <p className="text-xs text-red-200">{selectedConversation.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedConversation.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto text-white/20" />
                  <p className="text-sm text-white/60">No messages yet</p>
                </div>
              </div>
            ) : (
              selectedConversation.messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex ${msg.sender === 'admin' ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-xs px-4 py-3 rounded-lg border ${
                      msg.sender === 'admin'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-slate-700/20 border-slate-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-white/70">
                        {msg.sender === 'admin' ? 'You' : msg.senderName}
                      </span>
                      {msg.readAt && msg.sender === 'admin' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <p className="text-sm text-white">{msg.content}</p>
                    <span className="text-xs text-white/40 mt-2 block">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Reply Area */}
          {selectedConversation.status !== 'collected' && selectedConversation.status !== 'rejected' && (
            <div className="border-t border-white/10 p-4 space-y-3 bg-slate-800/20">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response..."
                className="w-full bg-slate-700/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                rows={3}
                disabled={sendingId !== null}
              />
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sendingId !== null}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/30 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send
                </motion.button>
              </div>
            </div>
          )}

          {/* Actions Footer */}
          {selectedConversation.status === 'under_review' && (
            <div className="border-t border-white/10 p-3 grid grid-cols-3 gap-2 bg-slate-800/20">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStatusChange('verified')}
                disabled={sendingId !== null}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/30 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Verify
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRejectionDialog(true)}
                disabled={sendingId !== null}
                className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300 text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Reject
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStatusChange('collected')}
                disabled={sendingId !== null}
                className="bg-slate-600/20 hover:bg-slate-600/30 border border-slate-500/50 text-slate-300 text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Collected
              </motion.button>
            </div>
          )}

          {/* Rejection Dialog */}
          <AnimatePresence>
            {showRejectionDialog && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-card border border-white/10 rounded-xl p-6 max-w-sm space-y-4"
                >
                  <h3 className="text-lg font-bold text-white">Reject Claim</h3>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why the claim cannot be verified..."
                    className="w-full bg-slate-700/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowRejectionDialog(false)}
                      className="flex-1 px-4 py-2 bg-slate-700/30 border border-white/10 rounded-lg text-white font-medium hover:bg-slate-700/50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRejectClaim}
                      disabled={!rejectionReason.trim() || sendingId !== null}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/30 rounded-lg text-white font-medium transition-colors"
                    >
                      Confirm Rejection
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden lg:flex flex-1 items-center justify-center">
          <div className="text-center space-y-3">
            <MessageSquare className="w-12 h-12 mx-auto text-white/20" />
            <div>
              <p className="text-white/60 text-sm font-medium">Select a conversation</p>
              <p className="text-white/40 text-xs">Click on a claim to view the conversation</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
