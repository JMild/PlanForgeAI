/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import PageHeader from "@/src/components/layout/PageHeader";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Download,
  Mail,
  Printer,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DataTable } from "@/src/components/shared/table/Table";

/* ===================== Types ===================== */
type ReportTypeId =
  | "utilization"
  | "ontime"
  | "adherence"
  | "bottleneck"
  | "changeover"
  | "late"
  | "leadtime"
  | "downtime";

type ReportCategory =
  | "Performance"
  | "Planning"
  | "Efficiency"
  | "Optimization"
  | "Maintenance";

type DateRange = "today" | "week" | "month" | "quarter" | "year" | "custom";

type UtilizationByMachine = {
  machine: string;
  utilization: number; // %
  oee: number; // %
  planned: number; // minutes (example)
  actual: number; // minutes (example)
};

type OnTimeDeliveryRow = {
  week: string;
  onTime: number;
  late: number;
  total: number;
  percentage: number;
};

type PlanAdherenceRow = {
  date: string;
  planned: number;
  actual: number;
  variance: number;
};

type BottleneckRow = {
  process: string;
  avgWaitTime: number;
  throughput: number;
  utilization: number;
};

type ChangeoverRow = {
  machine: string;
  avgChangeover: number;
  changeoverCount: number;
  productionLoss: number;
};

type LateOrderRow = {
  orderNo: string;
  customer: string;
  dueDate: string;
  completedDate: string;
  daysLate: number;
  priority: 1 | 2 | 3;
};

type LeadTimeRow = {
  product: string;
  avgLeadTime: number;
  targetLeadTime: number;
  orders: number;
};

type DowntimeReasonRow = {
  reason: string;
  duration: number;
  count: number;
  percentage: number;
};

type ReportData = {
  utilizationByMachine: UtilizationByMachine[];
  onTimeDelivery: OnTimeDeliveryRow[];
  planAdherence: PlanAdherenceRow[];
  bottleneckAnalysis: BottleneckRow[];
  changeoverTime: ChangeoverRow[];
  lateOrders: LateOrderRow[];
  leadTimeAnalysis: LeadTimeRow[];
  downtimeReasons: DowntimeReasonRow[];
};

type ReportTypeItem = {
  id: ReportTypeId;
  name: string;
  icon: LucideIcon;
  category: ReportCategory;
};

