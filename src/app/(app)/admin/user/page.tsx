"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus, Search, Edit, Trash2, Eye, Download, Upload, Users,
  Shield, Mail, Phone, CheckCircle, XCircle, Key, Save
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import { ModalMode } from "@/src/types";
import { getDepartments, getRoles, getUsers } from "@/src/services/users";
import toast from "react-hot-toast";
import { ERROR_MESSAGES } from "@/src/config/messages";
import Modal from "@/src/components/shared/Modal";
import { DataTable } from "@/src/components/shared/table/Table";

/* =========================
   Types
========================= */
type Status = "Active" | "Inactive" | "Suspended" | "Pending";
type Department = string;

type Role = {
  role_id: string;
  role_name: string;
  description: string;
  permissions: string[];
};

type DepartmentOption = { department: string };

type User = {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  department: Department;
  role_id: Role["role_id"];
  role_name: string;
  status: Status;
  last_login: string | null;
  created_date: string;
  notes: string;
};

type UserFormData = {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  department: Department | "";
  role_id: Role["role_id"] | "";
  status: Status;
  notes: string;
};

type TableColumn<T> = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
};

/* =========================
   Component
========================= */
const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [filterDept, setFilterDept] = useState<"all" | Department>("all");
  const [filterRole, setFilterRole] = useState<"all" | Role["role_id"]>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  const [formData, setFormData] = useState<UserFormData>({
    user_id: "",
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    department: "",
    role_id: "",
    status: "Active",
    notes: "",
  });

  /* ===== Load initial data ===== */
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

  /* ===== Debounce search ===== */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  /* ===== Helpers ===== */
  const getStatusIcon = (status: Status) => {
    const cls =
      status === "Active"
        ? "text-emerald-300"
        : status === "Inactive"
          ? "text-white/60"
          : status === "Suspended"
            ? "text-amber-300"
            : "text-cyan-300"; // Pending
    const Icon = status === "Inactive" ? XCircle : CheckCircle;
    return <Icon size={16} className={cls} />;
  };

  const formatLastLogin = (dateStr: string | number | Date) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "-";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getUserStats = () => ({
    total: users.length,
    active: users.filter((u) => u.status === "Active").length,
    inactive: users.filter((u) => u.status === "Inactive").length,
  });

  const stats = getUserStats();

  const validateUser = (d: UserFormData): string | null => {
    if (!d.username || !d.email || !d.first_name || !d.last_name || !d.role_id || !d.department) {
      return "Please fill in all required fields";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return "Invalid email address";
    if (d.phone && !/^[0-9+\-()\s]{6,}$/.test(d.phone)) return "Invalid phone number";
    return null;
  };

  /* ===== Derived: filtered users ===== */
  const filteredUsers = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !q ||
        user.username.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.first_name.toLowerCase().includes(q) ||
        user.last_name.toLowerCase().includes(q);

      const matchesDept = filterDept === "all" || user.department === filterDept;
      const matchesRole = filterRole === "all" || user.role_id === filterRole;
      const matchesStatus = filterStatus === "all" || user.status === filterStatus;

      return matchesSearch && matchesDept && matchesRole && matchesStatus;
    });
  }, [users, debouncedSearch, filterDept, filterRole, filterStatus]);

  /* ===== Actions ===== */
  const openCreateModal = useCallback(() => {
    setFormData({
      user_id: `USR${Date.now().toString().slice(-6)}`,
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      department: "",
      role_id: "",
      status: "Active",
      notes: "",
    });
    setEditingUser(null);
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((user: User) => {
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
      notes: user.notes,
    });
    setEditingUser(user);
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

  const openViewModal = useCallback((user: User) => {
    setEditingUser(user);
    setModalMode("view");
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
    setModalMode(null);
  }, []);

  const handleSaveUser = useCallback(() => {
    const err = validateUser(formData);
    if (err) {
      toast.error(err);
      return;
    }

    const role = roles.find((r) => r.role_id === formData.role_id);

    const newUser: User = {
      user_id: formData.user_id || `USR${Date.now().toString().slice(-6)}`,
      username: formData.username.trim(),
      email: formData.email.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: formData.phone.trim(),
      department: formData.department as Department,
      role_id: formData.role_id as Role["role_id"],
      role_name: role?.role_name ?? "",
      status: formData.status,
      last_login: editingUser?.last_login ?? null,
      created_date: editingUser?.created_date ?? new Date().toISOString(),
      notes: formData.notes.trim(),
    };

    setUsers((prev) =>
      editingUser ? prev.map((u) => (u.user_id === editingUser.user_id ? newUser : u)) : [...prev, newUser]
    );

    toast.success(editingUser ? "User updated" : "User created");
    closeModal();
  }, [formData, roles, editingUser, closeModal]);

  const handleDeleteUser = useCallback(
    (id: User["user_id"]) => {
      setUsers((prev) => prev.filter((u) => u.user_id !== id));
      toast.success("User deleted");
    },
    []
  );

  const handleResetPassword = useCallback((user: User) => {
    toast.success(`Password reset link sent to ${user.email}`);
  }, []);

  const handleExport = useCallback(() => {
    try {
      const blob = new Blob([JSON.stringify(users, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported");
    } catch {
      toast.error("Export failed");
    }
  }, [users]);

  const handleImport = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const arr = JSON.parse(text) as User[];
      if (!Array.isArray(arr)) throw new Error();
      setUsers(arr);
      toast.success("Imported");
    } catch {
      toast.error("Import failed");
    }
  }, []);

  /* ===== Columns ===== */
  const userColumns: TableColumn<User>[] = useMemo(
    () => [
      {
        key: "user",
        label: "User",
        render: (user: User) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full grid place-items-center bg-cyan-500/10 border border-cyan-400/30 text-cyan-200">
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
          <span className="text-sm inline-flex items-center gap-1 truncate" title={user.role_name}>
            <Shield size={14} className="text-cyan-300" />
            {user.role_name}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (user: User) => (
          <span
            className={`inline-flex items-center gap-1 chip ${user.status === "Active"
              ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30"
              : user.status === "Inactive"
                ? "bg-white/5 text-white/80 border border-white/15"
                : user.status === "Suspended"
                  ? "bg-amber-500/15 text-amber-200 border border-amber-400/30"
                  : "bg-cyan-500/15 text-cyan-200 border border-cyan-400/30"
              }`}
          >
            {getStatusIcon(user.status)}
            {user.status}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "center",
        render: (user: User) => (
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => openViewModal(user)} className="p-1 hover:bg-white/10 rounded" title="View Details">
              <Eye size={16} className="text-white/70" />
            </button>
            <button onClick={() => openEditModal(user)} className="p-1 hover:bg-white/10 rounded" title="Edit User">
              <Edit size={16} className="text-cyan-300" />
            </button>
            <button onClick={() => handleResetPassword(user)} className="p-1 hover:bg-white/10 rounded" title="Reset Password">
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
    ],
    [openViewModal, openEditModal, handleResetPassword, handleDeleteUser]
  );

  const invalidMsg = validateUser(formData);

  /* ===== Render ===== */
  return (
    <div className="text-white">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-sm text-white/70 mt-1">Manage system users and access control</p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-3">
            <button
              className="btn btn-outline"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".json,application/json";
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                input.onchange = (e: any) => {
                  const f = e.target.files?.[0];
                  if (f) handleImport(f);
                };
                input.click();
              }}
            >
              <Upload size={18} />
              Import
            </button>
            <button className="btn btn-outline" onClick={handleExport}>
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
            <div className="grid grid-cols-3 gap-4">
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
                onChange={(e) => setFilterRole(e.target.value as 'all' | Role['role_id'])}
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
                className="glass-input w-32"
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
          <div className="glass-card h-48 grid place-items-center text-white/70">Loading users…</div>
        ) : filteredUsers.length === 0 ? (
          <div className="glass-card h-48 grid place-items-center text-white/70">No users found</div>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <DataTable columns={userColumns as any} data={filteredUsers} rowKey={(u: User) => u.user_id} isLoading={false} />
        )}
      </div>

      {/* ===== Main Modal ===== */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="2xl"
        title={modalMode === "view" ? "User Details" : editingUser ? "Edit User" : "Create New User"}
        footer={
          modalMode === "view" ? (
            <div className="flex items-center justify-end gap-3 w-full">
              <button onClick={closeModal} className="btn btn-outline">
                Close
              </button>
              <button onClick={() => setModalMode("edit")} className="btn btn-primary">
                <Edit className="w-4 h-4" />
                Edit User
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 w-full">
              <button onClick={closeModal} className="btn btn-outline">
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="btn btn-primary disabled:opacity-60"
                disabled={Boolean(invalidMsg)}
                title={invalidMsg ?? "Save"}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )
        }
      >
        {/* View Mode */}
        {modalMode === "view" && editingUser ? (
          <div className="space-y-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full grid place-items-center bg-cyan-500/10 border border-cyan-400/30 text-cyan-200 text-xl font-semibold">
                {editingUser.first_name.charAt(0)}
                {editingUser.last_name.charAt(0)}
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
                <div className="mt-1">{editingUser.phone || "-"}</div>
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
                <span
                  className={`mt-1 inline-flex items-center gap-1 chip ${editingUser.status === "Active"
                    ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30"
                    : editingUser.status === "Inactive"
                      ? "bg-white/5 text-white/80 border border-white/15"
                      : editingUser.status === "Suspended"
                        ? "bg-amber-500/15 text-amber-200 border border-amber-400/30"
                        : "bg-cyan-500/15 text-cyan-200 border border-cyan-400/30"
                    }`}
                >
                  {getStatusIcon(editingUser.status)}
                  {editingUser.status}
                </span>
              </div>
              <div>
                <div className="text-sm text-white/80">Last Login</div>
                <div className="mt-1">{editingUser.last_login ? formatLastLogin(editingUser.last_login) : "Never"}</div>
              </div>
              <div>
                <div className="text-sm text-white/80">Created Date</div>
                <div className="mt-1">{new Date(editingUser.created_date).toLocaleDateString()}</div>
              </div>
            </div>

            {editingUser.notes && (
              <div>
                <div className="text-sm text-white/80 mb-1">Notes</div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/90">{editingUser.notes}</div>
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
                  <option value="" className="select option">
                    Select Department
                  </option>
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
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value as Role["role_id"] })}
                  className="w-full glass-input"
                >
                  <option value="" className="select option">
                    Select Role
                  </option>
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
                  {["Active", "Inactive", "Suspended", "Pending"].map((s) => (
                    <option key={s} value={s} className="select option">
                      {s}
                    </option>
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
    </div>
  );
};

export default UserManagement;
