"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Plus, Search, Edit, Trash2, Eye, Download, Upload, Shield, Save,
  CheckCircle, XCircle, Users, Lock, AlertCircle,
  LayoutDashboard, Calendar, FileText, Settings, BarChart3,
  ClipboardList, Package2, Warehouse, Wrench, Database, CalendarCheck2
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import Modal from "@/src/components/shared/Modal";
import {
  getPermissionAll,
  getRoles,
  getPermissionByRoleId,
} from "@/src/services/users";
import toast from "react-hot-toast";
import { ERROR_MESSAGES } from "@/src/config/messages";
import { DataTable } from "@/src/components/shared/table/Table";

/* =========================
   Types
========================= */
type Status = "Active" | "Inactive";

type Role = {
  role_id: string;
  role_name: string;
  description: string;
  is_system_role: 0 | 1;
  status: Status;
  created_date: string;
  updated_date?: string;
  userCount?: number;
};

type RoleFormData = {
  role_id: string;
  role_name: string;
  description: string;
  permissions: string[]; // permission_name[]
  status: Status;
};

export type FlatPermission = {
  idx?: number;            // ใช้เรียงหน้า/สิทธิ์
  module_icon: string;
  module_id: string;
  module_name: string;
  permission_description?: string;
  permission_id: string;
  permission_name: string;
  screen_code?: string;
  screen_id?: string;
  screen_name?: string;
};

type ScreenCatalog = {
  screenId: string;
  screenName: string;
  screenCode?: string;
  order: number; // min(idx) ของหน้าจอนั้น
  permissions: Array<{
    id: string;        // permission_name
    name: string;      // permission_name
    description?: string;
    order: number;     // idx ของแถว
  }>;
};

type ModuleCatalog = {
  moduleId: string;
  moduleName: string;
  iconKey?: string;
  iconComp: LucideIcon;
  order: number; // min(idx) ของโมดูล
  screens: ScreenCatalog[];
  totalPermissions: number;
};

/* =========================
   Utilities
========================= */
const ICON_MAP: Record<string, LucideIcon> = {
  Users, LayoutDashboard, Calendar, FileText, Settings, BarChart3,
  ClipboardList, Package2, Warehouse, Wrench, Database, CalendarCheck2,
};

function resolveIcon(iconKey?: string): LucideIcon {
  if (!iconKey) return Shield;
  const key = iconKey as keyof typeof ICON_MAP;
  return ICON_MAP[key] || Shield;
}

/** แปลง flat → Catalog (Module → Screens → Permissions) + sort ตาม idx */
function buildCatalogByScreen(list: FlatPermission[]): ModuleCatalog[] {
  const byModule = new Map<
    string,
    { module: Omit<ModuleCatalog, "screens" | "totalPermissions">; screens: Map<string, ScreenCatalog>; }
  >();

  for (const row of list || []) {
    const moduleKey = row.module_id || row.module_name || "unknown_module";
    const mOrder = row.idx ?? Number.MAX_SAFE_INTEGER;

    if (!byModule.has(moduleKey)) {
      byModule.set(moduleKey, {
        module: {
          moduleId: row.module_id || moduleKey,
          moduleName: row.module_name || moduleKey,
          iconKey: row.module_icon,
          iconComp: resolveIcon(row.module_icon),
          order: mOrder,
        },
        screens: new Map<string, ScreenCatalog>(),
      });
    } else {
      const cur = byModule.get(moduleKey)!;
      if (mOrder < cur.module.order) cur.module.order = mOrder;
    }

    const bucket = byModule.get(moduleKey)!;

    const screenKey = row.screen_code || row.screen_name || "__general__";
    const screenName = row.screen_name || (screenKey === "__general__" ? "General Permissions" : screenKey);
    const sOrder = row.idx ?? Number.MAX_SAFE_INTEGER;

    if (!bucket.screens.has(screenKey)) {
      bucket.screens.set(screenKey, {
        screenId: screenKey,
        screenName,
        screenCode: row.screen_code,
        order: sOrder,
        permissions: [],
      });
    } else {
      const s = bucket.screens.get(screenKey)!;
      if (sOrder < s.order) s.order = sOrder;
    }

    const s = bucket.screens.get(screenKey)!;
    s.permissions.push({
      id: row.permission_name,
      name: row.permission_name,
      description: row.permission_description,
      order: row.idx ?? Number.MAX_SAFE_INTEGER,
    });
  }

  const modules = Array.from(byModule.values()).map(({ module, screens }) => {
    const screensArr = Array.from(screens.values())
      .map(sc => ({ ...sc, permissions: [...sc.permissions].sort((a, b) => a.order - b.order) }))
      .sort((a, b) => a.order - b.order);

    const totalPermissions = screensArr.reduce((sum, s) => sum + s.permissions.length, 0);
    return { ...module, screens: screensArr, totalPermissions };
  });

  return modules.sort((a, b) => a.order - b.order);
}

