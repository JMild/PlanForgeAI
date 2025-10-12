"use client";

import React, { useMemo, useState, useEffect } from "react";
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
  Edit3,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ======================== Types ======================== */

type IntegrationStatus = "Active" | "Inactive" | "Testing" | "Error";
interface IntegrationStats { totalCalls: number; successRate: number; avgResponseTime: number; }
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

interface MappingRow { id: string; local: string; external: string; dir: "in"|"out"|"bi"; confidence?: number }

/* ======================== Provider + Resource Spec ======================== */

const PROVIDER_TYPES: Record<ProviderType, ProviderSpec> = {
  ERP: {
    id: "ERP",
    name: "Enterprise Resource Planning (ERP)",
    icon: Database,
    color: "text-emerald-300",
    fields: [
      { key: "apiUrl", label: "API URL", placeholder: "https://erp.company.com" },
      { key: "username", label: "Username" },
      { key: "password", label: "Password" },
      { key: "companyId", label: "Company ID" },
      { key: "apiKey", label: "API Key" },
    ],
    docs: { overview: "ดึง Orders/BOM/Routings/Inventory ใช้แบบ read-only สำหรับการวางแผน" },
    localSchema: ["product.sku","order.id","order.due_date","inventory.on_hand"],
  },
  WMS: {
    id: "WMS",
    name: "Warehouse Management System (WMS)",
    icon: Package,
    color: "text-orange-300",
    fields: [
      { key: "apiUrl", label: "API URL", placeholder: "https://wms.company.com" },
      { key: "apiKey", label: "API Key" },
      { key: "warehouseId", label: "Warehouse ID" },
    ],
    docs: { overview: "เช็ควัตถุดิบคงเหลือ และจองเบิกวัตถุดิบ" },
    localSchema: ["material.item_code","material.qty_available","reservation.request_id"],
  },
  MES: {
    id: "MES",
    name: "Manufacturing Execution System (MES)",
    icon: Cog,
    color: "text-purple-300",
    fields: [
      { key: "apiUrl", label: "API URL", placeholder: "https://mes.company.com" },
      { key: "apiToken", label: "API Token" },
      { key: "plantCode", label: "Plant Code" },
    ],
    docs: { overview: "ส่ง dispatch plan และรับการยืนยันผลผลิต/actuals จากหน้างาน" },
    localSchema: ["job.id","job.operation","job.machine_code","job.qty_plan","job.qty_actual"],
  },
  HR: {
    id: "HR",
    name: "Human Resources (HR)",
    icon: BriefcaseBusiness,
    color: "text-sky-300",
    fields: [
      { key: "apiUrl", label: "API URL", placeholder: "https://hr.company.com" },
      { key: "apiKey", label: "API Key" },
      { key: "tenantId", label: "Tenant ID" },
    ],
    docs: { overview: "ซิงก์พนักงาน กะการทำงาน การลา เพื่อแผนการใช้กำลังคน" },
    localSchema: ["employee.emp_code","employee.full_name","employee.department","leave.type","leave.date"],
  },
  CMMS: {
    id: "CMMS",
    name: "Maintenance (CMMS)",
    icon: Wrench,
    color: "text-yellow-300",
    fields: [
      { key: "apiUrl", label: "API URL", placeholder: "https://cmms.company.com" },
      { key: "apiKey", label: "API Key" },
      { key: "siteId", label: "Site ID" },
    ],
    docs: { overview: "ดึงรายการทรัพย์สิน แผน PM และ Work Order สำหรับประสานงานกับการผลิต" },
    localSchema: ["asset.asset_code","asset.status","wo.id","wo.schedule_date","wo.machine_code"],
  },
};

