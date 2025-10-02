// import PageHeader from '@/src/components/layout/PageHeader';
// import React, { useState, useEffect, useMemo } from 'react';
// import SettingsModal from './components/SettingsModal';
// import AuditLogs from './components/AuditLogs';
// import IntegrationList from './components/IntegrationList';
// import IntegrationDetails from './components/IntegrationDetails';
// import FieldMapping from './components/FieldMapping';
// import FieldMappingModal from './components/FieldMappingModal';

// const initialIntegrationData = {
//   erp: {
//     name: "ERP",
//     description: "เชื่อมต่อผ่าน REST API หรือ SOAP",
//     enabled: true,
//     config: { type: 'rest', url: 'https://api.my-erp.com/v2', auth: { type: 'apikey', key: 'erp_live_sk_xxxxx' } },
//     mapping: [
//       { id: 1, local: 'product.sku', external: 'item_code', dir: 'in' },
//       { id: 2, local: 'order.id', external: 'sales_order_id', dir: 'in' },
//       { id: 3, local: 'inventory.on_hand', external: 'stock_qty', dir: 'bi' }
//     ],
//     logs: [{ time: '09:12', event: 'Sync products', result: true }, { time: '08:45', event: 'Fetch orders', result: true }],
//     icon: <div className="bg-blue-600 p-2 rounded-lg">
//       <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
//       </svg>
//     </div>
//   },
//   mes: {
//     name: "MES",
//     description: "ส่ง/รับคำสั่งการผลิต",
//     enabled: false,
//     config: { type: 'webhook', url: '', auth: { type: 'basic', user: '', pass: '' } },
//     mapping: [
//       { id: 1, local: 'job.id', external: 'work_order', dir: 'out' },
//       { id: 2, local: 'job.qty_produced', external: 'actual_qty', dir: 'in' }
//     ],
//     logs: [],
//     icon: <div className="bg-green-600 p-2 rounded-lg">
//       <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
//       </svg>
//     </div>
//   },
//   wms: {
//     name: "WMS",
//     description: "เช็คสต็อก real-time, confirm receipts",
//     enabled: true,
//     config: { type: 'soap', url: 'https://wms.our-warehouse.com/service.asmx', auth: { type: 'oauth2', cid: 'wms-client-123', csecret: '*****' } },
//     mapping: [
//       { id: 1, local: 'inventory.batch', external: 'lot_no', dir: 'bi' },
//       { id: 2, local: 'receipt.id', external: 'asn_id', dir: 'in' }
//     ],
//     logs: [{ time: '11:05', event: 'Webhook receive', result: false, error: 'Invalid signature' }, { time: '10:30', event: 'Stock check', result: true }],
//     icon: <div className="bg-purple-600 p-2 rounded-lg">
//       <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
//       </svg>
//     </div>
//   },
//   hr: {
//     name: "HR", description: "กะพนักงาน, ข้อมูลเวลาเข้าออก", enabled: false, config: { type: 'rest', url: '', auth: { type: 'apikey', key: '' } }, mapping: [], logs: [],
//     icon: <div className="bg-orange-600 p-2 rounded-lg">
//       <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
//       </svg>
//     </div>
//   },
//   crm: {
//     name: "CRM", description: "สื่อสารกับฝ่ายขาย / ข้อมูลคำสั่งซื้อ", enabled: false, config: { type: 'rest', url: '', auth: { type: 'apikey', key: '' } }, mapping: [], logs: [],
//     icon: <div className="bg-pink-600 p-2 rounded-lg">
//       <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
//       </svg>
//     </div>
//   }
// };

// export default function Integrations() {
//   const [integrations, setIntegrations] = useState(initialIntegrationData);
//   const [activeProviderKey, setActiveProviderKey] = useState('erp');

//   // 🔑 แยก modal state
//   const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
//   const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);

//   const activeProviderData = useMemo(() => {
//     if (!activeProviderKey) return null;
//     return { ...integrations[activeProviderKey], key: activeProviderKey };
//   }, [activeProviderKey, integrations]);

//   // 🛠 Settings modal handlers
//   const handleOpenSettingsModal = () => setIsSettingsModalOpen(true);
//   const handleCloseSettingsModal = () => setIsSettingsModalOpen(false);

//   // 🔁 Mapping modal handlers
//   const handleOpenMappingModal = () => setIsMappingModalOpen(true);
//   const handleCloseMappingModal = () => setIsMappingModalOpen(false);

