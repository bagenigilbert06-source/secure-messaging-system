'use client';

import { useState, useCallback, useMemo, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import {
  Send,
  Search,
  CheckCircle2,
  Clock,
  MessageSquare,
  ChevronRight,
  Loader,
  Archive,
  Reply,
  Inbox,
  X,
  User,
  Mail,
  Phone,
  FileText,
  Shield,
  Check,
  AlertCircle,
  Copy,
  MapPin,
  Calendar,
  Tag,
  History,
  Lock,
  Ticket,
  Zap,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface VerificationQuestion {
  id: string;
  question: string;
  answer?: string;
  status: 'pending' | 'answered' | 'satisfied' | 'unsatisfied';
  createdAt: string;
}

interface ReleaseInfo {
  referenceNumber: string;
  pickupInstructions: string;
  authorizedBy: string;
  authorizedAt: string;
  notes?: string;
}

interface AuditEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
}

interface Inquiry {
  id: string;
  itemId: string;
  itemName: string;
  itemDescription?: string;
  itemCategory?: string;
  itemLocation?: string;
  itemDateFound?: string;
  message: string;
  status: 'pending' | 'awaiting-verification' | 'verified' | 'rejected' | 'release-authorized' | 'released';
  createdAt: string;
  updatedAt: string;
  replies: Reply[];
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  studentIDNumber?: string;
  verificationStatus: 'pending' | 'in-progress' | 'verified' | 'rejected';
  verificationQuestions: VerificationQuestion[];
  releaseInfo?: ReleaseInfo;
  auditTrail: AuditEntry[];
  rejectionReason?: string;
}

interface Reply {
  id: string;
  message: string;
  sentBy: 'admin' | 'user';
  createdAt: string;
  senderName?: string;
  attachments?: string[];
}

interface QuickReplyTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface InquiriesPanelProps {
  initialMessages?: Inquiry[] | {
    messages?: Array<{
      id: string;
      sender_id: string;
      sender?: { name: string; email: string };
      item_id: string;
      item?: { name: string };
      subject: string;
      body: string;
      status: string;
      created_at: string;
    }>;
    total?: number;
  };
}

const statusConfig: Record<string, any> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    badgeClass: 'liquid-glass text-yellow-300',
    description: 'Claim submitted, awaiting review',
  },
  'awaiting-verification': {
    label: 'Awaiting Verification',
    icon: AlertCircle,
    badgeClass: 'liquid-glass text-orange-300',
    description: 'Verification questions sent to student',
  },
  verified: {
    label: 'Verified',
    icon: Shield,
    badgeClass: 'liquid-glass text-purple-300',
    description: 'Ownership verified successfully',
  },
  'release-authorized': {
    label: 'Release Authorized',
    icon: Zap,
    badgeClass: 'liquid-glass text-cyan-300',
    description: 'Ready for pickup/release',
  },
  released: {
    label: 'Released',
    icon: CheckCircle2,
    badgeClass: 'liquid-glass text-emerald-300',
    description: 'Item handed over to student',
  },
  rejected: {
    label: 'Rejected',
    icon: AlertCircle,
    badgeClass: 'liquid-glass text-red-300',
    description: 'Claim could not be verified',
  },
};