const RESOURCES: Record<ProviderType, Record<string, ResourceSpec>> = {
  ERP: {
    orders: { name:"Orders", method:"GET", path:"/erp/orders", defaultDir:"in",
      localSchema:["order.id","order.product_code","order.qty","order.due_date","order.customer"],
      exampleRequest:{ method:"GET", url:"$BASE/webhook/erp/orders?limit=5" },
      exampleResponse:[{ id:"SO-1001", product_code:"WDGT-A", qty:200, due_date:"2025-10-12" }]
    },
    boms: { name:"BOMs", method:"GET", path:"/erp/boms", defaultDir:"in",
      localSchema:["bom.product_code","bom.component_code","bom.qty_per","bom.unit","bom.scrap_rate"],
      exampleRequest:{ method:"GET", url:"$BASE/webhook/erp/boms?product=WDGT-A" },
      exampleResponse:[{ product_code:"WDGT-A", component_code:"MAT-001", qty_per:1, unit:"kg" }]
    },
    routings: { name:"Routings", method:"GET", path:"/erp/routings", defaultDir:"in",
      localSchema:["routing.product_code","routing.step.seq","routing.process","routing.work_center_code"],
      exampleRequest:{ method:"GET", url:"$BASE/webhook/erp/routings?product=WDGT-A" },
      exampleResponse:[{ product_code:"WDGT-A", step:{ seq:10, process:"MACH", work_center_code:"WC-MACH" } }]
    }
  },
  WMS: {
    available: { name:"Available", method:"GET", path:"/wms/available", defaultDir:"in",
      localSchema:["material.item_code","material.qty_available","material.uom","material.location"],
      exampleRequest:{ method:"GET", url:"$BASE/webhook/wms/available?item=MAT-001" },
      exampleResponse:[{ item_code:"MAT-001", qty_available:1530, uom:"kg" }]
    }
  },
  MES: {
    dispatch: { name:"Dispatch (send plan)", method:"POST", path:"/mes/dispatch", defaultDir:"out",
      localSchema:["job.id","job.operation","job.machine_code","job.start","job.end","job.qty_plan"],
      exampleRequest:{ method:"POST", url:"$BASE/webhook/mes/dispatch", body:{ jobs:[{ job_id:"J-001", machine_code:"M001" }] } },
      exampleResponse:{ accepted:true, scheduled:1 }
    }
  },
  HR: {
    employees: { name:"Employees", method:"GET", path:"/hr/employees", defaultDir:"in",
      localSchema:["employee.emp_code","employee.full_name","employee.department","employee.status"],
      exampleRequest:{ method:"GET", url:"$BASE/webhook/hr/employees?limit=10" },
      exampleResponse:[{ emp_code:"EMP001", full_name:"John Smith", department:"Manufacturing", status:"Active" }]
    },
    leaves: { name:"Leave Records", method:"GET", path:"/hr/leaves", defaultDir:"in",
      localSchema:["leave.emp_code","leave.type","leave.date","leave.duration"],
      exampleRequest:{ method:"GET", url:"$BASE/webhook/hr/leaves?from=2025-10-01&to=2025-10-31" },
      exampleResponse:[{ emp_code:"EMP001", type:"Vacation", date:"2025-10-12", duration:1 }]
    }
  },
  CMMS: {
    assets: { name:"Assets", method:"GET", path:"/cmms/assets", defaultDir:"in",
      localSchema:["asset.asset_code","asset.name","asset.status","asset.location"],
      exampleRequest:{ method:"GET", url:"$BASE/webhook/cmms/assets" },
      exampleResponse:[{ asset_code:"M001", name:"CNC-1", status:"RUN", location:"Line A" }]
    },
    workorders: { name:"Work Orders", method:"GET", path:"/cmms/workorders", defaultDir:"in",
      localSchema:["wo.id","wo.machine_code","wo.type","wo.schedule_date","wo.status"],
      exampleRequest:{ method:"GET", url:"$BASE/webhook/cmms/workorders?status=open" },
      exampleResponse:[{ id:"WO-1001", machine_code:"M001", type:"PM", schedule_date:"2025-10-10", status:"open" }]
    }
  }
};

/* ======================== Helpers ======================== */

const toneByHealth = (h?:IntegrationItem["health"])=> h==="Healthy"?"text-emerald-300": h==="Warning"?"text-amber-300": h==="Error"?"text-rose-300":"text-sky-300";
const HealthIcon = ({h}:{h?:IntegrationItem["health"]})=> h==="Healthy"? <CheckCircle2 size={16} className="inline align-[-2px] text-emerald-300"/> : h==="Warning"? <AlertTriangle size={16} className="inline align-[-2px] text-amber-300"/> : h==="Error"? <XCircle size={16} className="inline align-[-2px] text-rose-300"/> : <AlertTriangle size={16} className="inline align-[-2px] text-sky-300"/>;

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

