"use client";

import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
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
  Check,
  Pencil,
  RefreshCw,
  Filter,
  Search,
  Eye,
  EyeOff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Toggle from "@/src/components/shared/button/Toggle";

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
  source?: "auto" | "manual";
  locked?: boolean; // reserved
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
      { key: "apiUrl", label: "API URL", placeholder: "http://localhost:4000/api/maintenance" },
      { key: "apiKey", label: "API Key" },
    ],
    docs: { overview: "Maintenance Machines Management (อ่าน WO, PM/CM Schedule)" },
    localSchema: ["id", "machine_code", "type", "schedule_date", "status", "priority"],
  },
};

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
        { product_code: "WDGT-A", step: { seq: 10, process: "MACH", work_center_code: "WC-MACH" } },
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
      localSchema: ["job.id", "job.operation", "job.machine_code", "job.start", "job.end", "job.qty_plan"],
      exampleRequest: { method: "POST", url: "$BASE/webhook/mes/dispatch", body: { jobs: [{ job_id: "J-001", machine_code: "M001" }] } },
      exampleResponse: { accepted: true, scheduled: 1 },
    },
  },
  HR: {
    employees: {
      name: "Personnel",
      method: "GET",
      path: "/hr/employees",
      defaultDir: "in",
      localSchema: ["employee.emp_code", "employee.full_name", "employee.department", "employee.status"],
      exampleRequest: { method: "GET", url: "$BASE/webhook/hr/employees?limit=10" },
      exampleResponse: [{ emp_code: "EMP001", full_name: "John Smith", department: "Manufacturing", status: "Active" }],
    },
    leaves: {
      name: "Shifts & Calendars",
      method: "GET",
      path: "/hr/shift-calendars",
      defaultDir: "in",
      localSchema: ["leave.emp_code", "leave.type", "leave.date", "leave.duration"],
      exampleRequest: { method: "GET", url: "$BASE/webhook/hr/leaves?from=2025-10-01&to=2025-10-31" },
      exampleResponse: [{ emp_code: "EMP001", type: "Vacation", date: "2025-10-12", duration: 1 }],
    },
  },
  CMMS: {
    maintenance: {
      name: "Maintenance (single endpoint)",
      method: "GET",
      path: "(direct)",
      defaultDir: "in",
      localSchema: ["id", "machine_code", "type", "schedule_date", "status", "priority", "asset_name"],
      exampleRequest: { method: "GET", url: "$BASE" },
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
  h === "Healthy" ? "text-emerald-300" :
    h === "Warning" ? "text-amber-300" :
      h === "Error" ? "text-rose-300" : "text-sky-300";

const HealthIcon = ({ h }: { h?: IntegrationItem["health"] }) =>
  h === "Healthy" ? <CheckCircle2 size={16} className="inline align-[-2px] text-emerald-300" /> :
    h === "Warning" ? <AlertTriangle size={16} className="inline align-[-2px] text-amber-300" /> :
      h === "Error" ? <XCircle size={16} className="inline align-[-2px] text-rose-300" /> :
        <AlertTriangle size={16} className="inline align-[-2px] text-sky-300" />;

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
    const token = typeof window !== "undefined" ? btoa(`${cfg.username}:${cfg.password}`) : "";
    headers["Authorization"] = `Basic ${token}`;
  }
  return headers;
};

/* ======================== Main ======================== */

const INITIAL: IntegrationItem[] = [
  { id: "INT-ERP", name: "ERP", type: "ERP", status: "Inactive", health: "Error", createdDate: "2024-01-15", config: { apiUrl: "https://your-n8n", username: "api_user", password: "***", companyId: "COMP001", apiKey: "" }, stats: { totalCalls: 8200, successRate: 98.5, avgResponseTime: 320 } },
  { id: "INT-WMS", name: "WMS", type: "WMS", status: "Inactive", health: "Error", createdDate: "2024-02-01", config: { apiUrl: "https://your-n8n", apiKey: "", warehouseId: "WH-01" }, stats: { totalCalls: 5200, successRate: 99.0, avgResponseTime: 180 } },
  { id: "INT-MES", name: "MES", type: "MES", status: "Active", health: "Warning", createdDate: "2024-03-10", config: { apiUrl: "https://your-n8n", apiToken: "", plantCode: "PL-01" }, stats: { totalCalls: 12300, successRate: 99.2, avgResponseTime: 140 } },
  { id: "INT-HR", name: "HR", type: "HR", status: "Active", health: "Warning", createdDate: "2024-04-20", config: { apiUrl: "https://your-n8n", apiKey: "", tenantId: "TEN-01" }, stats: { totalCalls: 2100, successRate: 99.1, avgResponseTime: 200 } },
  { id: "INT-CMMS", name: "CMMS", type: "CMMS", status: "Active", health: "Healthy", createdDate: "2024-05-15", config: { apiUrl: "http://localhost:4001/api/maintenance", apiKey: "mock-api-key-123456", siteId: "SITE-A" }, stats: { totalCalls: 1100, successRate: 97.9, avgResponseTime: 260 } },
];

