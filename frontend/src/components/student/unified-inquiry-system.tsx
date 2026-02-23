'use client';

import React, { useState, useCallback, useMemo, useTransition, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  X,
  ChevronRight,
  Loader,
  Inbox,
  Plus,
  Paperclip,
  EyeOff,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  content: string;
  sender: 'student' | 'admin';
  senderName: string;
  timestamp: string;
  readAt?: string;
  attachments?: string[];
}

interface ItemClaim {
  id: string;
  itemId: string;
  itemName: string;
  itemDescription?: string;
  category?: string;
  location?: string;
  dateFound?: string;
  imageUrl?: string;
  status: 'pending' | 'under_review' | 'verified' | 'rejected' | 'collected';
  messages: Message[];
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  verificationQuestions?: Array<{
    id: string;
    question: string;
    answer?: string;
    status: 'pending' | 'answered' | 'satisfied' | 'unsatisfied';
  }>;
}

interface UnifiedInquirySystemProps {
  studentId: string;
  studentName: string;
  initialClaims?: ItemClaim[];
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
    icon: Clock,
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-orange-500/20 border-orange-500/30 text-orange-300',
    icon: AlertCircle,
  },
  verified: {
    label: 'Verified',
    color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-500/20 border-red-500/30 text-red-300',
    icon: AlertCircle,
  },
  collected: {
    label: 'Collected',
    color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    icon: CheckCircle2,
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
  transition: { duration: 0.3 },
};

