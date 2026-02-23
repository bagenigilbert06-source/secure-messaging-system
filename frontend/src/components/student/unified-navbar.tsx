'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  User,
  LogOut,
  Menu,
  X,
  Plus,
} from 'lucide-react';

interface UnifiedNavbarProps {
  studentName: string;
  onLogout: () => void;
  activeTab: 'browse' | 'claims' | 'inquiries' | 'losses' | 'profile' | 'report';
  onTabChange: (tab: 'browse' | 'claims' | 'inquiries' | 'losses' | 'profile' | 'report') => void;
  unreadMessages?: number;
}

const tabs = [
  {
    id: 'browse' as const,
    label: 'Browse Items',
    icon: Search,
  },
  {
    id: 'claims' as const,
    label: 'My Claims',
    icon: CheckCircle2,
  },
  {
    id: 'report' as const,
    label: 'Report Lost Item',
    icon: Plus,
  },
  {
    id: 'inquiries' as const,
    label: 'Inquiries',
    icon: MessageSquare,
  },
  {
    id: 'losses' as const,
    label: 'My Losses',
    icon: AlertCircle,
  },
  {
    id: 'profile' as const,
    label: 'Profile',
    icon: User,
  },
];

export default function UnifiedNavbar({
  studentName,
  onLogout,
  activeTab,
  onTabChange,
  unreadMessages = 0,
}: UnifiedNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 z-50 liquid-glass mx-3 mt-3 rounded-2xl"
      style={{ willChange: 'transform' }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="font-display font-black text-3xl tracking-tight text-white whitespace-nowrap flex-shrink-0"
          >
            CampusFind
          </motion.div>

          {/* Desktop Tab Navigation - Center */}
          <div className="hidden lg:flex items-center gap-2 flex-1 justify-center px-4">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 text-xs ${
                    isActive
                      ? 'bg-emerald-600/30 text-emerald-300 shadow-lg shadow-emerald-500/20'
                      : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                  {tab.id === 'inquiries' && unreadMessages > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-1 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-xs rounded-full font-bold shadow-lg shadow-emerald-500/30"
                    >
                      {unreadMessages}
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Right Section - User Info & Logout */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {/* User Profile Area */}
            <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
              <div className="text-right">
                <div className="text-white font-semibold text-xs">{studentName}</div>
              </div>
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-all duration-300"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-white/10 pt-4 pb-4 space-y-2"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onTabChange(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-600/30 text-emerald-300 shadow-lg shadow-emerald-500/20'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                    {tab.id === 'inquiries' && unreadMessages > 0 && (
                      <span className="ml-auto px-2.5 py-1 bg-emerald-500 text-white text-xs rounded-full font-bold">
                        {unreadMessages}
                      </span>
                    )}
                  </motion.button>
                );
              })}

              <div className="border-t border-white/10 pt-4 mt-4 flex flex-col gap-3 sm:hidden">
                <div className="text-white text-sm font-semibold px-2">{studentName}</div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors font-semibold"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
