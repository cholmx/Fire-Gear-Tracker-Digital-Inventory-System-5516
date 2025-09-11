import React, { useState } from 'react';
import { useUsers, USER_ROLES, PERMISSION_DESCRIPTIONS } from '../contexts/UserContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import SafeIcon from '../common/SafeIcon';
import Modal from '../components/Modal';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiSearch, FiEdit, FiTrash2, FiUser, FiShield, FiCheck, FiX, FiMapPin, FiMail, FiPhone, FiCalendar, FiEye, FiUserCheck, FiUserX, FiKey } = FiIcons;

const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser, setUserStatus, hasPermission, currentUser } = useUsers();
  const { stations } = useData();
  const { user: authUser } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'firefighter',
    department: '',
    assignedStations: [],
    status: 'active'
  });

  // Check if current user can manage users
  const canManageUsers = hasPermission(authUser, 'manage_users');

  if (!canManageUsers) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <SafeIcon icon={FiShield} className="w-12 h-12 text-mission-text-muted mx-auto mb-4" />
          <p className="text-mission-text-secondary font-inter">Access Denied</p>
          <p className="text-mission-text-muted text-sm font-inter">
            You don't have permission to manage users
          </p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    addUser(formData);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'firefighter',
      department: '',
      assignedStations: [],
      status: 'active'
    });
    setShowAddModal(false);
  };

  const handleEditUser = (e) => {
    e.preventDefault();
    updateUser(selectedUser.id, formData);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      department: user.department,
      assignedStations: user.assignedStations || [],
      status: user.status
    });
    setShowEditModal(true);
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const openPermissionsModal = (user) => {
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  const handleDeleteUser = (user) => {
    if (user.id === authUser?.id) {
      alert('You cannot delete your own account');
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
      deleteUser(user.id);
    }
  };

  const toggleUserStatus = (user) => {
    if (user.id === authUser?.id) {
      alert('You cannot change your own account status');
      return;
    }
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUserStatus(user.id, newStatus);
  };

  const getRoleColor = (role) => {
    return USER_ROLES[role]?.color || 'text-mission-text-muted';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'inactive': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      default: return 'text-mission-text-muted bg-mission-bg-tertiary border-mission-border';
    }
  };

  const getStationNames = (stationIds) => {
    if (!stationIds || stationIds.length === 0) return 'All Stations';
    return stationIds
      .map(id => stations.find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-inter-tight font-bold text-mission-text-primary">User Management</h1>
          <p className="text-base font-inter text-mission-text-secondary mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1 bg-fire-red hover:bg-fire-red-dark text-white px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors mt-4 sm:mt-0"
        >
          <SafeIcon icon={FiPlus} className="w-3 h-3" />
          <span>ADD USER</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-mission-accent-blue/20 rounded-lg">
              <SafeIcon icon={FiUser} className="w-5 h-5 text-mission-accent-blue" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-roboto-mono text-mission-text-muted uppercase">Total Users</p>
              <p className="text-xl font-roboto-mono font-bold text-white">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-lg">
              <SafeIcon icon={FiUserCheck} className="w-5 h-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-roboto-mono text-mission-text-muted uppercase">Active Users</p>
              <p className="text-xl font-roboto-mono font-bold text-white">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-red-500/20 rounded-lg">
              <SafeIcon icon={FiShield} className="w-5 h-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-roboto-mono text-mission-text-muted uppercase">Administrators</p>
              <p className="text-xl font-roboto-mono font-bold text-white">
                {users.filter(u => ['fire-chief', 'assistant-chief'].includes(u.role)).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-yellow-500/20 rounded-lg">
              <SafeIcon icon={FiUserX} className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-roboto-mono text-mission-text-muted uppercase">Inactive Users</p>
              <p className="text-xl font-roboto-mono font-bold text-white">
                {users.filter(u => u.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-3">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-3">
          <div className="flex-1">
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mission-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 py-1.5 text-xs font-inter bg-mission-bg-tertiary border border-mission-border rounded text-white placeholder-mission-text-muted focus:outline-none focus:ring-1 focus:ring-fire-red focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2 py-1.5 text-xs font-inter bg-mission-bg-tertiary border border-mission-border rounded text-white focus:outline-none focus:ring-1 focus:ring-fire-red focus:border-transparent"
          >
            <option value="all">ALL ROLES</option>
            {Object.entries(USER_ROLES).map(([key, role]) => (
              <option key={key} value={key}>{role.name.toUpperCase()}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 text-xs font-inter bg-mission-bg-tertiary border border-mission-border rounded text-white focus:outline-none focus:ring-1 focus:ring-fire-red focus:border-transparent"
          >
            <option value="all">ALL STATUS</option>
            <option value="active">ACTIVE</option>
            <option value="inactive">INACTIVE</option>
            <option value="pending">PENDING</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-mission-bg-secondary border border-mission-border rounded-lg overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon icon={FiUser} className="w-12 h-12 text-mission-text-muted mx-auto mb-4" />
            <p className="text-mission-text-secondary">No users found</p>
            <p className="text-mission-text-muted text-sm mb-4">
              {users.length === 0 ? 'Add your first user to get started' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-mission-bg-tertiary border-b border-mission-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">
                    Stations
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mission-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-mission-bg-primary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-mission-bg-tertiary rounded-md">
                          <SafeIcon icon={FiUser} className="w-4 h-4 text-mission-text-secondary" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-inter font-medium text-white">
                            {user.firstName} {user.lastName}
                            {user.id === authUser?.id && (
                              <span className="ml-2 text-xs text-mission-accent-blue">(You)</span>
                            )}
                          </div>
                          <div className="text-sm font-inter text-mission-text-muted">
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-xs font-roboto-mono text-mission-text-muted">
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-inter font-medium ${getRoleColor(user.role)}`}>
                        {USER_ROLES[user.role]?.name || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-inter text-mission-text-secondary">
                      {getStationNames(user.assignedStations)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-roboto-mono font-medium border ${getStatusColor(user.status)}`}>
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-roboto-mono text-mission-text-secondary">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openViewModal(user)}
                          className="p-1 text-mission-text-muted hover:text-mission-accent-blue hover:bg-mission-bg-primary rounded transition-colors"
                          title="View Details"
                        >
                          <SafeIcon icon={FiEye} className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => openPermissionsModal(user)}
                          className="p-1 text-mission-text-muted hover:text-mission-accent-green hover:bg-mission-bg-primary rounded transition-colors"
                          title="View Permissions"
                        >
                          <SafeIcon icon={FiKey} className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1 text-mission-text-muted hover:text-white hover:bg-mission-bg-primary rounded transition-colors"
                          title="Edit User"
                        >
                          <SafeIcon icon={FiEdit} className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user)}
                          disabled={user.id === authUser?.id}
                          className="p-1 text-mission-text-muted hover:text-yellow-400 hover:bg-mission-bg-primary rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                        >
                          <SafeIcon icon={user.status === 'active' ? FiUserX : FiUserCheck} className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.id === authUser?.id}
                          className="p-1 text-mission-text-muted hover:text-red-400 hover:bg-mission-bg-primary rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete User"
                        >
                          <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add User"
        size="lg"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                required
              >
                {Object.entries(USER_ROLES).map(([key, role]) => (
                  <option key={key} value={key}>{role.name}</option>
                ))}
              </select>
              {formData.role && (
                <p className="text-xs text-mission-text-muted mt-1">
                  {USER_ROLES[formData.role]?.description}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                placeholder="Fire Department"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Assigned Stations
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-mission-border rounded-lg p-2 bg-mission-bg-tertiary">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.assignedStations.length === 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, assignedStations: [] });
                    }
                  }}
                  className="rounded border-mission-border text-fire-red focus:ring-fire-red focus:ring-offset-mission-bg-secondary"
                />
                <span className="text-sm text-mission-text-secondary">All Stations</span>
              </label>
              {stations.map((station) => (
                <label key={station.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.assignedStations.includes(station.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          assignedStations: [...formData.assignedStations, station.id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          assignedStations: formData.assignedStations.filter(id => id !== station.id)
                        });
                      }
                    }}
                    className="rounded border-mission-border text-fire-red focus:ring-fire-red focus:ring-offset-mission-bg-secondary"
                  />
                  <span className="text-sm text-mission-text-secondary">{station.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-mission-text-muted mt-1">
              Leave empty or select "All Stations" for full access
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 text-xs font-roboto-mono text-mission-text-muted hover:text-white transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-fire-red hover:bg-fire-red-dark text-white rounded text-xs font-roboto-mono font-medium transition-colors"
            >
              ADD USER
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="lg"
      >
        <form onSubmit={handleEditUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                required
                disabled={selectedUser?.id === authUser?.id}
              >
                {Object.entries(USER_ROLES).map(([key, role]) => (
                  <option key={key} value={key}>{role.name}</option>
                ))}
              </select>
              {selectedUser?.id === authUser?.id && (
                <p className="text-xs text-yellow-400 mt-1">
                  You cannot change your own role
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                placeholder="Fire Department"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Assigned Stations
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-mission-border rounded-lg p-2 bg-mission-bg-tertiary">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.assignedStations.length === 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, assignedStations: [] });
                    }
                  }}
                  className="rounded border-mission-border text-fire-red focus:ring-fire-red focus:ring-offset-mission-bg-secondary"
                />
                <span className="text-sm text-mission-text-secondary">All Stations</span>
              </label>
              {stations.map((station) => (
                <label key={station.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.assignedStations.includes(station.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          assignedStations: [...formData.assignedStations, station.id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          assignedStations: formData.assignedStations.filter(id => id !== station.id)
                        });
                      }
                    }}
                    className="rounded border-mission-border text-fire-red focus:ring-fire-red focus:ring-offset-mission-bg-secondary"
                  />
                  <span className="text-sm text-mission-text-secondary">{station.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-3 py-1.5 text-xs font-roboto-mono text-mission-text-muted hover:text-white transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-fire-red hover:bg-fire-red-dark text-white rounded text-xs font-roboto-mono font-medium transition-colors"
            >
              UPDATE USER
            </button>
          </div>
        </form>
      </Modal>

      {/* View User Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-inter-tight font-medium text-white mb-4">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-inter text-mission-text-muted">Name</label>
                    <p className="text-white font-inter">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-inter text-mission-text-muted">Email</label>
                    <p className="text-white font-inter">{selectedUser.email}</p>
                  </div>
                  {selectedUser.phone && (
                    <div>
                      <label className="block text-sm font-inter text-mission-text-muted">Phone</label>
                      <p className="text-white font-roboto-mono">{selectedUser.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-inter text-mission-text-muted">Department</label>
                    <p className="text-white font-inter">{selectedUser.department}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-inter-tight font-medium text-white mb-4">Role & Access</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-inter text-mission-text-muted">Role</label>
                    <p className={`font-inter font-medium ${getRoleColor(selectedUser.role)}`}>
                      {USER_ROLES[selectedUser.role]?.name || selectedUser.role}
                    </p>
                    <p className="text-xs text-mission-text-muted mt-1">
                      {USER_ROLES[selectedUser.role]?.description}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-inter text-mission-text-muted">Status</label>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-roboto-mono font-medium border ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-inter text-mission-text-muted">Assigned Stations</label>
                    <p className="text-white font-inter">
                      {getStationNames(selectedUser.assignedStations)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-inter-tight font-medium text-white mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-inter text-mission-text-muted">Created</label>
                  <p className="text-white font-roboto-mono">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-inter text-mission-text-muted">Last Login</label>
                  <p className="text-white font-roboto-mono">
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Permissions Modal */}
      <Modal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        title="User Permissions"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-mission-bg-tertiary rounded-md">
                <SafeIcon icon={FiUser} className="w-5 h-5 text-mission-text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-inter-tight font-medium text-white">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className={`text-sm font-inter ${getRoleColor(selectedUser.role)}`}>
                  {USER_ROLES[selectedUser.role]?.name || selectedUser.role}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-base font-inter-tight font-medium text-white mb-3">Permissions</h4>
              <div className="space-y-2">
                {USER_ROLES[selectedUser.role]?.permissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-3 p-2 bg-mission-bg-tertiary rounded">
                    <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-inter text-white">
                        {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-xs text-mission-text-muted">
                        {PERMISSION_DESCRIPTIONS[permission]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedUser.assignedStations && selectedUser.assignedStations.length > 0 && (
              <div>
                <h4 className="text-base font-inter-tight font-medium text-white mb-3">Station Access</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedUser.assignedStations.map((stationId) => {
                    const station = stations.find(s => s.id === stationId);
                    return station ? (
                      <div key={stationId} className="flex items-center space-x-2 p-2 bg-mission-bg-tertiary rounded">
                        <SafeIcon icon={FiMapPin} className="w-4 h-4 text-mission-accent-blue" />
                        <span className="text-sm text-white font-inter">{station.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {(!selectedUser.assignedStations || selectedUser.assignedStations.length === 0) && (
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiMapPin} className="w-5 h-5 text-blue-400" />
                  <div>
                    <h4 className="text-blue-400 font-medium">All Stations Access</h4>
                    <p className="text-blue-300 text-sm">This user has access to all stations in the department</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;