// === New helper: build URL from $BASE and config base ===
const buildUrl = (u: string, base: string) => {
  if (!u) return "";
  if (u.startsWith("$BASE")) return u.replace("$BASE", base.replace(/\/+$/, ""));
  if (u.startsWith("/")) return base.replace(/\/+$/, "") + u;
  return u;
};

// === New helper: auth headers from config ===
const getAuthHeadersFromConfig = (cfg: IntegrationConfig) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cfg.apiKey) headers["Authorization"] = `Bearer ${String(cfg.apiKey)}`;
  if (cfg.apiToken) headers["Authorization"] = `Bearer ${String(cfg.apiToken)}`;
  if (cfg.username && cfg.password) {
    const token = typeof window !== "undefined" ? btoa(`${cfg.username}:${cfg.password}`) : "";
    headers["Authorization"] = `Basic ${token}`;
  }
  return headers;
};

// === New helper: sample value by "a.b.c" path ===
const getByPath = (obj: unknown, path: string): unknown => {
  try {
    return String(path)
      .split(".")
      .reduce((acc: any, key) => (acc == null ? acc : acc[key]), obj as any);
  } catch {
    return undefined;
  }
};

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
        <BookOpen className="text-sky-300" size={18}/>
        <h3 className="font-semibold">Docs – {provider.name}</h3>
      </div>
      <p className="text-white/80 text-sm mb-3">{provider.docs.overview}</p>

      <div className="text-sm mb-2 font-medium">Response (sample)</div>
      <pre className="max-h-60 overflow-auto bg-black/40 border border-white/10 rounded p-2 text-xs whitespace-pre">
        {JSON.stringify(response ?? {}, null, 2)}
      </pre>
      {disabled && <p className="text-xs text-white/50 mt-1">* Locked – เข้าสู่โหมด Edit เพื่อปรับค่า</p>}
    </div>
  );
}

/* ======================== Main ======================== */

const INITIAL: IntegrationItem[] = [
  { id:"INT-ERP",  name:"Core ERP",  type:"ERP",  status:"Active", health:"Healthy", createdDate:"2024-01-15", config:{ apiUrl:"https://your-n8n", username:"api_user", password:"***", companyId:"COMP001", apiKey:"" }, stats:{ totalCalls:8200, successRate:98.5, avgResponseTime:320 } },
  { id:"INT-WMS",  name:"Main WMS",  type:"WMS",  status:"Active", health:"Healthy", createdDate:"2024-02-01", config:{ apiUrl:"https://your-n8n", apiKey:"", warehouseId:"WH-01" }, stats:{ totalCalls:5200, successRate:99.0, avgResponseTime:180 } },
  { id:"INT-MES",  name:"Shopfloor MES", type:"MES", status:"Active", health:"Healthy", createdDate:"2024-03-10", config:{ apiUrl:"https://your-n8n", apiToken:"", plantCode:"PL-01" }, stats:{ totalCalls:12300, successRate:99.2, avgResponseTime:140 } },
  { id:"INT-HR",   name:"HR System", type:"HR",  status:"Active", health:"Healthy", createdDate:"2024-04-20", config:{ apiUrl:"https://your-n8n", apiKey:"", tenantId:"TEN-01" }, stats:{ totalCalls:2100, successRate:99.1, avgResponseTime:200 } },
  { id:"INT-CMMS", name:"CMMS",      type:"CMMS", status:"Active", health:"Warning", createdDate:"2024-05-15", config:{ apiUrl:"https://your-n8n", apiKey:"", siteId:"SITE-A" }, stats:{ totalCalls:1100, successRate:97.9, avgResponseTime:260 } },
];

