'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, BarChart3 } from 'lucide-react';
import * as adminApi from '@/services/admin-api';

interface ReportData {
  type: 'users' | 'items' | 'summary';
  format: 'csv' | 'json';
}

export default function Reports() {
  const [reportType, setReportType] = useState<'users' | 'items' | 'summary'>('users');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const token = localStorage.getItem('access_token');
      
      const url = `${baseUrl}/api/admin/export/${reportType}?format=${format}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      if (format === 'json') {
        const data = await response.json();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const urlObj = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlObj;
        link.download = `${reportType}_export.json`;
        link.click();
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}_export.csv`;
        link.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-emerald-400" />
          Reports & Exports
        </h2>
      </div>

      {/* Report Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Report Type Selection */}
        <div className="lg:col-span-2 liquid-glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Report Type</h3>
          <div className="space-y-3">
            {[
              { id: 'users', label: 'Users Report', desc: 'Export all users data' },
              { id: 'items', label: 'Items Report', desc: 'Export all items inventory' },
              { id: 'summary', label: 'Summary Report', desc: 'Dashboard overview statistics' },
            ].map((option) => (
              <label
                key={option.id}
                className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition ${
                  reportType === option.id
                    ? 'bg-emerald-500/20 border border-emerald-400/40'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="reportType"
                  value={option.id}
                  checked={reportType === option.id}
                  onChange={(e) => setReportType(e.target.value as typeof reportType)}
                  className="mt-1"
                />
                <div>
                  <p className="text-white font-medium">{option.label}</p>
                  <p className="text-white/60 text-sm">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="liquid-glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Export Format</h3>
          <div className="space-y-2 mb-6">
            {[
              { id: 'csv', label: 'CSV', desc: 'Spreadsheet format' },
              { id: 'json', label: 'JSON', desc: 'JSON format' },
            ].map((fmt) => (
              <label
                key={fmt.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                  format === fmt.id
                    ? 'bg-blue-500/20 border border-blue-400/40'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={fmt.id}
                  checked={format === fmt.id}
                  onChange={(e) => setFormat(e.target.value as typeof format)}
                />
                <div>
                  <p className="text-white text-sm font-medium">{fmt.label}</p>
                  <p className="text-white/60 text-xs">{fmt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full px-4 py-3 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {loading ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </motion.div>

      {/* Report Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="liquid-glass rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Report Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/60 text-sm mb-1">Report Type</p>
            <p className="text-white font-semibold capitalize">{reportType}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/60 text-sm mb-1">Export Format</p>
            <p className="text-white font-semibold uppercase">{format}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/60 text-sm mb-1">Generated</p>
            <p className="text-white font-semibold">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="liquid-glass rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">About These Reports</h3>
        <ul className="space-y-2 text-white/70 text-sm">
          <li className="flex gap-3">
            <span className="text-emerald-400">•</span>
            <span><strong>Users Report:</strong> Contains all user information including names, emails, roles, and verification status.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400">•</span>
            <span><strong>Items Report:</strong> Lists all lost and found items with their status, category, and reporting information.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400">•</span>
            <span><strong>Summary Report:</strong> High-level overview of system statistics and activity metrics.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400">•</span>
            <span><strong>CSV Format:</strong> Best for spreadsheets and data analysis in Excel or Google Sheets.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400">•</span>
            <span><strong>JSON Format:</strong> Best for integration with other systems and programmatic access.</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
