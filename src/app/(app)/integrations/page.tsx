"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Database,
  Settings as Cog,
  Package,
  BriefcaseBusiness,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wand2,
  BookOpen,
  Trash2,
  Check,
  Pencil,
  RefreshCw,
  Filter,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ======================== Types ======================== */

type IntegrationStatus = "Active" | "Inactive" | "Testing" | "Error";
interface IntegrationStats {
  totalCalls: number;
  successRate: number;
  avgResponseTime: number;
}
type Primitive = string | number | boolean | null | undefined;
type IntegrationConfig = Record<string, Primitive>;

type ProviderType = "ERP" | "WMS" | "MES" | "HR" | "CMMS";

interface ProviderField {
  key: string;
  label: string;
  placeholder?: string;
  default?: string | number | boolean;
}

interface ProviderSpec {
  id: ProviderType;
  name: string;
  icon: LucideIcon;
  color: string;
  fields: ProviderField[];
  docs: { overview: string };
  localSchema: string[];
}

interface ResourceSpec {
  name: string;
  method: "GET" | "POST";
  path: string;
  defaultDir: "in" | "out" | "bi";
  localSchema: string[];
  exampleRequest: { method: "GET" | "POST"; url: string; body?: unknown };
  exampleResponse: unknown;
}

interface IntegrationItem {
  id: string;
  name: string;
  type: ProviderType;
  status: IntegrationStatus;
  health?: "Healthy" | "Warning" | "Error" | "Unknown";
  lastSync?: string;
  createdDate?: string;
  config: IntegrationConfig;
  stats: IntegrationStats;
}

interface MappingRow {
  id: string;
  local: string;
  external: string;
  dir: "in" | "out" | "bi";
  confidence?: number;
}

/* ======================== Provider + Resource Spec ======================== */

const PROVIDER_TYPES: Record<ProviderType, ProviderSpec> = {
  ERP: {
    id: "ERP",
    name: "Enterprise Resource Planning",
    icon: Database,
    color: "text-emerald-300",
    fields: [
      { key: "apiUrl", label: "API URL", placeholder: "https://erp.company.com" },
      { key: "username", label: "Username" },
      { key: "password", label: "Password" },
      { key: "companyId", label: "Company ID" },
      { key: "apiKey", label: "API Key" },
    ],
    docs: {
      overview: "ดึง Orders/BOM/Routings/Inventory ใช้แบบ read-only สำหรับการวางแผน",
    },
    localSchema: ["product.sku", "order.id", "order.due_date", "inventory.on_hand"],
  },
  WMS: {
    id: "WMS",
    name: "Warehouse Management System",
    icon: Package,
    color: "text-orange-300",
    fields: [
      { key: "apiUrl", label: "API URL", placeholder: "https://wms.company.com" },
      { key: "apiKey", label: "API Key" },
      { key: "warehouseId", label: "Warehouse ID" },
    ],
    docs: { overview: "เช็ควัตถุดิบคงเหลือ และจองเบิกวัตถุดิบ" },
    localSchema: ["material.item_code", "material.qty_available", "reservation.request_id"],
  },
  MES: {
    id: "MES",
    name: "Manufacturing Execution System",
    icon: Cog,
    color: "text-purple-300",
    fields: [
      { key: "apiUrl", label: "API URL", placeholder: "https://mes.company.com" },
      { key: "apiToken", label: "API Token" },
      { key: "plantCode", label: "Plant Code" },
    ],
    docs: { overview: "ส่ง dispatch plan และรับการยืนยันผลผลิต/actuals จากหน้างาน" },
    localSchema: ["job.id", "job.operation", "job.machine_code", "job.qty_plan", "job.qty_actual"],
  },
  HR: {
    id: "HR",
    name: "Human Resources",
    icon: BriefcaseBusiness,
    color: "text-sky-300",
    fields: [
      { key: "apiUrl", label: "API URL", placeholder: "https://hr.company.com" },
      { key: "apiKey", label: "API Key" },
      { key: "tenantId", label: "Tenant ID" },
    ],
    docs: { overview: "ซิงก์พนักงาน กะการทำงาน การลา เพื่อแผนการใช้กำลังคน" },
    localSchema: [
      "employee.emp_code",
      "employee.full_name",
      "employee.department",
      "leave.type",
      "leave.date",
    ],
  },
  CMMS: {
    id: "CMMS",
    name: "Maintenance",
    icon: Wrench,
    color: "text-yellow-300",
    fields: [
      {
        key: "apiUrl",
        label: "API URL",
        placeholder: "http://localhost:4000/api/maintenance",
      },
      { key: "apiKey", label: "API Key" },
      // { key: "siteId", label: "Site ID" },
    ],
    docs: {
      overview: ""
        // "Maintenance Machines Management",
    },
    localSchema: [
      "id",
      "machine_code",
      "type",
      "schedule_date",
      "status",
      "priority",
    ],
  },
};