export default function IntegrationsLocked() {
  const [list, setList] = useState<IntegrationItem[]>(INITIAL);
  const [activeId, setActiveId] = useState<string>(INITIAL[0].id);
  const active = useMemo(() => list.find(i => i.id === activeId)!, [list, activeId]);

  // Locked/Edit toggle
  const [editing, setEditing] = useState<boolean>(false);

  // endpoint picker & preview
  const [resourceKey, setResourceKey] = useState<string>("");
  useEffect(() => {
    const keys = Object.keys(getResourcesFor(active.type));
    setResourceKey((prev) => (keys.includes(prev) ? prev : keys[0] ?? ""));
  }, [active.type]);

  // === Preview cache/state ===
  const [previewMap, setPreviewMap] = useState<Record<string, unknown>>({});
  const [preview, setPreview] = useState<unknown>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  // Load from cache when switching active/resource
  useEffect(() => {
    const cacheKey = `${active.id}:${resourceKey}`;
    setPreview(previewMap[cacheKey] ?? null);
  }, [active.id, resourceKey, previewMap]);

  const flat = useMemo(() => flatten(preview || {}), [preview]);
  const externalOptions = useMemo(() => Object.keys(flat).sort(), [flat]);

  // mapping
  const currentRes = useMemo(() => getResourcesFor(active.type)[resourceKey], [active.type, resourceKey]);
  const defaultDir: "in" | "out" | "bi" = currentRes?.defaultDir ?? "in";
  const [mapping, setMapping] = useState<MappingRow[]>([]);
  useEffect(() => {
    const local = currentRes?.localSchema ?? PROVIDER_TYPES[active.type].localSchema;
    setMapping(local.map(l => ({ id: l, local: l, external: "", dir: defaultDir })));
  }, [active.type, resourceKey, currentRes?.localSchema, defaultDir]);

  // Save config on blur
  const saveConfigPatch = (patch: Partial<IntegrationConfig>) => {
    setList(prev =>
      prev.map(i => (i.id === active.id ? { ...i, config: { ...i.config, ...patch } } : i))
    );
  };

  const isSecretField = (k: string) => /key|token|password/i.test(k);

  // === Fetch preview from API URL ===
  const fetchPreview = async () => {
    const resSpec = getResourcesFor(active.type)[resourceKey];
    if (!resSpec) return;
    const base = String(active.config?.apiUrl || "").trim();
    if (!base) {
      setFetchErr("กรุณากรอก API URL ก่อน");
      return;
    }

    const req = resSpec.exampleRequest;
    const url = buildUrl(req.url, base);
    const headers = getAuthHeadersFromConfig(active.config || {});
    setFetching(true);
    setFetchErr(null);
    try {
      const r = await fetch(url, {
        method: req.method || resSpec.method,
        headers,
        body: (req.method || resSpec.method) === "POST" ? JSON.stringify(req.body ?? {}) : undefined,
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
  };

  return (
    <div className="mx-auto max-w-7xl p-6 text-white">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-white/70">Locked view • ERP • WMS • MES • HR • CMMS</p>
        </div>

        <button
          onClick={() => setEditing((prev) => !prev)}
          className="
            px-3 py-2 rounded-lg 
            bg-white/10 border border-white/15 
            hover:bg-white/20 
            transition-colors duration-200 
            inline-flex items-center gap-2
            focus:outline-none focus:ring-2 focus:ring-sky-400
          "
          title={editing ? "Exit Edit Mode" : "Edit Item"}
          aria-pressed={editing}
        >
          <Edit3 size={16} />
          <span>{editing ? "Done" : "Edit"}</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="lg:col-span-1 rounded-xl border border-white/10 bg-white/5">
          {list.map(item => {
            const T = PROVIDER_TYPES[item.type];
            const Icon = T.icon;
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-white/10 hover:bg-white/5 ${isActive ? "bg-white/10" : ""}`}
              >
                <div className="w-10 h-10 rounded-lg border border-white/10 grid place-items-center">
                  <Icon size={20} className={T.color} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-white/60">{T.name}</div>
                </div>
                <div className={`text-xs ${toneByHealth(item.health)}`}>
                  <HealthIcon h={item.health} /> {item.health || "Unknown"}
                </div>
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
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {PROVIDER_TYPES[active.type].fields.map((f) => {
                const value = (active.config?.[f.key] as Primitive) ?? f.default ?? "";
                const typeAttr = isSecretField(f.key) ? "password" : "text";
                const labelCls = `block mb-1 text-xs ${isSecretField(f.key) ? "font-semibold text-white/80" : "text-white/70"}`;
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

            {!editing && (
              <p className="text-xs text-white/50 mt-3">* Locked – กดปุ่ม Edit ที่มุมขวาบนเพื่อแก้ไขค่า</p>
            )}
          </div>

          {/* Mapping Card */}
          <div className="rounded-xl border border-white/10 p-4 bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Wand2 size={18} className="text-fuchsia-300" />
                <h3 className="font-semibold">Field Mapping</h3>
                <div className="flex items-center gap-2 ml-3">
                  <span className="text-xs text-white/70">Endpoint</span>
                  <select
                    value={resourceKey}
                    onChange={(e) => setResourceKey(e.target.value)}
                    className="px-2 py-1 rounded bg-white/10 border border-white/15 text-sm disabled:opacity-60"
                    disabled={!editing}
                  >
                    {Object.entries(getResourcesFor(active.type)).map(([k, s]) => (
                      <option key={k} value={k}>
                        {s.method} {s.path} — {s.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-white/50">Dir: {currentRes?.defaultDir || "in"}</span>
                </div>
              </div>

              {/* Fetch Preview button + error */}
              <div className="flex items-center gap-2">
                {fetchErr && <span className="text-xs text-rose-300">{fetchErr}</span>}
                <button
                  onClick={fetchPreview}
                  className="px-2 py-1 rounded bg-white/10 border border-white/15 text-sm hover:bg-white/20 disabled:opacity-60"
                  disabled={fetching || !resourceKey}
                  title="ดึงตัวอย่าง response จาก API URL ที่ตั้งไว้"
                >
                  {fetching ? "Fetching..." : "Fetch Preview"}
                </button>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm border-collapse min-w-[720px]">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="py-2 pr-3">Local Field</th>
                    <th className="py-2 pr-3">External Field</th>
                    <th className="py-2 pr-3">Direction</th>
                    <th className="py-2 pr-3">Confidence</th>
                    <th className="py-2 pr-3">Sample</th>
                    <th className="py-2 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {mapping.map((row) => (
                    <tr key={row.id} className="border-b border-white/5">
                      <td className="py-2 pr-3 font-mono">{row.local}</td>
                      <td className="py-2 pr-3">
                        <select
                          className="w-full px-2 py-1 rounded bg-white/10 border border-white/15 disabled:opacity-60"
                          value={row.external}
                          onChange={(e) =>
                            setMapping((prev) =>
                              prev.map((m) => (m.id === row.id ? { ...m, external: e.target.value } : m))
                            )
                          }
                          disabled={!editing}
                        >
                          <option value="">— Select from preview —</option>
                          {externalOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <select
                          className="px-2 py-1 rounded bg-white/10 border border-white/15 disabled:opacity-60"
                          value={row.dir}
                          onChange={(e) =>
                            setMapping((prev) =>
                              prev.map((m) =>
                                m.id === row.id ? { ...m, dir: e.target.value as "in" | "out" | "bi" } : m
                              )
                            )
                          }
                          disabled={!editing}
                        >
                          <option value="in">in</option>
                          <option value="out">out</option>
                          <option value="bi">bi</option>
                        </select>
                      </td>
                      <td className="py-2 pr-3">{row.confidence?.toFixed(2) ?? "-"}</td>
                      <td className="py-2 pr-3 text-xs text-white/70">
                        {row.external
                          ? (() => {
                              const v = getByPath(preview ?? {}, row.external);
                              return v === undefined ? "—" : JSON.stringify(v);
                            })()
                          : "—"}
                      </td>
                      <td className="py-2 pr-3 text-right">
                        {editing && (
                          <button
                            onClick={() => setMapping((prev) => prev.filter((m) => m.id !== row.id))}
                            className="p-1 rounded hover:bg-white/10"
                            title="Remove row"
                          >
                            <Trash2 size={16} className="text-rose-300" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!editing && <p className="text-xs text-white/50 mt-3">* Locked – เปลี่ยน endpoint/แก้ mapping ได้เมื่อ Edit</p>}
          </div>

          {/* Docs */}
          <DocsPanel
            type={active.type}
            resourceKey={resourceKey}
            baseUrl={String(active.config?.apiUrl || "https://your-n8n")}
            preview={preview}
            onSelectResource={setResourceKey}
            disabled={!editing}
          />
        </div>
      </div>
    </div>
  );
}