export default function UnifiedInquirySystem({
  studentId,
  studentName,
  initialClaims = [],
}: UnifiedInquirySystemProps) {
  const [claims, setClaims] = useState<ItemClaim[]>(initialClaims);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | keyof typeof statusConfig>('all');
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [markUnread, setMarkUnread] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  useEffect(() => {
    if (claims.length === 0 && initialClaims?.length === 0) {
      const fetchClaims = async () => {
        try {
          const response = await fetch(`/api/student/${studentId}/claims`);
          if (response.ok) {
            const data = await response.json();
            const transformedClaims = (data.items || []).map((claim: any) => ({
              id: claim.id,
              itemId: claim.item_id,
              itemName: claim.item?.name || claim.item_name || 'Unknown Item',
              itemDescription: claim.item?.description || claim.item_description || '',
              category: claim.item?.category || claim.category || '',
              location: claim.item?.location_found || claim.location || '',
              dateFound: claim.item?.date_found || claim.date_found || '',
              imageUrl: claim.item?.image_url || claim.image_url || '',
              status: claim.status || 'pending',
              messages: claim.messages || [],
              unreadCount: claim.unread_count || 0,
              createdAt: claim.created_at || new Date().toISOString(),
              updatedAt: claim.updated_at || new Date().toISOString(),
              rejectionReason: claim.rejection_reason || undefined,
              verificationQuestions: claim.verification_questions || [],
            }));
            setClaims(transformedClaims);
          }
        } catch (error) {
          console.error('[v0] Error fetching claims:', error);
        }
      };
      fetchClaims();
    } else if (initialClaims && initialClaims.length > 0) {
      setClaims(initialClaims);
    }
  }, [studentId]);

  const selectedClaim = useMemo(() => claims.find((c) => c.id === selectedClaimId), [claims, selectedClaimId]);

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesSearch =
        claim.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.itemDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = filterStatus === 'all' || claim.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [claims, searchQuery, filterStatus]);

  const stats = useMemo(
    () => ({
      total: claims.length,
      pending: claims.filter((c) => c.status === 'pending').length,
      underReview: claims.filter((c) => c.status === 'under_review').length,
      verified: claims.filter((c) => c.status === 'verified').length,
      rejected: claims.filter((c) => c.status === 'rejected').length,
      unread: claims.reduce((sum, c) => sum + c.unreadCount, 0),
    }),
    [claims]
  );

  const handleSendReply = useCallback(async () => {
    if (!selectedClaim || !replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const response = await fetch(`/api/claims/${selectedClaim.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyText,
          sender: 'student',
          senderName: studentName,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        startTransition(() => {
          setClaims((prev) =>
            prev.map((c) =>
              c.id === selectedClaim.id
                ? {
                    ...c,
                    messages: [...c.messages, newMessage],
                    updatedAt: new Date().toISOString(),
                  }
                : c
            )
          );
          setReplyText('');
        });
      }
    } catch (error) {
      console.error('[v0] Error sending reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  }, [selectedClaim, replyText, studentName]);

  const handleMarkAsRead = useCallback(async () => {
    if (!selectedClaim) return;

    try {
      await fetch(`/api/claims/${selectedClaim.id}/mark-read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      startTransition(() => {
        setClaims((prev) =>
          prev.map((c) =>
            c.id === selectedClaim.id ? { ...c, unreadCount: 0 } : c
          )
        );
      });
    } catch (error) {
      console.error('[v0] Error marking as read:', error);
    }
  }, [selectedClaim]);

  return (
    <div className="min-h-screen bg-background text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Premium Design */}
        <motion.div variants={fadeInUp} className="mb-8">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-white/[0.02] blur-2xl pointer-events-none" />
            <div className="liquid-glass p-8 md:p-12 rounded-3xl border border-emerald-500/20 relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/40 to-teal-500/20 flex items-center justify-center border border-emerald-400/30">
                  <MessageSquare className="w-6 h-6 text-emerald-300" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-3 text-gradient">My Claims</h1>
              <p className="text-lg text-white/70 font-light">Manage your lost items and communicate with our support team</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid - Premium Cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8"
        >
          {[
            { label: 'Total', value: stats.total, color: 'text-white', icon: Inbox },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-300', icon: Clock },
            { label: 'Reviewing', value: stats.underReview, color: 'text-orange-300', icon: AlertCircle },
            { label: 'Verified', value: stats.verified, color: 'text-emerald-300', icon: CheckCircle2 },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-300', icon: AlertCircle },
            { label: 'Unread', value: stats.unread, color: 'text-cyan-300', icon: MessageSquare },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={`stat-${idx}`}
                variants={fadeInUp}
                whileHover={{ y: -6, scale: 1.03 }}
                className="liquid-glass p-4 md:p-5 rounded-2xl border border-white/10 hover:border-emerald-400/40 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 flex items-center justify-center group-hover:from-emerald-500/50 group-hover:to-emerald-500/20 transition-all">
                    <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-xs text-white/60 font-semibold uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content Area */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Panel - Claims List */}
          <motion.div variants={fadeInUp} className="md:col-span-1">
            <div className="liquid-glass rounded-3xl border border-white/10 h-full flex flex-col overflow-hidden">
              {/* Search Bar */}
              <div className="p-4 md:p-6 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                  <Input
                    placeholder="Search claims..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:bg-white/10 focus:border-emerald-400/50"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mt-4 overflow-x-hidden">
                  {['all', 'pending', 'under_review', 'verified', 'rejected'].map((status) => (
                    <motion.button
                      key={status}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilterStatus(status as any)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                        filterStatus === status
                          ? 'bg-emerald-500/25 border border-emerald-400/50 text-emerald-200'
                          : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {status === 'all' ? 'All' : status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Claims List */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2">
                {filteredClaims.length === 0 ? (
                  <motion.div variants={fadeInUp} className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                      <MessageSquare className="w-6 h-6 text-white/30" />
                    </div>
                    <p className="text-white/50 text-sm">No claims found</p>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {filteredClaims.map((claim) => {
                      const isSelected = claim.id === selectedClaimId;
                      return (
                        <motion.button
                          key={claim.id}
                          variants={fadeInUp}
                          whileHover={{ scale: 1.02, x: 4 }}
                          onClick={() => {
                            setSelectedClaimId(claim.id);
                            setIsMobileDetailOpen(true);
                            if (claim.unreadCount > 0) handleMarkAsRead();
                          }}
                          className={`w-full text-left p-4 rounded-xl transition-all ${
                            isSelected
                              ? 'bg-emerald-500/20 border border-emerald-400/50 shadow-lg shadow-emerald-500/10'
                              : 'bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-emerald-400/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              claim.unreadCount > 0 ? 'bg-emerald-400' : 'bg-white/20'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white truncate text-sm">{claim.itemName}</h3>
                              <p className="text-xs text-white/50 truncate mt-1">{claim.itemDescription}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusConfig[claim.status]?.color}`}>
                                  {statusConfig[claim.status]?.label}
                                </span>
                                {claim.unreadCount > 0 && (
                                  <span className="text-xs bg-emerald-500/40 text-emerald-200 px-2 py-1 rounded-full font-bold">
                                    {claim.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Details & Messages */}
          <motion.div variants={fadeInUp} className={`md:col-span-2 ${isMobileDetailOpen ? 'block' : 'hidden md:block'}`}>
            {selectedClaim ? (
              <div className="liquid-glass rounded-3xl border border-white/10 h-full flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1">{selectedClaim.itemName}</h2>
                    <p className="text-sm text-white/60">Claim #{selectedClaim.id.slice(0, 8)}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMobileDetailOpen(false)}
                    className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Info Grid */}
                <div className="p-6 md:p-8 border-b border-white/10 grid grid-cols-2 gap-4">
                  {selectedClaim.category && (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Category</p>
                      <p className="font-semibold text-emerald-300">{selectedClaim.category}</p>
                    </div>
                  )}
                  {selectedClaim.location && (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Location</p>
                      <p className="font-semibold text-white">{selectedClaim.location}</p>
                    </div>
                  )}
                  {selectedClaim.dateFound && (
                    <div className="col-span-2 bg-white/5 rounded-xl p-3 border border-white/10">
                      <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Date Found</p>
                      <p className="font-semibold text-white">{selectedClaim.dateFound}</p>
                    </div>
                  )}
                  {selectedClaim.itemDescription && (
                    <div className="col-span-2 bg-white/5 rounded-xl p-3 border border-white/10">
                      <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Description</p>
                      <p className="text-sm text-white">{selectedClaim.itemDescription}</p>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="p-6 md:p-8 border-b border-white/10">
                  <div className={`inline-block px-4 py-2 rounded-full font-bold text-sm ${statusConfig[selectedClaim.status]?.color}`}>
                    {statusConfig[selectedClaim.status]?.label}
                  </div>
                  {selectedClaim.status === 'rejected' && selectedClaim.rejectionReason && (
                    <div className="mt-4 p-4 rounded-xl bg-red-500/15 border border-red-500/30">
                      <p className="text-sm text-red-200"><strong>Reason:</strong> {selectedClaim.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-3">
                  {selectedClaim.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="w-8 h-8 text-white/20 mb-2" />
                      <p className="text-white/50 text-sm">No messages yet</p>
                    </div>
                  ) : (
                    selectedClaim.messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg ${
                          msg.sender === 'student'
                            ? 'bg-emerald-500/15 border border-emerald-400/30 mr-8'
                            : 'bg-white/5 border border-white/10 ml-8'
                        }`}
                      >
                        <p className="text-xs text-white/60 mb-1 font-semibold">{msg.senderName}</p>
                        <p className="text-sm text-white">{msg.content}</p>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Input */}
                <div className="p-6 md:p-8 border-t border-white/10">
                  {selectedClaim.status !== 'collected' && selectedClaim.status !== 'rejected' && (
                    <div className="flex gap-3">
                      <Textarea
                        placeholder="Send a message..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-lg text-sm h-20 resize-none focus:bg-white/10 focus:border-emerald-400/50"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || isSubmittingReply}
                        className="px-5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-semibold transition-all"
                      >
                        {isSubmittingReply ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <motion.div
                variants={fadeInUp}
                className="liquid-glass rounded-3xl border border-white/10 h-full flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-lg font-semibold text-white/60">Select a claim to view details</p>
                  <p className="text-sm text-white/40 mt-1">Start messaging with the support team</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.15);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.3);
        }
      `}</style>
    </div>
  );
}
