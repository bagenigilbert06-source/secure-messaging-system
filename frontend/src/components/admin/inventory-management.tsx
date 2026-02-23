'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit2, Search, Package, Download, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteAdminItem, updateAdminItem, getAllItems } from '@/services/admin-api';
import LiquidDropdown from './liquid-dropdown';

interface Item {
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
}

interface InventoryManagementProps {
  initialItems: {
    items?: Item[];
    total?: number;
  };
}

const ITEMS_PER_PAGE = 3;

export default function InventoryManagement({ initialItems }: InventoryManagementProps) {
  const [items, setItems] = useState<Item[]>(initialItems.items || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(!initialItems?.items || initialItems.items.length === 0);

  // Fetch fresh items immediately on mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await getAllItems(1, 50);
        
        // Handle both response.data and direct response structures
        const fetchedItems = response.data?.items || response.items || [];
        
        if (Array.isArray(fetchedItems) && fetchedItems.length > 0) {
          setItems(fetchedItems);
        }
      } catch (error) {
        // Use initial items from server if API fetch fails
      } finally {
        setIsLoading(false);
      }
    };

    // Start with spinner if no initial data, otherwise show initial data immediately
    if (!initialItems?.items || initialItems.items.length === 0) {
      setIsLoading(true);
    }
    
    fetchItems();
  }, [initialItems]);

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteAdminItem(itemId);
      setItems(items.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    try {
      await updateAdminItem(itemId, { status: newStatus });
      setItems(items.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item)));
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    }
  };

  // Pagination logic
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (canGoPrev) setCurrentPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (canGoNext) setCurrentPage(prev => prev + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Clean Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Inventory</h2>
          <p className="text-sm text-white/60 mt-1">Manage campus lost & found items</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Clean Filters - Compact Layout */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded border border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all text-sm"
          />
        </div>

        <LiquidDropdown
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
          options={[
            { value: '', label: 'All Status' },
            { value: 'unclaimed', label: 'Unclaimed' },
            { value: 'claimed', label: 'Claimed' },
            { value: 'processing', label: 'Processing' },
          ]}
          placeholder="All Status"
          className="w-40"
        />

        <LiquidDropdown
          value={categoryFilter}
          onChange={(value) => {
            setCategoryFilter(value);
            setCurrentPage(1);
          }}
          options={[
            { value: '', label: 'All Categories' },
            { value: 'electronics', label: 'Electronics' },
            { value: 'accessories', label: 'Accessories' },
            { value: 'documents', label: 'Documents' },
            { value: 'other', label: 'Other' },
          ]}
          placeholder="All Categories"
          className="w-40"
        />
      </div>

      {/* Clean Table */}
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <AnimatePresence mode="wait">
          {isLoading && items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <div className="flex items-center gap-2 text-white/60">
                <Loader className="w-5 h-5 animate-spin text-teal-400" />
                <span>Loading inventory...</span>
              </div>
            </motion.div>
          ) : paginatedItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-white/60"
            >
              <Package className="w-8 h-8 mb-3 opacity-50" />
              <p className="font-medium">No items found</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-x-auto"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-3 text-left font-medium text-white/80">Name</th>
                    <th className="px-6 py-3 text-left font-medium text-white/80">Category</th>
                    <th className="px-6 py-3 text-left font-medium text-white/80">Status</th>
                    <th className="px-6 py-3 text-left font-medium text-white/80">Found</th>
                    <th className="px-6 py-3 text-right font-medium text-white/80">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {paginatedItems.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">{item.name}</p>
                          <p className="text-xs text-white/50 mt-1">{item.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {item.status === 'claimed' ? (
                            <><CheckCircle2 className="w-4 h-4 text-green-400" /><span className="text-green-400">Claimed</span></>
                          ) : item.status === 'processing' ? (
                            <><Clock className="w-4 h-4 text-amber-400" /><span className="text-amber-400">Processing</span></>
                          ) : (
                            <><AlertCircle className="w-4 h-4 text-slate-400" /><span className="text-slate-400">Unclaimed</span></>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/60">
                        {new Date(item.date_found).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <LiquidDropdown
                            value={item.status}
                            onChange={(value) => handleStatusChange(item.id, value)}
                            options={[
                              { value: 'unclaimed', label: 'Unclaimed' },
                              { value: 'claimed', label: 'Claimed' },
                              { value: 'processing', label: 'Processing' },
                            ]}
                            className="w-32"
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between pt-4"
        >
          <p className="text-sm text-white/60">
            {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={!canGoPrev}
              className={`p-2 rounded transition-colors ${
                canGoPrev
                  ? 'hover:bg-white/10 text-white'
                  : 'text-white/30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-white/60">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`p-2 rounded transition-colors ${
                canGoNext
                  ? 'hover:bg-white/10 text-white'
                  : 'text-white/30 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

    </motion.div>
  );
}
