"use client"

import React, { useEffect, useState } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, Download, Upload, Users, Shield, Mail, Phone, CheckCircle,
  XCircle, Key, UserCheck, Save
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';
import { ModalMode } from '@/src/types';
// import { getDepartments, getRoles, getUsers } from '@/src/services/users';
import Loading from '@/src/components/Loading';
// import { mockUsers } from '@/src/lib/mockData';
import Modal from '@/src/components/shared/Modal';
import { getDepartments, getRoles, getUsers } from '@/src/services/users';
import toast from 'react-hot-toast';
import { ERROR_MESSAGES } from '@/src/config/messages';
import EmptyState from '@/src/components/shared/EmptyState';
import { DataTable } from '@/src/components/shared/table/Table';

/* =========================
   Types
========================= */
type Status = 'Active' | 'Inactive'; /// Active' | 'Inactive' | 'Suspended' | 'Pending'
type Department = string;

type RoleOption = { role_id: string; role_name: string };
type Role = { id: string; name: string; description: string; permissions: string[] };

// shape ของ mock data สำหรับฟิลเตอร์
type DepartmentOption = { department: string };

type User = {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  department: Department;
  role_id: Role['id'];
  role_name: string;
  status: Status;
  last_login: string | null;   // ISO string or null
  created_date: string;        // YYYY-MM-DD
  notes: string;
};

type UserFormData = {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  department: Department | '';
  role_id: Role['id'] | '';
  status: Status;
  notes: string;
};