//   const handleSaveConfig = (newConfig) => {
//     setIntegrations((prev) => ({
//       ...prev,
//       [activeProviderKey]: {
//         ...prev[activeProviderKey],
//         config: newConfig,
//       },
//     }));
//     setIsSettingsModalOpen(false);
//   };

//   const handleSaveMapping = (newMapping) => {
//     setIntegrations((prev) => ({
//       ...prev,
//       [activeProviderKey]: {
//         ...prev[activeProviderKey],
//         mapping: newMapping,
//       },
//     }));
//     setIsMappingModalOpen(false);
//   };

//   const handleToggleEnable = () => {
//     setIntegrations(prev => ({
//       ...prev,
//       [activeProviderKey]: {
//         ...prev[activeProviderKey],
//         enabled: !prev[activeProviderKey].enabled
//       }
//     }));
//   };

//   return (
//     <>
//       <PageHeader
//         title="Integrations"
//         description="การจัดการการเชื่อมต่อกับระบบภายนอก (ERP/MES/WMS/HR/CRM)"
//       />
//       <div className="max-w-6xl mx-auto px-6 py-6">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
//           <div className="lg:col-span-1 space-y-6">
//             <IntegrationList
//               integrations={integrations}
//               activeProvider={activeProviderKey}
//               onSelect={setActiveProviderKey}
//             />
//           </div>
//           <div className="lg:col-span-2 space-y-6">
//             <IntegrationDetails
//               provider={activeProviderData}
//               onToggle={handleToggleEnable}
//               onEdit={handleOpenSettingsModal} 
//             />

//             <FieldMapping
//               provider={activeProviderData}
//               onEditMapping={handleOpenMappingModal}
//             />

//             {/* 🔁 Field Mapping Modal */}
//             <FieldMappingModal
//               isOpen={isMappingModalOpen}
//               onClose={handleCloseMappingModal}
//               onSave={handleSaveMapping}
//               config={activeProviderData.mapping}
//               title={`Field Mapping: ${activeProviderData?.name || ''}`}
//             />

//             {/* ⚙️ Settings Modal */}
//             <SettingsModal
//               isOpen={isSettingsModalOpen}
//               onClose={handleCloseSettingsModal}
//               onSave={handleSaveConfig}
//               config={activeProviderData?.config}
//               title={`Settings: ${activeProviderData?.name || ''}`}
//             />

//             <AuditLogs provider={activeProviderData} />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import React, { useState } from "react";
import {
  Plus, Search, Edit, Trash2, Eye, Download, Settings,
  Save, X, CheckCircle, XCircle, AlertCircle, RefreshCw, Zap,
  Database, Server, Link, Activity, PlayCircle, PauseCircle,
  Package
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import { ModalMode } from "@/src/types";

/* ==================== Types ==================== */

type IntegrationField = {
  name: string;
  label: string;
  type: "text" | "password" | "number" | "checkbox" | "json" | "multiselect";
  required?: boolean;
  default?: unknown;
  placeholder?: string;
  options?: string[];
};

type IntegrationType = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string; // tailwind color key like "blue" | "green" | ...
  fields: IntegrationField[];
};

type IntegrationStats = {
  totalCalls: number;
  successRate: number;      // %
  avgResponseTime: number;  // ms
};

type IntegrationConfig = Record<string, unknown>;

type IntegrationStatus = "Active" | "Inactive" | "Testing" | "Error";
type IntegrationHealth = "Healthy" | "Warning" | "Error" | "Unknown";

type Integration = {
  id: string;
  name: string;
  type: string; // could be narrowed to union of INTEGRATION_TYPES ids if desired
  status: IntegrationStatus;
  health?: IntegrationHealth;
  lastSync?: string;
  createdDate?: string;
  config: IntegrationConfig;
  stats: IntegrationStats;
};

// State types
type FormData = {
  id: string;
  name: string;
  type: string;
  status: Exclude<IntegrationStatus, "Error">; // Editing form doesn’t set "Error" directly
  config: IntegrationConfig;
};

type SelectedType = IntegrationType | null;

/* ==================== Constants ==================== */

