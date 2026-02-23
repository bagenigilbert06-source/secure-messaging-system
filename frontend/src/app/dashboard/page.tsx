import { Suspense } from 'react';
import DashboardServerWrapper from '@/components/student/dashboard-server-wrapper';

/**
 * Server Component: Dashboard Page
 * Uses hybrid SSR + CSR rendering with server-side data fetching
 * 
 * The DashboardServerWrapper:
 * - Fetches all dashboard data on the server
 * - Passes initial data to client components
 * - No loading skeleton - content is immediately visible
 * - Clients can still refetch/subscribe to updates if needed
 */
export const metadata = {
  title: 'Dashboard - CampusFind',
  description: 'Manage your lost and found items',
};

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white/60">Loading dashboard...</div>
      </div>
    }>
      <DashboardServerWrapper />
    </Suspense>
  );
}
