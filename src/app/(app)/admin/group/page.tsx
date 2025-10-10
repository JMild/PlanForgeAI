"use client";

import React, { useState, useMemo, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Shield,
  Save,
  CheckCircle,
  XCircle,
  Users,
  Lock,
  AlertCircle,
  Calendar,
  LayoutDashboard,
  FileText,
  Settings,
  BarChart3,
  ClipboardList,
  Package2,
  Warehouse,
  Wrench,
  Database
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import Modal from "@/src/components/shared/Modal";
import { getPermissionAll, getRoles } from "@/src/services/users";
import toast from "react-hot-toast";
import { ERROR_MESSAGES } from "@/src/config/messages";
import Loading from "@/src/components/Loading";
import EmptyState from "@/src/components/shared/EmptyState";
import { DataTable } from "@/src/components/shared/table/Table";

/* =========================
   Types
========================= */
type Status = "Active" | "Inactive";

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // permission_name
  userCount: number;
  isSystem: boolean;
  status: Status;
  createdDate: string; // YYYY-MM-DD
};

type RoleFormData = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  status: Status;
};

export type FlatPermission = {
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

// โครงสร้างข้อมูลใหม่สำหรับจัดกลุ่มตามหน้าจอ
type ScreenCatalog = {
  screenId: string; // screen_code หรือ fallback
  screenName: string;
  screenCode?: string;
  permissions: Array<{
    id: string;          // permission_name
    name: string;
    description?: string;
  }>;
};

// แค็ตตาล็อกต่อ "โมดูล" ที่อัปเดตแล้ว
type ModuleCatalog = {
  moduleId: string;
  moduleName: string;
  iconKey?: string;
  iconComp: LucideIcon;
  screens: ScreenCatalog[]; // เปลี่ยนจาก permissions มาเป็น screens
  totalPermissions: number; // เพิ่ม field เพื่อนับจำนวน permission ทั้งหมดใน module
};


/* =========================
   Utilities
========================= */
const ICON_MAP: Record<string, LucideIcon> = {
  Users, LayoutDashboard, Calendar, FileText, Settings, BarChart3,
  ClipboardList, Package2, Warehouse, Wrench, Database,
};

function resolveIcon(iconKey?: string): LucideIcon {
  if (!iconKey) return Shield;
  const key = iconKey as keyof typeof ICON_MAP;
  return ICON_MAP[key] || Shield;
}

// **[MODIFIED]** แปลง flat list -> แค็ตตาล็อกที่จัดกลุ่มตาม Module และ Screen
function buildCatalogByScreen(list: FlatPermission[]): ModuleCatalog[] {
    const byModule = new Map<string, {
        module: Omit<ModuleCatalog, 'screens' | 'totalPermissions'>,
        screens: Map<string, ScreenCatalog>
    }>();

    for (const row of list || []) {
        const moduleKey = row.module_id || row.module_name || "unknown_module";
        if (!byModule.has(moduleKey)) {
            byModule.set(moduleKey, {
                module: {
                    moduleId: row.module_id || moduleKey,
                    moduleName: row.module_name || moduleKey,
                    iconKey: row.module_icon,
                    iconComp: resolveIcon(row.module_icon),
                },
                screens: new Map<string, ScreenCatalog>(),
            });
        }

        const moduleBucket = byModule.get(moduleKey)!;

        // ใช้ screen_code เป็น key หลัก ถ้าไม่มีให้ใช้ screen_name หรือค่า default
        const screenKey = row.screen_code || row.screen_name || "__general__";
        const screenName = row.screen_name || (screenKey === "__general__" ? "General Permissions" : screenKey);
        
        if (!moduleBucket.screens.has(screenKey)) {
            moduleBucket.screens.set(screenKey, {
                screenId: screenKey,
                screenName: screenName,
                screenCode: row.screen_code,
                permissions: [],
            });
        }
        
        const screenBucket = moduleBucket.screens.get(screenKey)!;
        screenBucket.permissions.push({
            id: row.permission_name,
            name: row.permission_name,
            description: row.permission_description,
        });
    }

    // แปลง Map กลับเป็น Array และคำนวณ totalPermissions
    return Array.from(byModule.values()).map(entry => {
        const screens = Array.from(entry.screens.values());
        const totalPermissions = screens.reduce((sum, screen) => sum + screen.permissions.length, 0);
        return {
            ...entry.module,
            screens: screens,
            totalPermissions: totalPermissions,
        };
    });
}

// **[MODIFIED]** group permissions (ของ role) ตามโครงสร้างใหม่เพื่อใช้ใน View
function groupPermissionsByScreen(catalog: ModuleCatalog[], permissionIds: string[]) {
    return catalog.map(m => ({
        ...m,
        screens: m.screens
            .map(s => ({
                ...s,
                permissions: s.permissions.filter(p => permissionIds.includes(p.id))
            }))
            .filter(s => s.permissions.length > 0) // เอาเฉพาะ screen ที่มี permission ที่ถูกเลือก
    }))
    .filter(m => m.screens.length > 0); // เอาเฉพาะ module ที่มี screen ที่ถูกเลือก
}

function hasFullAccess(rolePerms: string[], list?: FlatPermission[]) {
  if (rolePerms.includes("all")) return true;
  return (list || []).some((r) => r.permission_name === "all");
}

/* =========================
   Demo seed
========================= */
const INITIAL_ROLES: Role[] = [
  {
    id: "ROLE001", name: "Administrator", description: "Full system access with all permissions",
    permissions: ["all"], userCount: 1, isSystem: true, status: "Active", createdDate: "2024-01-01",
  },
  {
    id: "ROLE002", name: "Production Planner", description: "Create and manage production schedules",
    permissions: ["manage_user", "view_dashboard"], userCount: 2, isSystem: false, status: "Active", createdDate: "2024-01-15",
  },
];

/* =========================
   Component
========================= */
const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [modalMode, setModalMode] = useState<"edit" | "view" | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [flatPermissions, setFlatPermissions] = useState<FlatPermission[]>([]);
  const [moduleCatalog, setModuleCatalog] = useState<ModuleCatalog[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string>("");

  const [formData, setFormData] = useState<RoleFormData>({ id: "", name: "", description: "", permissions: [], status: "Active" });

  /* ===== Helpers ===== */
  const stats = useMemo(() => ({
    total: roles.length,
    active: roles.filter((r) => r.status === "Active").length,
    system: roles.filter((r) => r.isSystem).length,
    users: roles.reduce((sum, r) => sum + r.userCount, 0),
  }), [roles]);

  const filteredRoles = roles.filter((r) => {
    const q = searchTerm.trim().toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // const res = await getRoles();
        const resPermissionAll = (await getPermissionAll()) as unknown as FlatPermission[];
        setFlatPermissions(resPermissionAll);
        
        // **[MODIFIED]** ใช้ฟังก์ชันใหม่
        const catalog = buildCatalogByScreen(resPermissionAll);
        setModuleCatalog(catalog);
        
        if (catalog.length > 0) {
            setActiveModuleId(catalog[0].moduleId);
        }

        // setRoles(res);
      } catch (error) {
        console.error("Fetch data failed:", error);
        toast.error(ERROR_MESSAGES.fetchFailed);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ===== Actions ===== */
  const openCreateModal = () => {
    setFormData({ id: `ROLE${String(roles.length + 1).padStart(3, "0")}`, name: "", description: "", permissions: [], status: "Active" });
    setEditingRole(null);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setFormData({ id: role.id, name: role.name, description: role.description, permissions: [...role.permissions], status: role.status });
    setEditingRole(role);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const openViewModal = (role: Role) => {
    setEditingRole(role);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setModalMode(null);
  };

  const handleSaveRole = () => {
    if (!formData.name || !formData.description) {
      alert("Please fill in name and description");
      return;
    }
    if (formData.permissions.length === 0 && !formData.permissions.includes("all")) {
      alert("Please select at least one permission");
      return;
    }

    const newRole: Role = {
      id: formData.id, name: formData.name, description: formData.description,
      permissions: [...formData.permissions],
      userCount: editingRole?.userCount || 0,
      isSystem: editingRole?.isSystem || false,
      status: formData.status,
      createdDate: editingRole?.createdDate || new Date().toISOString().split("T")[0],
    };

    if (editingRole) setRoles(roles.map((r) => (r.id === editingRole.id ? newRole : r)));
    else setRoles([...roles, newRole]);
    closeModal();
  };

  const handleDeleteRole = (id: Role["id"]) => {
    const role = roles.find((r) => r.id === id);
    if (!role) return;
    if (role.isSystem) {
      alert("System roles cannot be deleted");
      return;
    }
    if (role.userCount > 0) {
      alert(`Cannot delete role: ${role.userCount} user(s) are assigned to this role`);
      return;
    }
    if (confirm(`Delete role "${role.name}"?`)) setRoles(roles.filter((r) => r.id !== id));
  };

  const roleColumns = [
    {
      key: "role", label: "Role",
      render: (role: Role) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium flex items-center gap-2">
              {role.name}
              {role.isSystem && (
                <span className="text-xs px-2 py-0.5 rounded border status-info inline-flex items-center gap-1">
                  <Lock size={12} /> System
                </span>
              )}
            </div>
            <div className="text-xs text-white/60">{role.id}</div>
          </div>
        </div>
      ),
    },
    { key: "description", label: "Description", render: (role: Role) => <span className="text-sm text-white/80">{role.description}</span> },
    {
      key: "users", label: "Users",
      render: (role: Role) => (
        <div className="inline-flex items-center gap-1 text-white/80">
          <Users size={14} /> {role.userCount}
        </div>
      ),
    },
    {
      key: "status", label: "Status",
      render: (role: Role) => (
        <span className={`inline-flex items-center gap-1 chip ${role.status === "Active" ? "status-success" : "status-inactive"}`}>
          {role.status === "Active" ? <CheckCircle size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-white/60" />}
          {role.status}
        </span>
      ),
    },
    {
      key: "actions", label: "Actions", align: "center",
      render: (role: Role) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => openViewModal(role)} className="p-1 hover:bg-white/10 rounded" title="View Details"><Eye size={16} className="text-white/70" /></button>
          <button onClick={() => openEditModal(role)} className={`p-1 hover:bg-white/10 rounded ${role.isSystem ? "opacity-40 cursor-not-allowed" : ""}`} title="Edit Role" disabled={role.isSystem}>
            <Edit size={16} className={`${role.isSystem ? "text-white/50" : "text-sky-300"}`} />
          </button>
          <button onClick={() => handleDeleteRole(role.id)} className={`p-1 hover:bg-white/10 rounded ${role.isSystem || role.userCount > 0 ? "opacity-40 cursor-not-allowed" : ""}`} title="Delete Role" disabled={role.isSystem || role.userCount > 0}>
            <Trash2 size={16} className={`${role.isSystem || role.userCount > 0 ? "text-white/50" : "text-rose-300"}`} />
          </button>
        </div>
      ),
    },
  ] as const;

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
              <div className="glass-card glass-card-default-padding"><div className="flex items-center justify-between"><div><p className="text-sm text-white/70">Total Roles</p><p className="text-2xl font-bold">{roles.length}</p></div><Shield size={32} className="text-sky-300" /></div></div>
              <div className="glass-card glass-card-default-padding"><div className="flex items-center justify-between"><div><p className="text-sm text-white/70">Active</p><p className="text-2xl font-bold text-emerald-300">{stats.active}</p></div><CheckCircle size={32} className="text-emerald-300" /></div></div>
              <div className="glass-card glass-card-default-padding"><div className="flex items-center justify-between"><div><p className="text-sm text-white/70">System Roles</p><p className="text-2xl font-bold text-sky-300">{stats.system}</p></div><Lock size={32} className="text-sky-300" /></div></div>
              <div className="glass-card glass-card-default-padding"><div className="flex items-center justify-between"><div><p className="text-sm text-white/70">Total Users</p><p className="text-2xl font-bold">{stats.users}</p></div><Users size={32} className="text-white/60" /></div></div>
            </div>
            <div className="flex gap-4 mt-4 mb-1 mx-0.5">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                <input type="text" placeholder="Search roles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="glass-input w-full !pl-10 pr-4" />
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as "all" | Status)} className="glass-input">
                {["all", "Active", "Inactive"].map((v) => <option key={v} value={v} className="select option">{v === "all" ? "All Status" : v}</option>)}
              </select>
            </div>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? ( <Loading text="Loading permissions..." /> ) : (
          <DataTable
            columns={roleColumns}
            data={filteredRoles}
            rowKey={(r) => r.id}
            emptyMessage={
              <EmptyState
                icon={<Shield size={48} className="mx-auto text-white/40 mb-4" />}
                title="No roles found" message="Create your first role to get started"
                buttonLabel="Create Role" onButtonClick={openCreateModal}
              />
            }
          />
        )}
      </div>

      <Modal
        open={isModalOpen} onClose={closeModal} size="3xl"
        title={modalMode === "view" ? "Role Details" : editingRole ? "Edit Role" : "Create New Role"}
        footer={
          modalMode === "view" ? (
            <div className="flex items-center justify-end gap-3 w-full">
              <button onClick={closeModal} className="btn btn-outline">Close</button>
              <button onClick={() => setModalMode("edit")} className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed" disabled={editingRole?.isSystem}>
                <Edit className="w-4 h-4" /> Edit Role
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 w-full">
              <button onClick={closeModal} className="btn btn-outline">Cancel</button>
              <button onClick={handleSaveRole} className="btn btn-primary"><Save className="w-4 h-4" /> Save Role</button>
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
                  {editingRole.name}
                  {editingRole.isSystem && <span className="text-xs px-2 py-0.5 rounded border status-info inline-flex items-center gap-1"><Lock size={12} /> System</span>}
                </h3>
                <p className="text-white/70">{editingRole.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div><div className="text-sm text-white/80">Role ID</div><div className="mt-1">{editingRole.id}</div></div>
              <div><div className="text-sm text-white/80">Status</div><div className={`mt-1 inline-flex items-center gap-2 chip ${editingRole.status === "Active" ? "status-success" : "status-inactive"}`}>{editingRole.status === "Active" ? <CheckCircle size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-white/60" />} {editingRole.status}</div></div>
              <div><div className="text-sm text-white/80">Users Assigned</div><div className="mt-1">{editingRole.userCount}</div></div>
              <div><div className="text-sm text-white/80">Created</div><div className="mt-1">{new Date(editingRole.createdDate).toLocaleDateString()}</div></div>
            </div>

            {/* **[MODIFIED]** Permissions grouped by Module and Screen */}
            <div>
              <div className="text-sm font-medium text-white/80 mb-3">Permissions</div>
              {hasFullAccess(editingRole.permissions, flatPermissions) ? (
                <div className="rounded-lg p-4 bg-sky-500/10 border border-sky-400/30">
                  <div className="flex items-center gap-2 text-sky-200"><CheckCircle size={18} className="text-sky-300" /> <span className="font-medium">Full System Access</span></div>
                  <p className="text-sm text-sky-100/80 mt-2">This role has complete access to all system features and functions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupPermissionsByScreen(moduleCatalog, editingRole.permissions).map((mod) => (
                    <div key={mod.moduleId} className="border border-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <mod.iconComp size={18} className="text-sky-300" />
                        <h4 className="font-semibold">{mod.moduleName}</h4>
                      </div>
                      <div className="space-y-3 pl-2 border-l-2 border-white/10">
                        {mod.screens.map((screen) => (
                           <div key={screen.screenId} className="pl-4">
                             <h5 className="font-medium text-white/90 text-sm mb-2">{screen.screenName} {screen.screenCode && <span className="text-xs text-white/50">({screen.screenCode})</span>}</h5>
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
              <div className="col-span-2"><label className="block text-sm font-medium text-white/80 mb-1">Role Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="glass-input w-full" placeholder="e.g., Production Planner" /></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-white/80 mb-1">Description *</label><textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="glass-input w-full" placeholder="Brief description of this role..." /></div>
              <div><label className="block text-sm font-medium text-white/80 mb-1">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })} className="glass-input w-full"><option className="select option" value="Active">Active</option><option className="select option" value="Inactive">Inactive</option></select></div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Permissions *</h3>
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, permissions: prev.permissions.includes("all") ? [] : ["all"] }))} className={`px-3 py-1 text-sm rounded ${formData.permissions.includes("all") ? "bg-sky-600 text-white" : "bg-white/10 text-white border border-white/20 hover:bg-white/20"}`}>
                {formData.permissions.includes("all") ? "Deselect All" : "Grant Full Access"}
              </button>
            </div>

            {/* **[MODIFIED]** Tabs and Panels grouped by Screen */}
            {!formData.permissions.includes("all") && (
              <div className="flex gap-6">
                {/* Tab headers (Side) */}
                <div className="flex flex-col gap-1 w-1/4">
                  {moduleCatalog.map((mod) => {
                    const isActive = activeModuleId === mod.moduleId;
                    const selectedCount = mod.screens.flatMap(s => s.permissions).filter(p => formData.permissions.includes(p.id)).length;
                    return (
                      <button key={mod.moduleId} onClick={() => setActiveModuleId(mod.moduleId)} className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded text-left ${isActive ? "bg-sky-600/30" : "hover:bg-white/10"}`}>
                        <div className="flex items-center gap-2">
                          <mod.iconComp size={16} className={`${isActive ? 'text-sky-300' : 'text-white/70'}`} />
                          <span className={`text-sm ${isActive ? 'font-semibold' : ''}`}>{mod.moduleName}</span>
                        </div>
                        {selectedCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/50 text-white">{selectedCount}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Tab panel (Main) */}
                <div className="flex-1 space-y-4">
                  {moduleCatalog.filter(m => m.moduleId === activeModuleId).map((mod) => (
                    <div key={`panel-${mod.moduleId}`} className="border border-white/10 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <mod.iconComp size={22} className="text-sky-300" />
                          <div>
                            <h4 className="font-semibold text-lg">{mod.moduleName}</h4>
                            <p className="text-xs text-white/60">Select permissions for this module</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                        {mod.screens.map(screen => {
                            const allInScreen = screen.permissions.map(p => p.id);
                            const selectedInScreen = allInScreen.filter(id => formData.permissions.includes(id));
                            const allSelected = allInScreen.length > 0 && selectedInScreen.length === allInScreen.length;

                            return (
                                <div key={screen.screenId} className="border border-white/10 rounded-md">
                                    <div className="flex items-center justify-between p-2.5 bg-white/5">
                                        <h5 className="font-semibold text-sm">{screen.screenName} {screen.screenCode && <span className="text-xs text-white/50">({screen.screenCode})</span>}</h5>
                                        <button type="button" onClick={() => {
                                            if (allSelected) {
                                                setFormData(prev => ({ ...prev, permissions: prev.permissions.filter(p => !allInScreen.includes(p))}));
                                            } else {
                                                setFormData(prev => ({ ...prev, permissions: [...new Set([...prev.permissions, ...allInScreen])]}));
                                            }
                                        }} className={`text-xs px-2 py-1 rounded ${allSelected ? "bg-sky-500/15 text-sky-300 border border-sky-300/20" : "bg-white/10 text-white border border-white/20 hover:bg-white/20"}`}>
                                            {allSelected ? "Deselect All" : "Select All"}
                                        </button>
                                    </div>
                                    <div className="p-3 space-y-2">
                                    {screen.permissions.map(perm => (
                                        <label key={perm.id} className="flex items-start gap-3 p-2 hover:bg-white/5 rounded cursor-pointer">
                                        <input type="checkbox" checked={formData.permissions.includes(perm.id)} onChange={() => {
                                            setFormData(prev => ({
                                            ...prev,
                                            permissions: prev.permissions.includes(perm.id)
                                                ? prev.permissions.filter(p => p !== perm.id)
                                                : [...prev.permissions, perm.id],
                                            }));
                                        }} className="mt-1 accent-sky-500 w-4 h-4 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{perm.name}</div>
                                            {perm.description && <div className="text-xs text-white/60">{perm.description}</div>}
                                        </div>
                                        </label>
                                    ))}
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                    </div>
                  ))}
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