const INTEGRATION_TYPES = [
  {
    id: "EMS",
    name: "Equipment Monitoring System (EMS)",
    description: "Real-time machine status, OEE, and downtime tracking",
    icon: Activity,
    color: "blue",
    fields: [
      { name: "apiUrl", label: "API URL", type: "text", required: true, placeholder: "https://ems.company.com/api" },
      { name: "apiKey", label: "API Key", type: "password", required: true },
      { name: "pollInterval", label: "Poll Interval (seconds)", type: "number", required: true, default: 30 },
      { name: "machineMapping", label: "Machine ID Mapping", type: "json" },
    ],
  },
  {
    id: "ERP",
    name: "Enterprise Resource Planning (ERP)",
    description: "Order sync, inventory, and material management",
    icon: Database,
    color: "green",
    fields: [
      { name: "apiUrl", label: "API URL", type: "text", required: true, placeholder: "https://erp.company.com/api" },
      { name: "username", label: "Username", type: "text", required: true },
      { name: "password", label: "Password", type: "password", required: true },
      { name: "companyId", label: "Company ID", type: "text", required: true },
      { name: "syncInterval", label: "Sync Interval (minutes)", type: "number", required: true, default: 60 },
    ],
  },
  {
    id: "MES",
    name: "Manufacturing Execution System (MES)",
    description: "Production tracking and shop floor data collection",
    icon: Settings,
    color: "purple",
    fields: [
      { name: "apiUrl", label: "API URL", type: "text", required: true, placeholder: "https://mes.company.com/api" },
      { name: "apiToken", label: "API Token", type: "password", required: true },
      { name: "plantCode", label: "Plant Code", type: "text", required: true },
      { name: "enableRealtime", label: "Enable Real-time Updates", type: "checkbox", default: true },
    ],
  },
  {
    id: "WMS",
    name: "Warehouse Management System (WMS)",
    description: "Material availability and inventory levels",
    icon: Package,
    color: "orange",
    fields: [
      { name: "apiUrl", label: "API URL", type: "text", required: true, placeholder: "https://wms.company.com/api" },
      { name: "apiKey", label: "API Key", type: "password", required: true },
      { name: "warehouseId", label: "Warehouse ID", type: "text", required: true },
    ],
  },
  {
    id: "WEBHOOK",
    name: "Webhook / Custom Integration",
    description: "Send events to external systems via webhooks",
    icon: Zap,
    color: "yellow",
    fields: [
      { name: "webhookUrl", label: "Webhook URL", type: "text", required: true, placeholder: "https://your-system.com/webhook" },
      { name: "secretKey", label: "Secret Key", type: "password" },
      {
        name: "events",
        label: "Events to Subscribe",
        type: "multiselect",
        required: true,
        options: ["order.created", "plan.generated", "job.started", "job.completed", "machine.down"],
      },
    ],
  },
] as const satisfies IntegrationType[];

const INITIAL_INTEGRATIONS = [
  {
    id: "INT001",
    name: "Production EMS",
    type: "EMS",
    status: "Active",
    lastSync: "2025-10-02T09:30:00",
    health: "Healthy",
    config: {
      apiUrl: "https://ems.company.com/api",
      apiKey: "••••••••••••",
      pollInterval: 30,
      machineMapping: "{}",
    },
    stats: { totalCalls: 15420, successRate: 99.2, avgResponseTime: 145 },
    createdDate: "2024-01-15",
  },
  {
    id: "INT002",
    name: "SAP ERP",
    type: "ERP",
    status: "Active",
    lastSync: "2025-10-02T09:00:00",
    health: "Healthy",
    config: {
      apiUrl: "https://erp.company.com/api",
      username: "api_user",
      password: "••••••••",
      companyId: "COMP001",
      syncInterval: 60,
    },
    stats: { totalCalls: 8230, successRate: 98.5, avgResponseTime: 320 },
    createdDate: "2024-02-01",
  },
  {
    id: "INT003",
    name: "Notification Webhook",
    type: "WEBHOOK",
    status: "Inactive",
    lastSync: "2025-09-28T14:30:00",
    health: "Warning",
    config: {
      webhookUrl: "https://notifications.company.com/webhook",
      secretKey: "••••••••",
      events: ["job.started", "job.completed", "machine.down"],
    },
    stats: { totalCalls: 1240, successRate: 92.3, avgResponseTime: 89 },
    createdDate: "2024-06-15",
  },
] as const satisfies Integration[];

/* ==================== Component ==================== */

