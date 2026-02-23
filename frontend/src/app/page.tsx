'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import LandingPage from '@/components/landing/landing-page';
import PremiumAuth from '@/components/auth/premium-auth';
import CompleteStudentDashboard from '@/components/student/complete-student-dashboard';
import CompleteAdminDashboard from '@/components/admin/complete-admin-dashboard';

export type ViewType = 'landing' | 'auth' | 'student' | 'admin';

export default function Page() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('landing');

  const handleLogout = async () => {
    await logout();
    setCurrentView('landing');
  };

  const handleGetStarted = () => {
    setCurrentView('auth');
  };

  const handleSignIn = () => {
    // Sign In navigates to auth view (same as Get Started)
    setCurrentView('auth');
  };

  const handleAuthBack = () => {
    setCurrentView('landing');
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated, show appropriate dashboard based on role
  if (isAuthenticated && user) {
    // Check if user is admin/officer
    if (user.role === 'admin' || user.role === 'officer') {
      return (
        <CompleteAdminDashboard
          adminName={user.name || user.email.split('@')[0]}
          onLogout={handleLogout}
          enableRealTimeSync={true}
          syncIntervalMs={60000}
        />
      );
    }

    // Otherwise show student dashboard
    return (
      <CompleteStudentDashboard
        studentName={user.name || user.email.split('@')[0]}
        onLogout={handleLogout}
        enableRealTimeSync={true}
        syncIntervalMs={60000}
      />
    );
  }

  // Otherwise show landing/auth pages
  return (
    <>
      {currentView === 'landing' && (
        <LandingPage onGetStarted={handleGetStarted} onSignIn={handleSignIn} />
      )}
      {currentView === 'auth' && (
        <PremiumAuth onBack={handleAuthBack} />
      )}
    </>
  );
}
