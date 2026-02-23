'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createItem } from '@/services/admin-api';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import LiquidDropdown from '@/components/admin/liquid-dropdown';

interface FormData {
  name: string;
  description: string;
  category: string;
  location_found: string;
  location_stored: string;
  date_found: string;
  images: File[];
  status: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
}

interface RecordItemFormProps {
  onSuccess?: () => void;
  initialCategories?: Category[];
}

export default function RecordItemForm({ onSuccess, initialCategories = [] }: RecordItemFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: initialCategories.find((c) => c.is_active)?.name || 'Other',
    location_found: '',
    location_stored: '',
    date_found: new Date().toISOString().split('T')[0],
    images: [],
    status: 'unclaimed',
  });

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...formData.images, ...files].slice(0, 5);
    setFormData((prev) => ({ ...prev, images: newFiles }));

    // Generate preview URLs
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.name || !formData.location_found || !formData.date_found) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Create FormData for multipart upload
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('location_found', formData.location_found);
      data.append('location_stored', formData.location_stored);
      data.append('date_found', formData.date_found);
      data.append('status', formData.status);

      // Add images
      formData.images.forEach((image) => {
        data.append('images', image);
      });

      const response = await createItem(data);

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess(true);
        setFormData({
          name: '',
          description: '',
          category: categories.find((c) => c.is_active)?.name || 'Other',
          location_found: '',
          location_stored: '',
          date_found: new Date().toISOString().split('T')[0],
          images: [],
          status: 'unclaimed',
        });
        setPreviewUrls([]);

        // Call success callback after 2 seconds
        setTimeout(() => {
          setSuccess(false);
          onSuccess?.();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories
    .filter((c) => c.is_active)
    .map((c) => ({ value: c.name, label: c.name }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white">Report a Lost Item</h2>
        <p className="text-white/60 text-sm mt-1">Help us find your lost item by providing details</p>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass bg-green-500/10 border border-green-400/30 rounded-lg p-4 text-green-300"
        >
          Item reported successfully! Our team will help locate it.
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass bg-red-500/10 border border-red-400/30 rounded-lg p-4 text-red-300"
        >
          {error}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="border border-white/10 rounded-lg p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-4">Basic Information</h3>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Item Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Black iPhone 13"
              className="w-full px-4 py-2 rounded-lg liquid-glass text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the item in detail (color, brand, special markings, etc.)..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg liquid-glass text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <LiquidDropdown
                label="Category"
                value={formData.category}
                onChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                options={
                  categoryOptions.length > 0
                    ? categoryOptions
                    : [{ value: 'Other', label: 'Other' }]
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg liquid-glass text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              >
                <option value="unclaimed">Unclaimed</option>
                <option value="claimed">Claimed</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Location Information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border border-white/10 rounded-lg p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-4">Location Information</h3>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Where was it lost? <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="location_found"
              value={formData.location_found}
              onChange={handleInputChange}
              placeholder="e.g., Library - Study Room 201"
              className="w-full px-4 py-2 rounded-lg liquid-glass text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Where we are storing it</label>
            <input
              type="text"
              name="location_stored"
              value={formData.location_stored}
              onChange={handleInputChange}
              placeholder="e.g., Storage Locker B-12"
              className="w-full px-4 py-2 rounded-lg liquid-glass text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              When was it lost? <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              name="date_found"
              value={formData.date_found}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg liquid-glass text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              required
            />
          </div>
        </motion.div>

        {/* Images */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border border-white/10 rounded-lg p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-4">Photos</h3>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">Upload Photos (Max 5)</label>
            <div className="relative border-2 border-dashed border-white/20 rounded-lg p-6 hover:border-emerald-400/50 transition-all cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={formData.images.length >= 5}
              />
              <div className="text-center">
                <Plus className="w-8 h-8 text-white/40 mx-auto mb-2" />
                <p className="text-white/70">Click to upload or drag and drop</p>
                <p className="text-white/40 text-sm">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4"
        >
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {loading ? 'Reporting...' : 'Report Lost Item'}
          </Button>
          <Button
            type="reset"
            variant="outline"
            className="border-white/10 text-white hover:bg-white/10"
          >
            Clear
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
