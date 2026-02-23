import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/server-api';

export const metadata = {
  title: 'Dashboard - Lost & Found',
  description: 'Student dashboard for managing lost and found items',
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Check authentication server-side
  const user = await getServerUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
