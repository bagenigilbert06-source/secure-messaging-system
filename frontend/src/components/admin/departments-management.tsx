'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, MapPin, Phone, Mail } from 'lucide-react';
import * as adminApi from '@/services/admin-api';

interface Department {
  id: string;
  name: string;
  location?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  is_active: boolean;
}

interface StorageLocation {
  id: string;
  name: string;
  building?: string;
  floor?: string;
  room?: string;
  capacity?: number;
  is_active: boolean;
  department_id?: string;
}

export default function DepartmentsManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [activeTab, setActiveTab] = useState<'departments' | 'locations'>('departments');
  
  const [formData, setFormData] = useState<Partial<Department>>({
    name: '',
    location: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    is_active: true,
  });

  const [locationData, setLocationData] = useState<Partial<StorageLocation>>({
    name: '',
    building: '',
    floor: '',
    room: '',
    capacity: undefined,
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptsRes, locsRes] = await Promise.all([
        adminApi.getDepartments(1, 100),
        adminApi.getLocations(1, 100),
      ]);
      if (deptsRes.data) {
        setDepartments(deptsRes.data.departments || []);
      }
      if (locsRes.data) {
        setLocations(locsRes.data.locations || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  };

  const handleAddDept = () => {
    setEditingId(null);
    setFormData({
      name: '',
      location: '',
      contact_person: '',
      contact_phone: '',
      contact_email: '',
      is_active: true,
    });
    setShowForm(true);
  };

  const handleEditDept = (dept: Department) => {
    setEditingId(dept.id);
    setFormData(dept);
    setShowForm(true);
  };

  const handleSaveDept = async () => {
    if (!formData.name?.trim()) {
      alert('Department name is required');
      return;
    }

    try {
      if (editingId) {
        await adminApi.updateDepartment(editingId, formData);
        setDepartments(departments.map(d => d.id === editingId ? { ...d, ...formData } : d));
      } else {
        const response = await adminApi.createDepartment(formData);
        if (response.data?.department) {
          setDepartments([...departments, response.data.department]);
        }
      }
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save department:', error);
      alert('Failed to save department');
    }
  };

  const handleDeleteDept = async (deptId: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await adminApi.deleteDepartment(deptId);
        setDepartments(departments.filter(d => d.id !== deptId));
      } catch (error) {
        console.error('Failed to delete department:', error);
        alert('Failed to delete department');
      }
    }
  };

  const handleAddLocation = (dept?: Department) => {
    setEditingLocId(null);
    setSelectedDept(dept || null);
    setLocationData({
      name: '',
      building: '',
      floor: '',
      room: '',
      capacity: undefined,
      is_active: true,
      department_id: dept?.id,
    });
    setShowLocationForm(true);
  };

  const handleEditLocation = (location: StorageLocation) => {
    setEditingLocId(location.id);
    setLocationData(location);
    setShowLocationForm(true);
  };

  const handleSaveLocation = async () => {
    if (!locationData.name?.trim()) {
      alert('Location name is required');
      return;
    }

    try {
      if (editingLocId) {
        await adminApi.updateLocation(editingLocId, locationData);
        setLocations(locations.map(l => l.id === editingLocId ? { ...l, ...locationData } : l));
      } else {
        const response = await adminApi.createLocation(locationData);
        if (response.data?.location) {
          setLocations([...locations, response.data.location]);
        }
      }
      setShowLocationForm(false);
    } catch (error) {
      console.error('Failed to save location:', error);
      alert('Failed to save location');
    }
  };

  const handleDeleteLocation = async (locId: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      try {
        await adminApi.deleteLocation(locId);
        setLocations(locations.filter(l => l.id !== locId));
      } catch (error) {
        console.error('Failed to delete location:', error);
        alert('Failed to delete location');
      }
    }
  };

  const deptLocations = selectedDept
    ? locations.filter(l => l.department_id === selectedDept.id)
    : locations;

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Departments & Locations</h2>
        {!showForm && !showLocationForm && (
          <button
            onClick={() => activeTab === 'departments' ? handleAddDept() : handleAddLocation()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition"
          >
            <Plus className="w-4 h-4" />
            New {activeTab === 'departments' ? 'Department' : 'Location'}
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === 'departments'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
              : 'bg-white/5 text-white/60 border border-white/10'
          }`}
        >
          Departments
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === 'locations'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
              : 'bg-white/5 text-white/60 border border-white/10'
          }`}
        >
          Storage Locations
        </button>
      </div>

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <>
          {/* Department Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="liquid-glass rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingId ? 'Edit Department' : 'New Department'}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Department name"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/40"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Building/Location"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Contact Person</label>
                    <input
                      type="text"
                      value={formData.contact_person || ''}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      placeholder="Name"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/40"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.contact_phone || ''}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="+254..."
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email || ''}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/40"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    id="dept_is_active"
                  />
                  <label htmlFor="dept_is_active" className="text-white/80">
                    Active
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveDept}
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

          {/* Departments List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {loading ? (
              <div className="col-span-full text-center py-8 text-white/40">
                Loading departments...
              </div>
            ) : departments.length === 0 ? (
              <div className="col-span-full text-center py-8 text-white/40">
                No departments found
              </div>
            ) : (
              departments.map((dept) => (
                <div
                  key={dept.id}
                  className="liquid-glass rounded-xl p-4 border border-white/10 hover:border-white/20 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">{dept.name}</h3>
                      {dept.location && (
                        <p className="text-white/60 text-sm flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {dept.location}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditDept(dept)}
                        className="p-2 hover:bg-white/10 rounded transition"
                      >
                        <Edit2 className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteDept(dept.id)}
                        className="p-2 hover:bg-red-500/20 rounded transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-white/70">
                    {dept.contact_person && (
                      <p>{dept.contact_person}</p>
                    )}
                    {dept.contact_phone && (
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {dept.contact_phone}
                      </p>
                    )}
                    {dept.contact_email && (
                      <p className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {dept.contact_email}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/60 mt-3">
                    <span className={`px-2 py-1 rounded ${dept.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                      {dept.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </>
      )}

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <>
          {/* Location Form */}
          {showLocationForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="liquid-glass rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingLocId ? 'Edit Location' : 'New Location'}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Name *</label>
                    <input
                      type="text"
                      value={locationData.name || ''}
                      onChange={(e) => setLocationData({ ...locationData, name: e.target.value })}
                      placeholder="Location name"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/40"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Department</label>
                    <select
                      value={locationData.department_id || ''}
                      onChange={(e) => setLocationData({ ...locationData, department_id: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-400/40"
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Building</label>
                    <input
                      type="text"
                      value={locationData.building || ''}
                      onChange={(e) => setLocationData({ ...locationData, building: e.target.value })}
                      placeholder="Building name"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/40"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Floor</label>
                    <input
                      type="text"
                      value={locationData.floor || ''}
                      onChange={(e) => setLocationData({ ...locationData, floor: e.target.value })}
                      placeholder="Floor"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/40"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Room</label>
                    <input
                      type="text"
                      value={locationData.room || ''}
                      onChange={(e) => setLocationData({ ...locationData, room: e.target.value })}
                      placeholder="Room"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2">Capacity</label>
                  <input
                    type="number"
                    value={locationData.capacity || ''}
                    onChange={(e) => setLocationData({ ...locationData, capacity: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Number of items"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/40"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={locationData.is_active}
                    onChange={(e) => setLocationData({ ...locationData, is_active: e.target.checked })}
                    id="loc_is_active"
                  />
                  <label htmlFor="loc_is_active" className="text-white/80">
                    Active
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveLocation}
                    className="flex-1 px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setShowLocationForm(false)}
                    className="flex-1 px-4 py-2 bg-red-500/20 border border-red-400/40 text-red-300 rounded-lg hover:bg-red-500/30 transition flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Locations List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {loading ? (
              <div className="col-span-full text-center py-8 text-white/40">
                Loading locations...
              </div>
            ) : locations.length === 0 ? (
              <div className="col-span-full text-center py-8 text-white/40">
                No locations found
              </div>
            ) : (
              locations.map((location) => (
                <div
                  key={location.id}
                  className="liquid-glass rounded-xl p-4 border border-white/10 hover:border-white/20 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{location.name}</h3>
                      {location.building && (
                        <p className="text-white/60 text-sm">{location.building}</p>
                      )}
                      {(location.floor || location.room) && (
                        <p className="text-white/60 text-sm">
                          {location.floor && `Floor ${location.floor}`}
                          {location.room && ` • Room ${location.room}`}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditLocation(location)}
                        className="p-2 hover:bg-white/10 rounded transition"
                      >
                        <Edit2 className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
                        className="p-2 hover:bg-red-500/20 rounded transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {location.capacity && (
                    <p className="text-white/70 text-sm mb-2">
                      Capacity: <strong>{location.capacity} items</strong>
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span className={`px-2 py-1 rounded ${location.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                      {location.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