// CMMS: single endpoint = apiUrl (direct)
const RESOURCES: Record<ProviderType, Record<string, ResourceSpec>> = {
  ERP: {
    orders: {
      name: "Orders",
      method: "GET",
      path: "/erp/orders",
      defaultDir: "in",
      localSchema: [
        "order.id",
        "order.product_code",
        "order.qty",
        "order.due_date",
        "order.customer",
      ],
      exampleRequest: { method: "GET", url: "$BASE/webhook/erp/orders?limit=5" },
      exampleResponse: [
        { id: "SO-1001", product_code: "WDGT-A", qty: 200, due_date: "2025-10-12" },
      ],
    },
    boms: {
      name: "BOMs",
      method: "GET",
      path: "/erp/boms",
      defaultDir: "in",
      localSchema: [
        "bom.product_code",
        "bom.component_code",
        "bom.qty_per",
        "bom.unit",
        "bom.scrap_rate",
      ],
      exampleRequest: { method: "GET", url: "$BASE/webhook/erp/boms?product=WDGT-A" },
      exampleResponse: [
        { product_code: "WDGT-A", component_code: "MAT-001", qty_per: 1, unit: "kg" },
      ],
    },
    routings: {
      name: "Routings",
      method: "GET",
      path: "/erp/routings",
      defaultDir: "in",
      localSchema: [
        "routing.product_code",
        "routing.step.seq",
        "routing.process",
        "routing.work_center_code",
      ],
      exampleRequest: { method: "GET", url: "$BASE/webhook/erp/routings?product=WDGT-A" },
      exampleResponse: [
        {
          product_code: "WDGT-A",
          step: { seq: 10, process: "MACH", work_center_code: "WC-MACH" },
        },
      ],
    },
  },
  WMS: {
    available: {
      name: "Available",
      method: "GET",
      path: "/wms/available",
      defaultDir: "in",
      localSchema: [
        "material.item_code",
        "material.qty_available",
        "material.uom",
        "material.location",
      ],
      exampleRequest: { method: "GET", url: "$BASE/webhook/wms/available?item=MAT-001" },
      exampleResponse: [{ item_code: "MAT-001", qty_available: 1530, uom: "kg" }],
    },
  },
  MES: {
    dispatch: {
      name: "Dispatch (send plan)",
      method: "POST",
      path: "/mes/dispatch",
      defaultDir: "out",
      localSchema: [
        "job.id",
        "job.operation",
        "job.machine_code",
        "job.start",
        "job.end",
        "job.qty_plan",
      ],
      exampleRequest: {
        method: "POST",
        url: "$BASE/webhook/mes/dispatch",
        body: { jobs: [{ job_id: "J-001", machine_code: "M001" }] },
      },
      exampleResponse: { accepted: true, scheduled: 1 },
    },
  },
  HR: {
    employees: {
      name: "Personnel",
      method: "GET",
      path: "/hr/employees",
      defaultDir: "in",
      localSchema: [
        "employee.emp_code",
        "employee.full_name",
        "employee.department",
        "employee.status",
      ],
      exampleRequest: { method: "GET", url: "$BASE/webhook/hr/employees?limit=10" },
      exampleResponse: [
        {
          emp_code: "EMP001",
          full_name: "John Smith",
          department: "Manufacturing",
          status: "Active",
        },
      ],
    },
    leaves: {
      name: "Shifts & Calendars",
      method: "GET",
      path: "/hr/shift-calendars",
      defaultDir: "in",
      localSchema: ["leave.emp_code", "leave.type", "leave.date", "leave.duration"],
      exampleRequest: {
        method: "GET",
        url: "$BASE/webhook/hr/leaves?from=2025-10-01&to=2025-10-31",
      },
      exampleResponse: [
        { emp_code: "EMP001", type: "Vacation", date: "2025-10-12", duration: 1 },
      ],
    },
  },
  CMMS: {
    maintenance: {
      name: "Maintenance (single endpoint)",
      method: "GET",
      path: "(direct)",
      defaultDir: "in",
      localSchema: [
        "id",
        "machine_code",
        "type",
        "schedule_date",
        "status",
        "priority",
        "asset_name",
      ],
      exampleRequest: { method: "GET", url: "$BASE" }, // will be replaced by apiUrl
      exampleResponse: [
        {
          id: "WO-1001",
          machine_code: "M001",
          type: "PM",
          schedule_date: "2025-10-10",
          status: "open",
          priority: "High",
          title: "Monthly PM",
          asset_name: "CNC-1",
        },
        {
          id: "WO-1002",
          machine_code: "M002",
          type: "CM",
          schedule_date: "2025-10-12",
          status: "open",
          priority: "Critical",
          title: "Repair spindle",
          asset_name: "CNC-2",
        },
      ],
    },
  },
};

