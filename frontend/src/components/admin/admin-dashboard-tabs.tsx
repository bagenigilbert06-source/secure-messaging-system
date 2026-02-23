'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  MessageSquare,
  TrendingUp,
  Settings,
  BarChart3,
  Users,
  FileText,
  Clock,
} from 'lucide-react';

import InventoryManagement from './inventory-management';
import AnalyticsDashboard from './analytics-dashboard';
import RecordItemForm from './record-item-form';
import InquiriesPanel from './inquiries-panel';
import AdminClaimConversations from './admin-claim-conversations';
import AdminStatsCards from './stats-cards';
import UserManagement from './user-management';
import Reports from './reports';
import ActivityLogs from './activity-logs';

interface AdminDashboardTabsProps {
  initialItems: {
    items?: Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      status: string;
      location_found: string;
      location_stored?: string;
      date_found: string;
      images?: Array<{ url: string }>;
      created_at: string;
    }>;
    total?: number;
  };
  initialMessages: {
    messages?: Array<{
      id: string;
      sender_id: string;
      sender?: { name: string; email: string };
      item_id: string;
      item?: { name: string };
      subject: string;
      body: string;
      status: string;
      created_at: string;
    }>;
    total?: number;
  };
  initialUsers?: {
    users?: Array<{
      id: string;
      name: string;
      email: string;
      student_id?: string;
      role: string;
      is_verified: boolean;
      is_active: boolean;
      created_at: string;
    }>;
    total?: number;
  };
  initialStats?: {
    total_users?: number;
    total_items?: number;
    total_messages?: number;
    items_by_status?: Record<string, number>;
    users?: {
      total?: number;
      students?: number;
      admins?: number;
      verified?: number;
      active?: number;
    };
    items?: {
      total?: number;
      unclaimed?: number;
      claimed?: number;
      collected?: number;
      by_category?: Record<string, number>;
    };
    messages?: {
      total?: number;
      unread?: number;
    };
    departments?: Record<string, number>;
    activity?: {
      recent_registrations?: number;
      recent_items?: number;
    };
  };
}

type TabKey = 'overview' | 'inventory' | 'record' | 'inquiries' | 'users' | 'reports' | 'activity-logs' | 'analytics';

interface Tab {
  id: TabKey;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const tabs: Tab[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <BarChart3 className="w-4 h-4" />,
    color: 'emerald',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: <Package className="w-4 h-4" />,
    color: 'emerald',
  },
  {
    id: 'record',
    label: 'Record Item',
    icon: <Plus className="w-4 h-4" />,
    color: 'blue',
  },
  {
    id: 'inquiries',
    label: 'Claims',
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'purple',
  },
  {
    id: 'users',
    label: 'Users',
    icon: <Users className="w-4 h-4" />,
    color: 'cyan',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <FileText className="w-4 h-4" />,
    color: 'orange',
  },
  {
    id: 'activity-logs',
    label: 'Activity Logs',
    icon: <Clock className="w-4 h-4" />,
    color: 'amber',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'amber',
  },
];

export default function AdminDashboardTabs({
  initialItems,
  initialMessages,
  initialUsers,
  initialStats,
}: AdminDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <AdminStatsCards stats={initialStats || {}} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                key="inventory-preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <InventoryManagement initialItems={initialItems} />
              </motion.div>
              <motion.div
                key="messages-preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <InquiriesPanel initialMessages={initialMessages} />
              </motion.div>
            </div>
          </div>
        );

      case 'inventory':
        return <InventoryManagement initialItems={initialItems} />;

      case 'record':
        return <RecordItemForm onSuccess={() => setActiveTab('inventory')} />;

      case 'inquiries':
        return (
          <AdminClaimConversations 
            conversations={initialMessages?.messages?.map((msg: any) => ({
              id: msg.id,
              claimId: msg.id,
              studentInfo: {
                id: msg.sender_id,
                name: msg.sender?.name || 'Unknown',
                email: msg.sender?.email || '',
                phone: msg.sender?.phone,
                idNumber: msg.sender?.student_id,
              },
              itemInfo: {
                id: msg.item_id,
                name: msg.item?.name || 'Unknown Item',
                description: msg.body,
                category: msg.item?.category || '',
                location: msg.item?.location_found || '',
                dateFound: msg.created_at,
                imageUrl: msg.item?.images?.[0]?.url,
              },
              status: msg.status || 'pending',
              messages: msg.messages || [],
              unreadCount: 0,
              createdAt: msg.created_at,
              updatedAt: msg.created_at,
            })) || []}
            isLoading={false}
          />
        );

      case 'users':
        return <UserManagement initialUsers={initialUsers} />;

      case 'reports':
        return <Reports />;

      case 'activity-logs':
        return <ActivityLogs />;

      case 'analytics':
        return <AnalyticsDashboard />;

      default:
        return null;
    }
  };

  const activeTabObj = tabs.find((tab) => tab.id === activeTab);

  const getTabColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500/30 text-blue-200 border-blue-400/60 shadow-lg shadow-blue-500/20';
      case 'purple':
        return 'bg-purple-500/30 text-purple-200 border-purple-400/60 shadow-lg shadow-purple-500/20';
      case 'amber':
        return 'bg-amber-500/30 text-amber-200 border-amber-400/60 shadow-lg shadow-amber-500/20';
      case 'cyan':
        return 'bg-cyan-500/30 text-cyan-200 border-cyan-400/60 shadow-lg shadow-cyan-500/20';
      case 'orange':
        return 'bg-orange-500/30 text-orange-200 border-orange-400/60 shadow-lg shadow-orange-500/20';
      default:
        return 'bg-emerald-500/30 text-emerald-200 border-emerald-400/60 shadow-lg shadow-emerald-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Tab Navigation - Enhanced Design */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="liquid-glass rounded-3xl p-1 overflow-x-auto backdrop-blur-xl border border-white/10"
      >
        <div className="flex gap-1">
          {tabs.map((tab, idx) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`relative px-5 py-3 rounded-2xl font-semibold text-sm flex items-center gap-2 whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? `${getTabColor(tab.color)} border backdrop-blur-lg`
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5 border border-transparent'
              }`}
            >
              <motion.span
                className="flex items-center gap-2"
                animate={{ scale: activeTab === tab.id ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </motion.span>

              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-2xl -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Content Area - Enhanced */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
          className="rounded-3xl"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
