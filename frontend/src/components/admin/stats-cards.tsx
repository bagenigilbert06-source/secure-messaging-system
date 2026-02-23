'use client';

import { motion } from 'framer-motion';
import { Users, Package, MessageSquare } from 'lucide-react';

interface StatsCardsProps {
  stats?: {
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
  };
}

export default function AdminStatsCards({ stats = {} }: StatsCardsProps) {
  // Handle both flat and nested stats structures
  const total_users = stats.total_users ?? stats.users?.total ?? 0;
  const total_items = stats.total_items ?? stats.items?.total ?? 0;
  const total_messages = stats.total_messages ?? stats.messages?.total ?? 0;
  const items_by_status = stats.items_by_status ?? {
    unclaimed: stats.items?.unclaimed ?? 0,
    claimed: stats.items?.claimed ?? 0,
    collected: stats.items?.collected ?? 0,
  };

  const statCards = [
    {
      label: 'Total Users',
      value: total_users,
      icon: Users,
      color: 'text-blue-400',
    },
    {
      label: 'Total Items',
      value: total_items,
      icon: Package,
      color: 'text-green-400',
    },
    {
      label: 'Total Messages',
      value: total_messages,
      icon: MessageSquare,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 font-medium">{card.label}</p>
                <p className="text-3xl font-semibold text-white mt-2">{card.value.toLocaleString()}</p>
              </div>
              <Icon className={`w-8 h-8 ${card.color} opacity-60`} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