function groupPermissionsByScreen(catalog: ModuleCatalog[], permissionIds: string[]) {
  return catalog
    .map(m => ({
      ...m,
      screens: m.screens
        .map(s => ({ ...s, permissions: s.permissions.filter(p => permissionIds.includes(p.id)) }))
        .filter(s => s.permissions.length > 0),
    }))
    .filter(m => m.screens.length > 0);
}
const hasFullAccess = (rolePerms: string[]) => rolePerms.includes("all");

/* =========================
   Compact table-like screen permissions
========================= */
const PermissionScreenTable: React.FC<{
  screen: ScreenCatalog;
  selected: string[];
  onToggleOne: (id: string) => void;
  onToggleAll: (ids: string[], select: boolean) => void;
}> = ({ screen, selected, onToggleOne, onToggleAll }) => {
  const allIds = screen.permissions.map(p => p.id);
  const selectedInScreen = allIds.filter(id => selected.includes(id));
  const allSelected = allIds.length > 0 && selectedInScreen.length === allIds.length;

  return (
    <div className="rounded-md border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/5">
        <div className="text-sm font-semibold">
          {screen.screenName}{" "}
          {screen.screenCode && <span className="text-xs text-white/50">({screen.screenCode})</span>}
          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-white/10 border border-white/15">
            {selectedInScreen.length}/{allIds.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onToggleAll(allIds, !allSelected)}
          className={`text-xs px-2 py-1 rounded ${allSelected
              ? "bg-sky-500/15 text-sky-300 border border-sky-300/20"
              : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
            }`}
        >
          {allSelected ? "Deselect All" : "Select All"}
        </button>
      </div>

      {/* “Table” */}
      <div
        role="table"
        className="grid"
        style={{ gridTemplateColumns: "28px 1fr" }} // << เหลือ 2 คอลัมน์
      >
        {/* Rows */}
        {screen.permissions.map((perm) => {
          const checked = selected.includes(perm.id);
          return (
            <div
              role="row"
              key={perm.id}
              className="contents border-t border-white/10 hover:bg-white/5"
            >
              <div role="cell" className="px-3 py-2 flex items-center">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleOne(perm.id)}
                  className="accent-sky-500 w-4 h-4"
                />
              </div>
              <div role="cell" className="px-3 py-2 text-sm font-medium">
                {perm.name}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

/* =========================
   Component
========================= */
const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [loading, setLoading] = useState<boolean>(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [modalMode, setModalMode] = useState<"edit" | "view" | null>(null);

  // Permissions catalog (lazy)
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [moduleCatalog, setModuleCatalog] = useState<ModuleCatalog[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string>("");

  // role_id -> permissions cache (lazy per role)
  const [rolePermsById, setRolePermsById] = useState<Record<string, string[]>>({});
  const [loadingPerms, setLoadingPerms] = useState<boolean>(false);

  // form
  const [formData, setFormData] = useState<RoleFormData>({
    role_id: "",
    role_name: "",
    description: "",
    permissions: [],
    status: "Active",
  });

  // filter permission within a module
  const [permFilter, setPermFilter] = useState("");

  /* ===== Stats ===== */
  const stats = useMemo(() => {
    const total = roles.length;
    const active = roles.filter((r) => r.status === "Active").length;
    const system = roles.filter((r) => r.is_system_role === 1).length;
    const users = roles.reduce((sum, r) => sum + (r.userCount || 0), 0);
    return { total, active, system, users };
  }, [roles]);

  /* ===== Load roles only ===== */
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await getRoles();
        const normalized: Role[] = (res || []).map((r: any) => ({
          role_id: r.role_id,
          role_name: r.role_name,
          description: r.description,
          is_system_role: Number(r.is_system_role) as 0 | 1,
          status: r.status as Status,
          created_date: r.created_date,
          updated_date: r.updated_date,
          userCount: r.user_count ?? 0,
        }));
        setRoles(normalized);
      } catch (e) {
        console.error(e);
        toast.error(ERROR_MESSAGES.fetchFailed);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filteredRoles = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return roles.filter((r) => {
      const matchSearch = !q ||
        r.role_name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.role_id.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [roles, searchTerm, filterStatus]);

  /* ===== Lazy helpers ===== */
  const ensureCatalogLoaded = useCallback(async () => {
    if (permissionsLoaded) return;
    try {
      const resPermissionAll = (await getPermissionAll()) as unknown as FlatPermission[];
      const catalog = buildCatalogByScreen(resPermissionAll);
      setModuleCatalog(catalog);
      if (catalog.length) setActiveModuleId(catalog[0].moduleId);
      setPermissionsLoaded(true);
    } catch (e) {
      console.error(e);
      toast.error("Load permissions catalog failed");
    }
  }, [permissionsLoaded]);

  const fetchRolePermsIfNeeded = useCallback(
    async (role_id: string) => {
      if (rolePermsById[role_id]) return rolePermsById[role_id];
      try {
        setLoadingPerms(true);
        const rows = await getPermissionByRoleId(role_id);
        const list = Array.from(new Set((rows || []).map((r: any) => r.permission_name).filter(Boolean))) as string[];
        setRolePermsById((prev) => ({ ...prev, [role_id]: list }));
        return list;
      } catch (e) {
        console.error(e);
        toast.error("Load role permissions failed");
        return [];
      } finally {
        setLoadingPerms(false);
      }
    },
    [rolePermsById]
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingRole(null);
    setModalMode(null);
    setPermFilter("");
  }, []);

  /* ===== Actions (lazy calls on demand) ===== */
  const openCreateModal = useCallback(async () => {
    await ensureCatalogLoaded();
    const nextNum =
      roles.map((r) => Number((r.role_id || "").replace(/\D/g, "")) || 0).reduce((m, v) => Math.max(m, v), 0) + 1;
    const newId = `ROLE${String(nextNum).padStart(3, "0")}`;

    setFormData({ role_id: newId, role_name: "", description: "", permissions: [], status: "Active" });
    setEditingRole(null);
    setModalMode("edit");
    setIsModalOpen(true);
  }, [roles, ensureCatalogLoaded]);

  const openEditModal = useCallback(
    async (role: Role) => {
      await ensureCatalogLoaded();
      const perms = await fetchRolePermsIfNeeded(role.role_id);
      setFormData({
        role_id: role.role_id,
        role_name: role.role_name,
        description: role.description,
        permissions: [...perms],
        status: role.status,
      });
      setEditingRole(role);
      setModalMode("edit");
      setIsModalOpen(true);
    },
    [ensureCatalogLoaded, fetchRolePermsIfNeeded]
  );

  const openViewModal = useCallback(
    async (role: Role) => {
      await ensureCatalogLoaded();
      await fetchRolePermsIfNeeded(role.role_id);
      setEditingRole(role);
      setModalMode("view");
      setIsModalOpen(true);
    },
    [ensureCatalogLoaded, fetchRolePermsIfNeeded]
  );

  const handleSaveRole = useCallback(() => {
    if (!formData.role_name || !formData.description) {
      toast.error("Please fill in role name and description");
      return;
    }
    if (!formData.permissions.includes("all") && formData.permissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    const newRole: Role = {
      role_id: formData.role_id,
      role_name: formData.role_name.trim(),
      description: formData.description.trim(),
      is_system_role: editingRole?.is_system_role ?? 0,
      status: formData.status,
      created_date: editingRole?.created_date ?? new Date().toISOString(),
      updated_date: new Date().toISOString(),
      userCount: editingRole?.userCount ?? 0,
    };

    setRoles(prev =>
      editingRole ? prev.map(r => (r.role_id === editingRole.role_id ? newRole : r)) : [...prev, newRole]
    );
    setRolePermsById(prev => ({ ...prev, [newRole.role_id]: [...formData.permissions] }));

    toast.success(editingRole ? "Role updated" : "Role created");
    closeModal();
  }, [formData, editingRole, closeModal]);

  const handleDeleteRole = useCallback((role: Role) => {
    if (role.is_system_role === 1) {
      toast.error("System roles cannot be deleted");
      return;
    }
    if ((role.userCount ?? 0) > 0) {
      toast.error(`Cannot delete role: ${role.userCount} user(s) assigned`);
      return;
    }
    setRoles(prev => prev.filter(r => r.role_id !== role.role_id));
    setRolePermsById(prev => {
      const { [role.role_id]: _drop, ...rest } = prev;
      return rest;
    });
    toast.success("Role deleted");
  }, []);

  /* ===== Columns ===== */
  const roleColumns = useMemo(
    () => [
      {
        key: "role",
        label: "Role",
        render: (role: Role) => (
          <div className="flex items-center gap-3">
            <div>
              <div className="font-medium flex items-center gap-2">
                {role.role_name}
                {role.is_system_role === 1 && (
                  <span className="text-xs px-2 py-0.5 rounded border status-info inline-flex items-center gap-1">
                    <Lock size={12} /> System
                  </span>
                )}
              </div>
              <div className="text-xs text-white/60">{role.description}</div>
            </div>
          </div>
        ),
      },
      {
        key: "users",
        label: "Users",
        render: (role: Role) => (
          <div className="inline-flex items-center gap-1 text-white/80">
            <Users size={14} /> {role.userCount ?? 0}
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        align: "center",
        render: (role: Role) => (
          <span className={`inline-flex items-center gap-1 chip ${role.status === "Active" ? "status-success" : "status-inactive"}`}>
            {/* {role.status === "Active" ? <CheckCircle size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-white/60" />} */}
            {role.status}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "center",
        render: (role: Role) => (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => openViewModal(role)} className="p-1 hover:bg-white/10 rounded" title="View Details">
              <Eye size={16} className="text-white/70" />
            </button>
            <button
              onClick={() => openEditModal(role)}
              className={`p-1 hover:bg-white/10 rounded ${role.is_system_role === 1 ? "opacity-40 cursor-not-allowed" : ""}`}
              title="Edit Role" disabled={role.is_system_role === 1}>
              <Edit size={16} className={`${role.is_system_role === 1 ? "text-white/50" : "text-sky-300"}`} />
            </button>
            <button
              onClick={() => handleDeleteRole(role)}
              className={`p-1 hover:bg-white/10 rounded ${role.is_system_role === 1 || (role.userCount ?? 0) > 0 ? "opacity-40 cursor-not-allowed" : ""}`}
              title="Delete Role" disabled={role.is_system_role === 1 || (role.userCount ?? 0) > 0}>
              <Trash2 size={16} className={`${role.is_system_role === 1 || (role.userCount ?? 0) > 0 ? "text-white/50" : "text-rose-300"}`} />
            </button>
          </div>
        ),
      },
    ],
    [openViewModal, openEditModal, handleDeleteRole]
  );

  const currentRolePerms: string[] = useMemo(() => {
    if (!editingRole) return [];
    return rolePermsById[editingRole.role_id] || [];
  }, [editingRole, rolePermsById]);

  const toggleMany = (ids: string[], select: boolean) => {
    setFormData(prev => {
      const cur = new Set(prev.permissions);
      if (select) ids.forEach(id => cur.add(id));
      else ids.forEach(id => cur.delete(id));
      return { ...prev, permissions: Array.from(cur) };
    });
  };

  /* =========================
     Render
  ========================= */
  return (
    <div className="text-white">
      <PageHeader
        title={
          <div>
            <h1 className="text-2xl font-bold">Role &amp; Permissions Management</h1>
            <p className="text-sm text-white/70 mt-1">Define roles and access control permissions</p>
          </div>
        }
        actions={
          <div className="flex gap-3">
            <button className="btn btn-outline"><Upload size={18} /> Import</button>
            <button className="btn btn-outline"><Download size={18} /> Export</button>
            <button onClick={openCreateModal} className="btn btn-primary"><Plus size={18} /> New Role</button>
          </div>
        }
        tabs={
          <>
            <div className="grid grid-cols-4 gap-4">
              <div className="glass-card glass-card-default-padding"><div className="flex items-center justify-between"><div><p className="text-sm text-white/70">Total Roles</p><p className="text-2xl font-bold">{stats.total}</p></div><Shield size={32} className="text-sky-300" /></div></div>
              <div className="glass-card glass-card-default-padding"><div className="flex items-center justify-between"><div><p className="text-sm text-white/70">Active</p><p className="text-2xl font-bold text-emerald-300">{stats.active}</p></div><CheckCircle size={32} className="text-emerald-300" /></div></div>
              <div className="glass-card glass-card-default-padding"><div className="flex items-center justify-between"><div><p className="text-sm text-white/70">System Roles</p><p className="text-2xl font-bold text-sky-300">{stats.system}</p></div><Lock size={32} className="text-sky-300" /></div></div>
              <div className="glass-card glass-card-default-padding"><div className="flex items-center justify-between"><div><p className="text-sm text-white/70">Total Users</p><p className="text-2xl font-bold">{stats.users}</p></div><Users size={32} className="text-white/60" /></div></div>
            </div>

            <div className="flex gap-4 mt-4 mb-1 mx-0.5">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                <input type="text" placeholder="Search roles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="glass-input w-full !pl-10 pr-4" />
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as "all" | Status)} className="glass-input w-32">
                {["all", "Active", "Inactive"].map((v) => <option key={v} value={v} className="select option">{v === "all" ? "All Status" : v}</option>)}
              </select>
            </div>
          </>
        }
      />

      <div className="px-4 py-6">
        <DataTable columns={roleColumns as any} data={filteredRoles} rowKey={(r: Role) => r.role_id} isLoading={loading} />
      </div>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="2xl"
        title={modalMode === "view" ? "Role Details" : editingRole ? "Edit Role" : "Create New Role"}
        footer={
          modalMode === "view" ? (
            <div className="flex items-center justify-end gap-3 w-full">
              <button onClick={closeModal} className="btn btn-outline">Close</button>
              <button onClick={() => setModalMode("edit")} className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed" disabled={editingRole?.is_system_role === 1} title={editingRole?.is_system_role === 1 ? "System role cannot be edited" : "Edit"}>
                <Edit className="w-4 h-4" /> Edit Role
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 w-full">
              <button onClick={closeModal} className="btn btn-outline">Cancel</button>
              <button onClick={handleSaveRole} className="btn btn-primary"><Save className="w-4 h-4" /> Save Changes</button>
            </div>
          )
        }
      >
        {modalMode === "view" && editingRole ? (
          /* ===== View Body ===== */
          <div className="space-y-6 text-white">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  {editingRole.role_name}
                  {editingRole.is_system_role === 1 && <span className="text-xs px-2 py-0.5 rounded border status-info inline-flex items-center gap-1"><Lock size={12} /> System</span>}
                </h3>
                <p className="text-white/70">{editingRole.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div><div className="text-sm text-white/80">Role ID</div><div className="mt-1">{editingRole.role_id}</div></div>
              <div><div className="text-sm text-white/80">Status</div>
                <div className={`mt-1 inline-flex items-center gap-2 chip ${editingRole.status === "Active" ? "status-success" : "status-inactive"}`}>
                  {editingRole.status === "Active" ? <CheckCircle size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-white/60" />} {editingRole.status}
                </div>
              </div>
              <div><div className="text-sm text-white/80">Users Assigned</div><div className="mt-1">{editingRole.userCount ?? 0}</div></div>
              <div><div className="text-sm text-white/80">Created</div><div className="mt-1">{new Date(editingRole.created_date).toLocaleString()}</div></div>
            </div>

            {/* Permissions (grouped) */}
            <div>
              <div className="text-sm font-medium text-white/80 mb-3">Permissions</div>
              {loadingPerms ? (
                <div className="glass-card p-4 text-white/70">Loading permissions…</div>
              ) : hasFullAccess(currentRolePerms) ? (
                <div className="rounded-lg p-4 bg-sky-500/10 border border-sky-400/30">
                  <div className="flex items-center gap-2 text-sky-200"><CheckCircle size={18} className="text-sky-300" /><span className="font-medium">Full System Access</span></div>
                  <p className="text-sm text-sky-100/80 mt-2">This role has complete access to all system features and functions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupPermissionsByScreen(moduleCatalog, currentRolePerms).map((mod) => (
                    <div key={mod.moduleId} className="border border-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <mod.iconComp size={18} className="text-sky-300" />
                        <h4 className="font-semibold">{mod.moduleName}</h4>
                      </div>
                      <div className="space-y-3 pl-2 border-l-2 border-white/10">
                        {mod.screens.map((screen) => (
                          <div key={screen.screenId} className="pl-4">
                            <h5 className="font-medium text-white/90 text-sm mb-2">
                              {screen.screenName} {screen.screenCode && <span className="text-xs text-white/50">({screen.screenCode})</span>}
                            </h5>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                              {screen.permissions.map((perm) => (
                                <div key={perm.id} className="flex items-center gap-2 text-sm">
                                  <CheckCircle size={14} className="text-emerald-300 flex-shrink-0" />
                                  <span className="text-white/90">{perm.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ===== Edit/Create Body ===== */
          <div className="space-y-6 text-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-1">Role Name *</label>
                <input type="text" value={formData.role_name} onChange={(e) => setFormData({ ...formData, role_name: e.target.value })} className="glass-input w-full" placeholder="e.g., Production Planner" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-1">Description *</label>
                <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="glass-input w-full" placeholder="Brief description of this role..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })} className="glass-input w-full">
                  <option className="select option" value="Active">Active</option>
                  <option className="select option" value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Full access toggle */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Permissions *</h3>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, permissions: prev.permissions.includes("all") ? [] : ["all"] }))}
                className={`px-3 py-1 text-sm rounded ${formData.permissions.includes("all") ? "btn-primary" : "bg-white/10 text-white border border-white/20 hover:bg-white/20"}`}
              >
                {formData.permissions.includes("all") ? "Deselect All" : "Grant Full Access"}
              </button>
            </div>

            {!formData.permissions.includes("all") && (
              <div className="flex gap-6">
                {/* Tabs (modules) */}
                <div className="flex flex-col gap-1 w-1/4">
                  {moduleCatalog.map((mod) => {
                    const isActive = activeModuleId === mod.moduleId;
                    const selectedCount = mod.screens.flatMap(s => s.permissions).filter(p => formData.permissions.includes(p.id)).length;
                    return (
                      <button key={mod.moduleId} onClick={() => setActiveModuleId(mod.moduleId)} className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded text-left ${isActive ? "bg-sky-600/30" : "hover:bg-white/10"}`}>
                        <div className="flex items-center gap-2">
                          <mod.iconComp size={16} className={`${isActive ? "text-sky-300" : "text-white/70"}`} />
                          <span className={`text-sm ${isActive ? "font-semibold" : ""}`}>{mod.moduleName}</span>
                        </div>
                        {selectedCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/50 text-white">{selectedCount}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Panel (compact table + filter + select all) */}
                <div className="flex-1 space-y-4">
                  {moduleCatalog.filter(m => m.moduleId === activeModuleId).map((mod) => {
                    const allIdsInModule = mod.screens.flatMap(s => s.permissions.map(p => p.id));
                    const selectedInModule = allIdsInModule.filter(id => formData.permissions.includes(id));
                    const moduleAllSelected = allIdsInModule.length > 0 && selectedInModule.length === allIdsInModule.length;

                    const screens = permFilter.trim()
                      ? mod.screens.map(s => ({
                        ...s,
                        permissions: s.permissions.filter(p =>
                          p.name.toLowerCase().includes(permFilter.toLowerCase()) ||
                          (p.description || "").toLowerCase().includes(permFilter.toLowerCase())
                        )
                      })).filter(s => s.permissions.length > 0)
                      : mod.screens;

                    return (
                      <div key={`panel-${mod.moduleId}`} className="border border-white/10 rounded-lg p-4">
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <mod.iconComp size={22} className="text-sky-300" />
                            <div>
                              <h4 className="font-semibold text-lg">{mod.moduleName}</h4>
                              <p className="text-xs text-white/60">Selected {selectedInModule.length}/{allIdsInModule.length}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input value={permFilter} onChange={(e) => setPermFilter(e.target.value)} placeholder="Filter permissions..." className="glass-input !h-8 w-56" />
                            <button type="button" onClick={() => toggleMany(allIdsInModule, !moduleAllSelected)} className={`text-xs px-3 py-1 rounded ${moduleAllSelected ? "bg-sky-500/15 text-sky-300 border border-sky-300/20" : "bg-white/10 text-white border border-white/20 hover:bg-white/20"}`}>
                              {moduleAllSelected ? "Deselect All" : "Select All"}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {screens.length === 0 && <div className="text-sm text-white/60">No permissions match your filter.</div>}
                          {screens.map(screen => (
                            <PermissionScreenTable
                              key={screen.screenId}
                              screen={screen}
                              selected={formData.permissions}
                              onToggleOne={(id) =>
                                setFormData(prev => ({
                                  ...prev,
                                  permissions: prev.permissions.includes(id)
                                    ? prev.permissions.filter(p => p !== id)
                                    : [...prev.permissions, id],
                                }))
                              }
                              onToggleAll={(ids, select) => toggleMany(ids, select)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-amber-500/10 border border-amber-300/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="text-amber-300 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-100">
                  <div className="font-medium mb-1">Permission Guidelines</div>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Grant only the permissions necessary for the role</li>
                    <li>Review permissions regularly to ensure they’re still appropriate</li>
                    <li>Full access should only be granted to administrators</li>
                    <li>Changes to permissions affect all users with this role</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RoleManagement;
