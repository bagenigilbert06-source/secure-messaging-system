'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Package, Settings, Save, Bell, Database, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminDashboardHeaderProps {
  adminName?: string;
  onLogout?: () => void;
}

export default function AdminDashboardHeader({ adminName, onLogout }: AdminDashboardHeaderProps = {}) {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Lost & Found System',
    siteDescription: 'A platform for managing lost and found items on campus',
    contactEmail: 'admin@example.com',
    maxUploadSize: 10,
    itemsPerPage: 20,
    enableNotifications: true,
    notificationEmail: 'notifications@example.com',
    maintenanceMode: false,
    autoArchiveItems: true,
    archiveAfterDays: 90,
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 mx-4 mt-3 rounded-2xl liquid-glass">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">CampusFind</h1>
                <p className="text-xs text-emerald-400">Admin Dashboard</p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {adminName && (
                <span className="hidden sm:inline text-sm text-white/70">
                  Welcome, <span className="font-semibold text-white">{adminName}</span>
                </span>
              )}
              <Button
                onClick={() => setShowSettings(true)}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden md:inline">Settings</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-stone-900 rounded-3xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 flex items-center justify-between p-6 border-b border-white/10 bg-stone-900/95 backdrop-blur">
                <h2 className="text-2xl font-bold text-white">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Success Message */}
                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="liquid-glass bg-green-500/10 border border-green-400/30 rounded-lg p-4 flex items-center gap-3 text-green-300"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Settings saved successfully!</span>
                  </motion.div>
                )}

                {/* General Settings */}
                <div className="border border-white/10 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">General</h3>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Site Name</label>
                    <input
                      type="text"
                      name="siteName"
                      value={settings.siteName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Site Description</label>
                    <textarea
                      name="siteDescription"
                      value={settings.siteDescription}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Contact Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={settings.contactEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                {/* System Settings */}
                <div className="border border-white/10 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">System</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Max Upload Size (MB)</label>
                      <input
                        type="number"
                        name="maxUploadSize"
                        value={settings.maxUploadSize}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Items Per Page</label>
                      <input
                        type="number"
                        name="itemsPerPage"
                        value={settings.itemsPerPage}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Maintenance Mode</p>
                        <p className="text-xs text-white/60">Take the site offline</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      name="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onChange={handleInputChange}
                      className="w-5 h-5"
                    />
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="border border-white/10 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </h3>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <p className="text-sm font-medium text-white">Enable Notifications</p>
                      <p className="text-xs text-white/60">Send system notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      name="enableNotifications"
                      checked={settings.enableNotifications}
                      onChange={handleInputChange}
                      className="w-5 h-5"
                    />
                  </div>

                  {settings.enableNotifications && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Notification Email</label>
                      <input
                        type="email"
                        name="notificationEmail"
                        value={settings.notificationEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  )}
                </div>

                {/* Archive Settings */}
                <div className="border border-white/10 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Archive
                  </h3>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <p className="text-sm font-medium text-white">Auto Archive Items</p>
                      <p className="text-xs text-white/60">Automatically archive old items</p>
                    </div>
                    <input
                      type="checkbox"
                      name="autoArchiveItems"
                      checked={settings.autoArchiveItems}
                      onChange={handleInputChange}
                      className="w-5 h-5"
                    />
                  </div>

                  {settings.autoArchiveItems && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Archive After (Days)</label>
                      <input
                        type="number"
                        name="archiveAfterDays"
                        value={settings.archiveAfterDays}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 flex gap-3 p-6 border-t border-white/10 bg-stone-900/95 backdrop-blur justify-end">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