/* ===================== Data ===================== */
const REPORT_DATA: ReportData = {
  utilizationByMachine: [
    { machine: "M001", utilization: 85, oee: 78, planned: 450, actual: 383 },
    { machine: "M002", utilization: 92, oee: 84, planned: 450, actual: 414 },
    { machine: "M003", utilization: 45, oee: 42, planned: 450, actual: 203 },
    { machine: "M004", utilization: 78, oee: 71, planned: 450, actual: 351 },
    { machine: "M005", utilization: 62, oee: 58, planned: 450, actual: 279 },
    { machine: "M006", utilization: 0, oee: 0, planned: 450, actual: 0 },
  ],

  onTimeDelivery: [
    { week: "Week 39", onTime: 12, late: 2, total: 14, percentage: 86 },
    { week: "Week 40", onTime: 15, late: 3, total: 18, percentage: 83 },
    { week: "Week 41", onTime: 18, late: 1, total: 19, percentage: 95 },
    { week: "Week 42", onTime: 16, late: 2, total: 18, percentage: 89 },
    { week: "Week 43", onTime: 20, late: 3, total: 23, percentage: 87 },
  ],

  planAdherence: [
    { date: "09/25", planned: 45, actual: 42, variance: -3 },
    { date: "09/26", planned: 48, actual: 50, variance: 2 },
    { date: "09/27", planned: 52, actual: 48, variance: -4 },
    { date: "09/28", planned: 47, actual: 47, variance: 0 },
    { date: "09/29", planned: 50, actual: 53, variance: 3 },
    { date: "09/30", planned: 55, actual: 51, variance: -4 },
    { date: "10/01", planned: 49, actual: 46, variance: -3 },
  ],

  bottleneckAnalysis: [
    { process: "Machining", avgWaitTime: 45, throughput: 850, utilization: 88 },
    { process: "Drilling", avgWaitTime: 25, throughput: 920, utilization: 82 },
    { process: "Pressing", avgWaitTime: 65, throughput: 650, utilization: 78 },
    { process: "Painting", avgWaitTime: 85, throughput: 580, utilization: 62 },
    { process: "Assembly", avgWaitTime: 15, throughput: 980, utilization: 45 },
    { process: "Packaging", avgWaitTime: 10, throughput: 1020, utilization: 55 },
  ],

  changeoverTime: [
    { machine: "M001", avgChangeover: 28, changeoverCount: 12, productionLoss: 336 },
    { machine: "M002", avgChangeover: 32, changeoverCount: 10, productionLoss: 320 },
    { machine: "M003", avgChangeover: 18, changeoverCount: 15, productionLoss: 270 },
    { machine: "M004", avgChangeover: 35, changeoverCount: 8, productionLoss: 280 },
    { machine: "M005", avgChangeover: 42, changeoverCount: 14, productionLoss: 588 },
  ],

  lateOrders: [
    { orderNo: "ORD018", customer: "XYZ Ltd", dueDate: "2025-09-28", completedDate: "2025-09-30", daysLate: 2, priority: 1 },
    { orderNo: "ORD009", customer: "Global Co", dueDate: "2025-09-29", completedDate: "2025-10-01", daysLate: 2, priority: 1 },
    { orderNo: "ORD012", customer: "Tech Inc", dueDate: "2025-09-27", completedDate: "2025-09-29", daysLate: 2, priority: 2 },
    { orderNo: "ORD015", customer: "ABC Corp", dueDate: "2025-09-30", completedDate: "2025-10-01", daysLate: 1, priority: 1 },
    { orderNo: "ORD021", customer: "Industrial Partners", dueDate: "2025-09-26", completedDate: "2025-09-28", daysLate: 2, priority: 3 },
  ],

  leadTimeAnalysis: [
    { product: "Widget A", avgLeadTime: 185, targetLeadTime: 180, orders: 12 },
    { product: "Widget B", avgLeadTime: 220, targetLeadTime: 200, orders: 8 },
    { product: "Widget C", avgLeadTime: 165, targetLeadTime: 170, orders: 15 },
    { product: "Widget D", avgLeadTime: 285, targetLeadTime: 260, orders: 6 },
  ],

  downtimeReasons: [
    { reason: "Machine Breakdown", duration: 180, count: 5, percentage: 35 },
    { reason: "Material Shortage", duration: 120, count: 8, percentage: 23 },
    { reason: "Tooling Change", duration: 90, count: 12, percentage: 17 },
    { reason: "Quality Issue", duration: 75, count: 6, percentage: 15 },
    { reason: "Other", duration: 55, count: 9, percentage: 10 },
  ],
};


const COLORS: string[] = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const REPORT_TYPES: ReportTypeItem[] = [
  { id: "utilization", name: "Machine Utilization", icon: Activity, category: "Performance" },
  { id: "ontime", name: "On-Time Delivery", icon: Clock, category: "Performance" },
  { id: "adherence", name: "Plan Adherence", icon: BarChart3, category: "Planning" },
  { id: "bottleneck", name: "Bottleneck Analysis", icon: AlertTriangle, category: "Optimization" },
  { id: "changeover", name: "Changeover Time", icon: RefreshCw, category: "Efficiency" },
  { id: "late", name: "Late Orders", icon: AlertTriangle, category: "Performance" },
  { id: "leadtime", name: "Lead Time Analysis", icon: TrendingUp, category: "Performance" },
  { id: "downtime", name: "Downtime Analysis", icon: AlertTriangle, category: "Maintenance" },
];

// ===== Tooltip theme (dark glass) =====
const TOOLTIP_STYLE: React.CSSProperties = {
  background: "rgba(2, 6, 23, 0.78)",        // deep glass
  border: "1px solid rgba(59,130,246,0.35)", // fallback border (blue-500)
  color: "#fff",
  borderRadius: 10,
  padding: "8px 10px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
  backdropFilter: "blur(6px)",
};
const TOOLTIP_LABEL_STYLE: React.CSSProperties = {
  color: "rgba(255,255,255,0.9)",
  fontWeight: 600,
  marginBottom: 4,
};

