'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Inbox } from 'lucide-react';
import { collectItem } from '@/services/api';

interface ApiItem {
  id: string;
  name: string;
  description: string;
  status: string;
  claimed_at?: string;
  created_at: string;
}

interface MyClaimsProps {
  initialClaims: {
    items?: ApiItem[];
    total?: number;
  };
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export default function MyClaims({ initialClaims }: MyClaimsProps) {
  const claims = initialClaims.items || [];
  const [userClaims, setUserClaims] = useState<ApiItem[]>(claims);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <motion.div
      key="claims"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 tracking-tight">
          My Claims
        </h1>
        <p className="text-lg text-white/60 max-w-2xl font-light">
          Track the status of items you've claimed. The Security Office will verify your ownership and update you here.
        </p>
      </div>

      {userClaims.length > 0 ? (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-5"
        >
          {userClaims.map((item) => (
            <motion.div
              key={item.id}
              variants={fadeInUp}
              whileHover={{ scale: 1.01, y: -2 }}
              className="p-7 rounded-2xl liquid-glass hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <div className="p-3.5 rounded-xl liquid-glass flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'claimed' ? 'liquid-glass text-emerald-300' :
                        item.status === 'collected' ? 'bg-emerald-500/20 text-emerald-300' :
                          'bg-yellow-500/20 text-yellow-300'
                      }`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    <span className="text-xs text-white/50">{formatDate(item.claimed_at || item.created_at)}</span>
                  </div>
                  <p className="text-sm text-white/70 mb-4">{item.description}</p>
                  {item.status === 'claimed' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        const result = await collectItem(item.id);
                        if (!result.error) {
                          setUserClaims(userClaims.map(i => i.id === item.id ? { ...i, status: 'collected' } : i));
                        }
                      }}
                      className="px-5 py-2.5 liquid-glass text-emerald-300 rounded-lg font-semibold transition-all text-sm"
                    >
                      Mark as Collected
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center py-24">
          <Inbox className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">No Claims Yet</h3>
          <p className="text-white/60 mb-8">When you submit a claim for an item, it will appear here</p>
        </motion.div>
      )}
    </motion.div>
  );
}
