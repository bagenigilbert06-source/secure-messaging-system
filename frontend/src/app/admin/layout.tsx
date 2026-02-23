import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/server-api';

export const metadata = {
  title: 'Admin Dashboard - Lost & Found',
  description: 'Administrator dashboard for managing lost and found items',
};

// Use dynamic rendering to prevent ISR revalidation loops
// Dynamic rendering ensures each request gets fresh auth checks without cache conflicts
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  try {
    console.log('[v0] AdminLayout - Starting render, checking authentication');
    
    // Check authentication server-side
    const user = await getServerUser();

    console.log('[v0] AdminLayout - getServerUser returned:', user ? 'user found' : 'no user');

    // Redirect if not authenticated
    if (!user) {
      console.log('[v0] AdminLayout - No user found, redirecting to login');
      redirect('/auth/login');
    }

    console.log('[v0] AdminLayout - User authenticated:', user.email, 'Role:', user.role);

    // Check if user is admin
    if (user.role !== 'admin') {
      console.log('[v0] AdminLayout - User is not admin, redirecting to dashboard');
      redirect('/dashboard');
    }

    console.log('[v0] AdminLayout - Admin user authorized, rendering admin layout');

    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  } catch (error) {
    console.error('[v0] AdminLayout - Error fetching user:', error);
    // If we can't fetch user, redirect to login to be safe
    redirect('/auth/login');
  }
}
