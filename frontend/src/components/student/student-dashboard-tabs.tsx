'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import UnifiedNavbar from './unified-navbar';
import BrowseItems from './browse-items';
import MyClaims from './my-claims';
import UnifiedInquirySystem from './unified-inquiry-system';
import MyLosses from './my-losses';
import Profile from './profile';
import RecordItemForm from './record-item-form';

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
}

interface StudentDashboardTabsProps {
  studentName?: string;
  studentId?: string;
  onLogout?: () => void;
  initialFoundItems: {
    items?: any[];
    total?: number;
  };
  initialUserItems: {
    items?: any[];
    total?: number;
  };
  initialUserClaims: {
    items?: any[];
    total?: number;
  };
  initialMessages: {
    messages?: any[];
    total?: number;
  };
  initialUserProfile?: {
    data?: any;
  } | null;
  initialCategories?: {
    categories?: any[];
  };
  initialConversations?: any[];
}

type TabKey = 'browse' | 'claims' | 'inquiries' | 'losses' | 'profile' | 'report';

export default function StudentDashboardTabs({
  studentName = 'Student',
  studentId = '',
  onLogout = () => {},
  initialFoundItems,
  initialUserItems,
  initialUserClaims,
  initialMessages,
  initialUserProfile,
  initialCategories,
  initialConversations,
}: StudentDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('browse');

  // Calculate unread messages count
  const unreadMessages = useMemo(() => {
    const messages = initialMessages?.messages || [];
    return messages.filter((m: any) => !m.read).length;
  }, [initialMessages]);

  const renderContent = () => {
    switch (activeTab) {
      case 'browse':
        return <BrowseItems initialItems={initialFoundItems} initialCategories={initialCategories} />;

      case 'claims':
      case 'inquiries':
        // Both now use unified inquiry system
        return (
          <UnifiedInquirySystem 
            studentId={studentId} 
            studentName={studentName}
            initialClaims={initialUserClaims?.items || []}
          />
        );

      case 'losses':
        return <MyLosses initialItems={initialUserItems} />;

      case 'profile':
        return <Profile initialProfile={initialUserProfile?.data} />;

      case 'report':
        return (
          <RecordItemForm 
            onSuccess={() => setActiveTab('losses')} 
            initialCategories={initialCategories?.categories || []}
          />
        );

      default:
        return null;
    }
  };

  const getTabColor = (color: string) => {
    switch (color) {
      case 'cyan':
        return 'bg-cyan-500/30 text-cyan-200 border-cyan-400/60 shadow-lg shadow-cyan-500/20';
      case 'amber':
        return 'bg-amber-500/30 text-amber-200 border-amber-400/60 shadow-lg shadow-amber-500/20';
      default:
        return 'bg-emerald-500/30 text-emerald-200 border-emerald-400/60 shadow-lg shadow-emerald-500/20';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-8 sm:pb-12">
      {/* Unified Navbar - One clean navbar with all tabs and user info */}
      <UnifiedNavbar
        studentName={studentName}
        onLogout={onLogout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadMessages={unreadMessages}
      />

      {/* Content Area - Smooth transitions between tabs */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
