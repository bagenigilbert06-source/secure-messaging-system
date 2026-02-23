'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import * as adminApi from '@/services/admin-api';

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
}

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    icon: '',
    color: 'bg-blue-500',
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getCategories(1, 100);
      if (response.data) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
    setLoading(false);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      color: 'bg-blue-500',
      is_active: true,
    });
    setShowForm(true);
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData(category);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      if (editingId) {
        await adminApi.updateCategory(editingId, formData);
        setCategories(categories.map(c => c.id === editingId ? { ...c, ...formData } : c));
      } else {
        const response = await adminApi.createCategory(formData);
        if (response.data?.category) {
          setCategories([...categories, response.data.category]);
        }
      }
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await adminApi.deleteCategory(categoryId);
        setCategories(categories.filter(c => c.id !== categoryId));
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert('Failed to delete category');
      }
    }
  };

  const colorOptions = [
    { name: 'Blue', value: 'bg-blue-500' },
    { name: 'Green', value: 'bg-green-500' },
    { name: 'Purple', value: 'bg-purple-500' },
    { name: 'Red', value: 'bg-red-500' },
    { name: 'Yellow', value: 'bg-yellow-500' },
    { name: 'Pink', value: 'bg-pink-500' },
    { name: 'Cyan', value: 'bg-cyan-500' },
    { name: 'Orange', value: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Categories Management</h2>
        {!showForm && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition"
          >
            <Plus className="w-4 h-4" />
            New Category
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Edit Category' : 'New Category'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category name"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/40"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Category description"
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/40"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Icon</label>
              <input
                type="text"
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="Icon name or emoji"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/40"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Color</label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`h-10 rounded-lg border-2 transition ${
                      formData.color === color.value
                        ? 'border-white'
                        : 'border-white/20'
                    } ${color.value}`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                id="is_active"
              />
              <label htmlFor="is_active" className="text-white/80">
                Active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-red-500/20 border border-red-400/40 text-red-300 rounded-lg hover:bg-red-500/30 transition flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Categories Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {loading ? (
          <div className="col-span-full text-center py-8 text-white/40">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-8 text-white/40">
            No categories found
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="liquid-glass rounded-xl p-4 border border-white/10 hover:border-white/20 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  {category.color && (
                    <div className={`${category.color}/20 w-10 h-10 rounded-lg mb-2 flex items-center justify-center`}>
                      {category.icon && <span className="text-xl">{category.icon}</span>}
                    </div>
                  )}
                  <h3 className="text-white font-semibold">{category.name}</h3>
                  {category.description && (
                    <p className="text-white/60 text-sm mt-1">{category.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 hover:bg-white/10 rounded transition"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 hover:bg-red-500/20 rounded transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className={`px-2 py-1 rounded ${category.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
}
