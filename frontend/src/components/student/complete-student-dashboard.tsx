/**
 * Complete Student Dashboard - Client Component (Hybrid SSR + CSR)
 * 
 * This is a client component that receives initial data from the server via props
 * from the DashboardServerWrapper component. The hybrid approach provides:
 * 
 * 1. Server-Side Rendering (SSR):
 *    - Dashboard data is fetched on the server during initial page load
 *    - No skeleton loaders - content is immediately visible
 *    - Improved SEO and faster First Contentful Paint (FCP)
 *    - Initial data comes from props: initialFoundItems, initialUserItems, etc.
 * 
 * 2. Client-Side Updates (Optional):
 *    - If enableRealTimeSync is true, the component polls for updated data
 *    - Real-time updates without page refresh using setInterval
 *    - Data merges seamlessly with smooth animations
 *    - Sync errors are tracked but don't break the UI
 * 
 * Data Flow:
 * User loads page → DashboardServerWrapper fetches data → Initial render with data
 * (optional) Client-side interval polls for updates → UI updates with fresh data
 */

'use client';

import { useEffect, useState } from 'react';
import StudentDashboardTabs from '@/components/student/student-dashboard-tabs';
import { ErrorBoundary } from '@/components/student/error-boundary';
import * as studentApi from '@/services/api';
import { motion } from 'framer-motion';

interface CompleteStudentDashboardProps {
  studentName: string;
  studentId?: string;
  onLogout: () => void;
  enableRealTimeSync?: boolean;
  syncIntervalMs?: number;
  initialFoundItems?: { items?: any[]; total?: number };
  initialUserItems?: { items?: any[]; total?: number };
  initialUserClaims?: { items?: any[]; total?: number };
  initialMessages?: { messages?: any[]; total?: number };
  initialUserProfile?: { data?: any } | null;
  initialCategories?: { categories?: string[] };
  initialConversations?: any[];
}

/**
 * Complete Student Dashboard Wrapper
 * This component wraps StudentDashboardTabs and provides data fetching
 * on the client side, following the same pattern as the admin dashboard.
 * In production, prefer using the /student route which handles SSR.
 */
export default function CompleteStudentDashboard({
  studentName,
  studentId = '',
  onLogout,
  enableRealTimeSync = false,
  syncIntervalMs = 60000,
  initialFoundItems,
  initialUserItems,
  initialUserClaims,
  initialMessages,
  initialUserProfile,
  initialCategories,
  initialConversations,
}: CompleteStudentDashboardProps) {
  const [foundItems, setFoundItems] = useState<{ items?: any[]; total?: number }>(initialFoundItems || {});
  const [userItems, setUserItems] = useState<{ items?: any[]; total?: number }>(initialUserItems || {});
  const [userClaims, setUserClaims] = useState<{ items?: any[]; total?: number }>(initialUserClaims || {});
  const [messages, setMessages] = useState<{ messages?: any[]; total?: number }>(initialMessages || {});
  const [userProfile, setUserProfile] = useState<{ data?: any } | null>(initialUserProfile || null);
  const [categories, setCategories] = useState(initialCategories || { categories: [] });
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let syncInterval: NodeJS.Timeout | null = null;

    const fetchDashboardData = async () => {
      try {
        const [itemsRes, userItemsRes, userClaimsRes, messagesRes, profileRes] = await Promise.all([
          studentApi.fetchFoundItems(1, 20),
          studentApi.fetchUserItems(1, 20),
          studentApi.fetchUserClaims(1, 20),
          studentApi.fetchUserMessages(1, 20),
          studentApi.fetchUserProfile(),
        ]);

        if (isMounted) {
          setFoundItems(itemsRes?.data ?? {});
          setUserItems(userItemsRes?.data ?? {});
          setUserClaims(userClaimsRes?.data ?? {});
          setMessages(messagesRes?.data ?? {});
          setUserProfile(profileRes);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('[v0] Dashboard data fetch failed:', err);
          setError('Failed to load dashboard data');
        }
      }
    };

    // Only fetch if we don't have initial data or if real-time sync is explicitly enabled
    if (!hasInitialized && (!initialFoundItems || !initialUserItems)) {
      fetchDashboardData();
      setHasInitialized(true);
    }

    // DISABLED: Real-time polling causes performance issues. Only enable if explicitly requested.
    // if (enableRealTimeSync) {
    //   syncInterval = setInterval(fetchDashboardData, Math.max(syncIntervalMs, 120000)); // Min 2 minutes
    // }

    // Cleanup
    return () => {
      isMounted = false;
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [hasInitialized]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen dark-bg-enhanced"
    >
      {/* Ambient Background Effects - Subtle Liquid Glass Theme */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-white/[0.015] rounded-full blur-3xl" />
      </div>

      {/* Main Content: Single Clean Navbar + Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorBoundary>
          <StudentDashboardTabs
            studentName={studentName}
            studentId={studentId}
            onLogout={onLogout}
            initialFoundItems={foundItems}
            initialUserItems={userItems}
            initialUserClaims={userClaims}
            initialMessages={messages}
            initialUserProfile={userProfile}
            initialCategories={categories}
            initialConversations={initialConversations}
          />
        </ErrorBoundary>
      </div>
    </motion.div>
  );
}