/* =========================
   Component
========================= */
const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDept, setFilterDept] = useState<'all' | Department>('all');
  const [filterRole, setFilterRole] = useState<'all' | Role['id']>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | Status>('all');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [showPermissions, setShowPermissions] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    user_id: '',
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    role_id: '',
    status: 'Active',
    notes: ''
  });

  useEffect(() => {
    Promise.all([getUsers(), getDepartments(), getRoles()])
      .then(([users, depts, roles]) => {
        setUsers(users);
        setDepartments(depts);
        setRoles(roles);
      })
      .catch(() => toast.error(ERROR_MESSAGES.fetchFailed))
      .finally(() => setLoading(false));
  }, []);

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'Active': return <CheckCircle size={16} className="text-green-600" />;
      case 'Inactive': return <XCircle size={16} className="text-gray-400" />;
    }
  };

  const formatlast_login = (dateStr: string | number | Date) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = filterDept === 'all' || user.department === filterDept;
    const matchesRole = filterRole === 'all' || user.role_id === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  const openCreateModal = () => {
    setFormData({
      user_id: `USR${String(users.length + 1).padStart(3, '0')}`,
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      department: '',
      role_id: '',
      status: 'Active',
      notes: ''
    });
    setEditingUser(null);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setFormData({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      department: user.department,
      role_id: user.role_id,
      status: user.status,
      notes: user.notes
    });
    setEditingUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openViewModal = (user: User) => {
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
    if (
      !formData.username ||
      !formData.email ||
      !formData.first_name ||
      !formData.last_name ||
      !formData.role_id ||
      !formData.department
    ) {
      alert('Please fill in all required fields');
      return;
    }

    const role = roles.find((r) => r.role_id === formData.role_id);

    const newUser: User = {
      user_id: formData.user_id,
      username: formData.username,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      department: formData.department as Department,
      role_id: formData.role_id as Role['id'],
      role_name: role?.role_name ?? '',
      status: formData.status,
      last_login: editingUser?.last_login ?? null,
      created_date: editingUser?.created_date ?? new Date().toISOString().split('T')[0],
      notes: formData.notes,
    };

    if (editingUser) {
      setUsers(users.map((u) => (u.user_id === editingUser.user_id ? newUser : u)));
    } else {
      setUsers([...users, newUser]);
    }
    closeModal();
  };

  const handleDeleteUser = (id: User['user_id']) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.user_id !== id));
    }
  };

  const handleResetPassword = (user: User) => {
    alert(`Password reset link sent to ${user.email}`);
  };

  const viewRolePermissions = (role_id: Role['id']) => {
    const role = roles.find((r) => r.role_id === role_id);
    if (!role) return;
    setSelectedRole(role);
    setShowPermissions(true);
  };

  const getUserStats = () => {
    return {
      total: users.length,
      active: users.filter((u) => u.status === 'Active').length,
      inactive: users.filter((u) => u.status === 'Inactive').length,
      // suspended: users.filter((u) => u.status === 'Suspended').length,
    };
  };

  const stats = getUserStats();

  const userColumns = [
    {
      key: "user",
      label: "User",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full grid place-items-center
                    bg-cyan-500/10 border border-cyan-400/30 text-cyan-200">
            <span className="font-semibold">
              {user.first_name.charAt(0)}
              {user.last_name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-sm text-white/70">@{user.username}</div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (user: User) => (
        <div className="text-sm flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Mail size={14} className="text-white/70" />
            <span>{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-1 text-white/70">
              <Phone size={14} />
              {user.phone}
            </div>
          )}
        </div>
      ),
    },
    { key: "department", label: "Department", align: "left" },
    {
      key: "role",
      label: "Role",
      render: (user: User) => (
        <button
          onClick={() => viewRolePermissions(user.role_id)}
          className="text-sm text-cyan-200 hover:text-cyan-100 inline-flex items-center gap-1 truncate"
          title={user.role_name}
        >
          {user.role_name}
        </button>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (user: User) => {
        const statusClass = user.status === "Active" ? "status-success" : "status-inactive";
        return (
          <span className={`inline-flex items-center gap-1 chip ${statusClass}`}>
            {getStatusIcon(user.status)}
            {user.status}
          </span>
        );
      },
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (user: User) => (
        <span className="text-sm text-white/70">
          {user.last_login ? formatlast_login(user.last_login) : "Never"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (user: User) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openViewModal(user)}
            className="p-1 hover:bg-white/10 rounded"
            title="View Details"
          >
            <Eye size={16} className="text-white/70" />
          </button>
          <button
            onClick={() => openEditModal(user)}
            className="p-1 hover:bg-white/10 rounded"
            title="Edit User"
          >
            <Edit size={16} className="text-cyan-300" />
          </button>
          <button
            onClick={() => handleResetPassword(user)}
            className="p-1 hover:bg-white/10 rounded"
            title="Reset Password"
          >
            <Key size={16} className="text-amber-300" />
          </button>
          <button
            onClick={() => handleDeleteUser(user.user_id)}
            className="p-1 hover:bg-white/10 rounded"
            title="Delete User"
          >
            <Trash2 size={16} className="text-rose-300" />
          </button>
        </div>
      ),
    },
  ] as const;


  return (
    <div className="text-white">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-sm text-white/70 mt-1">
                Manage system users and access control
              </p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-3">
            <button className="btn btn-outline">
              <Upload size={18} />
              Import
            </button>
            <button className="btn btn-outline">
              <Download size={18} />
              Export
            </button>
            <button onClick={openCreateModal} className="btn btn-primary">
              <Plus size={18} />
              New User
            </button>
          </div>
        }
        tabs={
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Total Users</p>
                    <p className="text-2xl font-bold text-cyan-300">{stats.total}</p>
                  </div>
                  <Users size={32} className="text-cyan-300" />
                </div>
              </div>

              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Active</p>
                    <p className="text-2xl font-bold text-emerald-300">{stats.active}</p>
                  </div>
                  <CheckCircle size={32} className="text-emerald-300" />
                </div>
              </div>

              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Inactive</p>
                    <p className="text-2xl font-bold text-white/80">{stats.inactive}</p>
                  </div>
                  <XCircle size={32} className="text-white/70" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4 mb-1 mx-0.5">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input w-full !pl-10 pr-4"
                />
              </div>

              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value as 'all' | Department)}
                className="glass-input"
              >
                <option value="all" className="select option">
                  All Departments
                </option>
                {departments.map((dept) => (
                  <option
                    key={dept.department}
                    value={dept.department}
                    className="select option"
                  >
                    {dept.department}
                  </option>
                ))}
              </select>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as 'all' | Role['id'])}
                className="glass-input"
              >
                <option value="all" className="select option">
                  All Roles
                </option>
                {roles.map((role) => (
                  <option
                    key={role.role_id}
                    value={role.role_id}
                    className="select option"
                  >
                    {role.role_name}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | Status)}
                className="glass-input"
              >
                {['all', 'Active', 'Inactive'].map((v) => (
                  <option key={v} value={v} className="select option">
                    {v === 'all' ? 'All Status' : v}
                  </option>
                ))}
              </select>
            </div>
          </>
        }
      />


      {/* Users List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <Loading text="Loading users..." />
        ) : (
          <DataTable
            columns={userColumns}
            data={filteredUsers}
            rowKey={(u) => u.user_id}
            emptyMessage={<EmptyState/>}
          />
        )}
      </div>

      {/* ===== Main Modal (ใช้ Modal base) ===== */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="2xl"
        title={
          modalMode === "view"
            ? "User Details"
            : editingUser
              ? "Edit User"
              : "Create New User"
        }
        footer={
          modalMode === "view" ? (
            <div className="flex items-center justify-end gap-3 w-full">
              <button onClick={closeModal} className="btn btn-outline">Close</button>
              <button
                onClick={() => setModalMode("edit")}
                className="btn btn-primary"
              >
                <Edit className="w-4 h-4" />
                Edit User
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 w-full">
              <button onClick={closeModal} className="btn btn-outline">Cancel</button>
              <button onClick={handleSaveUser} className="btn btn-primary">
                <Save className="w-4 h-4" />
                Save User
              </button>
            </div>
          )
        }
      >
        {/* View Mode */}
        {modalMode === 'view' && editingUser ? (
          <div className="space-y-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full grid place-items-center bg-cyan-500/10 border border-cyan-400/30 text-cyan-200 text-xl font-semibold">
                {editingUser.first_name.charAt(0)}{editingUser.last_name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {editingUser.first_name} {editingUser.last_name}
                </h3>
                <p className="text-white/70">@{editingUser.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-white/80">Email</div>
                <div className="mt-1">{editingUser.email}</div>
              </div>
              <div>
                <div className="text-sm text-white/80">Phone</div>
                <div className="mt-1">{editingUser.phone || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-white/80">Department</div>
                <div className="mt-1">{editingUser.department}</div>
              </div>
              <div>
                <div className="text-sm text-white/80">Role</div>
                <div className="mt-1 inline-flex items-center gap-1">
                  <Shield size={14} className="text-cyan-300" />
                  {editingUser.role_name}
                </div>
              </div>
              <div>
                <div className="text-sm text-white/80">Status</div>
                <span className={`mt-1 inline-flex items-center gap-1 chip ${editingUser.status === "Active" ? "status-success" : "status-inactive"}`}>
                  {getStatusIcon(editingUser.status)}
                  {editingUser.status}
                </span>
              </div>
              <div>
                <div className="text-sm text-white/80">Last Login</div>
                <div className="mt-1">{editingUser.last_login ? formatlast_login(editingUser.last_login) : 'Never'}</div>
              </div>
              <div>
                <div className="text-sm text-white/80">Created Date</div>
                <div className="mt-1">{new Date(editingUser.created_date).toLocaleDateString()}</div>
              </div>
            </div>

            {editingUser.notes && (
              <div>
                <div className="text-sm text-white/80 mb-1">Notes</div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/90">
                  {editingUser.notes}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Edit/Create Form */
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full glass-input"
                >
                  <option value="" className="select option">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.department} value={dept.department} className="select option">
                      {dept.department}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Role *</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value as Role['id'] })}
                  className="w-full glass-input"
                >
                  <option value="" className="select option">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_id} className="select option">
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                  className="w-full glass-input"
                >
                  {['Active', 'Inactive', 'Suspended', 'Pending'].map((s) => (
                    <option key={s} value={s} className="select option">{s}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="glass-input w-full"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ===== Role Permissions Modal (ใช้ Modal base) ===== */}
      <Modal
        open={Boolean(showPermissions && selectedRole)}
        onClose={() => setShowPermissions(false)}
        size="2xl"
        title={`${selectedRole?.name ?? ""} Role`}
        footer={
          <div className="flex justify-end w-full">
            <button
              onClick={() => setShowPermissions(false)}
              className="btn btn-outline"
            >
              Close
            </button>
          </div>
        }
      >
        {selectedRole && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-white/80">Description</label>
              <p className="mt-1 text-white/90">{selectedRole.description}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-white/80 mb-3 block">Permissions</label>
              {selectedRole.permissions.includes('all') ? (
                <div className="rounded-lg p-4 bg-cyan-500/10 border border-cyan-400/30">
                  <div className="flex items-center gap-2 text-cyan-200">
                    <CheckCircle size={20} className="text-cyan-300" />
                    <span className="font-medium">Full System Access</span>
                  </div>
                  <p className="text-sm text-cyan-100/80 mt-2">
                    This role has complete access to all system features and functions.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedRole.permissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg"
                    >
                      <CheckCircle size={16} className="text-emerald-300" />
                      <span className="text-sm text-white/90">
                        {permission.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg p-4 bg-white/5 border border-white/10">
              <div className="text-sm text-white/80">
                <div className="font-medium mb-2">Users with this role:</div>
                <div className="space-y-1">
                  {users
                    .filter((u) => u.role_id === selectedRole.id)
                    .map((user) => (
                      <div key={user.user_id} className="flex items-center gap-2">
                        <UserCheck size={14} className="text-white/70" />
                        <span className="text-white">
                          {user.first_name} {user.last_name}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