/* ======================== Helpers ======================== */

const toneByHealth = (h?: IntegrationItem["health"]) =>
  h === "Healthy"
    ? "text-emerald-300"
    : h === "Warning"
      ? "text-amber-300"
      : h === "Error"
        ? "text-rose-300"
        : "text-sky-300";

const HealthIcon = ({ h }: { h?: IntegrationItem["health"] }) =>
  h === "Healthy" ? (
    <CheckCircle2 size={16} className="inline align-[-2px] text-emerald-300" />
  ) : h === "Warning" ? (
    <AlertTriangle size={16} className="inline align-[-2px] text-amber-300" />
  ) : h === "Error" ? (
    <XCircle size={16} className="inline align-[-2px] text-rose-300" />
  ) : (
    <AlertTriangle size={16} className="inline align-[-2px] text-sky-300" />
  );

function flatten(obj: unknown, prefix = ""): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const walk = (o: unknown, p: string) => {
    if (o && typeof o === "object") {
      if (Array.isArray(o)) {
        o.slice(0, 5).forEach((v) => walk(v, p));
      } else {
        for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
          const np = p ? `${p}.${k}` : k;
          if (v && typeof v === "object") walk(v, np);
          else out[np] = v;
        }
      }
    }
  };
  walk(obj, prefix);
  return out;
}

const getResourcesFor = (type: ProviderType) => RESOURCES[type] ?? {};

const buildUrl = (u: string, base: string) => {
  if (!u) return "";
  if (u.startsWith("$BASE")) return u.replace("$BASE", base.replace(/\/+$/, ""));
  if (u.startsWith("/")) return base.replace(/\/+$/, "") + u;
  return u;
};

const getAuthHeadersFromConfig = (cfg: IntegrationConfig) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cfg.apiKey) headers["Authorization"] = `Bearer ${String(cfg.apiKey)}`;
  if ((cfg as any).apiToken) headers["Authorization"] = `Bearer ${String((cfg as any).apiToken)}`;
  if (cfg.username && cfg.password) {
    const token =
      typeof window !== "undefined" ? btoa(`${cfg.username}:${cfg.password}`) : "";
    headers["Authorization"] = `Basic ${token}`;
  }
  return headers;
};

const getByPath = (obj: unknown, path: string): unknown => {
  try {
    return String(path)
      .split(".")
      .reduce((acc: any, key) => (acc == null ? acc : acc[key]), obj as any);
  } catch {
    return undefined;
  }
};

/* ======================== CMMS Live Preview (Prototype) ======================== */

type WO = {
  id: string;
  machine_code?: string;
  asset_code?: string;
  asset_name?: string;
  type?: string; // PM / CM / Cal / Insp
  title?: string;
  schedule_date?: string;
  status?: string; // open / in_progress / done / hold
  priority?: string; // Critical/High/Medium/Low
};

function badgeTone(status?: string) {
  switch ((status || "").toLowerCase()) {
    case "critical":
      return "bg-rose-500/15 text-rose-300 border-rose-400/30";
    case "high":
      return "bg-amber-500/15 text-amber-300 border-amber-400/30";
    case "medium":
      return "bg-sky-500/15 text-sky-300 border-sky-400/30";
    case "low":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
    case "open":
      return "bg-cyan-500/15 text-cyan-300 border-cyan-400/30";
    case "in_progress":
      return "bg-indigo-500/15 text-indigo-300 border-indigo-400/30";
    case "done":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
    case "hold":
      return "bg-zinc-500/15 text-zinc-200 border-zinc-400/30";
    default:
      return "bg-white/5 text-white/70 border-white/15";
  }
}

function toArray(data: any): WO[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as WO[];
  if (Array.isArray((data as any).items)) return (data as any).items as WO[];
  if (Array.isArray((data as any).data)) return (data as any).data as WO[];
  return [];
}

