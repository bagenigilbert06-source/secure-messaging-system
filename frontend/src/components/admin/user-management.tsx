'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit2, Trash2, CheckCircle, XCircle, Download, Eye, Plus, X, Save, Loader } from 'lucide-react';
import * as adminApi from '@/services/admin-api';

interface User {
  id: string;
  name: string;
  email: string;
  student_id?: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

interface FormData {
  name: string;
  email: string;
  student_id: string;
  role: string;
  password?: string;
}

interface UserManagementProps {
  initialUsers?: {
    users?: User[];
    total?: number;
  };
}

export default function UserManagement({ initialUsers }: UserManagementProps) {
  // Initialize with server-rendered users immediately for instant display
  const [users, setUsers] = useState<User[]>(initialUsers?.users || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    student_id: '',
    role: 'student',
    password: '',
  });
  // Show skeleton only if we truly have no data at all (initial or loaded)
  const [isLoading, setIsLoading] = useState(!initialUsers?.users || initialUsers.users.length === 0);

  // Fetch fresh users immediately on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminApi.getAllUsers(1, 50);
        
        // Handle both response.data and direct response structures
        const fetchedUsers = response.data?.users || response.users || [];
        
        if (Array.isArray(fetchedUsers) && fetchedUsers.length > 0) {
          setUsers(fetchedUsers);
        }
      } catch (error) {
        // Use initial users from server if API fetch fails
      } finally {
        setIsLoading(false);
      }
    };

    // Start with spinner if no initial data, otherwise show initial data immediately
    if (!initialUsers?.users || initialUsers.users.length === 0) {
      setIsLoading(true);
    }
    
    fetchUsers();
  }, [initialUsers]);

  const handleVerifyUser = async (userId: string) => {
    try {
      await adminApi.verifyUser(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, is_verified: true } : u));
    } catch (error) {
      console.error('Failed to verify user:', error);
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const endpoint = isActive ? adminApi.deactivateUser : adminApi.activateUser;
      await endpoint(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !isActive } : u));
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await adminApi.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleExportUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/export/users?format=csv`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users_export.csv';
        a.click();
      }
    } catch (error) {
      console.error('Failed to export users:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      student_id: '',
      role: 'student',
      password: '',
    });
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      student_id: user.student_id || '',
      role: user.role,
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const response = await adminApi.createUser(formData);
      if (response.data) {
        setUsers([...users, response.data.user]);
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !formData.name || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const response = await adminApi.updateUser(selectedUser.id, formData);
      if (response.data) {
        setUsers(users.map((u) => (u.id === selectedUser.id ? response.data.user : u)));
        setShowEditModal(false);
        resetForm();
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="flex gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/40 text-blue-300 rounded-lg hover:bg-blue-500/30 transition"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
          <button
            onClick={handleExportUsers}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition"
          >
            <Download className="w-4 h-4" />
            Export Users
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by name, email, or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/40"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-400/40"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="liquid-glass rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-white/60 font-semibold text-sm">Name</th>
                <th className="text-left px-6 py-4 text-white/60 font-semibold text-sm">Email</th>
                <th className="text-left px-6 py-4 text-white/60 font-semibold text-sm">Role</th>
                <th className="text-left px-6 py-4 text-white/60 font-semibold text-sm">Status</th>
                <th className="text-left px-6 py-4 text-white/60 font-semibold text-sm">Verified</th>
                <th className="text-left px-6 py-4 text-white/60 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="w-5 h-5 animate-spin text-teal-400" />
                      <span className="text-white/60">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-white/40">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-white">{user.name}</td>
                    <td className="px-6 py-4 text-white/80">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                        className="flex items-center gap-2"
                      >
                        {user.is_active ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_verified ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <button
                          onClick={() => handleVerifyUser(user.id)}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4 text-white/60" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-2 hover:bg-blue-500/20 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailsModal(false)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="liquid-glass rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              <div className="space-y-3 text-white/80 text-sm">
                <p><span className="text-white/60">Email:</span> {selectedUser.email}</p>
                <p><span className="text-white/60">Student ID:</span> {selectedUser.student_id || 'N/A'}</p>
                <p><span className="text-white/60">Role:</span> {selectedUser.role}</p>
                <p><span className="text-white/60">Active:</span> {selectedUser.is_active ? 'Yes' : 'No'}</p>
                <p><span className="text-white/60">Verified:</span> {selectedUser.is_verified ? 'Yes' : 'No'}</p>
                <p><span className="text-white/60">Created:</span> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="mt-6 w-full px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="liquid-glass rounded-3xl p-6 max-w-md w-full border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Add New User</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Full name"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="user@example.com"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Student ID</label>
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleFormChange}
                    placeholder="Optional"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    placeholder="Set password"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-white/10 text-white rounded-lg hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/40 text-blue-300 rounded-lg hover:bg-blue-500/30 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="liquid-glass rounded-3xl p-6 max-w-md w-full border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Edit User</h3>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Full name"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="user@example.com"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Student ID</label>
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleFormChange}
                    placeholder="Optional"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-white/10 text-white rounded-lg hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