const QUICK_REPLY_TEMPLATES: QuickReplyTemplate[] = [
  {
    id: '1',
    title: 'Verify - Serial Number',
    category: 'verification',
    content: 'To confirm ownership, could you please provide the serial number? You can find it on the device label or in settings.',
  },
  {
    id: '2',
    title: 'Verify - Description',
    category: 'verification',
    content: 'Could you describe any visible identifying marks, scratches, or distinctive features of your item?',
  },
  {
    id: '3',
    title: 'Verify - Purchase Details',
    category: 'verification',
    content: 'Please provide details about where you purchased this item or any receipt information.',
  },
  {
    id: '4',
    title: 'Verify - Lock Screen',
    category: 'verification',
    content: 'To verify ownership of this device, could you confirm the lock screen password or unlock method?',
  },
  {
    id: '5',
    title: 'Approved - Ready for Pickup',
    category: 'resolution',
    content: 'Your claim has been verified! Your reference number is: [REF_NUMBER]. Pickup at Security Office, Monday-Friday 8AM-5PM. Bring valid student ID.',
  },
  {
    id: '6',
    title: 'Approved - Will Contact',
    category: 'resolution',
    content: 'Your claim has been verified and approved! Our office will contact you within 24 hours to arrange convenient pickup.',
  },
  {
    id: '7',
    title: 'Rejected - Insufficient Evidence',
    category: 'rejection',
    content: 'We were unable to verify ownership based on provided evidence. Please contact us within 7 days with additional proof.',
  },
];