function daysFromToday(dateStr?: string) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  const today = new Date();
  const diff = d.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function MaintenancePreview({
  raw,
  onRefresh,
}: {
  raw: unknown;
  onRefresh: () => void;
}) {
  const baseRows = useMemo(() => toArray(raw), [raw]);
  const [rows, setRows] = useState<WO[]>([]);
  useEffect(() => {
    setRows(baseRows);
  }, [baseRows]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<string>("all");

  const updateStatus = (id: string, next: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const s = status === "all" || (r.status || "").toLowerCase() === status;
      const t = type === "all" || (r.type || "").toLowerCase() === type;
      const qq =
        !q ||
        [r.id, r.machine_code, r.asset_code, r.asset_name, r.title].some((v) =>
          (v || "").toLowerCase().includes(q.toLowerCase())
        );
      return s && t && qq;
    });
  }, [rows, q, status, type]);

  const kpi = useMemo(() => {
    const total = rows.length;
    const open = rows.filter((r) => (r.status || "open").toLowerCase() !== "done").length;
    const pm = rows.filter((r) => (r.type || "").toLowerCase() === "pm").length;
    const cm = rows.filter((r) => (r.type || "").toLowerCase() === "cm").length;
    const overdue = rows.filter(
      (r) =>
        daysFromToday(r.schedule_date) < 0 &&
        (r.status || "open").toLowerCase() !== "done"
    ).length;
    return { total, open, pm, cm, overdue };
  }, [rows]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="text-yellow-300" size={18} />
          <h3 className="font-semibold">CMMS – Live Work Orders</h3>
        </div>
        <button
          onClick={onRefresh}
          className="px-2 py-1 rounded bg-white/10 border border-white/15 hover:bg-white/20 text-sm flex items-center gap-1"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
          <div className="text-xs text-white/60">Total</div>
          <div className="text-2xl font-bold">{kpi.total}</div>
        </div>
        <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-3">
          <div className="text-xs text-cyan-200/80">Open</div>
          <div className="text-2xl font-bold text-cyan-300">{kpi.open}</div>
        </div>
        <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3">
          <div className="text-xs text-emerald-200/80">PM</div>
          <div className="text-2xl font-bold text-emerald-300">{kpi.pm}</div>
        </div>
        <div className="rounded-lg border border-indigo-400/30 bg-indigo-500/10 p-3">
          <div className="text-xs text-indigo-200/80">CM</div>
          <div className="text-2xl font-bold text-indigo-300">{kpi.cm}</div>
        </div>
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-3">
          <div className="text-xs text-rose-200/80">Overdue</div>
          <div className="text-2xl font-bold text-rose-300">{kpi.overdue}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 pb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white/50"
            size={16}
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search WO, machine, title..."
            className="w-full pl-8 pr-3 py-2 rounded border border-white/15 bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-white/60" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-2 py-2 rounded bg-white/10 border border-white/15"
          >
            {["all", "open", "in_progress", "done", "hold"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-2 py-2 rounded bg-white/10 border border-white/15"
          >
            {["all", "pm", "cm", "calibration", "inspection"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="min-w-[820px] w-full text-sm border-t border-white/10">
          <thead>
            <tr className="text-left bg-white/5 border-b border-white/10">
              <th className="py-2 px-3">WO</th>
              <th className="py-2 px-3">Asset / Machine</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Schedule</th>
              <th className="py-2 px-3">Priority</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const d = daysFromToday(r.schedule_date);
              const when = d === 0 ? "Today" : d < 0 ? `${Math.abs(d)}d overdue` : `in ${d}d`;
              return (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="py-2 px-3 font-mono">{r.id}</td>
                  <td className="py-2 px-3">
                    <div className="text-white/90">
                      {r.asset_name || r.asset_code || r.machine_code}
                    </div>
                    <div className="text-xs text-white/60">{r.machine_code}</div>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded border ${badgeTone(
                        (r.type || "").toLowerCase()
                      )}`}
                    >
                      {(r.type || "").toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="text-white/90">{r.schedule_date || "-"}</div>
                    <div className="text-xs text-white/60">{when}</div>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded border ${badgeTone(r.priority)}`}>
                      {r.priority || "-"}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded border ${badgeTone(r.status)}`}>
                      {(r.status || "open").replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => updateStatus(r.id, "in_progress")}
                        className="px-2 py-1 rounded bg-cyan-600/20 border border-cyan-400/30 hover:bg-cyan-600/30 text-xs"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, "in_progress")}
                        className="px-2 py-1 rounded bg-indigo-600/20 border border-indigo-400/30 hover:bg-indigo-600/30 text-xs"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, "done")}
                        className="px-2 py-1 rounded bg-emerald-600/20 border border-emerald-400/30 hover:bg-emerald-600/30 text-xs disabled:opacity-50"
                        disabled={(r.status || "") === "done"}
                      >
                        Complete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-white/60 text-sm">
                  No work orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======================== Main ======================== */
const INITIAL: IntegrationItem[] = [
  { id: "INT-ERP", name: "ERP", type: "ERP", status: "Active", health: "Error", createdDate: "2024-01-15", config: { apiUrl: "https://your-n8n", username: "api_user", password: "***", companyId: "COMP001", apiKey: "" }, stats: { totalCalls: 8200, successRate: 98.5, avgResponseTime: 320 } },
  { id: "INT-WMS", name: "WMS", type: "WMS", status: "Active", health: "Error", createdDate: "2024-02-01", config: { apiUrl: "https://your-n8n", apiKey: "", warehouseId: "WH-01" }, stats: { totalCalls: 5200, successRate: 99.0, avgResponseTime: 180 } },
  { id: "INT-MES", name: "MES", type: "MES", status: "Active", health: "Error", createdDate: "2024-03-10", config: { apiUrl: "https://your-n8n", apiToken: "", plantCode: "PL-01" }, stats: { totalCalls: 12300, successRate: 99.2, avgResponseTime: 140 } },
  { id: "INT-HR", name: "HR", type: "HR", status: "Active", health: "Warning", createdDate: "2024-04-20", config: { apiUrl: "https://your-n8n", apiKey: "", tenantId: "TEN-01" }, stats: { totalCalls: 2100, successRate: 99.1, avgResponseTime: 200 } },
  { id: "INT-CMMS", name: "CMMS", type: "CMMS", status: "Active", health: "Healthy", createdDate: "2024-05-15", config: { apiUrl: "http://localhost:4000/api/maintenance", apiKey: "mock-api-key-123456", siteId: "SITE-A" }, stats: { totalCalls: 1100, successRate: 97.9, avgResponseTime: 260 } },
];

export default function IntegrationsLocked() {
  const [list, setList] = useState<IntegrationItem[]>(INITIAL);
  const [activeId, setActiveId] = useState<string>(INITIAL[0].id);
  const active = useMemo(() => list.find((i) => i.id === activeId)!, [list, activeId]);

  const [editing, setEditing] = useState<boolean>(false);
  // CMMS is single endpoint
  const [resourceKey, setResourceKey] = useState<string>("maintenance");

  // Connection state (auto-test)
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "failed">("idle");
  const [testMsg, setTestMsg] = useState<string | null>(null);

  // Preview cache/state
  const [previewMap, setPreviewMap] = useState<Record<string, unknown>>({});
  const [preview, setPreview] = useState<unknown>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  // Show cached preview on switch
  useEffect(() => {
    const cacheKey = `${active.id}:${resourceKey}`;
    setPreview(previewMap[cacheKey] ?? null);
  }, [active.id, resourceKey, previewMap]);

  // Flattened external keys
  const flat = useMemo(() => flatten(preview || {}), [preview]);
  const externalOptions = useMemo(() => Object.keys(flat).sort(), [flat]);

  // Mapping rows
  const currentRes = useMemo(
    () => getResourcesFor(active.type)[resourceKey],
    [active.type, resourceKey]
  );
  const defaultDir: "in" | "out" | "bi" = currentRes?.defaultDir ?? "in";
  const [mapping, setMapping] = useState<MappingRow[]>([]);
  useEffect(() => {
    const local = currentRes?.localSchema ?? PROVIDER_TYPES[active.type].localSchema;
    setMapping(local.map((l) => ({ id: l, local: l, external: "", dir: defaultDir })));
  }, [active.type, resourceKey, currentRes?.localSchema, defaultDir]);

  // Threshold for fuzzy auto-match
  const [matchThreshold, setMatchThreshold] = useState<number>(0.5);

  const saveConfigPatch = (patch: Partial<IntegrationConfig>) => {
    setList((prev) => prev.map((i) => (i.id === active.id ? { ...i, config: { ...i.config, ...patch } } : i)));
  };

  const isSecretField = (k: string) => /key|token|password/i.test(k);

  /* ---- Test connection ---- */
  const testConnection = useCallback(async () => {
    const base = String(active.config?.apiUrl || "").trim();
    if (!base) {
      setTestMsg("กรุณากรอก API URL ก่อน");
      setTestStatus("failed");
      return false;
    }
    setTesting(true);
    setTestMsg(null);
    setTestStatus("idle");
    try {
      const headers = getAuthHeadersFromConfig(active.config || {});
      const resp = await fetch(base, { method: "GET", headers });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      setTestStatus("success");
      setTestMsg("✅ Connected");
      return true;
    } catch (err: any) {
      setTestStatus("failed");
      setTestMsg(`❌ Failed: ${err?.message || "Cannot connect"}`);
      return false;
    } finally {
      setTesting(false);
    }
  }, [active.config]);

  /* ---- Fetch preview ---- */
  const doFetchPreview = useCallback(async () => {
    const resSpec = getResourcesFor(active.type)[resourceKey];
    if (!resSpec) return;
    const base = String(active.config?.apiUrl || "").trim();
    if (!base) {
      setFetchErr("กรุณากรอก API URL ก่อน");
      return;
    }
    const req = resSpec.exampleRequest; // { method, url: "$BASE" }
    const url = buildUrl(req.url, base); // exact base for CMMS
    const headers = getAuthHeadersFromConfig(active.config || {});
    setFetching(true);
    setFetchErr(null);
    try {
      const r = await fetch(url, {
        method: req.method || resSpec.method,
        headers,
        body:
          (req.method || resSpec.method) === "POST"
            ? JSON.stringify(req.body ?? {})
            : undefined,
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const cacheKey = `${active.id}:${resourceKey}`;
      setPreviewMap((m) => ({ ...m, [cacheKey]: data }));
      setPreview(data);
    } catch (e: any) {
      setFetchErr(e?.message || "Fetch failed");
    } finally {
      setFetching(false);
    }
  }, [active.id, active.type, active.config, resourceKey]);

  /* ---- Auto test on load & on API URL change; then auto fetch ---- */
  useEffect(() => {
    (async () => {
      const ok = await testConnection();
      if (ok) void doFetchPreview();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.config?.apiUrl]);

  /* ---- Fuzzy auto-map (non-overwrite) ---- */
  const runAutoMap = useCallback(() => {
    // ใช้ preview ถ้ามี ไม่งั้น fallback ไปที่ exampleResponse
    const resSpec = getResourcesFor(active.type)[resourceKey];
    const candidateSource = preview ?? resSpec?.exampleResponse ?? {};
    const flatPreview = flatten(candidateSource);
    const candidates = externalOptions.length
      ? externalOptions
      : Object.keys(flatPreview).sort();

    if (!resSpec || candidates.length === 0) {
      // ไม่มีอะไรให้เทียบ -> จบเงียบ ๆ
      return;
    }

    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const levenshtein = (a: string, b: string) => {
      const m = a.length, n = b.length;
      const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
      for (let i = 0; i <= m; i++) dp[i][0] = i;
      for (let j = 0; j <= n; j++) dp[0][j] = j;
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        }
      }
      return dp[m][n];
    };
    const sim = (a: string, b: string) => {
      if (!a || !b) return 0;
      if (a === b) return 1;
      const na = norm(a), nb = norm(b);
      const maxLen = Math.max(na.length, nb.length) || 1;
      const lev = levenshtein(na, nb);
      const levScore = 1 - lev / maxLen;
      const ta = new Set(na.split(" ").filter(Boolean));
      const tb = new Set(nb.split(" ").filter(Boolean));
      const inter = [...ta].filter(x => tb.has(x)).length;
      const union = new Set([...ta, ...tb]).size || 1;
      const jac = inter / union;
      const lastA = a.split(".").pop() || a;
      const lastB = b.split(".").pop() || b;
      const lastBoost = lastA.toLowerCase() === lastB.toLowerCase() ? 0.15 : 0;
      return Math.max(0, Math.min(1, 0.7 * levScore + 0.3 * jac + lastBoost));
    };
    const pick = (local: string): { ext: string; score: number } => {
      let best = { ext: "", score: 0 };
      for (const e of candidates) {
        const s = Math.max(
          sim(local, e),
          sim(local.split(".").pop() || local, e.split(".").pop() || e)
        );
        if (s > best.score) best = { ext: e, score: s };
      }
      return best;
    };

    setMapping(prev =>
      prev.map(m => {
        const match = pick(m.local);
        const conf = Math.round(match.score * 100) / 100;
        // ไม่ทับค่าที่ผู้ใช้กรอกเอง
        if (!m.external && conf >= matchThreshold) {
          return { ...m, external: match.ext, confidence: conf };
        }
        return { ...m, confidence: conf };
      })
    );
  }, [active.type, resourceKey, preview, externalOptions, matchThreshold, setMapping]);

  // Auto-run when preview ready
  useEffect(() => {
    if (preview) runAutoMap();
  }, [preview, runAutoMap]);

  return (
    <div className="mx-auto max-w-7xl p-6 text-white">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-white/70">ERP • WMS • MES • HR • CMMS</p>
        </div>

        <button
          onClick={() => setEditing((prev) => !prev)}
          className={[
            "btn flex items-center gap-2 transition focus:outline-none",
            "focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
            editing
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "btn-outline border-emerald-600 text-emerald-500 hover:bg-emerald-50/10",
          ].join(" ")}
          title={editing ? "Exit Edit Mode" : "Edit Item"}
          aria-pressed={editing}
        >
          {editing ? <Check size={18} /> : <Pencil size={18} />}
          <span className="whitespace-nowrap">{editing ? "Done" : "Edit"}</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="lg:col-span-1 rounded-xl border border-white/10 bg-white/5">
          {list.map((item) => {
            const T = PROVIDER_TYPES[item.type];
            const Icon = T.icon;
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-white/10 hover:bg-white/5 ${isActive ? "bg-white/10" : ""
                  }`}
              >
                <div className="w-10 h-10 rounded-lg border border-white/10 grid place-items-center">
                  <Icon size={20} className={T.color} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-white/60">{T.name}</div>
                </div>
                {item.health !== 'Error' && (
                  <div className={`text-xs ${toneByHealth(item.health)}`}>
                    <HealthIcon h={item.health} /> {item.health || "Unknown"}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Card */}
          <div className="rounded-xl border border-white/10 p-4 bg-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">{active.name}</div>
              <div className="flex items-center gap-3">
                {testStatus === "success" ? (
                  <span className="inline-flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle2 size={16} /> Connected
                  </span>
                ) : (
                  <button
                    onClick={testConnection}
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={testing}
                  >
                    {testing ? "Testing..." : "Test Connection"}
                  </button>
                )}
                {testStatus === "failed" && (
                  <span className="text-sm font-medium text-rose-400">{testMsg}</span>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {PROVIDER_TYPES[active.type].fields.map((f) => {
                const value = (active.config?.[f.key] as Primitive) ?? f.default ?? "";
                const typeAttr = isSecretField(f.key) ? "password" : "text";
                const labelCls = `block mb-1 text-xs ${isSecretField(f.key) ? "font-semibold text-white/80" : "text-white/70"
                  }`;
                return (
                  <div key={f.key}>
                    <label className={labelCls}>{f.label}</label>
                    <input
                      type={typeAttr}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder={f.placeholder}
                      defaultValue={value as string}
                      disabled={!editing}
                      onBlur={(e) => editing && saveConfigPatch({ [f.key]: e.target.value })}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mapping Card */}
          <div className="rounded-xl border border-white/10 p-4 bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-wrap items-center gap-3">
                <Wand2 size={18} className="text-fuchsia-300" />
                <h3 className="font-semibold">Field Mapping</h3>

                {/* Endpoint (locked) */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/70">Endpoint</span>
                  <select
                    value={resourceKey}
                    onChange={(e) => setResourceKey(e.target.value)}
                    className="px-4 pr-10 py-1 rounded bg-white/10 border border-white/15 text-sm"
                    disabled
                  >
                    <option value="maintenance">GET (direct) — Maintenance</option>
                  </select>
                  {/* <span className="text-xs text-white/50">
                    Dir: {currentRes?.defaultDir || "in"}
                  </span> */}
                </div>

                {/* Matching Controls */}
                {/* <div className="flex items-center gap-2">
                  <span className="text-xs text-white/70">Threshold</span>
                  <input
                    type="range"
                    min={0.3}
                    max={0.95}
                    step={0.05}
                    value={matchThreshold}
                    onChange={(e) => setMatchThreshold(parseFloat(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-xs text-white/70 w-8 text-right">
                    {matchThreshold.toFixed(2)}
                  </span>
                </div> */}
              </div>

              <div className="flex items-center gap-2">
                {fetchErr && <span className="text-xs text-rose-300">{fetchErr}</span>}
                <button
                  onClick={runAutoMap}
                  className="px-2 py-1 rounded bg-fuchsia-600/20 border border-fuchsia-400/30 text-sm hover:bg-fuchsia-600/30"
                >
                  Auto-match
                </button>
                {/* <button
                  onClick={doFetchPreview}
                  className="px-2 py-1 rounded bg-white/10 border border-white/15 text-sm hover:bg-white/20 disabled:opacity-60"
                  disabled={fetching}
                  title="ดึงตัวอย่าง response จาก API URL ที่ตั้งไว้"
                >
                  {fetching ? "Fetching..." : "Fetch Preview"}
                </button> */}
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm border-collapse min-w-[720px]">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="py-2 pr-3">Local Field</th>
                    <th className="py-2 pr-3">External Field</th>
                    {/* <th className="py-2 pr-3">Direction</th> */}
                    {/* <th className="py-2 pr-3">Confidence</th>
                    <th className="py-2 pr-3">Sample</th> */}
                    {/* <th className="py-2 pr-3"></th> */}
                  </tr>
                </thead>
                <tbody>
                  {mapping.map((row) => {
                    const low = (row.confidence ?? 0) < matchThreshold || !row.external;
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-white/5 ${low ? "bg-rose-500/5" : ""}`}
                      >
                        <td className="py-2 pr-3 font-mono">{row.local}</td>
                        <td className="py-2 pr-3">
                          <select
                            className={`w-full px-2 py-1 rounded border ${low
                              ? "border-rose-400/50 bg-rose-500/10"
                              // ? "border-white/15 bg-white/10"
                              : "border-white/15 bg-white/10"
                              }`}
                            value={row.external}
                            onChange={(e) =>
                              setMapping((prev) =>
                                prev.map((m) =>
                                  m.id === row.id ? { ...m, external: e.target.value } : m
                                )
                              )
                            }
                          >
                            <option value="">— Select from preview —</option>
                            {externalOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </td>
                        {/* <td className="py-2 pr-3"> */}
                        {/* <td className="py-2">
                          <select
                            className="px-6 py-1 rounded bg-white/10 border border-white/15"
                            value={row.dir}
                            onChange={(e) =>
                              setMapping((prev) =>
                                prev.map((m) =>
                                  m.id === row.id
                                    ? { ...m, dir: e.target.value as "in" | "out" | "bi" }
                                    : m
                                )
                              )
                            }
                          >
                            <option value="in">in</option>
                            <option value="out">out</option>
                            <option value="bi">bi</option>
                          </select>
                        </td> */}
                        {/* <td className={`py-2 pr-3 ${low ? "text-rose-300 font-medium" : ""}`}>
                          {row.confidence?.toFixed(2) ?? "-"}
                        </td> 
                        <td className="py-2 pr-3 text-xs text-white/70">
                          {row.external
                            ? (() => {
                                const v = getByPath(preview ?? {}, row.external);
                                return v === undefined ? "—" : JSON.stringify(v);
                              })()
                            : "—"}
                        </td>*/}
                        {/* <td className="py-2 pr-3 text-right">
                          <button
                            onClick={() =>
                              setMapping((prev) => prev.filter((m) => m.id !== row.id))
                            }
                            className="p-1 rounded hover:bg-white/10"
                            title="Remove row"
                          >
                            <Trash2 size={16} className="text-rose-300" />
                          </button>
                        </td> */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Maintenance Prototype */}
          {/* {active.type === "CMMS" && resourceKey === "maintenance" && (
            <MaintenancePreview
              raw={preview || getResourcesFor("CMMS").maintenance.exampleResponse}
              onRefresh={doFetchPreview}
            />
          )} */}

          {/* Docs */}
          <DocsPanel
            type={active.type}
            resourceKey={resourceKey}
            baseUrl={String(active.config?.apiUrl || "http://localhost:4000/api/maintenance")}
            preview={preview}
            onSelectResource={setResourceKey}
            disabled={!editing}
          />
        </div>
      </div>
    </div>
  );
}

/* ======================== Docs Panel ======================== */

function DocsPanel({
  type,
  resourceKey,
  baseUrl,
  preview,
  onSelectResource,
  disabled,
}: {
  type: ProviderType;
  resourceKey: string;
  baseUrl: string;
  preview: unknown;
  onSelectResource: (key: string) => void;
  disabled: boolean;
}) {
  const provider = PROVIDER_TYPES[type];
  const resSpec = getResourcesFor(type)[resourceKey];
  const response: unknown =
    preview && resSpec?.method === "GET" ? preview : resSpec?.exampleResponse ?? {};

  return (
    <div className="rounded-xl border border-white/10 p-4 bg-white/5">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="text-sky-300" size={18} />
        <h3 className="font-semibold">Docs – {provider.name}</h3>
      </div>
      <p className="text-white/80 text-sm mb-3">{provider.docs.overview}</p>
      <div className="text-sm mb-2 font-medium">Response (sample)</div>
      <pre className="max-h-60 overflow-auto bg-black/40 border border-white/10 rounded p-2 text-xs whitespace-pre">
        {JSON.stringify(response ?? {}, null, 2)}
      </pre>
      <div className="text-sm mt-4 mb-2 font-medium">Review Result:</div>
      <pre className="max-h-60 overflow-auto bg-black/40 border border-white/10 rounded p-2 text-xs whitespace-pre">
        {JSON.stringify(preview ?? {}, null, 2)}
      </pre>
    </div>
  );
}
