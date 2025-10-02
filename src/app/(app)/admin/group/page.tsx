"use client"

import React, { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, Download, Upload, Shield,
  Save, X, CheckCircle, XCircle, Users, Lock, Unlock, Copy,
  AlertCircle, Settings, FileText, Calendar, Package, Wrench
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// Permission categories and definitions
type Status = 'Active' | 'Inactive';

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  status: Status;
  createdDate: string;
};

type RoleFormData = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  status: Status;
};

const PERMISSION_CATEGORIES = [
  {
    category: 'Orders',
    icon: FileText,
    permissions: [
      { id: 'view_orders', name: 'View Orders', description: 'Can view order list and details' },
      { id: 'create_orders', name: 'Create Orders', description: 'Can create new orders' },
      { id: 'edit_orders', name: 'Edit Orders', description: 'Can modify existing orders' },
      { id: 'delete_orders', name: 'Delete Orders', description: 'Can delete orders' },
      { id: 'import_orders', name: 'Import Orders', description: 'Can import orders from CSV/Excel' },
    ]
  },
  {
    category: 'Planning',
    icon: Calendar,
    permissions: [
      { id: 'view_plan', name: 'View Plan', description: 'Can view production plans' },
      { id: 'create_plan', name: 'Create Plan', description: 'Can create production plans' },
      { id: 'edit_plan', name: 'Edit Plan', description: 'Can modify production plans' },
      { id: 'delete_plan', name: 'Delete Plan', description: 'Can delete production plans' },
      { id: 'approve_plan', name: 'Approve Plan', description: 'Can approve/reject production plans' },
      { id: 'run_ai_planner', name: 'Run AI Planner', description: 'Can execute AI planning engine' },
    ]
  },
  {
    category: 'Production',
    icon: Settings,
    permissions: [
      { id: 'view_production', name: 'View Production', description: 'Can view production status' },
      { id: 'update_production', name: 'Update Production', description: 'Can update job status and progress' },
      { id: 'start_job', name: 'Start Job', description: 'Can start production jobs' },
      { id: 'complete_job', name: 'Complete Job', description: 'Can mark jobs as complete' },
      { id: 'report_downtime', name: 'Report Downtime', description: 'Can report machine downtime' },
    ]
  },
  {
    category: 'Master Data',
    icon: Package,
    permissions: [
      { id: 'view_masters', name: 'View Master Data', description: 'Can view all master data' },
      { id: 'edit_products', name: 'Edit Products', description: 'Can modify product master' },
      { id: 'edit_routing', name: 'Edit Routing', description: 'Can modify routing/process plans' },
      { id: 'edit_machines', name: 'Edit Machines', description: 'Can modify machine master' },
      { id: 'edit_materials', name: 'Edit Materials', description: 'Can modify material master' },
      { id: 'edit_shifts', name: 'Edit Shifts/Calendars', description: 'Can modify shift schedules' },
      { id: 'edit_skills', name: 'Edit Skills Matrix', description: 'Can modify skills matrix' },
    ]
  },
  {
    category: 'Maintenance',
    icon: Wrench,
    permissions: [
      { id: 'view_maintenance', name: 'View Maintenance', description: 'Can view maintenance schedules' },
      { id: 'edit_maintenance', name: 'Edit Maintenance', description: 'Can create/modify maintenance plans' },
      { id: 'view_downtime', name: 'View Downtime', description: 'Can view downtime history' },
    ]
  },
  {
    category: 'Reports',
    icon: FileText,
    permissions: [
      { id: 'view_reports', name: 'View Reports', description: 'Can view all reports' },
      { id: 'export_reports', name: 'Export Reports', description: 'Can export reports to CSV/PDF' },
      { id: 'create_custom_reports', name: 'Create Custom Reports', description: 'Can create custom report templates' },
    ]
  },
  {
    category: 'Administration',
    icon: Shield,
    permissions: [
      { id: 'manage_users', name: 'Manage Users', description: 'Can create/edit/delete users' },
      { id: 'manage_roles', name: 'Manage Roles', description: 'Can create/edit/delete roles' },
      { id: 'view_audit_log', name: 'View Audit Log', description: 'Can view system audit logs' },
      { id: 'system_settings', name: 'System Settings', description: 'Can modify system settings' },
      { id: 'integration_config', name: 'Integration Config', description: 'Can configure EMS/ERP integrations' },
    ]
  },
];

