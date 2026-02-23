'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { 
  User, Mail, Phone, MapPin, BookOpen, Building2, AlertCircle, Check, 
  LogOut, Lock, Shield, Activity, RefreshCw
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  student_id: string;
  student_type?: string;
  department?: string;
  phone?: string;
  hostel?: string;
  room_number?: string;
  role: string;
  is_verified: boolean;
  email_verified: boolean;
  is_active: boolean;
  created_at?: string;
}

interface ProfileProps {
  initialProfile?: UserProfile | null;
}

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
};

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] } },
};

export default function Profile({ initialProfile }: ProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile || null);
  const [loading, setLoading] = useState(!initialProfile);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile if not provided initially
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          setError('Not authenticated. Please log in again.');
          setProfile(null);
          return;
        }

        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to load profile');
        }

        const data = await response.json();
        setProfile(data.user || data);
        setError(null);
      } catch (err) {
        console.error('[v0] Profile fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [initialProfile]);



  const handleLogout = async () => {
    try {
      // Call logout endpoint to clear server-side session and revoke token
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((error) => {
        console.error('[v0] Logout request failed:', error);
        // Continue with client-side logout even if server call fails
      });

      // Clear all client-side authentication data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('[v0] Logout error:', error);
      // Force logout anyway
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight">
            Profile
          </h1>
          <p className="text-base sm:text-lg text-white/60 font-light">
            Your account information and details.
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium">Error Loading Profile</p>
            <p className="text-red-300/70 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && !profile && (
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center py-24">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <RefreshCw className="w-12 h-12 text-emerald-400" />
          </motion.div>
          <p className="text-white/60 mt-4">Loading your profile...</p>
        </motion.div>
      )}

      {profile ? (
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="space-y-4 md:space-y-6"
        >
          {/* Hero Profile Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            className="p-6 md:p-8 rounded-2xl liquid-glass hover:border-emerald-500/20 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-6">
              <motion.div
                whileHover={{ scale: 1.08, transition: { duration: 0.2 } }}
                className="p-5 rounded-2xl liquid-glass flex-shrink-0 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10"
              >
                <User className="w-10 h-10 text-emerald-400" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 break-words">{profile.name}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 whitespace-nowrap">
                    {profile.role}
                  </span>
                  {profile.is_verified && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 flex items-center gap-1 whitespace-nowrap">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {profile.is_active && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 flex items-center gap-1 whitespace-nowrap">
                      <Activity className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-white/60 uppercase tracking-wider">Email</p>
                  <p className="text-white break-all">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-white/60 uppercase tracking-wider">Student ID</p>
                  <p className="text-white break-all">{profile.student_id}</p>
                </div>
              </div>

              {profile.phone ? (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/60 uppercase tracking-wider">Phone</p>
                    <p className="text-white">{profile.phone}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>

          {/* Academic Details */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            className="p-6 md:p-8 rounded-2xl liquid-glass hover:border-emerald-500/20 transition-all duration-300"
          >
            <h3 className="text-lg md:text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Academic Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {profile.student_type && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Student Type</p>
                  <p className="text-white font-semibold capitalize">{profile.student_type}</p>
                </div>
              )}

              {profile.department && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Department</p>
                  <p className="text-white font-semibold">{profile.department}</p>
                </div>
              )}

              {profile.hostel ? (
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs text-white/60 uppercase tracking-wider">Hostel</p>
                  </div>
                  <p className="text-white font-semibold">{profile.hostel}</p>
                </div>
              ) : null}

              {profile.room_number ? (
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs text-white/60 uppercase tracking-wider">Room Number</p>
                  </div>
                  <p className="text-white font-semibold">{profile.room_number}</p>
                </div>
              ) : null}
            </div>
          </motion.div>

          {/* Account Status */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            className="p-6 md:p-8 rounded-2xl liquid-glass hover:border-emerald-500/20 transition-all duration-300"
          >
            <h3 className="text-lg md:text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Account Status
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white/50" />
                  <span className="text-white/70">Email Verified</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profile.email_verified ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                  {profile.email_verified ? '✓ Yes' : '○ Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-white/50" />
                  <span className="text-white/70">Account Active</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profile.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  {profile.is_active ? '✓ Active' : '✗ Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-white/50" />
                  <span className="text-white/70">Verified Student</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profile.is_verified ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                  {profile.is_verified ? '✓ Verified' : '○ Pending'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Account Actions */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            className="p-6 md:p-8 rounded-2xl liquid-glass hover:border-red-500/20 transition-all duration-300"
          >
            <h3 className="text-lg md:text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-400" />
              Account Actions
            </h3>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
                onClick={handleLogout}
                className="w-full p-4 rounded-xl liquid-glass hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-300 flex items-center justify-center gap-2 text-red-300 hover:text-red-200 font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        !loading && (
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center py-16 md:py-24">
            <User className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Profile Not Available</h3>
            <p className="text-white/60 mb-6">{error || 'Unable to load your profile information'}</p>
            <motion.button
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg liquid-glass hover:border-emerald-500/20 text-emerald-300 transition-all duration-300"
            >
              Try Again
            </motion.button>
          </motion.div>
        )
      )}
    </motion.div>
  );
}
