"use client"

import React, { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, Download, Upload, Users,
  Save, X, Shield, Lock, Mail, Phone, Calendar, CheckCircle,
  XCircle, AlertCircle, Key, UserCheck, Activity
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// Sample roles
const ROLES = [
  {
    id: 'ROLE001',
    name: 'Administrator',
    description: 'Full system access',
    permissions: ['all']
  },
  {
    id: 'ROLE002',
    name: 'Planner',
    description: 'Create and manage production plans',
    permissions: ['view_orders', 'create_plan', 'edit_plan', 'view_reports', 'view_machines', 'view_materials']
  },
  {
    id: 'ROLE003',
    name: 'Supervisor',
    description: 'Monitor and approve production',
    permissions: ['view_orders', 'view_plan', 'approve_plan', 'view_production', 'view_reports']
  },
  {
    id: 'ROLE004',
    name: 'Operator',
    description: 'Execute production tasks',
    permissions: ['view_production', 'update_production', 'view_orders']
  },
  {
    id: 'ROLE005',
    name: 'Maintenance',
    description: 'Manage equipment maintenance',
    permissions: ['view_machines', 'edit_maintenance', 'view_downtime']
  },
  {
    id: 'ROLE006',
    name: 'Viewer',
    description: 'Read-only access to reports',
    permissions: ['view_reports', 'view_orders', 'view_plan']
  },
];

// Sample departments
const DEPARTMENTS = [
  'Production Planning',
  'Manufacturing',
  'Quality Assurance',
  'Maintenance',
  'Management',
  'IT',
];

// Initial users data
const INITIAL_USERS = [
  {
    id: 'USR001',
    username: 'admin',
    email: 'admin@company.com',
    firstName: 'System',
    lastName: 'Administrator',
    phone: '+1-555-0001',
    department: 'IT',
    roleId: 'ROLE001',
    roleName: 'Administrator',
    status: 'Active',
    lastLogin: '2025-10-02T08:30:00',
    createdDate: '2024-01-01',
    notes: 'System administrator account'
  },
  {
    id: 'USR002',
    username: 'jsmith',
    email: 'john.smith@company.com',
    firstName: 'John',
    lastName: 'Smith',
    phone: '+1-555-0102',
    department: 'Production Planning',
    roleId: 'ROLE002',
    roleName: 'Planner',
    status: 'Active',
    lastLogin: '2025-10-02T09:15:00',
    createdDate: '2024-02-15',
    notes: ''
  },
  {
    id: 'USR003',
    username: 'sjohnson',
    email: 'sarah.johnson@company.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '+1-555-0103',
    department: 'Manufacturing',
    roleId: 'ROLE003',
    roleName: 'Supervisor',
    status: 'Active',
    lastLogin: '2025-10-01T16:45:00',
    createdDate: '2024-03-20',
    notes: ''
  },
  {
    id: 'USR004',
    username: 'mchen',
    email: 'mike.chen@company.com',
    firstName: 'Mike',
    lastName: 'Chen',
    phone: '+1-555-0104',
    department: 'Manufacturing',
    roleId: 'ROLE004',
    roleName: 'Operator',
    status: 'Active',
    lastLogin: '2025-10-02T07:00:00',
    createdDate: '2024-04-10',
    notes: ''
  },
  {
    id: 'USR005',
    username: 'tanderson',
    email: 'tom.anderson@company.com',
    firstName: 'Tom',
    lastName: 'Anderson',
    phone: '+1-555-0105',
    department: 'Maintenance',
    roleId: 'ROLE005',
    roleName: 'Maintenance',
    status: 'Active',
    lastLogin: '2025-10-02T08:00:00',
    createdDate: '2024-05-05',
    notes: ''
  },
  {
    id: 'USR006',
    username: 'lbrown',
    email: 'lisa.brown@company.com',
    firstName: 'Lisa',
    lastName: 'Brown',
    phone: '+1-555-0106',
    department: 'Management',
    roleId: 'ROLE006',
    roleName: 'Viewer',
    status: 'Inactive',
    lastLogin: '2025-09-15T14:30:00',
    createdDate: '2024-06-01',
    notes: 'On leave'
  },
];

const UserManagement = () => {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    roleId: '',
    status: 'Active',
    notes: ''
  });

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-700',
      'Inactive': 'bg-gray-100 text-gray-700',
      'Suspended': 'bg-red-100 text-red-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <CheckCircle size={16} className="text-green-600" />;
      case 'Inactive': return <XCircle size={16} className="text-gray-600" />;
      case 'Suspended': return <AlertCircle size={16} className="text-red-600" />;
      case 'Pending': return <Clock size={16} className="text-yellow-600" />;
      default: return <Users size={16} className="text-gray-600" />;
    }
  };

  const formatLastLogin = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'all' || user.department === filterDept;
    const matchesRole = filterRole === 'all' || user.roleId === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  const openCreateModal = () => {
    setFormData({
      id: `USR${String(users.length + 1).padStart(3, '0')}`,
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      department: '',
      roleId: '',
      status: 'Active',
      notes: ''
    });
    setEditingUser(null);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setFormData({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      department: user.department,
      roleId: user.roleId,
      status: user.status,
      notes: user.notes
    });
    setEditingUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openViewModal = (user) => {
    setEditingUser(user);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setModalMode(null);
  };

  const handleSaveUser = () => {
    if (!formData.username || !formData.email || !formData.firstName || !formData.lastName || !formData.roleId) {
      alert('Please fill in all required fields');
      return;
    }

    const role = ROLES.find(r => r.id === formData.roleId);

    const newUser = {
      ...formData,
      roleName: role?.name || '',
      lastLogin: editingUser?.lastLogin || null,
      createdDate: editingUser?.createdDate || new Date().toISOString().split('T')[0]
    };

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? newUser : u));
    } else {
      setUsers([...users, newUser]);
    }
    closeModal();
  };

  const handleDeleteUser = (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleResetPassword = (user) => {
    alert(`Password reset link sent to ${user.email}`);
  };

  const viewRolePermissions = (roleId) => {
    const role = ROLES.find(r => r.id === roleId);
    setSelectedRole(role);
    setShowPermissions(true);
  };

  const getUserStats = () => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'Active').length,
      inactive: users.filter(u => u.status === 'Inactive').length,
      suspended: users.filter(u => u.status === 'Suspended').length
    };
  };

  const stats = getUserStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-500 mt-1">Manage system users and access control</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Upload size={18} />
                  Import
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Download size={18} />
                  Export
                </button>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={18} />
                  New User
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Users size={32} className="text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <CheckCircle size={32} className="text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Inactive</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                  </div>
                  <XCircle size={32} className="text-gray-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Suspended</p>
                    <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
                  </div>
                  <AlertCircle size={32} className="text-red-600" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                {ROLES.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Users List */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500 mb-4">Create your first user to get started</p>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create User
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Department</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Last Login</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-900">
                            <Mail size={14} />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1 text-gray-500 mt-1">
                              <Phone size={14} />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.department}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => viewRolePermissions(user.roleId)}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Shield size={14} />
                          {user.roleName}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(user.status)}`}>
                          {getStatusIcon(user.status)}
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.lastLogin ? formatLastLogin(user.lastLogin) : 'Never'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openViewModal(user)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="View Details"
                          >
                            <Eye size={16} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Edit User"
                          >
                            <Edit size={16} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(user)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Reset Password"
                          >
                            <Key size={16} className="text-orange-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Delete User"
                          >
                            <Trash2 size={16} className="text-red-600" />
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
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'view' ? 'User Details' : editingUser ? 'Edit User' : 'Create New User'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {modalMode === 'view' && editingUser ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-2xl">
                        {editingUser.firstName.charAt(0)}{editingUser.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {editingUser.firstName} {editingUser.lastName}
                      </h3>
                      <p className="text-gray-500">@{editingUser.username}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-gray-900">{editingUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-gray-900">{editingUser.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Department</label>
                      <p className="mt-1 text-gray-900">{editingUser.department}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <p className="mt-1">
                        <span className="inline-flex items-center gap-1 text-blue-600">
                          <Shield size={16} />
                          {editingUser.roleName}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(editingUser.status)}`}>
                          {getStatusIcon(editingUser.status)}
                          {editingUser.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">User ID</label>
                      <p className="mt-1 text-gray-900">{editingUser.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Created</label>
                      <p className="mt-1 text-gray-900">
                        {new Date(editingUser.createdDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Login</label>
                      <p className="mt-1 text-gray-900">
                        {editingUser.lastLogin ? new Date(editingUser.lastLogin).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>

                  {editingUser.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notes</label>
                      <p className="mt-1 text-gray-900 p-3 bg-gray-50 rounded">{editingUser.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">First Name *</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Username *</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!!editingUser}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1-555-0000"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Department *</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Role *</label>
                      <select
                        value={formData.roleId}
                        onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Role</option>
                        {ROLES.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Status *</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700 block mb-2">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Additional notes or comments..."
                      />
                    </div>
                  </div>

                  {!editingUser && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <div className="font-medium mb-1">Password Setup</div>
                          <p>A temporary password will be generated and sent to the user's email address. They will be required to change it on first login.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div>
                {modalMode === 'view' && editingUser && (
                  <button
                    onClick={() => handleResetPassword(editingUser)}
                    className="px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 flex items-center gap-2"
                  >
                    <Key size={18} />
                    Reset Password
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                {modalMode === 'view' ? (
                  <button
                    onClick={() => setModalMode('edit')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Edit size={18} />
                    Edit User
                  </button>
                ) : (
                  <button
                    onClick={handleSaveUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save size={18} />
                    Save User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Permissions Modal */}
      {showPermissions && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={24} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">{selectedRole.name} Role</h2>
              </div>
              <button onClick={() => setShowPermissions(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-gray-900">{selectedRole.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Permissions</label>
                  {selectedRole.permissions.includes('all') ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-900">
                        <CheckCircle size={20} className="text-blue-600" />
                        <span className="font-medium">Full System Access</span>
                      </div>
                      <p className="text-sm text-blue-800 mt-2">This role has complete access to all system features and functions.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedRole.permissions.map(permission => (
                        <div key={permission} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-sm text-gray-900">
                            {permission.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-700">
                    <div className="font-medium mb-2">Users with this role:</div>
                    <div className="space-y-1">
                      {users.filter(u => u.roleId === selectedRole.id).map(user => (
                        <div key={user.id} className="flex items-center gap-2">
                          <UserCheck size={14} className="text-gray-500" />
                          <span>{user.firstName} {user.lastName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowPermissions(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;