// ใช้กับทุกกราฟ (Bar/Line/Composed/Pie) 
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const p0 = payload[0];
  const isPie = !!p0?.payload?.name; // pie slice จะมี name ใน payload
  // สี series จาก Recharts จะถูกส่งมาใน p0.color (ติดตาม fill/stroke ที่ตั้งไว้)
  const chipColor = p0?.color || COLORS[0];

  const style = {
    ...TOOLTIP_STYLE,
    border: `1px solid ${chipColor}66`, // ไล่โทนตามสี series/slice
  } as React.CSSProperties;

  // สำหรับ Pie: แสดง % ถ้ามี percent
  const percent =
    isPie && p0.payload?.percent != null
      ? ` (${Math.round(p0.payload.percent * 100)}%)`
      : "";

  // label (แกน X) โชว์เฉพาะกราฟที่ไม่ใช่ Pie
  return (
    <div style={style}>
      {!isPie && label && <div style={TOOLTIP_LABEL_STYLE}>{label}</div>}
      {payload.map((item: any, idx: number) => {
        const name = item.name ?? item.dataKey ?? "value";
        const color = item.color || chipColor;
        return (
          <div key={idx} className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded" style={{ background: color }} />
            <span className="text-white/90">{name}</span>
            <span className="ml-2 font-semibold text-white">
              {item.value}{isPie ? percent : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ===================== Page ===================== */
const ProductionReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportTypeId>("utilization");
  const [dateRange, setDateRange] = useState<DateRange>("week");

  const handleExport = (format: "PDF" | "Excel") => {
    alert(`Exporting report as ${format}...`);
  };

  const renderReport = (): React.ReactNode => {
    switch (selectedReport) {
      case "utilization":
        return <UtilizationReport data={REPORT_DATA.utilizationByMachine} />;
      case "ontime":
        return <OnTimeDeliveryReport data={REPORT_DATA.onTimeDelivery} />;
      case "adherence":
        return <PlanAdherenceReport data={REPORT_DATA.planAdherence} />;
      case "bottleneck":
        return <BottleneckReport data={REPORT_DATA.bottleneckAnalysis} />;
      case "changeover":
        return <ChangeoverReport data={REPORT_DATA.changeoverTime} />;
      case "late":
        return <LateOrdersReport data={REPORT_DATA.lateOrders} />;
      case "leadtime":
        return <LeadTimeReport data={REPORT_DATA.leadTimeAnalysis} />;
      case "downtime":
        return <DowntimeReport data={REPORT_DATA.downtimeReasons} />;
      default:
        return null;
    }
  };

  const selectedReportInfo = REPORT_TYPES.find((r) => r.id === selectedReport);
  const SelectedIcon = selectedReportInfo?.icon;

  return (
    <div>
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Production Reports</h1>
              <p className="text-sm text-white/60 mt-1">
                Analytics and insights for production performance
              </p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setDateRange(e.target.value as DateRange)
              }
              className="glass-input"
            >
              <option value="today" className="select option">
                Today
              </option>
              <option value="week" className="select option">
                This Week
              </option>
              <option value="month" className="select option">
                This Month
              </option>
              <option value="quarter" className="select option">
                This Quarter
              </option>
              <option value="year" className="select option">
                This Year
              </option>
              <option value="custom" className="select option">
                Custom Range
              </option>
            </select>

            <button onClick={() => handleExport("PDF")} className="btn btn-outline">
              <Download size={18} />
              Export PDF
            </button>

            <button onClick={() => handleExport("Excel")} className="btn btn-outline">
              <Download size={18} />
              Export Excel
            </button>
          </div>
        }
        tabs={
          <div className="flex overflow-x-auto px-4 py-2 gap-4">
            {["Performance", "Planning", "Efficiency", "Optimization", "Maintenance"].map(
              (category) => {
                const isCategorySelected = REPORT_TYPES.some(
                  (r) => r.category === category && r.id === selectedReport
                );

                return (
                  <div key={category} className="flex flex-col">
                    <span
                      className={`text-sm font-semibold ${isCategorySelected ? "text-sky-300" : "text-white/80"
                        }`}
                    >
                      {category}
                    </span>

                    <div className="flex gap-2 mt-1">
                      {REPORT_TYPES.filter((r) => r.category === category).map((report) => (
                        <button
                          key={report.id}
                          onClick={() => setSelectedReport(report.id)}
                          className={`px-3 py-1 rounded text-sm border transition-colors ${selectedReport === report.id
                            ? "bg-sky-500/20 text-sky-300 border-sky-400/20"
                            : "text-white/70 hover:bg-white/10 border-white/10"
                            }`}
                        >
                          {report.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        }
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="rounded-lg border border-white/10 bg-white/5">
          {/* Report Header */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {SelectedIcon && <SelectedIcon size={24} className="text-sky-300" />}
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedReportInfo?.name}</h2>
                  <p className="text-sm text-white/60">
                    Period:&nbsp;
                    {dateRange === "week"
                      ? "This Week"
                      : dateRange === "month"
                        ? "This Month"
                        : dateRange === "today"
                          ? "Today"
                          : dateRange === "quarter"
                            ? "This Quarter"
                            : dateRange === "year"
                              ? "This Year"
                              : "Custom"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/10 rounded" title="Print">
                  <Printer size={18} className="text-white/70" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded" title="Email">
                  <Mail size={18} className="text-white/70" />
                </button>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="p-6">{renderReport()}</div>
        </div>
      </div>
    </div>
  );
};

/* ===================== Report Components ===================== */
const UtilizationReport: React.FC<{ data: UtilizationByMachine[] }> = ({ data }) => {
  const avgUtilization = Math.round(data.reduce((sum, m) => sum + m.utilization, 0) / data.length);
  const avgOEE = Math.round(data.reduce((sum, m) => sum + m.oee, 0) / data.length);

  const columns = [
    {
      key: "machine",
      label: "Machine",
    },
    {
      key: "planned",
      label: "Planned (min)",
      align: "right",
    },
    {
      key: "actual",
      label: "Actual (min)",
      align: "right",
    },
    {
      key: "utilization",
      label: "Utilization",
      align: "right",
      render: (m: UtilizationByMachine) => (
        <span className="text-sky-300">{m.utilization}%</span>
      ),
    },
    {
      key: "oee",
      label: "OEE",
      align: "right",
      render: (m: UtilizationByMachine) => (
        <span className="text-emerald-300">{m.oee}%</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "right",
      render: (m: UtilizationByMachine) => {
        const statusLabel =
          m.utilization >= 80
            ? "Excellent"
            : m.utilization >= 60
              ? "Good"
              : m.utilization > 0
                ? "Low"
                : "Down";

        const statusClass =
          m.utilization >= 80
            ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/20"
            : m.utilization >= 60
              ? "status-inactive"
              : m.utilization > 0
                ? "bg-orange-500/15 text-orange-300 border-orange-400/20"
                : "status-error";

        return <span className={`chip ${statusClass}`}>{statusLabel}</span>;
      },
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Average Utilization</div>
          <div className="text-3xl font-bold text-sky-300">{avgUtilization}%</div>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Average OEE</div>
          <div className="text-3xl font-bold text-emerald-300">{avgOEE}%</div>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Active Machines</div>
          <div className="text-3xl font-bold text-violet-300">{data.filter((m) => m.utilization > 0).length}</div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Utilization & OEE by Machine</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
            <XAxis dataKey="machine" stroke="rgba(255,255,255,0.6)" style={{ fontSize: "12px" }} />
            <YAxis stroke="rgba(255,255,255,0.6)" style={{ fontSize: "12px" }} />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ transition: "none" }}
              cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }} />
            <Legend />
            <Bar dataKey="utilization" fill="#3B82F6" name="Utilization %" />
            <Bar dataKey="oee" fill="#10B981" name="OEE %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Machine Details</h3>
        <DataTable
          columns={columns}
          data={data}
          rowKey={(m) => m.machine}
        />
      </div>
    </div>
  );
};

const ChangeoverReport: React.FC<{ data: ChangeoverRow[] }> = ({ data }) => {
  const totalChangeovers = data.reduce((sum, m) => sum + m.changeoverCount, 0);
  const totalLoss = data.reduce((sum, m) => sum + m.productionLoss, 0);
  const avgChangeover = Math.round(data.reduce((sum, m) => sum + m.avgChangeover, 0) / data.length);

  const columns = [
    {
      key: "machine",
      label: "Machine",
    },
    {
      key: "avgChangeover",
      label: "Avg Time",
      align: "right",
      render: (m: ChangeoverRow) => <span>{m.avgChangeover} min</span>,
    },
    {
      key: "changeoverCount",
      label: "Count",
      align: "right",
    },
    {
      key: "productionLoss",
      label: "Total Loss",
      align: "right",
      render: (m: ChangeoverRow) => (
        <span className="text-rose-300 font-medium">{m.productionLoss} min</span>
      ),
    },
    {
      key: "impact",
      label: "Impact",
      align: "right",
      render: (m: ChangeoverRow) => {
        const label =
          m.productionLoss > 400
            ? "High"
            : m.productionLoss > 300
              ? "Medium"
              : "Low";

        const style =
          m.productionLoss > 400
            ? "status-error"
            : m.productionLoss > 300
              ? "status-inactive"
              : "bg-emerald-500/15 text-emerald-300 border-emerald-400/20";

        return <span className={`chip ${style}`}>{label}</span>;
      },
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Avg Changeover Time</div>
          <div className="text-3xl font-bold text-amber-300">{avgChangeover} min</div>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Total Changeovers</div>
          <div className="text-3xl font-bold text-sky-300">{totalChangeovers}</div>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Production Loss</div>
          <div className="text-3xl font-bold text-rose-300">{totalLoss} min</div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Changeover Analysis by Machine</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
            <XAxis dataKey="machine" stroke="rgba(255,255,255,0.6)" style={{ fontSize: "12px" }} />
            <YAxis stroke="rgba(255,255,255,0.6)" style={{ fontSize: "12px" }} />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ transition: "none" }}
              cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }} />

            <Legend />
            <Bar dataKey="avgChangeover" fill="#F59E0B" name="Avg Changeover (min)" />
            <Bar dataKey="changeoverCount" fill="#3B82F6" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ✅ Table with DataTable */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Machine Changeover Details</h3>
        <DataTable
          columns={columns}
          data={data}
          rowKey={(row) => row.machine}
        />
      </div>
    </div>
  );
};

const LateOrdersReport: React.FC<{ data: LateOrderRow[] }> = ({ data }) => {
  const totalDaysLate = data.reduce((sum, o) => sum + o.daysLate, 0);
  const avgDaysLate = Math.round((totalDaysLate / data.length) * 10) / 10;

  const columns = [
    {
      key: "orderNo",
      label: "Order",
    },
    {
      key: "customer",
      label: "Customer",
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (o: LateOrderRow) => new Date(o.dueDate).toLocaleDateString(),
    },
    {
      key: "completedDate",
      label: "Completed",
      render: (o: LateOrderRow) => new Date(o.completedDate).toLocaleDateString(),
    },
    {
      key: "daysLate",
      label: "Days Late",
      align: "right",
      render: (o: LateOrderRow) => (
        <span className="text-rose-300 font-medium">
          {o.daysLate} day{o.daysLate !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      align: "center",
      render: (o: LateOrderRow) => {
        const style =
          o.priority === 1
            ? "status-error"
            : o.priority === 2
              ? "status-inactive"
              : "bg-emerald-500/15 text-emerald-300 border-emerald-400/20";

        return <span className={`chip ${style}`}>P{o.priority}</span>;
      },
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Late Orders</div>
          <div className="text-3xl font-bold text-rose-300">{data.length}</div>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Avg Days Late</div>
          <div className="text-3xl font-bold text-amber-300">{avgDaysLate}</div>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Priority 1 Late</div>
          <div className="text-3xl font-bold text-yellow-200">
            {data.filter((o) => o.priority === 1).length}
          </div>
        </div>
      </div>

      {/* ✅ Table with DataTable */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Late Order Details</h3>
        <DataTable
          columns={columns}
          data={data}
          rowKey={(row) => row.orderNo}
        />
      </div>
    </div>
  );
};

const LeadTimeReport: React.FC<{ data: LeadTimeRow[] }> = ({ data }) => {
  const avgLeadTime = Math.round(data.reduce((sum, p) => sum + p.avgLeadTime, 0) / data.length);
  const onTarget = data.filter((p) => p.avgLeadTime <= p.targetLeadTime).length;
  const onTargetPercentage = Math.round((onTarget / data.length) * 100);
  const totalOrders = data.reduce((sum, p) => sum + p.orders, 0);

  const columns = [
    {
      key: "product",
      label: "Product",
    },
    {
      key: "avgLeadTime",
      label: "Avg Lead Time",
      align: "right",
      render: (p: LeadTimeRow) => `${p.avgLeadTime} min`,
    },
    {
      key: "targetLeadTime",
      label: "Target",
      align: "right",
      render: (p: LeadTimeRow) => `${p.targetLeadTime} min`,
    },
    {
      key: "variance",
      label: "Variance",
      align: "right",
      render: (p: LeadTimeRow) => {
        const variance = p.avgLeadTime - p.targetLeadTime;
        const sign = variance > 0 ? "+" : "";
        return (
          <span className={`font-medium ${variance > 0 ? "text-rose-300" : "text-emerald-300"}`}>
            {sign}
            {variance} min
          </span>
        );
      },
    },
    {
      key: "orders",
      label: "Orders",
      align: "right",
    },
    {
      key: "status",
      label: "Status",
      align: "right",
      render: (p: LeadTimeRow) => {
        const variance = p.avgLeadTime - p.targetLeadTime;
        let statusLabel = "On Target";
        let statusClass =
          "bg-emerald-500/15 text-emerald-300 border-emerald-400/20";

        if (variance > 0 && variance <= 20) {
          statusLabel = "Slightly Over";
          statusClass = "status-inactive";
        } else if (variance > 20) {
          statusLabel = "Over Target";
          statusClass = "status-error";
        }

        return <span className={`chip ${statusClass}`}>{statusLabel}</span>;
      },
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Avg Lead Time</div>
          <div className="text-3xl font-bold text-sky-300">{avgLeadTime} min</div>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">On-Target Rate</div>
          <div className="text-3xl font-bold text-emerald-300">{onTargetPercentage}%</div>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Total Orders</div>
          <div className="text-3xl font-bold text-violet-300">{totalOrders}</div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Lead Time vs Target by Product
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
            <XAxis
              dataKey="product"
              stroke="rgba(255,255,255,0.6)"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="rgba(255,255,255,0.6)" style={{ fontSize: "12px" }} />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ transition: "none" }}
              cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }} />

            <Legend />
            <Bar
              dataKey="targetLeadTime"
              fill="#94A3B8"
              name="Target Lead Time (min)"
            />
            <Bar
              dataKey="avgLeadTime"
              fill="#3B82F6"
              name="Actual Lead Time (min)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ✅ DataTable */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Product Lead Time Analysis</h3>
        <DataTable
          columns={columns}
          data={data}
          rowKey={(p) => p.product}
        />
      </div>
    </div>
  );
};

const DowntimeReport: React.FC<{ data: DowntimeReasonRow[] }> = ({ data }) => {
  const totalDowntime = data.reduce((sum, r) => sum + r.duration, 0);
  const totalIncidents = data.reduce((sum, r) => sum + r.count, 0);
  const avgDowntime = Math.round(totalDowntime / totalIncidents);

  const columns = [
    {
      key: "reason",
      label: "Reason",
      render: (row: DowntimeReasonRow) => (
        <div className="flex items-center gap-2">
          {/* ไม่สามารถใช้ index ได้ตรงนี้ เลยใช้แค่ row */}
          {/* ถ้าต้องการสีที่วนซ้ำ อาจต้องเปลี่ยน data structure หรือ generate สีล่วงหน้า */}
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[0] }} />
          {row.reason}
        </div>
      ),
    },
    {
      key: "duration",
      label: "Duration",
      align: "right",
      render: (row: DowntimeReasonRow) => `${row.duration} min`,
    },
    {
      key: "count",
      label: "Incidents",
      align: "right",
    },
    {
      key: "percentage",
      label: "Percentage",
      align: "right",
      render: (row: DowntimeReasonRow) => `${row.percentage}%`,
    },
    {
      key: "priority",
      label: "Priority",
      align: "right",
      render: (row: DowntimeReasonRow) => {
        let label = "Low";
        let cls = "bg-emerald-500/15 text-emerald-300 border-emerald-400/20";

        if (row.percentage >= 30) {
          label = "High";
          cls = "status-error";
        } else if (row.percentage >= 20) {
          label = "Medium";
          cls = "status-inactive";
        }

        return <span className={`chip ${cls}`}>{label}</span>;
      },
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Total Downtime</div>
          <div className="text-3xl font-bold text-rose-300">{totalDowntime} min</div>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Total Incidents</div>
          <div className="text-3xl font-bold text-amber-300">{totalIncidents}</div>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Avg per Incident</div>
          <div className="text-3xl font-bold text-sky-300">{avgDowntime} min</div>
        </div>
      </div>

      {/* Pie & Bar Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Downtime by Reason</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                dataKey="percentage"
                nameKey="reason"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(e) => `${e.percentage}%`}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ transition: "none" }}
                cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Duration by Reason</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.6)" style={{ fontSize: "12px" }} />
              <YAxis
                dataKey="reason"
                type="category"
                stroke="rgba(255,255,255,0.6)"
                style={{ fontSize: "11px" }}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ transition: "none" }}
                cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }} />

              <Bar dataKey="duration" fill="#EF4444" name="Duration (min)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ✅ DataTable */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Downtime Breakdown</h3>
        <DataTable
          columns={columns}
          data={data}
          rowKey={(row) => row.reason}
        />
      </div>
    </div>
  );
};

const OnTimeDeliveryReport: React.FC<{ data: OnTimeDeliveryRow[] }> = ({ data }) => {
  const totalOrders = data.reduce((sum, w) => sum + w.total, 0);
  const totalOnTime = data.reduce((sum, w) => sum + w.onTime, 0);
  const totalLate = totalOrders - totalOnTime;
  const overallPercentage = Math.round((totalOnTime / totalOrders) * 100);

  const columns = [
    {
      key: "week",
      label: "Period",
      render: (row: OnTimeDeliveryRow) => row.week,
    },
    {
      key: "total",
      label: "Total Orders",
      align: "right",
      render: (row: OnTimeDeliveryRow) => row.total,
    },
    {
      key: "onTime",
      label: "On-Time",
      align: "right",
      render: (row: OnTimeDeliveryRow) => (
        <span className="text-emerald-300 font-medium">{row.onTime}</span>
      ),
    },
    {
      key: "late",
      label: "Late",
      align: "right",
      render: (row: OnTimeDeliveryRow) => (
        <span className="text-rose-300 font-medium">{row.late}</span>
      ),
    },
    {
      key: "percentage",
      label: "Performance",
      align: "right",
      render: (row: OnTimeDeliveryRow) => {
        let cls = "status-error";
        if (row.percentage >= 90) {
          cls = "bg-emerald-500/15 text-emerald-300 border-emerald-400/20";
        } else if (row.percentage >= 80) {
          cls = "status-inactive";
        }
        return <span className={`chip ${cls}`}>{row.percentage}%</span>;
      },
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">On-Time Rate</div>
          <div className="text-3xl font-bold text-emerald-300">{overallPercentage}%</div>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Total Orders</div>
          <div className="text-3xl font-bold text-sky-300">{totalOrders}</div>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">On-Time</div>
          <div className="text-3xl font-bold text-violet-300">{totalOnTime}</div>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Late</div>
          <div className="text-3xl font-bold text-rose-300">{totalLate}</div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">On-Time Delivery Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
            <XAxis dataKey="week" stroke="rgba(255,255,255,0.6)" style={{ fontSize: "12px" }} />
            <YAxis stroke="rgba(255,255,255,0.6)" style={{ fontSize: "12px" }} />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ transition: "none" }}
              cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }} />

            <Legend />
            <Bar dataKey="onTime" fill="#10B981" name="On-Time" />
            <Bar dataKey="late" fill="#EF4444" name="Late" />
            <Line type="monotone" dataKey="percentage" stroke="#3B82F6" strokeWidth={2} name="On-Time %" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Breakdown Table */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Weekly Breakdown</h3>
        <DataTable
          columns={columns}
          data={data}
          rowKey={(row) => row.week}
        />
      </div>
    </div>
  );
};

const PlanAdherenceReport: React.FC<{ data: PlanAdherenceRow[] }> = ({ data }) => {
  const avgVariance = Math.round(
    data.reduce((sum, d) => sum + Math.abs(d.variance), 0) / data.length
  );
  const adherenceRate = data.filter((d) => Math.abs(d.variance) <= 2).length;
  const adherencePercentage = Math.round((adherenceRate / data.length) * 100);
  const totalPlanned = data.reduce((sum, d) => sum + d.planned, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Adherence Rate</div>
          <div className="text-3xl font-bold text-emerald-300">{adherencePercentage}%</div>
          <div className="text-xs text-white/70 mt-1">Within ±2 jobs tolerance</div>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Avg Variance</div>
          <div className="text-3xl font-bold text-violet-300">±{avgVariance}</div>
          <div className="text-xs text-white/70 mt-1">jobs per day</div>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-white/70 font-medium mb-1">Total Planned</div>
          <div className="text-3xl font-bold text-sky-300">{totalPlanned}</div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Planned vs Actual Jobs</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" style={{ fontSize: "12px" }} />
            <YAxis stroke="rgba(255,255,255,0.6)" style={{ fontSize: "12px" }} />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ transition: "none" }}
              cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }} />

            <Legend />
            <Bar dataKey="planned" fill="#3B82F6" name="Planned Jobs" />
            <Bar dataKey="actual" fill="#10B981" name="Actual Jobs" />
            <Line type="monotone" dataKey="variance" stroke="#EF4444" strokeWidth={2} name="Variance" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const BottleneckReport: React.FC<{ data: BottleneckRow[] }> = ({ data }) => {
  const topBottleneck = data.reduce<BottleneckRow>(
    (max, p) => (p.avgWaitTime > max.avgWaitTime ? p : max),
    data[0]
  );

  const columns = [
    {
      key: "process",
      label: "Process",
      render: (row: BottleneckRow) => row.process,
    },
    {
      key: "avgWaitTime",
      label: "Avg Wait Time",
      align: "right",
      render: (row: BottleneckRow) => `${row.avgWaitTime} min`,
    },
    {
      key: "throughput",
      label: "Throughput",
      align: "right",
      render: (row: BottleneckRow) => row.throughput,
    },
    {
      key: "utilization",
      label: "Utilization",
      align: "right",
      render: (row: BottleneckRow) => `${row.utilization}%`,
    },
    {
      key: "priority",
      label: "Priority",
      align: "right",
      render: (row: BottleneckRow) => {
        let cls = "status-error";
        let label = "High";
        if (row.avgWaitTime < 30) {
          cls = "bg-emerald-500/15 text-emerald-300 border-emerald-400/20";
          label = "Low";
        } else if (row.avgWaitTime < 60) {
          cls = "status-inactive";
          label = "Medium";
        }
        return <span className={`chip ${cls}`}>{label}</span>;
      },
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="p-4 rounded-lg border border-rose-400/20 bg-rose-500/10">
        <div className="flex items-start gap-3">
          <AlertTriangle size={24} className="text-rose-300 flex-shrink-0 mt-1" />
          <div>
            <div className="font-semibold text-rose-200 mb-1">Primary Bottleneck Identified</div>
            <div className="text-sm text-rose-100">
              <strong>{topBottleneck.process}</strong> has the highest average wait time of{" "}
              <strong>{topBottleneck.avgWaitTime} minutes</strong> with {topBottleneck.utilization}% utilization
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Average Wait Time by Process</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.6)" style={{ fontSize: "12px" }} />
            <YAxis
              dataKey="process"
              type="category"
              stroke="rgba(255,255,255,0.6)"
              style={{ fontSize: "12px" }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ transition: "none" }}
              cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }} />
            <Bar dataKey="avgWaitTime" fill="#EF4444" name="Avg Wait Time (min)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Process Analysis</h3>
        <DataTable
          columns={columns}
          data={data}
          rowKey={(row) => row.process}
        />
      </div>
    </div>
  );
};

export default ProductionReports;
