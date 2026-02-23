import {
  getServerAdminDashboardStats,
  getServerAdminRecentActivity,
  getServerAdminUsers,
  getServerAdminItems,
  getServerAdminMessages,
} from '@/lib/server-api';
import AdminDashboardHeader from '@/components/admin/dashboard-header';
import AdminDashboardTabs from '@/components/admin/admin-dashboard-tabs';
import { ErrorBoundary } from '@/components/admin/error-boundary';

// Use dynamic rendering to prevent ISR revalidation loops
// Dynamic rendering ensures each request gets fresh data without cache conflicts
export const dynamic = 'force-dynamic';

/**
 * Server Component: Admin Dashboard
 * Fetches all data server-side for instant results (hybrid rendering)
 * Passes data to client components via props for interactivity
 */
export default async function AdminDashboard() {
  console.log('[v0] AdminDashboard - Page rendering, fetching all dashboard data');
  
  // Fetch all dashboard data in parallel on server
  const [stats, recentActivity, users, items, messages] = await Promise.all([
    getServerAdminDashboardStats(),
    getServerAdminRecentActivity(),
    getServerAdminUsers(1, 50),
    getServerAdminItems(1, 10),
    getServerAdminMessages(1, 10),
  ]);

  console.log('[v0] AdminDashboard - Data fetched successfully');
  console.log('[v0] AdminDashboard - Stats:', stats);
  console.log('[v0] AdminDashboard - Items count:', items?.items?.length || 0);
  console.log('[v0] AdminDashboard - Messages count:', messages?.messages?.length || 0);
  console.log('[v0] AdminDashboard - Users count:', users?.users?.length || 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-slate-600/5 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Header */}
      <AdminDashboardHeader />

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 space-y-6">
        {/* Tab-Based Dashboard with all functionality */}
        <ErrorBoundary>
          <AdminDashboardTabs
            initialItems={items}
            initialMessages={messages}
            initialUsers={users}
            initialStats={stats}
          />
        </ErrorBoundary>
      </main>
    </div>
  );
}