const IntegrationsManagement: React.FC = () => {
  // ใช้ spread ให้ state เป็น mutable แม้ INITIAL_INTEGRATIONS จะเป็น readonly
  const [integrations, setIntegrations] = useState<Integration[]>([...INITIAL_INTEGRATIONS]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedType, setSelectedType] = useState<SelectedType>(null);
  const [formData, setFormData] = useState<FormData>({
    id: "",
    name: "",
    type: "",
    status: "Inactive",
    config: {},
  });

  /* ---------- helpers ---------- */

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      Active: "bg-green-100 text-green-700",
      Inactive: "bg-gray-100 text-gray-700",
      Error: "bg-red-100 text-red-700",
      Testing: "bg-yellow-100 text-yellow-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getHealthColor = (health?: string): string => {
    const colors: Record<string, string> = {
      Healthy: "text-green-600",
      Warning: "text-yellow-600",
      Error: "text-red-600",
      Unknown: "text-gray-600",
    };
    return health ? colors[health] || "text-gray-600" : "text-gray-600";
  };

  const getHealthIcon = (health?: string) => {
    switch (health) {
      case "Healthy":
        return <CheckCircle size={16} />;
      case "Warning":
        return <AlertCircle size={16} />;
      case "Error":
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getTypeColor = (typeId: string): string => {
    const type = INTEGRATION_TYPES.find((t) => t.id === typeId);
    return type?.color ?? "gray";
  };

  const getTypeInfo = (typeId: string): IntegrationType | undefined =>
    INTEGRATION_TYPES.find((t) => t.id === typeId);

  const formatLastSync = (dateStr: string | number | Date): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  /* ---------- derived ---------- */
  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || integration.type === filterType;
    const matchesStatus = filterStatus === "all" || integration.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  /* ---------- actions ---------- */
  const openCreateModal = (): void => {
    setFormData({
      id: `INT${String(integrations.length + 1).padStart(3, "0")}`,
      name: "",
      type: "",
      status: "Inactive",
      config: {},
    });
    setSelectedType(null);
    setEditingIntegration(null);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const openEditModal = (integration: Integration): void => {
    setFormData({
      id: integration.id,
      name: integration.name,
      type: integration.type,
      status: (["Active", "Inactive", "Testing"].includes(integration.status)
        ? (integration.status as FormData["status"])
        : "Inactive"),
      config: { ...integration.config },
    });
    setSelectedType(getTypeInfo(integration.type) ?? null);
    setEditingIntegration(integration);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const openViewModal = (integration: Integration): void => {
    setEditingIntegration(integration);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setEditingIntegration(null);
    setModalMode(null);
    setSelectedType(null);
  };

  const handleSaveIntegration = (): void => {
    if (!formData.name || !formData.type) {
      alert("Please fill in name and type");
      return;
    }

    const newIntegration: Integration = {
      ...formData,
      lastSync: editingIntegration?.lastSync, // อย่าเซ็ต null เพราะ type เป็น string | undefined
      health: editingIntegration?.health ?? "Unknown",
      stats: editingIntegration?.stats ?? { totalCalls: 0, successRate: 0, avgResponseTime: 0 },
      createdDate: editingIntegration?.createdDate ?? new Date().toISOString().split("T")[0],
    };

    if (editingIntegration) {
      setIntegrations((prev) => prev.map((i) => (i.id === editingIntegration.id ? newIntegration : i)));
    } else {
      setIntegrations((prev) => [...prev, newIntegration]);
    }
    closeModal();
  };

  const handleDeleteIntegration = (id: string): void => {
    if (confirm("Are you sure you want to delete this integration?")) {
      setIntegrations((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleTestConnection = (integration: Integration): void => {
    alert(`Testing connection for ${integration.name}...\n\nConnection successful! ✓`);
  };

  const handleSyncNow = (integration: Integration): void => {
    alert(`Syncing ${integration.name}...\n\nSync completed successfully!`);
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === integration.id ? { ...i, lastSync: new Date().toISOString(), health: "Healthy" } : i
      )
    );
  };

  const handleToggleStatus = (id: string): void => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: i.status === "Active" ? "Inactive" : "Active" } : i
      )
    );
  };

  const handleTypeSelect = (typeId: string): void => {
    const type = getTypeInfo(typeId) ?? null;
    setSelectedType(type);
    setFormData((prev) => ({
      ...prev,
      type: typeId,
      config: (type?.fields ?? []).reduce<Record<string, unknown>>(
        (acc, field) => ({ ...acc, [field.name]: field.default ?? (field.type === "checkbox" ? false : "") }),
        {}
      ),
    }));
  };

  const updateConfigField = (fieldName: string, value: string | number | boolean | string[]): void => {
    setFormData((prev) => ({
      ...prev,
      config: { ...prev.config, [fieldName]: value },
    }));
  };

  /* ==================== UI ==================== */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
                <p className="text-sm text-gray-500 mt-1">Connect external systems and data sources</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Download size={18} />
                  Export Logs
                </button>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={18} />
                  New Integration
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Integrations</p>
                    <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
                  </div>
                  <Link size={32} className="text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {integrations.filter((i) => i.status === "Active").length}
                    </p>
                  </div>
                  <CheckCircle size={32} className="text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Healthy</p>
                    <p className="text-2xl font-bold text-green-600">
                      {integrations.filter((i) => i.health === "Healthy").length}
                    </p>
                  </div>
                  <Activity size={32} className="text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Issues</p>
                    <p className="text-2xl font-bold text-red-600">
                      {integrations.filter((i) => i.health === "Error" || i.health === "Warning").length}
                    </p>
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
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {INTEGRATION_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
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
                <option value="Error">Error</option>
                <option value="Testing">Testing</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Integrations List */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredIntegrations.length === 0 ? (
            <div className="text-center py-12">
              <Link size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
              <p className="text-gray-500 mb-4">Connect your first external system</p>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Integration
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredIntegrations.map((integration) => {
                const typeInfo = getTypeInfo(integration.type);
                const TypeIcon = typeInfo?.icon || Server;

                return (
                  <div key={integration.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg bg-${getTypeColor(integration.type)}-100 flex items-center justify-center`}>
                          <TypeIcon size={24} className={`text-${getTypeColor(integration.type)}-600`} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(integration.status)}`}>
                              {integration.status}
                            </span>
                            <span className={`flex items-center gap-1 text-sm ${getHealthColor(integration.health)}`}>
                              {getHealthIcon(integration.health)}
                              {integration.health}
                            </span>
                          </div>

                          <p className="text-sm text-gray-500 mb-3">{typeInfo?.description}</p>

                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Type:</span>
                              <div className="font-medium text-gray-900">{typeInfo?.name}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Last Sync:</span>
                              <div className="font-medium text-gray-900">
                                {integration.lastSync ? formatLastSync(integration.lastSync) : "Never"}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Success Rate:</span>
                              <div className="font-medium text-gray-900">{integration.stats.successRate}%</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Avg Response:</span>
                              <div className="font-medium text-gray-900">{integration.stats.avgResponseTime}ms</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(integration.id)}
                          className="p-2 hover:bg-gray-200 rounded"
                          title={integration.status === "Active" ? "Deactivate" : "Activate"}
                        >
                          {integration.status === "Active" ? (
                            <PauseCircle size={18} className="text-gray-600" />
                          ) : (
                            <PlayCircle size={18} className="text-green-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleSyncNow(integration)}
                          className="p-2 hover:bg-gray-200 rounded"
                          title="Sync Now"
                          disabled={integration.status !== "Active"}
                        >
                          <RefreshCw
                            size={18}
                            className={integration.status === "Active" ? "text-blue-600" : "text-gray-400"}
                          />
                        </button>
                        <button
                          onClick={() => handleTestConnection(integration)}
                          className="p-2 hover:bg-gray-200 rounded"
                          title="Test Connection"
                        >
                          <Zap size={18} className="text-yellow-600" />
                        </button>
                        <button
                          onClick={() => openViewModal(integration)}
                          className="p-2 hover:bg-gray-200 rounded"
                          title="View Details"
                        >
                          <Eye size={18} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => openEditModal(integration)}
                          className="p-2 hover:bg-gray-200 rounded"
                          title="Edit Integration"
                        >
                          <Edit size={18} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteIntegration(integration.id)}
                          className="p-2 hover:bg-gray-200 rounded"
                          title="Delete Integration"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === "view" ? "Integration Details" : editingIntegration ? "Edit Integration" : "New Integration"}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {modalMode === "view" && editingIntegration ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    {(() => {
                      const typeInfo = getTypeInfo(editingIntegration.type);
                      const TypeIcon = typeInfo?.icon || Server;
                      return (
                        <>
                          <div className={`w-16 h-16 rounded-lg bg-${getTypeColor(editingIntegration.type)}-100 flex items-center justify-center`}>
                            <TypeIcon size={32} className={`text-${getTypeColor(editingIntegration.type)}-600`} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">{editingIntegration.name}</h3>
                            <p className="text-gray-500">{typeInfo?.name}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(editingIntegration.status)}`}>
                          {editingIntegration.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Health</label>
                      <p className={`mt-1 flex items-center gap-1 ${getHealthColor(editingIntegration.health)}`}>
                        {getHealthIcon(editingIntegration.health)}
                        {editingIntegration.health}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Sync</label>
                      <p className="mt-1 text-gray-900">
                        {editingIntegration.lastSync ? new Date(editingIntegration.lastSync).toLocaleString() : "Never"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Created</label>
                      <p className="mt-1 text-gray-900">
                        {editingIntegration.createdDate ? new Date(editingIntegration.createdDate).toLocaleDateString() : "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Performance Statistics</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-500">Total API Calls</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {editingIntegration.stats.totalCalls.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-500">Success Rate</div>
                        <div className="text-2xl font-bold text-green-600">
                          {editingIntegration.stats.successRate}%
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-500">Avg Response</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {editingIntegration.stats.avgResponseTime}ms
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Configuration</label>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {Object.entries(editingIntegration.config).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600">{key}:</span>
                          <span className="text-gray-900 font-mono">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700 block mb-2">Integration Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Production EMS"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700 block mb-2">Integration Type *</label>
                      {!editingIntegration ? (
                        <div className="grid grid-cols-2 gap-3">
                          {INTEGRATION_TYPES.map((type) => {
                            const TypeIcon = type.icon;
                            const isSelected = formData.type === type.id;
                            return (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => handleTypeSelect(type.id)}
                                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                                  isSelected
                                    ? `border-${type.color}-500 bg-${type.color}-50`
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <TypeIcon size={24} className={`text-${type.color}-600`} />
                                  <div className="flex-1">
                                    <div className="font-medium text-sm text-gray-900">{type.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                          {getTypeInfo(formData.type)?.name}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as FormData["status"] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Testing">Testing</option>
                      </select>
                    </div>
                  </div>

                  {/* Configuration Fields */}
                  {selectedType && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
                      <div className="space-y-4">
                        {selectedType.fields.map((field) => (
                          <div key={field.name}>
                            <label className="text-sm font-medium text-gray-700 block mb-2">
                              {field.label} {field.required && "*"}
                            </label>

                            {field.type === "text" && (
                              <input
                                type="text"
                                value={(formData.config[field.name] as string) || ""}
                                onChange={(e) => updateConfigField(field.name, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={field.placeholder}
                                required={field.required}
                              />
                            )}

                            {field.type === "password" && (
                              <input
                                type="password"
                                value={(formData.config[field.name] as string) || ""}
                                onChange={(e) => updateConfigField(field.name, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                                required={field.required}
                              />
                            )}

                            {field.type === "number" && (
                              <input
                                type="number"
                                value={
                                  typeof formData.config[field.name] === "number"
                                    ? (formData.config[field.name] as number)
                                    : ""
                                }
                                onChange={(e) => updateConfigField(field.name, Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required={field.required}
                              />
                            )}

                            {field.type === "checkbox" && (
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={Boolean(formData.config[field.name])}
                                  onChange={(e) => updateConfigField(field.name, e.target.checked)}
                                  className="rounded"
                                />
                                <span className="text-sm text-gray-600">Enable this option</span>
                              </label>
                            )}

                            {field.type === "json" && (
                              <textarea
                                value={(formData.config[field.name] as string) || ""}
                                onChange={(e) => updateConfigField(field.name, e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                placeholder='{"internal_id": "external_id"}'
                              />
                            )}

                            {field.type === "multiselect" && (
                              <div className="space-y-2">
                                {(field.options ?? []).map((option) => {
                                  const current = (formData.config[field.name] as string[]) ?? [];
                                  const checked = current.includes(option);
                                  return (
                                    <label key={option} className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => {
                                          const updated = e.target.checked
                                            ? [...current, option]
                                            : current.filter((o) => o !== option);
                                          updateConfigField(field.name, updated);
                                        }}
                                        className="rounded"
                                      />
                                      <span className="text-sm text-gray-700">{option}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <div className="font-medium mb-1">Integration Setup</div>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Test the connection before activating</li>
                          <li>Keep API credentials secure and rotate regularly</li>
                          <li>Monitor sync logs for errors or issues</li>
                          <li>Start with &quot;Testing&quot; status to validate configuration</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div>
                {modalMode === "view" && editingIntegration && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTestConnection(editingIntegration)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Zap size={18} />
                      Test Connection
                    </button>
                    <button
                      onClick={() => handleSyncNow(editingIntegration)}
                      className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2"
                    >
                      <RefreshCw size={18} />
                      Sync Now
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                {modalMode === "view" ? (
                  <button
                    onClick={() => setModalMode("edit")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Edit size={18} />
                    Edit Integration
                  </button>
                ) : (
                  <button
                    onClick={handleSaveIntegration}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save size={18} />
                    Save Integration
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsManagement;