// Initial roles data
const INITIAL_ROLES: Role[] = [
  {
    id: 'ROLE001',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: ['all'],
    userCount: 1,
    isSystem: true,
    status: 'Active',
    createdDate: '2024-01-01',
  },
  {
    id: 'ROLE002',
    name: 'Production Planner',
    description: 'Create and manage production schedules',
    permissions: [
      'view_orders', 'create_orders', 'edit_orders',
      'view_plan', 'create_plan', 'edit_plan', 'run_ai_planner',
      'view_production', 'view_masters', 'view_reports', 'export_reports'
    ],
    userCount: 2,
    isSystem: false,
    status: 'Active',
    createdDate: '2024-01-15',
  },
  {
    id: 'ROLE003',
    name: 'Supervisor',
    description: 'Monitor and approve production activities',
    permissions: [
      'view_orders', 'view_plan', 'approve_plan',
      'view_production', 'update_production', 'start_job', 'complete_job',
      'view_masters', 'view_reports', 'export_reports'
    ],
    userCount: 3,
    isSystem: false,
    status: 'Active',
    createdDate: '2024-02-01',
  },
  {
    id: 'ROLE004',
    name: 'Machine Operator',
    description: 'Execute production tasks and update status',
    permissions: [
      'view_production', 'update_production', 'start_job', 'complete_job',
      'report_downtime', 'view_orders'
    ],
    userCount: 5,
    isSystem: false,
    status: 'Active',
    createdDate: '2024-02-15',
  },
  {
    id: 'ROLE005',
    name: 'Maintenance Engineer',
    description: 'Manage equipment maintenance and repairs',
    permissions: [
      'view_machines', 'view_maintenance', 'edit_maintenance',
      'view_downtime', 'report_downtime', 'view_production'
    ],
    userCount: 2,
    isSystem: false,
    status: 'Active',
    createdDate: '2024-03-01',
  },
  {
    id: 'ROLE006',
    name: 'Report Viewer',
    description: 'Read-only access to reports and dashboards',
    permissions: [
      'view_reports', 'view_orders', 'view_plan', 'view_production', 'view_masters'
    ],
    userCount: 4,
    isSystem: false,
    status: 'Active',
    createdDate: '2024-03-15',
  },
];

const RoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'view' | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<RoleFormData>({
    id: '',
    name: '',
    description: '',
    permissions: [],
    status: 'Active',
  });

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      Active: 'bg-green-100 text-green-700',
      Inactive: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getAllPermissionIds = () => {
    return PERMISSION_CATEGORIES.flatMap(cat => cat.permissions.map(p => p.id));
  };

  const getPermissionName = (permId: string) => {
    for (const cat of PERMISSION_CATEGORIES) {
      const perm = cat.permissions.find(p => p.id === permId);
      if (perm) return perm.name;
    }
    return permId;
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || role.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setFormData({
      id: `ROLE${String(roles.length + 1).padStart(3, '0')}`,
      name: '',
      description: '',
      permissions: [],
      status: 'Active',
    });
    setEditingRole(null);
    setModalMode('edit');
    setIsModalOpen(true);
    setExpandedCategories({});
  };

  const openEditModal = (role: Role) => {
    setFormData({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
      status: role.status,
    });
    setEditingRole(role);
    setModalMode('edit');
    setIsModalOpen(true);
    setExpandedCategories({});
  };

  const openViewModal = (role: Role) => {
    setEditingRole(role);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setModalMode(null);
    setExpandedCategories({});
  };

  const handleSaveRole = () => {
    if (!formData.name || !formData.description) {
      alert('Please fill in name and description');
      return;
    }

    if (formData.permissions.length === 0 && !formData.permissions.includes('all')) {
      alert('Please select at least one permission');
      return;
    }

    const newRole = {
      ...formData,
      userCount: editingRole?.userCount || 0,
      isSystem: editingRole?.isSystem || false,
      createdDate: editingRole?.createdDate || new Date().toISOString().split('T')[0],
      status: formData.status as 'Active' | 'Inactive',
    };

    if (editingRole) {
      setRoles(roles.map(r => r.id === editingRole.id ? newRole : r));
    } else {
      setRoles([...roles, newRole]);
    }
    closeModal();
  };

  const handleDeleteRole = (id: string) => {
    const role = roles.find(r => r.id === id);
    if (!role) return;

    if (role.isSystem) {
      alert('System roles cannot be deleted');
      return;
    }
    if (role.userCount > 0) {
      alert(`Cannot delete role: ${role.userCount} user(s) are assigned to this role`);
      return;
    }
    if (confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      setRoles(roles.filter(r => r.id !== id));
    }
  };

  const handleCopyRole = (role: Role) => {
    const newId = `ROLE${String(roles.length + 1).padStart(3, '0')}`;
    const copiedRole: Role = {
      ...role,
      id: newId,
      name: `${role.name} (Copy)`,
      userCount: 0,
      isSystem: false,
      createdDate: new Date().toISOString().split('T')[0],
      status: role.status as 'Active' | 'Inactive',
    };
    setRoles([...roles, copiedRole]);
  };
  const togglePermission = (permId: string) => {
    if (formData.permissions.includes('all')) {
      // If "all" is selected, deselect it and select this specific permission
      setFormData(prev => ({
        ...prev,
        permissions: [permId]
      }));
    } else if (permId === 'all') {
      // Select all permissions
      setFormData(prev => ({
        ...prev,
        permissions: ['all']
      }));
    } else {
      // Toggle individual permission
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permId)
          ? prev.permissions.filter(p => p !== permId)
          : [...prev.permissions, permId]
      }));
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const selectAllInCategory = (category: string) => {
    const cat = PERMISSION_CATEGORIES.find(c => c.category === category);
    if (!cat) return;

    const categoryPermIds = cat.permissions.map(p => p.id);
    const allSelected = categoryPermIds.every(id => formData.permissions.includes(id));

    if (allSelected) {
      // Deselect all in category
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !categoryPermIds.includes(p))
      }));
    } else {
      // Select all in category
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions.filter(p => p !== 'all'), ...categoryPermIds])]
      }));
    }
  };

  const getPermissionCount = (permissions: string | string[]) => {
    if (permissions.includes('all')) return 'All';
    return permissions.length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Role & Permissions Management</h1>
                <p className="text-sm text-gray-500 mt-1">Define roles and access control permissions</p>
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
                  New Role
                </button>
              </div>
            </div>


            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4  mt-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Roles</p>
                    <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                  </div>
                  <Shield size={32} className="text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Roles</p>
                    <p className="text-2xl font-bold text-green-600">
                      {roles.filter(r => r.status === 'Active').length}
                    </p>
                  </div>
                  <CheckCircle size={32} className="text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">System Roles</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {roles.filter(r => r.isSystem).length}
                    </p>
                  </div>
                  <Lock size={32} className="text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {roles.reduce((sum, r) => sum + r.userCount, 0)}
                    </p>
                  </div>
                  <Users size={32} className="text-gray-600" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Roles List */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredRoles.length === 0 ? (
            <div className="text-center py-12">
              <Shield size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
              <p className="text-gray-500 mb-4">Create your first role to get started</p>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Role
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRoles.map(role => (
                <div key={role.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Shield size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                            {role.isSystem && (
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                                <Lock size={12} />
                                System
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(role.status)}`}>
                              {role.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600 mt-3 ml-16">
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{role.userCount} user{role.userCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle size={14} />
                          <span>{getPermissionCount(role.permissions)} permission{role.permissions.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>Created {new Date(role.createdDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openViewModal(role)}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="View Details"
                      >
                        <Eye size={18} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleCopyRole(role)}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Copy Role"
                      >
                        <Copy size={18} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => openEditModal(role)}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Edit Role"
                        disabled={role.isSystem}
                      >
                        <Edit size={18} className={role.isSystem ? 'text-gray-400' : 'text-blue-600'} />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Delete Role"
                        disabled={role.isSystem || role.userCount > 0}
                      >
                        <Trash2 size={18} className={
                          role.isSystem || role.userCount > 0 ? 'text-gray-400' : 'text-red-600'
                        } />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'view' ? 'Role Details' : editingRole ? 'Edit Role' : 'Create New Role'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {modalMode === 'view' && editingRole ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Shield size={32} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{editingRole.name}</h3>
                      <p className="text-gray-500">{editingRole.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Role ID</label>
                      <p className="mt-1 text-gray-900">{editingRole.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(editingRole.status)}`}>
                          {editingRole.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Users Assigned</label>
                      <p className="mt-1 text-gray-900">{editingRole.userCount}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Created</label>
                      <p className="mt-1 text-gray-900">
                        {new Date(editingRole.createdDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Permissions</label>
                    {editingRole.permissions.includes('all') ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-900">
                          <CheckCircle size={20} className="text-blue-600" />
                          <span className="font-medium">Full System Access</span>
                        </div>
                        <p className="text-sm text-blue-800 mt-2">
                          This role has complete access to all system features and functions.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {PERMISSION_CATEGORIES.map(cat => {
                          const rolePerms = cat.permissions.filter(p =>
                            editingRole.permissions.includes(p.id)
                          );

                          if (rolePerms.length === 0) return null;

                          const CategoryIcon = cat.icon;

                          return (
                            <div key={cat.category} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <CategoryIcon size={18} className="text-blue-600" />
                                <h4 className="font-semibold text-gray-900">{cat.category}</h4>
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                  {rolePerms.length}/{cat.permissions.length}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {rolePerms.map(perm => (
                                  <div key={perm.id} className="flex items-center gap-2 text-sm">
                                    <CheckCircle size={14} className="text-green-600" />
                                    <span className="text-gray-700">{perm.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700 block mb-2">Role Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Production Planner"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700 block mb-2">Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Brief description of this role..."
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData,  status: e.target.value as 'Active' | 'Inactive' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Permissions *</h3>
                      <button
                        type="button"
                        onClick={() => togglePermission('all')}
                        className={`px-3 py-1 text-sm rounded ${formData.permissions.includes('all')
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {formData.permissions.includes('all') ? 'Deselect All' : 'Grant Full Access'}
                      </button>
                    </div>

                    {formData.permissions.includes('all') ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-900">
                          <CheckCircle size={20} className="text-blue-600" />
                          <span className="font-medium">Full System Access Granted</span>
                        </div>
                        <p className="text-sm text-blue-800 mt-2">
                          This role will have complete access to all system features and functions.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {PERMISSION_CATEGORIES.map(cat => {
                          const CategoryIcon = cat.icon;
                          const isExpanded = expandedCategories[cat.category];
                          const selectedInCategory = cat.permissions.filter(p =>
                            formData.permissions.includes(p.id)
                          ).length;
                          const allSelected = selectedInCategory === cat.permissions.length;

                          return (
                            <div key={cat.category} className="border-2 border-gray-200 rounded-lg">
                              <div
                                className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                onClick={() => toggleCategory(cat.category)}
                              >
                                <div className="flex items-center gap-3">
                                  <CategoryIcon size={20} className="text-blue-600" />
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{cat.category}</h4>
                                    <p className="text-xs text-gray-500">
                                      {selectedInCategory}/{cat.permissions.length} selected
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      selectAllInCategory(cat.category);
                                    }}
                                    className={`text-xs px-2 py-1 rounded ${allSelected
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                      }`}
                                  >
                                    {allSelected ? 'Deselect All' : 'Select All'}
                                  </button>
                                  {isExpanded ? (
                                    <XCircle size={20} className="text-gray-400" />
                                  ) : (
                                    <CheckCircle size={20} className="text-gray-400" />
                                  )}
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="p-3 space-y-2 bg-white">
                                  {cat.permissions.map(perm => (
                                    <label
                                      key={perm.id}
                                      className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={formData.permissions.includes(perm.id)}
                                        onChange={() => togglePermission(perm.id)}
                                        className="mt-1"
                                      />
                                      <div className="flex-1">
                                        <div className="font-medium text-sm text-gray-900">{perm.name}</div>
                                        <div className="text-xs text-gray-500">{perm.description}</div>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {!formData.permissions.includes('all') && formData.permissions.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-green-800">
                          <div className="font-medium mb-1">
                            {formData.permissions.length} Permission{formData.permissions.length !== 1 ? 's' : ''} Selected
                          </div>
                          <div className="text-xs">
                            Click on categories above to expand and manage individual permissions
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warning */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-800">
                        <div className="font-medium mb-1">Permission Guidelines</div>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Grant only the permissions necessary for the role</li>
                          <li>Review permissions regularly to ensure they're still appropriate</li>
                          <li>Full access should only be granted to administrators</li>
                          <li>Changes to permissions affect all users with this role</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
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
                  disabled={editingRole?.isSystem}
                >
                  <Edit size={18} />
                  Edit Role
                </button>
              ) : (
                <button
                  onClick={handleSaveRole}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Role
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;