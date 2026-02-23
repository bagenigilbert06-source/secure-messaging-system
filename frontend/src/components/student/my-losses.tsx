'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Inbox } from 'lucide-react';

interface ApiItem {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

interface MyLossesProps {
  initialItems: {
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

export default function MyLosses({ initialItems }: MyLossesProps) {
  const userItems = initialItems.items || [];

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
      key="losses"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 tracking-tight">
          My Losses
        </h1>
        <p className="text-lg text-white/60 max-w-2xl font-light">
          Items you've reported as lost. We'll notify you when they're found.
        </p>
      </div>

      {userItems.length > 0 ? (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-5"
        >
          {userItems.map((item) => (
            <motion.div
              key={item.id}
              variants={fadeInUp}
              whileHover={{ scale: 1.01, y: -2 }}
              className="p-7 rounded-2xl liquid-glass hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <div className="p-3.5 rounded-xl liquid-glass flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'unclaimed' ? 'liquid-glass text-yellow-300' :
                        item.status === 'claimed' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-emerald-500/20 text-emerald-300'
                      }`}>
                      {item.status === 'unclaimed' ? 'Searching' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    <span className="text-xs text-white/50">{formatDate(item.created_at)}</span>
                  </div>
                  <p className="text-sm text-white/70">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center py-24">
          <Inbox className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">No Losses Reported</h3>
          <p className="text-white/60">When you report a lost item, it will appear here</p>
        </motion.div>
      )}
    </motion.div>
  );
}
