'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Bell, Lock, Globe, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LiquidDropdown from './liquid-dropdown';

interface SettingsPanelProps {}

export default function SettingsPanel({}: SettingsPanelProps) {
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
      // Simulate API call
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white">Settings</h2>
        <p className="text-white/60 text-sm mt-1">Configure system settings and preferences</p>
      </div>

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="border border-white/10 rounded-lg p-6 space-y-4"
      >
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-4">General</h3>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Site Name</label>
          <input
            type="text"
            name="siteName"
            value={settings.siteName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg liquid-glass text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Site Description</label>
          <textarea
            name="siteDescription"
            value={settings.siteDescription}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-400/50 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Contact Email</label>
            <input
              type="email"
              name="contactEmail"
              value={settings.contactEmail}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-400/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Items Per Page</label>
            <input
              type="number"
              name="itemsPerPage"
              value={settings.itemsPerPage}
              onChange={handleInputChange}
              min="5"
              max="100"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-400/50 transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* File Upload Settings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="border border-white/10 rounded-lg p-6 space-y-4"
      >
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-4">File Storage</h3>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Max Upload Size (MB)</label>
          <input
            type="number"
            name="maxUploadSize"
            value={settings.maxUploadSize}
            onChange={handleInputChange}
            min="1"
            max="100"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
          />
          <p className="text-white/40 text-xs mt-1">Maximum file size for item images</p>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="border border-white/10 rounded-lg p-6 space-y-4"
      >
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-4">Notifications</h3>

        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
          <div>
            <p className="font-medium text-white">Enable Email Notifications</p>
            <p className="text-white/60 text-sm">Send notifications for new items and messages</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="enableNotifications"
              checked={settings.enableNotifications}
              onChange={handleInputChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500/50"></div>
          </label>
        </div>

        {settings.enableNotifications && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">Notification Email</label>
            <input
              type="email"
              name="notificationEmail"
              value={settings.notificationEmail}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition-all"
            />
          </div>
        )}
      </motion.div>

      {/* System Settings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="border border-white/10 rounded-lg p-6 space-y-4"
      >
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-4">System</h3>

        {/* Maintenance Mode */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
          <div>
            <p className="font-medium text-white">Maintenance Mode</p>
            <p className="text-white/60 text-sm">Disable access while performing maintenance</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleInputChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500/50"></div>
          </label>
        </div>

        {/* Auto Archive */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
          <div>
            <p className="font-medium text-white">Auto-Archive Items</p>
            <p className="text-white/60 text-sm">Automatically archive old unclaimed items</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="autoArchiveItems"
              checked={settings.autoArchiveItems}
              onChange={handleInputChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500/50"></div>
          </label>
        </div>

        {settings.autoArchiveItems && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">Archive After (Days)</label>
            <input
              type="number"
              name="archiveAfterDays"
              value={settings.archiveAfterDays}
              onChange={handleInputChange}
              min="7"
              max="365"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-400/50 transition-all"
            />
          </div>
        )}
      </motion.div>

      {/* Warning */}
      {settings.maintenanceMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-4 flex items-start gap-3 text-amber-300"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Maintenance Mode Enabled</p>
            <p className="text-sm text-amber-300/70">
              Users will not be able to access the system until maintenance mode is disabled.
            </p>
          </div>
        </motion.div>
      )}

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-4"
      >
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </motion.div>
    </motion.div>
  );
}