export default function IntegrationsLocked() {
  const [list, setList] = useState<IntegrationItem[]>(INITIAL);
  const [activeId, setActiveId] = useState<string>("INT-CMMS");
  const active = useMemo(() => list.find((i) => i.id === activeId)!, [list, activeId]);

  const [editing, setEditing] = useState<boolean>(false);
  const [resourceKey] = useState<string>("maintenance");

  // connection state
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "failed">("idle");

  // preview state
  const [previewMap, setPreviewMap] = useState<Record<string, unknown>>({});
  const [preview, setPreview] = useState<unknown>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  // abort in-flight fetch when switching
  const abortRef = useRef<AbortController | null>(null);

  // Show cached preview on switch
  useEffect(() => {
    const cacheKey = `${active.id}:${resourceKey}`;
    setPreview(previewMap[cacheKey] ?? null);
    setTestStatus("idle");
    if (abortRef.current) abortRef.current.abort();
  }, [active.id, resourceKey, previewMap]);

  // Flattened external keys
  const flat = useMemo(() => flatten(preview || {}), [preview]);
  const externalOptions = useMemo(() => Object.keys(flat).sort(), [flat]);

  // Mapping rows
  const currentRes = useMemo(() => getResourcesFor(active.type)[resourceKey], [active.type, resourceKey]);
  const defaultDir: "in" | "out" | "bi" = currentRes?.defaultDir ?? "in";
  const [mapping, setMapping] = useState<MappingRow[]>([]);
  useEffect(() => {
    const local = currentRes?.localSchema ?? PROVIDER_TYPES[active.type].localSchema;
    setMapping(local.map((l) => ({ id: l, local: l, external: "", dir: defaultDir, locked: false })));
  }, [active.type, resourceKey, currentRes?.localSchema, defaultDir]);

  // Threshold for fuzzy auto-match
  const [matchThreshold] = useState<number>(0.5);

  const saveConfigPatch = (patch: Partial<IntegrationConfig>) => {
    setList((prev) => prev.map((i) => (i.id === active.id ? { ...i, config: { ...i.config, ...patch } } : i)));
  };

  const isSecretField = (k: string) => /key|token|password/i.test(k);

  /* ---- UI helpers ---- */
  const isInactive = active.status !== "Active";

  /* ---- Test connection ---- */
  const testConnection = useCallback(async () => {
    if (isInactive) {
      setTestStatus("idle");
      return false;
    }
    const base = String(active.config?.apiUrl || "").trim();
    if (!base) {
      setTestStatus("failed");
      return false;
    }
    setTesting(true);
    setTestStatus("idle");
    try {
      const headers = getAuthHeadersFromConfig(active.config || {});
      const resp = await fetch(base, { method: "GET", headers });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      setTestStatus("success");
      return true;
    } catch (err: any) {
      setTestStatus("failed");
      return false;
    } finally {
      setTesting(false);
    }
  }, [active.config, isInactive]);

  /* ---- Fetch preview ---- */
  const doFetchPreview = useCallback(async () => {
    if (isInactive) {
      setFetchErr("อินทิเกรชันเป็น Inactive — เปิดใช้งานก่อน");
      return;
    }
    const resSpec = getResourcesFor(active.type)[resourceKey];
    if (!resSpec) return;
    const base = String(active.config?.apiUrl || "").trim();
    if (!base) {
      setFetchErr("กรุณากรอก API URL ก่อน");
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

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
        signal: controller.signal,
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const cacheKey = `${active.id}:${resourceKey}`;
      setPreviewMap((m) => ({ ...m, [cacheKey]: data }));
      setPreview(data);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setFetchErr(e?.message || "Fetch failed");
    } finally {
      setFetching(false);
    }
  }, [active.id, active.type, active.config, resourceKey, isInactive]);

  /* ---- Auto test/fetch: run only if Active & apiUrl present ---- */
  useEffect(() => {
    (async () => {
      if (isInactive) return;
      if (!active.config?.apiUrl) return;
      const ok = await testConnection();
      if (ok) void doFetchPreview();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.id, active.status, active.config?.apiUrl]);

  /* ---- Fuzzy auto-map (with force) ---- */
  const runAutoMap = useCallback(
    (opts?: { force?: boolean }) => {
      if (isInactive || !preview) return;

      const resSpec = getResourcesFor(active.type)[resourceKey];
      const candidateSource = preview ?? resSpec?.exampleResponse ?? {};
      const flatPreview = flatten(candidateSource);
      const candidates = externalOptions.length ? externalOptions : Object.keys(flatPreview).sort();

      if (!resSpec || candidates.length === 0) return;

      // --- similarity functions ---
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
        const inter = [...ta].filter((x) => tb.has(x)).length;
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
          const s = Math.max(sim(local, e), sim(local.split(".").pop() || local, e.split(".").pop() || e));
          if (s > best.score) best = { ext: e, score: s };
        }
        return best;
      };

      // --- update mapping ---
      setMapping((prev) =>
        prev.map((m) => {
          if (m.locked || m.source === "manual") return m; // เคารพค่าที่ผู้ใช้เลือกเอง

          const match = pick(m.local);
          const conf = Math.round(match.score * 100) / 100;

          // ถ้า force: เขียนทับทุกแถว (ที่ไม่ manual/locked) ตาม threshold ล่าสุด
          if (opts?.force) {
            if (conf >= matchThreshold) {
              return { ...m, external: match.ext, confidence: conf, source: "auto" };
            }
            // ต่ำกว่า threshold: เคลียร์ค่า เพื่อให้ผู้ใช้เห็นว่ายังไม่มั่นใจ
            return { ...m, external: "", confidence: conf, source: "auto" };
          }

          // เดิม: อัปเดตเฉพาะกรณีคะแนนใหม่ดีกว่าเดิม
          if (conf >= matchThreshold && conf > (m.confidence ?? 0)) {
            return { ...m, external: match.ext, confidence: conf, source: "auto" };
          }
          // ไม่ถึง threshold หรือไม่ดีกว่าเดิม → อัปเดต confidence เพื่อสะท้อนผลล่าสุด
          return { ...m, confidence: conf };
        })
      );

      setFetchErr?.(null);
    },
    [active.type, resourceKey, preview, externalOptions, matchThreshold, isInactive]
  );

  // Auto-run when preview ready & active
  useEffect(() => {
    if (!isInactive && preview) runAutoMap(); // ครั้งแรกแบบ non-force
  }, [isInactive, preview, runAutoMap]);

  // Toggle handler
  const handleToggleActive = (nextOn: boolean) => {
    const nextStatus: IntegrationStatus = nextOn ? "Active" : "Inactive";
    setList((prev) => prev.map((i) => (i.id === active.id ? { ...i, status: nextStatus } : i)));
    if (!nextOn) {
      setTestStatus("idle");
      setPreview(null);
      setFetchErr(null);
      if (abortRef.current) abortRef.current.abort();
    }
  };

  /* ======================== UI ======================== */
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
        <div className="lg:col-span-1 rounded-xl border border-white/10 bg-white/[0.04]">
          {list.map((item) => {
            const T = PROVIDER_TYPES[item.type];
            const Icon = T.icon;
            const isActiveRow = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-white/10 hover:bg-white/5 ${isActiveRow ? "bg-white/10" : ""}`}
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
        <div className="lg:col-span-2 space-y-8">
          {/* Section: Connection */}
          <section className="rounded-xl border border-white/10 bg-white/[0.04] shadow-sm">
            <header className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Cog size={18} className="text-cyan-300" />
                <h2 className="text-lg font-semibold">{active.name} Connection</h2>
              </div>

              <div className="flex items-center gap-3">
                <Toggle
                  isOn={active.status === "Active"}
                  onToggle={(on: boolean) => handleToggleActive(on)}
                />
                <span className="text-sm text-white/60">Enable</span>
                {testStatus === "success" && (
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-sm">
                    <CheckCircle2 size={16} /> Connected
                  </span>
                )}
              </div>
            </header>

            <div className="p-4 space-y-5">
              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/70">Status:</span>
                  {testStatus === "success" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                      <CheckCircle2 size={14} /> Connected
                    </span>
                  )}
                  {testStatus === "failed" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-rose-400/30 bg-rose-500/10 text-rose-300">
                      <XCircle size={14} /> Failed
                    </span>
                  )}
                  {testStatus === "idle" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-white/15 bg-white/5 text-white/70">
                      Idle
                    </span>
                  )}
                </div>

                <button
                  onClick={testConnection}
                  disabled={testing || isInactive || !String(active.config?.apiUrl || "").trim()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  title={isInactive ? "Activate ก่อนจึงจะทดสอบได้" : "Test Connection"}
                  aria-busy={testing}
                >
                  {testing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Testing…
                    </>
                  ) : (
                    <>
                      <RefreshCw size={14} /> Test Connection
                    </>
                  )}
                </button>
              </div>

              {/* Fields */}
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {PROVIDER_TYPES[active.type].fields.map((f) => {
                  const value = (active.config?.[f.key] as Primitive) ?? f.default ?? "";
                  const isUrlField =
                    f.key.toLowerCase().includes("apiurl") || f.label.toLowerCase().includes("url");
                  return (
                    <FieldInput
                      key={f.key}
                      id={`fld-${f.key}`}
                      label={f.label}
                      placeholder={f.placeholder}
                      value={String(value ?? "")}
                      editable={editing}
                      isSecret={isSecretField(f.key)}
                      isUrl={isUrlField}
                      onSave={(v) => saveConfigPatch({ [f.key]: v })}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section: Field Mapping */}
          <section className="rounded-xl border border-white/10 bg-white/[0.04] shadow-sm">
            <header className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Wand2 size={18} className="text-fuchsia-300" />
                <h2 className="text-semibold text-base">Field Mapping</h2>
              </div>

              <div className="flex items-center gap-2">
                {fetchErr && <span className="text-xs text-rose-300">{fetchErr}</span>}
                <button
                  onClick={() => runAutoMap({ force: true })}
                  disabled={isInactive || !preview}
                  className="px-2 py-1 rounded bg-fuchsia-600/20 border border-fuchsia-400/30 text-sm hover:bg-fuchsia-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isInactive ? "Activate ก่อน" : (!preview ? "ยังไม่มี Preview" : "Auto-match (re-run)")}
                >
                  Auto-match
                </button>
              </div>
            </header>

            {/* Mapping Table */}
            <div className="overflow-auto max-h-[400px]">
              <table className="w-full text-sm border-collapse min-w-[720px]">
                <thead>
                  <tr className="bg-white/10 text-left border-b border-white/10">
                    <th className="py-2 px-3 w-1/2">Local Field</th>
                    <th className="py-2 px-3">External Field</th>
                  </tr>
                </thead>
                <tbody>
                  {!fetching &&
                    mapping.map((row) => {
                      const noData = isInactive || !preview;
                      const isEmpty = !row.external;
                      const isSelectMode = !noData && isEmpty;
                      const hasValue = !!row.external;

                      return (
                        <tr
                          key={row.id}
                          className={`border-b border-white/5 transition ${hasValue
                            ? "hover:bg-white/[0.03]"
                            : isSelectMode
                              ? "hover:bg-amber-500/10"
                              : "hover:bg-white/[0.03]"
                            }`}
                        >
                          <td className="py-2 px-3 font-mono text-xs text-white/90">{row.local}</td>
                          <td className="py-2 px-3">
                            <select
                              className={`w-full px-2 py-1 rounded border text-sm transition
                                ${noData
                                  ? "bg-white/[0.05] border-white/10 text-white/40"
                                  : isEmpty
                                    ? "bg-amber-500/10 border-amber-400/30 text-amber-300"
                                    : "bg-white/10 border-white/15"
                                }`}
                              value={row.external ?? ""}
                              disabled={noData}
                              onChange={(e) =>
                                setMapping((prev) =>
                                  prev.map((m) =>
                                    m.id === row.id
                                      ? { ...m, external: e.target.value, source: "manual" }
                                      : m
                                  )
                                )
                              }
                            >
                              <option value="">
                                {noData ? "No data" : "— Select —"}
                              </option>
                              {externalOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}

                  {fetching && (
                    <tr>
                      <td colSpan={2} className="py-6 text-center text-white/60">
                        Fetching sample...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section: Docs with Tabs (Live/Sample) */}
          <DocsTabsSection
            active={active}
            resourceKey={resourceKey}
            preview={preview}
          />
        </div>
      </div>
    </div>
  );
}

/* ======================== FieldInput (standalone component) ======================== */

function FieldInput({
  id,
  label,
  placeholder,
  value,
  editable,
  isSecret,
  isUrl,
  onSave,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  editable: boolean;
  isSecret: boolean;
  isUrl: boolean;
  onSave: (v: string) => void;
}) {
  const [local, setLocal] = useState<string>(value ?? "");
  const [show, setShow] = useState<boolean>(false);
  const missing = isUrl && !String(local || "").trim();

  useEffect(() => {
    setLocal(value ?? "");
  }, [value]);

  const typeAttr: React.HTMLInputTypeAttribute = isSecret && !show ? "password" : "text";

  return (
    <div className="group">
      <label htmlFor={id} className="block mb-1 text-xs font-semibold text-white/70">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={typeAttr}
          inputMode={isUrl ? "url" : undefined}
          className={[
            "w-full px-3 py-2 rounded-lg bg-white/10 border focus:outline-none",
            "focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-60 disabled:cursor-not-allowed",
            missing ? "border-rose-400/40" : "border-white/15",
          ].join(" ")}
          placeholder={placeholder}
          value={local}
          disabled={!editable}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => editable && onSave(local)}
          aria-invalid={missing || undefined}
          aria-describedby={isUrl ? `${id}-hint` : undefined}
        />

        {isSecret && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-100/80 hover:text-white"
            aria-label="Toggle password visibility"
          >
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ======================== Docs: Tabs + Panel ======================== */
function JsonBlock({ value, maxH = 240 }: { value: unknown; maxH?: number }) {
  return (
    <pre
      className="overflow-auto bg-black/40 border border-white/10 rounded p-2 text-xs whitespace-pre"
      style={{ maxHeight: maxH }}
    >
      {JSON.stringify(value ?? {}, null, 2)}
    </pre>
  );
}

function DocsPanelCore({
  response,
}: {
  type: ProviderType;
  baseUrl: string;
  response: unknown;
  lastPreview: unknown;
}) {
  return (
    <div className="space-y-4">
      <div>
        <JsonBlock value={response} maxH={260} />
      </div>
    </div>
  );
}

function DocsTabsSection({
  active,
  resourceKey,
  preview,
}: {
  active: IntegrationItem;
  resourceKey: string;
  preview: unknown;
}) {
  const resSpec = getResourcesFor(active.type);
  const sample =
    resSpec?.[resourceKey]?.exampleResponse ||
    getResourcesFor("CMMS")?.maintenance?.exampleResponse ||
    {};
  const hasLive = !!preview;

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] shadow-sm overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-amber-300" />
          <h2 className="text-semibold text-base">Integration Docs</h2>
        </div>
        <div className="flex items-center gap-2">
          {hasLive ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
              <CheckCircle2 size={14} /> Live Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-300 text-xs">
              <AlertTriangle size={14} /> Showing Sample Only
            </span>
          )}
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Live Preview Section */}
        {hasLive && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-emerald-400 font-medium text-sm">
                Live Preview
              </span>
            </div>
            <DocsPanelCore
              type={active.type}
              baseUrl={String(active.config?.apiUrl || "http://localhost:4000/api/maintenance")}
              response={preview}
              lastPreview={preview}
            />
          </div>
        )}

        {/* Sample Data Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-300 font-medium text-sm">
              Sample Data
            </span>
          </div>
          <DocsPanelCore
            type={active.type}
            baseUrl={String(active.config?.apiUrl || "http://localhost:4000/api/maintenance")}
            response={sample}
            lastPreview={preview}
          />
        </div>
      </div>
    </section>
  );
}
