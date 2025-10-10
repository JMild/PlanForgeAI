"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle,
  Package, Calendar, Wrench, Activity,
  BarChart3, PieChart, Zap, Play, Pause, AlertCircle
} from "lucide-react";
import {
  LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

import { getDashboard } from "@/src/lib/api";
import PageHeader from "@/src/components/layout/PageHeader";

/* ===== Types ===== */
interface Kpis {
  utilizationRate: number;
  utilizationTrend: number;
  onTimeDelivery: number;
  onTimeTrend: number;
  throughput: number;
  throughputTrend: number;
  lateOrders: number;
  lateTrend: number;
}
interface OrderStatus { unplanned: number; planned: number; inProgress: number; completed: number; late: number; }
interface MachineStatus {
  code: string; name: string; status: "Running" | "Idle" | "Down" | string;
  utilization: number; currentJob: string | null; timeRemaining: number; downReason?: string;
}
interface UtilizationTrend { date: string; utilization: number; }
interface WorkCenterUtilization { name: string; utilization: number; }
interface UpcomingMaintenance { machine: string; name: string; type: string; scheduledDate: string; duration: number; status: string; }
interface CriticalOrder { orderNo: string; customer: string; dueDate: string; status: string; completion: number; priority: number; }
interface RecentAlert { time: string; type: "warning" | "error" | "info"; message: string; }
interface DashboardData {
  kpis: Kpis;
  orderStatus: OrderStatus;
  machineStatus: MachineStatus[];
  utilizationTrend: UtilizationTrend[];
  workCenterUtilization: WorkCenterUtilization[];
  upcomingMaintenance: UpcomingMaintenance[];
  criticalOrders: CriticalOrder[];
  recentAlerts: RecentAlert[];
}

type AlertType = "error" | "warning" | "info";

interface Alert {
  id: string;
  message: string;
  type: AlertType;
  [key: string]: unknown;
}

/* ===== Colors (Recharts/tooltip) ===== */
const COLORS = {
  primary: "#22d3ee", 
  success: "#10b981", 
  warning: "#f59e0b", 
  danger: "#ef4444", 
  info: "#0ea5e9", 
  axis: "rgba(255,255,255,0.75)",
  grid: "rgba(255,255,255,0.12)",
  dot: "rgba(34,211,238,0.9)",
  tooltipBg: "rgba(2,6,23,0.92)",
  tooltipBd: "rgba(34,211,238,0.35)",
  tooltipTx: "#ffffff",
};
const PIE_COLORS = ["#22d3ee", "#14b8a6", "#0ea5e9", "#f59e0b", "#ef4444"];

/* ===== Small UI helpers ===== */
const trendPill = (trend: number) => {
  const up = trend > 0;
  const cls =
    (up ? "text-emerald-300 bg-emerald-500/10 border-emerald-400/30" : "text-rose-300 bg-rose-500/10 border-rose-400/30")
    + " chip inline-flex items-center gap-1 border";
  return (
    <span className={cls} aria-label={`${up ? "Up" : "Down"} ${Math.abs(trend)}%`}>
      {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {Math.abs(trend)}%
    </span>
  );
};

const getStatusChip = (status: string) => {
  if (status === "Late")
    return "chip bg-rose-500/15 text-rose-200 border border-rose-400/30";
  if (status === "In Progress")
    return "chip bg-cyan-500/15 text-cyan-200 border border-cyan-400/30";
  return "chip bg-emerald-500/15 text-emerald-200 border border-emerald-400/30";
};

const getAlertStyle = (type: Alert["type"]) =>
  type === "error" ? "border-l-2 border-rose-400 bg-rose-500/5"
    : type === "warning" ? "border-l-2 border-amber-400 bg-amber-500/5"
      : "border-l-2 border-cyan-400 bg-cyan-500/5";

/* ===== Skeleton while loading ===== */
const LoadingSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass-card h-28" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="glass-card h-72 lg:col-span-2" />
      <div className="glass-card h-72" />
    </div>
    <div className="glass-card h-96" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="glass-card h-80" />
      <div className="glass-card h-80" />
      <div className="glass-card h-80" />
    </div>
  </div>
);

/* ===== Main Component ===== */
const ProductionDashboard = () => {
  // const [timeRange, setTimeRange] = useState("week");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDashboard();

      const normalizedAlerts: RecentAlert[] = data.recentAlerts.map((a) => ({
        time: a.time,
        message: a.message,
        type: (a.type || "info").toLowerCase() as AlertType,
      }));

      setDashboardData({ ...data, recentAlerts: normalizedAlerts });
    };
    fetchData();
  }, []);

  /* ——— Loading ——— */
  if (!dashboardData) return <LoadingSkeleton />;

  /* ——— Helpers ——— */
  const getStatusColor = (status: MachineStatus["status"]): string => {
    switch (status) {
      case "Running": return "bg-emerald-500";
      case "Idle": return "bg-amber-500";
      case "Down": return "bg-rose-500 alarm-blink";
      default: return "bg-white/30";
    }
  };
  const getStatusIcon = (status: MachineStatus["status"]) => {
    switch (status) {
      case "Running": return <Play size={16} className="text-white" />;
      case "Idle": return <Pause size={16} className="text-white" />;
      case "Down": return <AlertCircle size={16} className="text-white" />;
      default: return null;
    }
  };
  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "error": return <AlertCircle size={14} className="text-rose-400" />;
      case "warning": return <AlertTriangle size={14} className="text-amber-400" />;
      case "info": return <CheckCircle size={14} className="text-cyan-300" />;
      default: return null;
    }
  };

  const orderStatusData = [
    { name: "Unplanned", value: dashboardData.orderStatus.unplanned },
    { name: "Planned", value: dashboardData.orderStatus.planned },
    { name: "In Progress", value: dashboardData.orderStatus.inProgress },
    { name: "Completed", value: dashboardData.orderStatus.completed },
    { name: "Late", value: dashboardData.orderStatus.late },
  ];
  const totalOrders = orderStatusData.reduce((s, v) => s + v.value, 0) || 1;

  return (
    <div>
      {/* Header */}
      <PageHeader
        title={
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white">Production Dashboard</h1>
            <p className="text-sm text-white/70 mt-1">Real-time overview of production operations</p>
          </div>
        }
        actions={
          <div className="flex items-center gap-3 flex-row-reverse">
            {/* <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="glass-input min-w-[140px]"
              aria-label="Select time range"
            >
              <option className="select option" value="today">Today</option>
              <option className="select option" value="week">This Week</option>
              <option className="select option" value="month">This Month</option>
            </select> */}

            <button type="button" className="btn btn-primary whitespace-nowrap">
              <Zap size={18} />
              Go to Planner
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card glass-card-default-padding kpi-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">Utilization Rate</span>
              <Activity size={20} className="text-cyan-300" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-white">{dashboardData.kpis.utilizationRate}%</span>
              {trendPill(dashboardData.kpis.utilizationTrend)}
            </div>
            <p className="text-xs text-white/60 mt-2">vs last period</p>
          </div>

          <div className="glass-card glass-card-default-padding kpi-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">On-Time Delivery</span>
              <CheckCircle size={20} className="text-emerald-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-white">{dashboardData.kpis.onTimeDelivery}%</span>
              {trendPill(dashboardData.kpis.onTimeTrend)}
            </div>
            <p className="text-xs text-white/60 mt-2">vs last period</p>
          </div>

          <div className="glass-card glass-card-default-padding kpi-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">Throughput</span>
              <Package size={20} className="text-sky-300" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-white">{dashboardData.kpis.throughput}</span>
              {trendPill(dashboardData.kpis.throughputTrend)}
            </div>
            <p className="text-xs text-white/60 mt-2">units this week</p>
          </div>

          <div className="glass-card glass-card-default-padding kpi-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">Late Orders</span>
              <AlertTriangle size={20} className="text-rose-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-white">{dashboardData.kpis.lateOrders}</span>
              {/* lateTrend: น้อยลง = ดี -> ใช้สีเขียว */}
              {trendPill(dashboardData.kpis.lateTrend * -1)}
            </div>
            <p className="text-xs text-white/60 mt-2">vs last period</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Utilization Trend */}
          <div className="glass-card glass-card-default-padding lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={20} className="text-white/80" />
                <h2 className="text-lg font-semibold text-white">Utilization Trend</h2>
              </div>
              {/* <span className="chip bg-white/10 text-white border border-white/15 text-xs">Range: {timeRange}</span> */}
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={dashboardData.utilizationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                <XAxis dataKey="date" stroke={COLORS.axis} tick={{ fontSize: 12 }} />
                <YAxis stroke={COLORS.axis} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: COLORS.tooltipBg, border: `1px solid ${COLORS.tooltipBd}`, color: COLORS.tooltipTx }}
                  labelStyle={{ color: COLORS.tooltipTx }}
                />
                <Line
                  type="monotone"
                  dataKey="utilization"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  dot={{ fill: COLORS.dot }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status */}
          <div className="glass-card glass-card-default-padding">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Order Status</h2>
              <PieChart size={20} className="text-white/80" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {orderStatusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: COLORS.tooltipBg, border: `1px solid ${COLORS.tooltipBd}`, color: COLORS.tooltipTx }}
                  labelStyle={{ color: COLORS.tooltipTx }}
                />
              </RePieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {orderStatusData.map((item, idx) => {
                const pct = Math.round((item.value / totalOrders) * 100);
                return (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: PIE_COLORS[idx] }} />
                      <span className="text-white/80">{item.name}</span>
                    </div>
                    <span className="font-semibold text-white">
                      {item.value} <span className="text-white/60">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Machine Status & Work Center Utilization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Machine Status Grid */}
          <div className="glass-card glass-card-default-padding lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Machine Status</h2>
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-white/75">Running</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-white/75">Idle</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-white/75">Down</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {dashboardData.machineStatus.map((machine) => (
                <div key={machine.code} className="glass-card glass-card-default-padding">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-white truncate">{machine.code}</span>
                    <div className={`w-6 h-6 rounded-full ${getStatusColor(machine.status)} grid place-items-center`}>
                      {getStatusIcon(machine.status)}
                    </div>
                  </div>
                  <p className="text-xs text-white/75 truncate mb-2">{machine.name}</p>

                  {machine.status === "Running" && (
                    <>
                      <div className="text-xs font-medium text-cyan-300 mb-1 truncate">{machine.currentJob}</div>
                      <div className="flex items-center gap-1 text-xs text-white/70">
                        <Clock size={10} />
                        {machine.timeRemaining}m left
                      </div>
                    </>
                  )}
                  {machine.status === "Down" && (
                    <div className="text-xs text-rose-300 font-medium truncate">{machine.downReason}</div>
                  )}
                  {machine.status === "Idle" && (
                    <div className="text-xs text-white/75">Available</div>
                  )}

                  <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/70">Utilization</span>
                      <span className="font-semibold text-white">{machine.utilization}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
                      <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${machine.utilization}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work Centers */}
          <div className="glass-card glass-card-default-padding">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Work Centers</h2>
              <BarChart3 size={20} className="text-white/80" />
            </div>
            <div className="space-y-4">
              {dashboardData.workCenterUtilization.map((wc) => (
                <div key={wc.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-white/80">{wc.name}</span>
                    <span className="text-sm font-semibold text-white">{wc.utilization}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${wc.utilization >= 80 ? "bg-emerald-500"
                        : wc.utilization >= 60 ? "bg-cyan-500"
                          : wc.utilization >= 40 ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                      style={{ width: `${wc.utilization}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: Critical Orders, Maintenance, Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Critical Orders */}
          <div className="glass-card glass-card-default-padding">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Critical Orders</h2>
              <Calendar size={20} className="text-white/80" />
            </div>
            <div className="space-y-3">
              {dashboardData.criticalOrders.map((order) => (
                <div key={order.orderNo} className="glass-card glass-card-default-padding">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-white">{order.orderNo}</span>
                    <span className={getStatusChip(order.status)}>{order.status}</span>
                  </div>
                  <p className="text-xs text-white/75 mb-2">{order.customer}</p>
                  <div className="flex items-center justify-between text-xs text-white/70 mb-2">
                    <span>Due: {new Date(order.dueDate).toLocaleDateString()}</span>
                    <span className="font-medium">{order.completion}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${order.status === "Late" ? "bg-rose-500" : "bg-cyan-500"}`}
                      style={{ width: `${order.completion}%` }}
                    />
                  </div>
                </div>
              ))}
              {dashboardData.criticalOrders.length === 0 && (
                <div className="text-sm text-white/60">No critical orders</div>
              )}
            </div>
          </div>

          {/* Upcoming Maintenance */}
          <div className="glass-card glass-card-default-padding">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Maintenance</h2>
              <Wrench size={20} className="text-white/80" />
            </div>
            <div className="space-y-3">
              {dashboardData.upcomingMaintenance.map((pm, idx) => (
                <div key={idx} className="glass-card glass-card-default-padding">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-white">{pm.machine}</span>
                    <span className={pm.status === "In Progress"
                      ? "chip bg-amber-500/15 text-amber-200 border border-amber-400/30"
                      : "chip bg-cyan-500/15 text-cyan-200 border border-cyan-400/30"}>
                      {pm.status}
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mb-1">{pm.name}</p>
                  <p className="text-xs text-white/70 mb-1">{pm.type}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">
                      {new Date(pm.scheduledDate).toLocaleDateString()}
                    </span>
                    <span className="text-white font-medium">{pm.duration} min</span>
                  </div>
                </div>
              ))}
              {dashboardData.upcomingMaintenance.length === 0 && (
                <div className="text-sm text-white/60">No upcoming maintenance</div>
              )}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="glass-card glass-card-default-padding">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Alerts</h2>
              <AlertTriangle size={20} className="text-white/80" />
            </div>
            <div className="space-y-3">
              {dashboardData.recentAlerts.map((alert, idx) => (
                <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${getAlertStyle(alert.type)}`}>
                  <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white">{alert.message}</p>
                    <p className="text-xs text-white/70 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
              {dashboardData.recentAlerts.length === 0 && (
                <div className="text-sm text-white/60">No recent alerts</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;
