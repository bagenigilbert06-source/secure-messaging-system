'use client';

import { useEffect, useState } from 'react';
import AdminDashboardHeader from '@/components/admin/dashboard-header';
import AdminDashboardTabs from '@/components/admin/admin-dashboard-tabs';
import { ErrorBoundary } from '@/components/admin/error-boundary';
import * as adminApi from '@/services/admin-api';

interface CompleteAdminDashboardProps {
  adminName: string;
  onLogout: () => void;
  enableRealTimeSync?: boolean;
  syncIntervalMs?: number;
}

/**
 * Complete Admin Dashboard Wrapper
 * This component wraps AdminDashboardTabs and provides data fetching
 * on the client side for backward compatibility with the main routing logic.
 * In production, prefer using the /admin route which handles SSR.
 */
export default function CompleteAdminDashboard({
  adminName,
  onLogout,
  enableRealTimeSync = false,
  syncIntervalMs = 60000,
}: CompleteAdminDashboardProps) {
  const [items, setItems] = useState<{ items?: any[]; total?: number }>({});
  const [messages, setMessages] = useState<{ messages?: any[]; total?: number }>({});
  const [stats, setStats] = useState<{ total_users?: number; total_items?: number; total_messages?: number; items_by_status?: Record<string, number> }>({});
  const [error, setError] = useState<string | null>(null);

  // Debug: Detect page reloads and unexpected refreshes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[v0] Page became visible - checking if refresh occurred');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log('[v0] Detected page unload/reload attempt');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    console.log('[v0] CompleteAdminDashboard - useEffect running (initial fetch only)');
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        console.log('[v0] CompleteAdminDashboard - Fetching dashboard data');
        const [itemsRes, messagesRes, statsRes] = await Promise.all([
          adminApi.getAdminItems(1, 10),
          adminApi.getAdminMessages(1, 10),
          adminApi.getAdminDashboardStats(),
        ]);

        // Only update state if component is still mounted
        if (isMounted) {
          console.log('[v0] CompleteAdminDashboard - Data fetched successfully');
          setItems(itemsRes?.data ?? {});
          setMessages(messagesRes?.data ?? {});
          setStats(statsRes?.data ?? {});
          setError(null);
        }
      } catch (err) {
        console.error('[v0] CompleteAdminDashboard - Error fetching data:', err);
        if (isMounted) {
          setError('Failed to load dashboard data');
        }
      }
    };

    // Initial fetch only
    fetchDashboardData();

    // Set up real-time sync if enabled (disabled by default)
    let syncInterval: NodeJS.Timeout | null = null;
    if (enableRealTimeSync) {
      console.log('[v0] CompleteAdminDashboard - Setting up real-time sync interval');
      syncInterval = setInterval(fetchDashboardData, syncIntervalMs);
    }

    // Cleanup
    return () => {
      isMounted = false;
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [enableRealTimeSync, syncIntervalMs]); // Added proper dependencies

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient Background Effects - Liquid Glass Theme */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-white/[0.015] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <AdminDashboardHeader adminName={adminName} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 space-y-6">
        {/* Tab-Based Dashboard with all functionality */}
        <ErrorBoundary>
          <AdminDashboardTabs
            initialItems={items}
            initialMessages={messages}
            initialStats={stats}
          />
        </ErrorBoundary>
      </main>
    </div>
  );
}
