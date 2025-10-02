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
    {
      orderNo: "ORD018",
      customer: "XYZ Ltd",
      dueDate: "2025-09-28",
      completedDate: "2025-09-30",
      daysLate: 2,
      priority: 1,
    },
    {
      orderNo: "ORD009",
      customer: "Global Co",
      dueDate: "2025-09-29",
      completedDate: "2025-10-01",
      daysLate: 2,
      priority: 1,
    },
    {
      orderNo: "ORD012",
      customer: "Tech Inc",
      dueDate: "2025-09-27",
      completedDate: "2025-09-29",
      daysLate: 2,
      priority: 2,
    },
    {
      orderNo: "ORD015",
      customer: "ABC Corp",
      dueDate: "2025-09-30",
      completedDate: "2025-10-01",
      daysLate: 1,
      priority: 1,
    },
    {
      orderNo: "ORD021",
      customer: "Industrial Partners",
      dueDate: "2025-09-26",
      completedDate: "2025-09-28",
      daysLate: 2,
      priority: 3,
    },
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

const COLORS: string[] = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Production Reports
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Analytics and insights for production performance
                </p>
              </div>
              <div className="flex gap-3">
                <select
                  value={dateRange}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setDateRange(e.target.value as DateRange)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
                <button
                  onClick={() => handleExport("PDF")}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download size={18} />
                  Export PDF
                </button>
                <button
                  onClick={() => handleExport("Excel")}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download size={18} />
                  Export Excel
                </button>
              </div>
            </div>
          </div>
        }
      />

      <div className="flex">
        {/* Sidebar - Report List */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex overflow-x-auto px-4 py-2 gap-2">
            {["Performance", "Planning", "Efficiency", "Optimization", "Maintenance"].map(
              (category) => (
                <div key={category} className="flex flex-col">
                  <span className="text-sm font-semibold">{category}</span>
                  <div className="flex gap-2 mt-1">
                    {REPORT_TYPES.filter((r) => r.category === (category as ReportCategory)).map(
                      (report) => (
                        <button
                          key={report.id}
                          onClick={() => setSelectedReport(report.id)}
                          className={`px-3 py-1 rounded text-sm ${
                            selectedReport === report.id
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {report.name}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Report Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {SelectedIcon && (
                    <SelectedIcon size={24} className="text-blue-600" />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedReportInfo?.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Period:{" "}
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
                  <button className="p-2 hover:bg-gray-100 rounded" title="Print">
                    <Printer size={18} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded" title="Email">
                    <Mail size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div className="p-6">{renderReport()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===================== Report Components ===================== */

const UtilizationReport: React.FC<{ data: UtilizationByMachine[] }> = ({
  data,
}) => {
  const avgUtilization = Math.round(
    data.reduce((sum, m) => sum + m.utilization, 0) / data.length
  );
  const avgOEE = Math.round(data.reduce((sum, m) => sum + m.oee, 0) / data.length);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium mb-1">
            Average Utilization
          </div>
          <div className="text-3xl font-bold text-blue-900">{avgUtilization}%</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium mb-1">Average OEE</div>
          <div className="text-3xl font-bold text-green-900">{avgOEE}%</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600 font-medium mb-1">
            Active Machines
          </div>
          <div className="text-3xl font-bold text-purple-900">
            {data.filter((m) => m.utilization > 0).length}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Utilization & OEE by Machine
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="machine" stroke="#6B7280" style={{ fontSize: "12px" }} />
            <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="utilization" fill="#3B82F6" name="Utilization %" />
            <Bar dataKey="oee" fill="#10B981" name="OEE %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table (แก้ให้ตรงกับโครงสร้าง utilization) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Machine Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Machine
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Planned (min)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actual (min)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Utilization
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  OEE
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((m) => (
                <tr key={m.machine} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {m.machine}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">{m.planned}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">{m.actual}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">{m.utilization}%</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">{m.oee}%</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        m.utilization >= 80
                          ? "bg-green-100 text-green-700"
                          : m.utilization >= 60
                          ? "bg-yellow-100 text-yellow-700"
                          : m.utilization > 0
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {m.utilization >= 80
                        ? "Excellent"
                        : m.utilization >= 60
                        ? "Good"
                        : m.utilization > 0
                        ? "Low"
                        : "Down"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ChangeoverReport: React.FC<{ data: ChangeoverRow[] }> = ({ data }) => {
  const totalChangeovers = data.reduce((sum, m) => sum + m.changeoverCount, 0);
  const totalLoss = data.reduce((sum, m) => sum + m.productionLoss, 0);
  const avgChangeover = Math.round(
    data.reduce((sum, m) => sum + m.avgChangeover, 0) / data.length
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-sm text-orange-600 font-medium mb-1">
            Avg Changeover Time
          </div>
          <div className="text-3xl font-bold text-orange-900">{avgChangeover} min</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium mb-1">Total Changeovers</div>
          <div className="text-3xl font-bold text-blue-900">{totalChangeovers}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-sm text-red-600 font-medium mb-1">Production Loss</div>
          <div className="text-3xl font-bold text-red-900">{totalLoss} min</div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Changeover Analysis by Machine
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="machine" stroke="#6B7280" style={{ fontSize: "12px" }} />
            <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgChangeover" fill="#F59E0B" name="Avg Changeover (min)" />
            <Bar dataKey="changeoverCount" fill="#3B82F6" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Machine Changeover Details
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Machine
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Avg Time
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Count
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total Loss
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Impact
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((machine) => (
                <tr key={machine.machine} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {machine.machine}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {machine.avgChangeover} min
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {machine.changeoverCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                    {machine.productionLoss} min
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        machine.productionLoss > 400
                          ? "bg-red-100 text-red-700"
                          : machine.productionLoss > 300
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {machine.productionLoss > 400
                        ? "High"
                        : machine.productionLoss > 300
                        ? "Medium"
                        : "Low"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const LateOrdersReport: React.FC<{ data: LateOrderRow[] }> = ({ data }) => {
  const totalDaysLate = data.reduce((sum, o) => sum + o.daysLate, 0);
  const avgDaysLate = Math.round((totalDaysLate / data.length) * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-sm text-red-600 font-medium mb-1">Late Orders</div>
          <div className="text-3xl font-bold text-red-900">{data.length}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-sm text-orange-600 font-medium mb-1">
            Avg Days Late
          </div>
          <div className="text-3xl font-bold text-orange-900">{avgDaysLate}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-600 font-medium mb-1">
            Priority 1 Late
          </div>
          <div className="text-3xl font-bold text-yellow-900">
            {data.filter((o) => o.priority === 1).length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Late Order Details
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Completed
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Days Late
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((order) => (
                <tr key={order.orderNo} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {order.orderNo}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{order.customer}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(order.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(order.completedDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className="font-medium text-red-600">
                      {order.daysLate} day{order.daysLate !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        order.priority === 1
                          ? "bg-red-100 text-red-700"
                          : order.priority === 2
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      P{order.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const LeadTimeReport: React.FC<{ data: LeadTimeRow[] }> = ({ data }) => {
  const avgLeadTime = Math.round(
    data.reduce((sum, p) => sum + p.avgLeadTime, 0) / data.length
  );
  const onTarget = data.filter((p) => p.avgLeadTime <= p.targetLeadTime).length;
  const onTargetPercentage = Math.round((onTarget / data.length) * 100);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium mb-1">Avg Lead Time</div>
          <div className="text-3xl font-bold text-blue-900">{avgLeadTime} min</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium mb-1">On-Target Rate</div>
          <div className="text-3xl font-bold text-green-900">
            {onTargetPercentage}%
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600 font-medium mb-1">
            Total Orders
          </div>
          <div className="text-3xl font-bold text-purple-900">
            {data.reduce((sum, p) => sum + p.orders, 0)}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Lead Time vs Target by Product
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="product" stroke="#6B7280" style={{ fontSize: "12px" }} />
            <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="targetLeadTime" fill="#94A3B8" name="Target Lead Time (min)" />
            <Bar dataKey="avgLeadTime" fill="#3B82F6" name="Actual Lead Time (min)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Product Lead Time Analysis
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Avg Lead Time
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Target
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Variance
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Orders
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((product) => {
                const variance = product.avgLeadTime - product.targetLeadTime;
                return (
                  <tr key={product.product} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {product.product}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {product.avgLeadTime} min
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {product.targetLeadTime} min
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span
                        className={`font-medium ${
                          variance > 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {variance > 0 ? "+" : ""}
                        {variance} min
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {product.orders}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          variance <= 0
                            ? "bg-green-100 text-green-700"
                            : variance <= 20
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {variance <= 0
                          ? "On Target"
                          : variance <= 20
                          ? "Slightly Over"
                          : "Over Target"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DowntimeReport: React.FC<{ data: DowntimeReasonRow[] }> = ({ data }) => {
  const totalDowntime = data.reduce((sum, r) => sum + r.duration, 0);
  const totalIncidents = data.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-sm text-red-600 font-medium mb-1">Total Downtime</div>
          <div className="text-3xl font-bold text-red-900">{totalDowntime} min</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-sm text-orange-600 font-medium mb-1">Total Incidents</div>
          <div className="text-3xl font-bold text-orange-900">{totalIncidents}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-600 font-medium mb-1">
            Avg per Incident
          </div>
          <div className="text-3xl font-bold text-yellow-900">
            {Math.round(totalDowntime / totalIncidents)} min
          </div>
        </div>
      </div>

      {/* Pie & Bar */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Downtime by Reason
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                dataKey="percentage"
                nameKey="reason"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.percentage}%`}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Duration by Reason
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" style={{ fontSize: "12px" }} />
              <YAxis
                dataKey="reason"
                type="category"
                stroke="#6B7280"
                style={{ fontSize: "11px" }}
                width={120}
              />
              <Tooltip />
              <Bar dataKey="duration" fill="#EF4444" name="Duration (min)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Downtime Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reason
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Duration
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Incidents
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Percentage
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((reason, index) => (
                <tr key={reason.reason} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {reason.reason}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {reason.duration} min
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {reason.count}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                    {reason.percentage}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        reason.percentage >= 30
                          ? "bg-red-100 text-red-700"
                          : reason.percentage >= 20
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {reason.percentage >= 30
                        ? "High"
                        : reason.percentage >= 20
                        ? "Medium"
                        : "Low"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const OnTimeDeliveryReport: React.FC<{ data: OnTimeDeliveryRow[] }> = ({
  data,
}) => {
  const totalOrders = data.reduce((sum, w) => sum + w.total, 0);
  const totalOnTime = data.reduce((sum, w) => sum + w.onTime, 0);
  const overallPercentage = Math.round((totalOnTime / totalOrders) * 100);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium mb-1">On-Time Rate</div>
          <div className="text-3xl font-bold text-green-900">{overallPercentage}%</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium mb-1">Total Orders</div>
          <div className="text-3xl font-bold text-blue-900">{totalOrders}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600 font-medium mb-1">On-Time</div>
          <div className="text-3xl font-bold text-purple-900">{totalOnTime}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-sm text-red-600 font-medium mb-1">Late</div>
          <div className="text-3xl font-bold text-red-900">
            {totalOrders - totalOnTime}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          On-Time Delivery Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="week" stroke="#6B7280" style={{ fontSize: "12px" }} />
            <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="onTime" fill="#10B981" name="On-Time" />
            <Bar dataKey="late" fill="#EF4444" name="Late" />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="#3B82F6"
              strokeWidth={2}
              name="On-Time %"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Weekly Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Period
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total Orders
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  On-Time
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Late
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((week) => (
                <tr key={week.week} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {week.week}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {week.total}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                    {week.onTime}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                    {week.late}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        week.percentage >= 90
                          ? "bg-green-100 text-green-700"
                          : week.percentage >= 80
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {week.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PlanAdherenceReport: React.FC<{ data: PlanAdherenceRow[] }> = ({
  data,
}) => {
  const avgVariance = Math.round(
    data.reduce((sum, d) => sum + Math.abs(d.variance), 0) / data.length
  );
  const adherenceRate = data.filter((d) => Math.abs(d.variance) <= 2).length;
  const adherencePercentage = Math.round((adherenceRate / data.length) * 100);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium mb-1">Adherence Rate</div>
          <div className="text-3xl font-bold text-blue-900">
            {adherencePercentage}%
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Within ±2 jobs tolerance
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600 font-medium mb-1">Avg Variance</div>
          <div className="text-3xl font-bold text-purple-900">±{avgVariance}</div>
          <div className="text-xs text-purple-600 mt-1">jobs per day</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium mb-1">Total Planned</div>
          <div className="text-3xl font-bold text-green-900">
            {data.reduce((sum, d) => sum + d.planned, 0)}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Planned vs Actual Jobs
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: "12px" }} />
            <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="planned" fill="#3B82F6" name="Planned Jobs" />
            <Bar dataKey="actual" fill="#10B981" name="Actual Jobs" />
            <Line
              type="monotone"
              dataKey="variance"
              stroke="#EF4444"
              strokeWidth={2}
              name="Variance"
            />
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

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="flex items-start gap-3">
          <AlertTriangle size={24} className="text-red-600 flex-shrink-0 mt-1" />
          <div>
            <div className="font-semibold text-red-900 mb-1">
              Primary Bottleneck Identified
            </div>
            <div className="text-sm text-red-800">
              <strong>{topBottleneck.process}</strong> has the highest average wait
              time of <strong>{topBottleneck.avgWaitTime} minutes</strong> with{" "}
              {topBottleneck.utilization}% utilization
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Average Wait Time by Process
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" stroke="#6B7280" style={{ fontSize: "12px" }} />
            <YAxis
              dataKey="process"
              type="category"
              stroke="#6B7280"
              style={{ fontSize: "12px" }}
              width={100}
            />
            <Tooltip />
            <Bar dataKey="avgWaitTime" fill="#EF4444" name="Avg Wait Time (min)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table (ให้สอดคล้องกับ bottleneck data) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Process Analysis
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Process
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Avg Wait Time
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Throughput
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Utilization
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((p) => (
                <tr key={p.process} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {p.process}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {p.avgWaitTime} min
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {p.throughput}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {p.utilization}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        p.avgWaitTime >= 60
                          ? "bg-red-100 text-red-700"
                          : p.avgWaitTime >= 30
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {p.avgWaitTime >= 60
                        ? "High"
                        : p.avgWaitTime >= 30
                        ? "Medium"
                        : "Low"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductionReports;