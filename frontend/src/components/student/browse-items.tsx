'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  Tag,
  MapPin,
  Clock,
  Inbox,
  X,
} from 'lucide-react';
import { claimItem } from '@/services/api';

interface ApiItem {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  location_found: string;
  date_found: string;
  images?: Array<{ id: string }>;
}

interface BrowseItemsProps {
  initialItems: {
    items?: ApiItem[];
    total?: number;
  };
  initialCategories?: {
    categories?: string[];
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

export default function BrowseItems({ initialItems, initialCategories }: BrowseItemsProps) {
  const items = initialItems.items || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<ApiItem | null>(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimProof, setClaimProof] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatedCategories = useMemo(() => {
    // Use categories from server if available
    const serverCategories = initialCategories?.categories || [];
    
    if (serverCategories.length > 0) {
      // Filter out 'Other' and add 'All' at the beginning
      const filtered = serverCategories.filter(c => c.toLowerCase() !== 'other');
      return ['All', ...filtered];
    }

    // Fallback to calculating from items if no server categories
    const predefined = ['All', 'Electronics', 'Documents', 'Clothing', 'Accessories', 'Keys', 'Bags', 'Books', 'Jewelry'];
    const uniqueCategories = new Set(predefined);

    items.forEach(item => {
      if (item.category) {
        const normalized = item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase();
        uniqueCategories.add(normalized);
      }
    });

    const categories = Array.from(uniqueCategories).sort((a, b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      return a.localeCompare(b);
    });

    return categories;
  }, [items, initialCategories]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location_found.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, items]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !claimProof.trim()) {
      setError('Please provide proof of ownership');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await claimItem(selectedItem.id, claimProof);
      if (response.error) {
        setError(`Error: ${response.error}`);
      } else {
        setShowSuccess(true);
        setClaimProof('');
        setShowClaimForm(false);
        setSelectedItem(null);
        setTimeout(() => setShowSuccess(false), 5000);
      }
    } catch (err) {
      setError('Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

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
      key="browse"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-12 text-center">
        <motion.div variants={fadeInUp} initial="initial" animate="animate">
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 tracking-tight">
            Find Your Lost Items
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto font-light">
            Browse through {items.length} items found on campus. If you find something that looks familiar, send a claim with proof of ownership.
          </p>
        </motion.div>
      </div>

      {/* Search Bar */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="mb-8"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by item name, location, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 liquid-glass text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 font-light rounded-2xl"
            style={{ willChange: 'border-color, box-shadow' }}
          />
        </div>
      </motion.div>

      {/* Category Filters */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="flex flex-wrap gap-2 mb-12"
      >
        {calculatedCategories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${selectedCategory === category
                ? 'liquid-glass text-emerald-300'
                : 'bg-white/5 border border-white/10 text-white/70 hover:border-white/20 hover:text-white'
              }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      {/* Results Summary */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="mb-8 flex items-center justify-between"
      >
        <p className="text-white/60 font-light">
          Showing{' '}
          <span className="font-semibold text-white">{filteredItems.length}</span>{' '}
          item{filteredItems.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-emerald-500/20 border border-emerald-400/60 text-emerald-200 rounded-2xl flex items-center justify-between"
          >
            <span>Claim submitted successfully! Check your Messages for updates.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-400/60 text-red-200 rounded-2xl flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="hover:text-red-100">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -4 }}
              className="group rounded-2xl liquid-glass overflow-hidden p-5 cursor-pointer transition-all duration-300"
            >
              {/* Item Image */}
              <div className="relative h-40 mb-4 rounded-lg overflow-hidden bg-white/5">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/items/images/${item.images[0].id}/download`}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tag className="w-8 h-8 text-white/30" />
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-emerald-500/30 transition-all"
                >
                  {favorites.includes(item.id) ? (
                    <Heart className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                  ) : (
                    <Heart className="w-5 h-5 text-white/60" />
                  )}
                </motion.button>
              </div>

              {/* Item Details */}
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{item.name}</h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Tag className="w-4 h-4" />
                  {item.category}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <MapPin className="w-4 h-4" />
                  {item.location_found}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Clock className="w-4 h-4" />
                  {formatDate(item.date_found)}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedItem(item);
                  setShowClaimForm(true);
                }}
                className="w-full py-2.5 liquid-glass text-emerald-300 rounded-lg font-semibold transition-all text-sm"
              >
                Claim Item
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center py-24">
          <Inbox className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">No Items Found</h3>
          <p className="text-white/60">Try adjusting your search or filters</p>
        </motion.div>
      )}

      {/* Claim Modal */}
      <AnimatePresence>
        {showClaimForm && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowClaimForm(false);
              setError(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-stone-900 rounded-2xl p-6 max-w-md w-full border border-white/10 liquid-glass"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Claim Item</h2>
                <button
                  onClick={() => {
                    setShowClaimForm(false);
                    setError(null);
                  }}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-white/70 mb-6 font-semibold">{selectedItem.name}</p>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-3 bg-red-500/20 border border-red-400/60 text-red-200 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Proof of Ownership
                  </label>
                  <textarea
                    value={claimProof}
                    onChange={(e) => setClaimProof(e.target.value)}
                    placeholder="Describe distinctive features that prove this is your item..."
                    rows={4}
                    disabled={submitting}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowClaimForm(false);
                      setClaimProof('');
                      setError(null);
                    }}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !claimProof.trim()}
                    className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-all font-semibold"
                  >
                    {submitting ? 'Submitting...' : 'Submit Claim'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