export default function InquiriesPanel({ initialMessages = [] }: InquiriesPanelProps) {
  const transformedMessages = Array.isArray(initialMessages)
    ? initialMessages
    : (initialMessages?.messages || []).map((msg) => ({
        id: msg.id,
        itemId: msg.item_id,
        itemName: msg.item?.name || 'Unknown Item',
        itemDescription: '',
        itemCategory: '',
        itemLocation: '',
        itemDateFound: '',
        message: msg.body,
        status: (['pending', 'awaiting-verification', 'verified', 'rejected', 'release-authorized', 'released'] as const).includes(msg.status as any)
          ? (msg.status as any)
          : 'pending',
        createdAt: msg.created_at,
        updatedAt: msg.created_at,
        replies: [],
        studentId: msg.sender_id,
        studentName: msg.sender?.name,
        studentEmail: msg.sender?.email,
        studentPhone: '',
        studentIDNumber: '',
        verificationStatus: 'pending' as const,
        verificationQuestions: [],
        auditTrail: [],
      }));

  const [inquiries, setInquiries] = useState<Inquiry[]>(transformedMessages);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'awaiting-verification' | 'verified' | 'release-authorized' | 'released' | 'rejected'>('pending');
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showVerificationPanel, setShowVerificationPanel] = useState(false);
  const [showReleasePanel, setShowReleasePanel] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [newVerificationQuestion, setNewVerificationQuestion] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inquiry) => {
      const matchesSearch =
        inquiry.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inquiry.studentName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (inquiry.studentEmail?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || inquiry.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [inquiries, searchQuery, filterStatus]);

  const stats = useMemo(
    () => ({
      total: inquiries.length,
      pending: inquiries.filter((i) => i.status === 'pending').length,
      awaitingVerification: inquiries.filter((i) => i.status === 'awaiting-verification').length,
      verified: inquiries.filter((i) => i.status === 'verified').length,
      releaseAuthorized: inquiries.filter((i) => i.status === 'release-authorized').length,
      released: inquiries.filter((i) => i.status === 'released').length,
      rejected: inquiries.filter((i) => i.status === 'rejected').length,
    }),
    [inquiries]
  );

  const insertTemplate = useCallback((template: QuickReplyTemplate) => {
    setReplyText((prev) => (prev ? prev + '\n\n' + template.content : template.content));
    setShowTemplates(false);
  }, []);

  const handleSendReply = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!replyText.trim() || !selectedInquiry) return;

      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/inquiries/${selectedInquiry.id}/admin-reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: replyText,
            status: 'awaiting-verification',
          }),
        });

        if (response.ok) {
          const updatedInquiry = await response.json();
          startTransition(() => {
            setSelectedInquiry(updatedInquiry);
            setInquiries((prev) =>
              prev.map((i) => (i.id === updatedInquiry.id ? updatedInquiry : i))
            );
            setReplyText('');
          });
        }
      } catch (error) {
        console.error('Error sending reply:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedInquiry]
  );

  const handleChangeStatus = useCallback(
    async (newStatus: string) => {
      if (!selectedInquiry) return;

      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/inquiries/${selectedInquiry.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
          const updated = { ...selectedInquiry, status: newStatus as any };
          startTransition(() => {
            setSelectedInquiry(updated);
            setInquiries((prev) =>
              prev.map((i) => (i.id === selectedInquiry.id ? updated : i))
            );
          });
        }
      } catch (error) {
        console.error('Error updating status:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedInquiry]
  );

  const handleAddVerificationQuestion = useCallback(async () => {
    if (!selectedInquiry || !newVerificationQuestion.trim()) return;

    setIsSubmitting(true);
    try {
      const newQuestion: VerificationQuestion = {
        id: `q-${Date.now()}`,
        question: newVerificationQuestion,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const updated = {
        ...selectedInquiry,
        verificationQuestions: [...selectedInquiry.verificationQuestions, newQuestion],
        status: 'awaiting-verification' as const,
      };

      startTransition(() => {
        setSelectedInquiry(updated);
        setInquiries((prev) =>
          prev.map((i) => (i.id === selectedInquiry.id ? updated : i))
        );
        setNewVerificationQuestion('');
      });
    } catch (error) {
      console.error('Error adding question:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedInquiry, newVerificationQuestion]);

  const handleVerifyOwnership = useCallback(async () => {
    if (!selectedInquiry) return;

    setIsSubmitting(true);
    try {
      const newAuditEntry: AuditEntry = {
        id: `audit-${Date.now()}`,
        action: 'VERIFIED_OWNERSHIP',
        performedBy: 'Admin User',
        timestamp: new Date().toISOString(),
        details: 'Student identity and ownership verified',
      };

      const updated = {
        ...selectedInquiry,
        status: 'verified' as const,
        verificationStatus: 'verified' as const,
        auditTrail: [...selectedInquiry.auditTrail, newAuditEntry],
      };

      startTransition(() => {
        setSelectedInquiry(updated);
        setInquiries((prev) =>
          prev.map((i) => (i.id === selectedInquiry.id ? updated : i))
        );
        setShowVerificationPanel(false);
      });
    } catch (error) {
      console.error('Error verifying:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedInquiry]);

  const handleAuthorizeRelease = useCallback(async () => {
    if (!selectedInquiry || !pickupInstructions.trim()) return;

    setIsSubmitting(true);
    try {
      const referenceNumber = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const releaseInfo: ReleaseInfo = {
        referenceNumber,
        pickupInstructions,
        authorizedBy: 'Admin User',
        authorizedAt: new Date().toISOString(),
      };

      const newAuditEntry: AuditEntry = {
        id: `audit-${Date.now()}`,
        action: 'RELEASE_AUTHORIZED',
        performedBy: 'Admin User',
        timestamp: new Date().toISOString(),
        details: `Item release authorized with reference: ${referenceNumber}`,
      };

      const updated = {
        ...selectedInquiry,
        status: 'release-authorized' as const,
        releaseInfo,
        auditTrail: [...selectedInquiry.auditTrail, newAuditEntry],
      };

      startTransition(() => {
        setSelectedInquiry(updated);
        setInquiries((prev) =>
          prev.map((i) => (i.id === selectedInquiry.id ? updated : i))
        );
        setPickupInstructions('');
        setShowReleasePanel(false);
      });
    } catch (error) {
      console.error('Error authorizing release:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedInquiry, pickupInstructions]);

  const handleRejectClaim = useCallback(async (reason: string) => {
    if (!selectedInquiry) return;

    setIsSubmitting(true);
    try {
      // Create audit entry
      const newAuditEntry: AuditEntry = {
        id: `audit-${Date.now()}`,
        action: 'CLAIM_REJECTED',
        performedBy: 'Admin User',
        timestamp: new Date().toISOString(),
        details: `Claim rejected: ${reason}`,
      };

      // Create notification reply to student
      const notificationReply: Reply = {
        id: `reply-${Date.now()}`,
        message: `Your claim has been rejected. Reason: ${reason}. If you believe this is incorrect, please contact our office.`,
        sentBy: 'admin',
        createdAt: new Date().toISOString(),
        senderName: 'Claims Team',
      };

      const updated = {
        ...selectedInquiry,
        status: 'rejected' as const,
        verificationStatus: 'rejected' as const,
        rejectionReason: reason,
        replies: [...selectedInquiry.replies, notificationReply],
        auditTrail: [...selectedInquiry.auditTrail, newAuditEntry],
      };

      // Send to API
      const response = await fetch(`/api/inquiries/${selectedInquiry.id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', reason }),
      });

      if (response.ok) {
        startTransition(() => {
          setSelectedInquiry(updated);
          setInquiries((prev) =>
            prev.map((i) => (i.id === selectedInquiry.id ? updated : i))
          );
        });
      }
    } catch (error) {
      console.error('[v0] Error rejecting claim:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedInquiry]);

  const handleReleaseItem = useCallback(async () => {
    if (!selectedInquiry) return;

    setIsSubmitting(true);
    try {
      const newAuditEntry: AuditEntry = {
        id: `audit-${Date.now()}`,
        action: 'ITEM_RELEASED',
        performedBy: 'Admin User',
        timestamp: new Date().toISOString(),
        details: 'Item released to student',
      };

      const updated = {
        ...selectedInquiry,
        status: 'released' as const,
        auditTrail: [...selectedInquiry.auditTrail, newAuditEntry],
      };

      startTransition(() => {
        setSelectedInquiry(updated);
        setInquiries((prev) =>
          prev.map((i) => (i.id === selectedInquiry.id ? updated : i))
        );
      });
    } catch (error) {
      console.error('Error releasing item:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedInquiry]);

  return (
    <motion.div
      key="inquiries"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col gap-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 md:mb-4 tracking-tight text-balance">
          Claims Management
        </h1>
        <p className="text-base md:text-lg text-white/60 max-w-2xl font-light">
          Review student claims, verify ownership, and manage item releases. Process claims by verifying student identities and ensuring items go to rightful owners.
        </p>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-6 gap-2 md:gap-3"
      >
        {[
          { label: 'Total', value: stats.total, icon: MessageSquare, color: 'text-white/50' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-400' },
          { label: 'Awaiting', value: stats.awaitingVerification, icon: AlertCircle, color: 'text-orange-400' },
          { label: 'Verified', value: stats.verified, icon: Shield, color: 'text-purple-400' },
          { label: 'Auth.', value: stats.releaseAuthorized, icon: Zap, color: 'text-cyan-400' },
          { label: 'Released', value: stats.released, icon: Check, color: 'text-emerald-400' },
        ].map((stat) => {
          const StatIcon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              className="p-2 md:p-4 rounded-lg md:rounded-xl liquid-glass"
            >
              <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                <StatIcon className={`w-3 md:w-4 h-3 md:h-4 ${stat.color}`} />
                <span className="text-xs text-white/60 font-medium line-clamp-1">{stat.label}</span>
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row lg:gap-6 overflow-hidden">
        {/* Claims List */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Filter */}
          <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-2.5 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search claims by student, email, item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 py-2.5 md:py-3 text-sm md:text-base bg-white/5 border-white/10 text-white placeholder-white/40 rounded-lg md:rounded-xl liquid-glass"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['pending', 'awaiting-verification', 'verified', 'release-authorized', 'released', 'all'] as const).map((status) => {
                const displayLabel = {
                  'pending': 'Pending',
                  'awaiting-verification': 'Awaiting',
                  'verified': 'Verified',
                  'release-authorized': 'Auth.',
                  'released': 'Released',
                  'all': 'All',
                }[status];

                return (
                  <motion.button
                    key={status}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                      filterStatus === status
                        ? 'liquid-glass text-emerald-300 border-emerald-500/30'
                        : 'liquid-glass text-white/60 hover:text-white/80'
                    }`}
                  >
                    {displayLabel}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Claims List */}
          <div className="flex-1 overflow-y-auto space-y-2 md:space-y-3 pr-2">
            {filteredInquiries.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-2 md:space-y-3"
              >
                {filteredInquiries.map((inquiry) => (
                  <motion.button
                    key={inquiry.id}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedInquiry(inquiry);
                      setIsMobileDetailOpen(true);
                    }}
                    className={`w-full text-left p-3 md:p-5 rounded-lg md:rounded-2xl liquid-glass transition-all group hover:border-emerald-500/30 ${
                      selectedInquiry?.id === inquiry.id ? 'border-emerald-500/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors mb-1 line-clamp-1">
                          {inquiry.itemName}
                        </h3>
                        <p className="text-xs text-white/50 mb-1">by {inquiry.studentName || 'Student'}</p>
                        <p className="text-xs md:text-sm text-white/70 line-clamp-2 mb-2 md:mb-3">{inquiry.message}</p>
                        <div className="flex items-center gap-2 md:gap-3 text-xs text-white/50 flex-wrap">
                          <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {inquiry.replies.length}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 md:gap-2 flex-shrink-0">
                        <span className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs font-semibold ${statusConfig[inquiry.status]?.badgeClass || 'liquid-glass'}`}>
                          {statusConfig[inquiry.status]?.label || 'Unknown'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-emerald-300 group-hover:translate-x-1 transition-all hidden md:block" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="text-center py-16 md:py-24"
              >
                <Inbox className="w-12 md:w-16 h-12 md:h-16 text-white/30 mx-auto mb-3 md:mb-4" />
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">No Claims Found</h3>
                <p className="text-sm md:text-base text-white/60">
                  {filterStatus === 'pending'
                    ? 'All pending claims have been processed'
                    : 'Try adjusting your filters'}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Detail Panel - Desktop */}
        <div className="hidden lg:flex flex-1 flex-col bg-white/5 rounded-3xl liquid-glass overflow-hidden max-h-[800px]">
          <AnimatePresence mode="wait">
            {selectedInquiry ? (
              <motion.div
                key={selectedInquiry.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col h-full overflow-y-auto"
              >
                {/* Header */}
                <div className="border-b border-white/10 p-4 space-y-3 flex-shrink-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-white line-clamp-1">{selectedInquiry.itemName}</h2>
                      <p className="text-xs text-white/60 mt-1">{selectedInquiry.studentName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${statusConfig[selectedInquiry.status]?.badgeClass || 'liquid-glass'}`}>
                      {statusConfig[selectedInquiry.status]?.label}
                    </span>
                  </div>
                </div>

                {/* Student & Item Info */}
                <div className="border-b border-white/10 p-4 space-y-3 flex-shrink-0">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-white/80 uppercase tracking-wide">Student Information</h3>
                    <div className="space-y-1 text-xs text-white/70">
                      {selectedInquiry.studentEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-blue-300" />
                          <span>{selectedInquiry.studentEmail}</span>
                        </div>
                      )}
                      {selectedInquiry.studentPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-blue-300" />
                          <span>{selectedInquiry.studentPhone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-blue-300" />
                        <span>ID: {selectedInquiry.studentIDNumber || selectedInquiry.studentId}</span>
                      </div>
                    </div>
                  </div>

                  {selectedInquiry.itemLocation && (
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-white/80 uppercase tracking-wide">Item Location</h3>
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <MapPin className="w-3 h-3 text-amber-300" />
                        <span>{selectedInquiry.itemLocation}</span>
                      </div>
                    </div>
                  )}

                  {selectedInquiry.itemDateFound && (
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-white/80 uppercase tracking-wide">Date Found</h3>
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <Calendar className="w-3 h-3 text-amber-300" />
                        <span>{new Date(selectedInquiry.itemDateFound).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Verification Questions */}
                {selectedInquiry.verificationQuestions.length > 0 && (
                  <div className="border-b border-white/10 p-4 space-y-2 flex-shrink-0 bg-purple-500/5">
                    <h3 className="text-xs font-bold text-purple-300 uppercase">Verification Questions</h3>
                    <div className="space-y-2">
                      {selectedInquiry.verificationQuestions.map((q) => (
                        <div key={q.id} className="p-2 rounded bg-white/5 border border-white/10">
                          <p className="text-xs font-medium text-white mb-1">{q.question}</p>
                          {q.answer && <p className="text-xs text-white/60 italic">A: {q.answer}</p>}
                          <p className="text-xs text-white/50 mt-1">Status: {q.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Release Info */}
                {selectedInquiry.releaseInfo && (
                  <div className="border-b border-white/10 p-4 space-y-2 flex-shrink-0 bg-cyan-500/5">
                    <h3 className="text-xs font-bold text-cyan-300 uppercase">Release Information</h3>
                    <div className="space-y-1 text-xs text-white/70">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-3 h-3 text-cyan-300" />
                        <span>Ref: {selectedInquiry.releaseInfo.referenceNumber}</span>
                      </div>
                      <p>{selectedInquiry.releaseInfo.pickupInstructions}</p>
                    </div>
                  </div>
                )}

                {/* Conversation */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                  {selectedInquiry.replies.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <Reply className="w-8 h-8 text-white/20 mx-auto mb-2" />
                        <p className="text-white/60 font-medium text-xs">No messages yet</p>
                      </div>
                    </div>
                  ) : (
                    selectedInquiry.replies.map((reply, i) => (
                      <div
                        key={reply.id}
                        className={`flex gap-2 ${reply.sentBy === 'admin' ? '' : 'flex-row-reverse'}`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 liquid-glass ${
                          reply.sentBy === 'admin' ? 'text-emerald-300' : 'text-blue-300'
                        }`}>
                          {reply.sentBy === 'admin' ? 'A' : 'S'}
                        </div>
                        <div className={`flex-1 text-xs ${reply.sentBy === 'admin' ? '' : 'text-right'}`}>
                          <div className={`text-xs font-semibold mb-0.5 ${
                            reply.sentBy === 'admin' ? 'text-emerald-300' : 'text-blue-300'
                          }`}>
                            {reply.sentBy === 'admin' ? 'Admin' : 'Student'}
                          </div>
                          <div className={`p-2 rounded-lg liquid-glass ${
                            reply.sentBy === 'admin'
                              ? 'bg-emerald-500/10 border-emerald-500/30'
                              : 'bg-blue-500/10 border-blue-500/30'
                          } border max-w-xs`}>
                            <p className="text-xs text-white/90">{reply.message}</p>
                          </div>
                          <div className="text-xs text-white/50 mt-0.5">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Action Buttons */}
                <div className="border-t border-white/10 p-3 space-y-2 flex-shrink-0 bg-white/5">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedInquiry.status === 'pending' && (
                      <>
                        <button
                          onClick={() => setShowVerificationPanel(!showVerificationPanel)}
                          disabled={isSubmitting}
                          className="px-2 py-1.5 text-xs bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded font-semibold hover:bg-purple-500/30 disabled:opacity-50"
                        >
                          Ask Q&As
                        </button>
                        <button
                          onClick={() => setShowReleasePanel(!showReleasePanel)}
                          className="px-2 py-1.5 text-xs bg-red-500/20 border border-red-500/30 text-red-300 rounded font-semibold hover:bg-red-500/30"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {selectedInquiry.status === 'awaiting-verification' && (
                      <>
                        <button
                          onClick={handleVerifyOwnership}
                          disabled={isSubmitting}
                          className="px-2 py-1.5 text-xs bg-green-500/20 border border-green-500/30 text-green-300 rounded font-semibold hover:bg-green-500/30 disabled:opacity-50"
                        >
                          Verify Own
                        </button>
                        <button
                          onClick={() => handleRejectClaim('Insufficient evidence provided')}
                          disabled={isSubmitting}
                          className="px-2 py-1.5 text-xs bg-red-500/20 border border-red-500/30 text-red-300 rounded font-semibold hover:bg-red-500/30 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {selectedInquiry.status === 'verified' && (
                      <button
                        onClick={() => setShowReleasePanel(!showReleasePanel)}
                        className="col-span-2 px-2 py-1.5 text-xs bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded font-semibold hover:bg-cyan-500/30"
                      >
                        Auth Release
                      </button>
                    )}

                    {selectedInquiry.status === 'release-authorized' && (
                      <button
                        onClick={handleReleaseItem}
                        disabled={isSubmitting}
                        className="col-span-2 px-2 py-1.5 text-xs bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded font-semibold hover:bg-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Release Item
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setShowAuditTrail(!showAuditTrail)}
                    className="w-full px-2 py-1 text-xs bg-white/5 border border-white/10 text-white/70 rounded hover:text-white/90 flex items-center justify-center gap-1"
                  >
                    <History className="w-3 h-3" />
                    Audit Trail
                  </button>
                </div>

                {/* Verification Panel */}
                <AnimatePresence>
                  {showVerificationPanel && selectedInquiry.status === 'pending' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/10 p-3 bg-purple-500/10 space-y-2 flex-shrink-0"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Verification question..."
                          value={newVerificationQuestion}
                          onChange={(e) => setNewVerificationQuestion(e.target.value)}
                          className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 text-white placeholder-white/40 rounded"
                        />
                        <button
                          onClick={handleAddVerificationQuestion}
                          disabled={!newVerificationQuestion.trim() || isSubmitting}
                          className="px-3 py-1 text-xs bg-purple-500/30 text-purple-300 rounded font-semibold hover:bg-purple-500/40 disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                      <div className="text-xs text-white/60 max-h-32 overflow-y-auto space-y-1">
                        {QUICK_REPLY_TEMPLATES.filter(t => t.category === 'verification').slice(0, 3).map(t => (
                          <button
                            key={t.id}
                            onClick={() => setNewVerificationQuestion(t.content)}
                            className="w-full text-left p-1 rounded bg-white/5 hover:bg-white/10 text-xs text-white/70 hover:text-white/90 line-clamp-1"
                          >
                            {t.title}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Release Panel */}
                <AnimatePresence>
                  {showReleasePanel && (selectedInquiry.status === 'verified' || selectedInquiry.status === 'pending') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/10 p-3 bg-cyan-500/10 space-y-2 flex-shrink-0"
                    >
                      <textarea
                        placeholder="Pickup instructions..."
                        value={pickupInstructions}
                        onChange={(e) => setPickupInstructions(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white/5 border border-white/10 text-white placeholder-white/40 rounded resize-none h-16"
                      />
                      <button
                        onClick={handleAuthorizeRelease}
                        disabled={!pickupInstructions.trim() || isSubmitting}
                        className="w-full px-2 py-1.5 text-xs bg-cyan-500/30 text-cyan-300 rounded font-semibold hover:bg-cyan-500/40 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Processing...' : 'Authorize Release'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Audit Trail */}
                <AnimatePresence>
                  {showAuditTrail && selectedInquiry.auditTrail.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/10 p-3 bg-white/5 space-y-1 flex-shrink-0 max-h-40 overflow-y-auto"
                    >
                      <h3 className="text-xs font-bold text-white/80 mb-2">Audit Trail</h3>
                      {selectedInquiry.auditTrail.map(entry => (
                        <div key={entry.id} className="text-xs text-white/60 pb-1 border-b border-white/5">
                          <p className="font-semibold text-white/80">{entry.action}</p>
                          <p className="text-white/50">{new Date(entry.timestamp).toLocaleString()}</p>
                          {entry.details && <p className="text-white/60">{entry.details}</p>}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full text-center"
              >
                <div>
                  <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60 font-medium text-sm">No claim selected</p>
                  <p className="text-xs text-white/50 mt-1">Select a claim to view details</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
