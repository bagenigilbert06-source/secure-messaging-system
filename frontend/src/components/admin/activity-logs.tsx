'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, ChevronDown } from 'lucide-react';
import * as adminApi from '@/services/admin-api';

interface ActivityLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  old_values?: any;
  new_values?: any;
  details?: string;
  created_at: string;
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter, searchTerm]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getActivityLogs(
        1,
        100,
        actionFilter || undefined,
        entityFilter || undefined
      );
      if (response.data) {
        let filteredLogs = response.data.logs || [];
        if (searchTerm) {
          filteredLogs = filteredLogs.filter(log =>
            log.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.admin_name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setLogs(filteredLogs);
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    }
    setLoading(false);
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      activate: '✓',
      deactivate: '✗',
    };
    return icons[action] || '📝';
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      update: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
      delete: 'bg-red-500/20 text-red-300 border-red-400/40',
      activate: 'bg-green-500/20 text-green-300 border-green-400/40',
      deactivate: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
    };
    return colors[action] || 'bg-white/10 text-white/70 border-white/20';
  };

  const getEntityIcon = (entity: string) => {
    const icons: Record<string, string> = {
      user: '👤',
      item: '📦',
      category: '🏷️',
      department: '🏢',
      location: '📍',
    };
    return icons[entity] || '📋';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Clock className="w-8 h-8 text-amber-400" />
          Activity Logs
        </h2>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="liquid-glass rounded-2xl p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search by name or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/40"
            />
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-400/40"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="activate">Activate</option>
            <option value="deactivate">Deactivate</option>
          </select>

          {/* Entity Filter */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-400/40"
          >
            <option value="">All Entities</option>
            <option value="user">Users</option>
            <option value="item">Items</option>
            <option value="category">Categories</option>
            <option value="department">Departments</option>
            <option value="location">Locations</option>
          </select>
        </div>
      </motion.div>

      {/* Activity Logs Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        {loading ? (
          <div className="text-center py-8 text-white/40">Loading activity logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-white/40">No activity logs found</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="liquid-glass rounded-xl overflow-hidden transition hover:bg-white/10"
            >
              {/* Main Log Entry */}
              <div
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                className="p-4 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-2xl mt-1">{getEntityIcon(log.entity_type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getActionColor(log.action_type)}`}>
                        {getActionIcon(log.action_type)} {log.action_type.toUpperCase()}
                      </span>
                      <span className="text-white/60 text-xs">
                        {log.entity_type.toUpperCase()}
                      </span>
                      <span className="text-white font-semibold truncate">
                        {log.entity_name || log.entity_id}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-white/60">
                      <span>by <strong className="text-white">{log.admin_name}</strong></span>
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  {(log.old_values || log.new_values) && (
                    <motion.div
                      animate={{ rotate: expandedLog === log.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-white/40" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedLog === log.id && (log.old_values || log.new_values || log.details) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/10 p-4 bg-white/5"
                >
                  <div className="space-y-3 text-sm">
                    {log.details && (
                      <div>
                        <p className="text-white/60 mb-1">Details:</p>
                        <p className="text-white bg-white/5 rounded p-2">{log.details}</p>
                      </div>
                    )}

                    {log.old_values && Object.keys(log.old_values).length > 0 && (
                      <div>
                        <p className="text-white/60 mb-1">Previous Values:</p>
                        <div className="bg-red-500/10 rounded p-2 space-y-1 max-h-40 overflow-y-auto">
                          {Object.entries(log.old_values).map(([key, value]) => (
                            <div key={key} className="text-white/80">
                              <span className="text-red-400">{key}:</span> {JSON.stringify(value)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {log.new_values && Object.keys(log.new_values).length > 0 && (
                      <div>
                        <p className="text-white/60 mb-1">New Values:</p>
                        <div className="bg-emerald-500/10 rounded p-2 space-y-1 max-h-40 overflow-y-auto">
                          {Object.entries(log.new_values).map(([key, value]) => (
                            <div key={key} className="text-white/80">
                              <span className="text-emerald-400">{key}:</span> {JSON.stringify(value)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          ))
        )}
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="liquid-glass rounded-xl p-4"
      >
        <p className="text-white/60 text-sm mb-3">Legend:</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { action: 'create', label: 'Create' },
            { action: 'update', label: 'Update' },
            { action: 'delete', label: 'Delete' },
            { action: 'activate', label: 'Activate' },
            { action: 'deactivate', label: 'Deactivate' },
          ].map((item) => (
            <div key={item.action} className={`px-3 py-2 rounded text-xs font-medium border ${getActionColor(item.action)}`}>
              {item.label}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
