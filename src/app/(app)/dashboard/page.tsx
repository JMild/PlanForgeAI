"use client";

import React, { useEffect, useState } from 'react';
import {
  TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle,
  Package, Calendar, Users, Wrench, Activity, ArrowRight,
  BarChart3, PieChart, Zap, Play, Pause, AlertCircle
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { getDashboard } from '@/src/lib/api';
import PageHeader from '@/src/components/layout/PageHeader';

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#6366F1',
  gray: '#6B7280',
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const ProductionDashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDashboard();
      setDashboardData(data);
    };
    fetchData();
  }, []);

  if (!dashboardData) {
    return <div className="p-6">Loading...</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Running': return 'bg-green-500';
      case 'Idle': return 'bg-yellow-500';
      case 'Down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Running': return <Play size={16} className="text-white" />;
      case 'Idle': return <Pause size={16} className="text-white" />;
      case 'Down': return <AlertCircle size={16} className="text-white" />;
      default: return null;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <AlertCircle size={14} className="text-red-600" />;
      case 'warning': return <AlertTriangle size={14} className="text-yellow-600" />;
      case 'info': return <CheckCircle size={14} className="text-blue-600" />;
      default: return null;
    }
  };

  const orderStatusData = [
    { name: 'Unplanned', value: dashboardData.orderStatus.unplanned },
    { name: 'Planned', value: dashboardData.orderStatus.planned },
    { name: 'In Progress', value: dashboardData.orderStatus.inProgress },
    { name: 'Completed', value: dashboardData.orderStatus.completed },
    { name: 'Late', value: dashboardData.orderStatus.late },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader title={
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Production Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Real-time overview of production operations</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Zap size={18} />
                Go to Planner
              </button>
            </div>
          </div>
        </div>
      }/>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Utilization Rate</span>
              <Activity size={20} className="text-blue-600" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">{dashboardData.kpis.utilizationRate}%</span>
              <span className={`flex items-center text-sm font-medium mb-1 ${dashboardData.kpis.utilizationTrend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                {dashboardData.kpis.utilizationTrend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(dashboardData.kpis.utilizationTrend)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">vs last period</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">On-Time Delivery</span>
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">{dashboardData.kpis.onTimeDelivery}%</span>
              <span className={`flex items-center text-sm font-medium mb-1 ${dashboardData.kpis.onTimeTrend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                {dashboardData.kpis.onTimeTrend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(dashboardData.kpis.onTimeTrend)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">vs last period</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Throughput</span>
              <Package size={20} className="text-purple-600" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">{dashboardData.kpis.throughput}</span>
              <span className={`flex items-center text-sm font-medium mb-1 ${dashboardData.kpis.throughputTrend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                {dashboardData.kpis.throughputTrend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(dashboardData.kpis.throughputTrend)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">units this week</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Late Orders</span>
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">{dashboardData.kpis.lateOrders}</span>
              <span className={`flex items-center text-sm font-medium mb-1 ${dashboardData.kpis.lateTrend < 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                {dashboardData.kpis.lateTrend < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                {Math.abs(dashboardData.kpis.lateTrend)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">vs last period</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-6">
          {/* Utilization Trend */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Utilization Trend</h2>
              <BarChart3 size={20} className="text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dashboardData.utilizationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Line type="monotone" dataKey="utilization" stroke={COLORS.primary} strokeWidth={2} dot={{ fill: COLORS.primary }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
              <PieChart size={20} className="text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {orderStatusData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: PIE_COLORS[idx] }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Machine Status & Work Center Utilization */}
        <div className="grid grid-cols-3 gap-6">
          {/* Machine Status Grid */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Machine Status</h2>
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-600">Running</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-gray-600">Idle</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-gray-600">Down</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {dashboardData.machineStatus.map(machine => (
                <div key={machine.code} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-900 truncate">{machine.code}</span>
                    <div className={`w-6 h-6 rounded-full ${getStatusColor(machine.status)} flex items-center justify-center`}>
                      {getStatusIcon(machine.status)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 truncate mb-2">{machine.name}</p>

                  {machine.status === 'Running' && (
                    <>
                      <div className="text-xs font-medium text-blue-600 mb-1">{machine.currentJob}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={10} />
                        {machine.timeRemaining}m left
                      </div>
                    </>
                  )}

                  {machine.status === 'Down' && (
                    <div className="text-xs text-red-600 font-medium">{machine.downReason}</div>
                  )}

                  {machine.status === 'Idle' && (
                    <div className="text-xs text-gray-400">Available</div>
                  )}

                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Utilization</span>
                      <span className="font-semibold text-gray-900">{machine.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${machine.utilization}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work Center Utilization */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Work Centers</h2>
              <BarChart3 size={20} className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {dashboardData.workCenterUtilization.map(wc => (
                <div key={wc.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">{wc.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{wc.utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${wc.utilization >= 80 ? 'bg-green-500' :
                        wc.utilization >= 60 ? 'bg-blue-500' :
                          wc.utilization >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
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
        <div className="grid grid-cols-3 gap-6">
          {/* Critical Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Critical Orders</h2>
              <Calendar size={20} className="text-gray-400" />
            </div>
            <div className="space-y-3">
              {dashboardData.criticalOrders.map(order => (
                <div key={order.orderNo} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-gray-900">{order.orderNo}</span>
                    <span className={`text-xs px-2 py-1 rounded ${order.status === 'Late' ? 'bg-red-100 text-red-700' :
                      order.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{order.customer}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Due: {new Date(order.dueDate).toLocaleDateString()}</span>
                    <span className="font-medium">{order.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${order.status === 'Late' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                      style={{ width: `${order.completion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Maintenance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Maintenance</h2>
              <Wrench size={20} className="text-gray-400" />
            </div>
            <div className="space-y-3">
              {dashboardData.upcomingMaintenance.map((pm, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-gray-900">{pm.machine}</span>
                    <span className={`text-xs px-2 py-1 rounded ${pm.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                      }`}>
                      {pm.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{pm.name}</p>
                  <p className="text-xs text-gray-500 mb-1">{pm.type}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {new Date(pm.scheduledDate).toLocaleDateString()}
                    </span>
                    <span className="text-gray-600 font-medium">{pm.duration} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
              <AlertTriangle size={20} className="text-gray-400" />
            </div>
            <div className="space-y-3">
              {dashboardData.recentAlerts.map((alert, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;

// import React from "react";
// import PageHeader from "@/src/components/layout/PageHeader";
// import { cls } from "@/src/lib/utils";

// import KPISnapshot from "./components/KPISnapshot";
// import AlertsList from "./components/AlertsList";
// import MachineStatus from "./components/MachineStatus";
// import MaterialCard from "./components/MaterialCard";
// import RecentOrders from "./components/RecentOrders";
// import { CheckCircle2, Clock4, Factory, Gauge, Sparkles, TrendingUp } from "lucide-react";

// /* ------------------ Static Data ------------------ */

// const OVERVIEW = {
//   output: {
//     title: "Output Today",
//     value: 3420,
//     unit: "pcs",
//     target: 1200,
//     deltaText: "+8% vs Plan",
//     deltaTone: "emerald" as const,
//   },
//   ontime: {
//     title: "On-time % (7 วัน)",
//     value: 83,
//     series: [88, 82, 86, 91, 87, 92, 83],
//     deltaText: "+3%",
//     deltaTone: "emerald" as const,
//   },
//   oee: {
//     title: "OEE (วันนี้)",
//     value: 74,
//     series: [69, 71, 70, 73, 74, 76, 74],
//     deltaText: "-2% vs Yesterday",
//     deltaTone: "amber" as const,
//     details: [
//       { label: "Avail.", value: "88%" },
//       { label: "Perf.", value: "84%" },
//       { label: "Qual.", value: "99%" },
//     ],
//   },
//   orderStatus: [
//     { label: "กำลังผลิต", value: 18, tone: "ok" as const },
//     { label: "รอผลิต", value: 7, tone: "warn" as const },
//     { label: "ล่าช้า", value: 3, tone: "bad" as const },
//   ],
// };

// /* ------------------ Small UI bits ------------------ */

// const toneBg: Record<"emerald" | "blue" | "amber" | "rose", string> = {
//   emerald:
//     "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
//   blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
//   amber:
//     "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
//   rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
// };

// const statusTone: Record<"ok" | "warn" | "bad", string> = {
//   ok: "text-emerald-600 dark:text-emerald-300",
//   warn: "text-amber-600 dark:text-amber-300",
//   bad: "text-rose-600 dark:text-rose-400",
// };

// /** Mini sparkline without any library (SVG) */
// function Sparkline({
//   values,
//   strokeClass = "stroke-indigo-500 dark:stroke-indigo-300",
// }: {
//   values: number[];
//   strokeClass?: string;
// }) {
//   if (!values?.length) return null;
//   const w = 160;
//   const h = 44;
//   const pad = 4;
//   const min = Math.min(...values);
//   const max = Math.max(...values);
//   const span = Math.max(1, max - min);
//   const step = (w - pad * 2) / Math.max(1, values.length - 1);

//   const points = values
//     .map((v, i) => {
//       const x = pad + i * step;
//       const y = h - pad - ((v - min) / span) * (h - pad * 2);
//       return `${x},${y}`;
//     })
//     .join(" ");

//   const lastX = pad + (values.length - 1) * step;
//   const lastY = h - pad - ((values.at(-1)! - min) / span) * (h - pad * 2);

//   return (
//     <svg
//       className="w-full"
//       viewBox={`0 0 ${w} ${h}`}
//       role="img"
//       aria-label="trend"
//     >
//       <path d={`M ${points}`} className={cls("fill-none", strokeClass)} strokeWidth={2} />
//       <circle cx={lastX} cy={lastY} r={2.5} className={strokeClass} />
//       {/* baseline */}
//       <line
//         x1={pad}
//         y1={h - pad}
//         x2={w - pad}
//         y2={h - pad}
//         className="stroke-slate-200 dark:stroke-slate-700"
//         strokeWidth={1}
//       />
//     </svg>
//   );
// }

// const SectionCard: React.FC<
//   React.PropsWithChildren<{ title?: React.ReactNode; right?: React.ReactNode; className?: string }>
// > = ({ title, right, children, className }) => (
//   <section
//     className={`rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/70 dark:border-slate-700 ${className ?? ""}`}
//   >
//     <div className="p-4">
//       {(title || right) && (
//         <div className="mb-2 flex items-center justify-between gap-3">
//           {title ? (
//             <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
//           ) : (
//             <div />
//           )}
//           {right}
//         </div>
//       )}
//       {children}
//     </div>
//   </section>
// );

// /** KPI Card base */
// const KpiCard: React.FC<{
//   label: string;
//   value: string;
//   sub?: string;
//   badge?: React.ReactNode;
//   icon?: React.ReactNode;
// }> = ({ label, value, sub, badge, icon }) => (
//   <SectionCard
//     title={
//       <span className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">
//         {icon} {label}
//       </span>
//     }
//     right={badge}
//   >
//     <div className="mt-1">
//       <div className="flex items-baseline justify-center gap-2">
//         <span className="text-[clamp(26px,5vw,38px)] leading-none font-extrabold">
//           {value}
//         </span>
//       </div>
//       {sub && <div className="mt-2 text-xs text-slate-500">{sub}</div>}
//     </div>
//   </SectionCard>
// );
// /* ------------------ Overview ------------------ */

// type PillVariant = "success" | "warn" | "danger" | "info" | "muted";

// const pillClass: Record<PillVariant, string> = {
//   success:
//     "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30",
//   warn: "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30",
//   danger:
//     "text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/30",
//   info: "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30",
//   muted:
//     "text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800/60",
// };


// const StatusPill: React.FC<{ variant: PillVariant; children: React.ReactNode }> = ({
//   variant,
//   children,
// }) => (
//   <span
//     className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${pillClass[variant]}`}
//   >
//     {children}
//   </span>
// );


// function OverviewSection() {
//   const outputPct = Math.min(
//     100,
//     Math.round((OVERVIEW.output.value / OVERVIEW.output.target) * 100)
//   );

//   return (
//     <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <KpiCard
//           label="Output Today"
//           icon={<TrendingUp className="w-4 h-4" />}
//           value="3,420"
//           sub="เป้า 1,200 pcs"
//           badge={<StatusPill variant="success">+8% vs Plan</StatusPill>}
//         />
//         <KpiCard
//           label="On-time % (7 วัน)"
//           icon={<Clock4 className="w-4 h-4" />}
//           value="83%"
//           badge={<StatusPill variant="success">+3%</StatusPill>}
//         />
//         <SectionCard
//           title={
//             <span className="flex items-center gap-2 text-xs uppercase text-slate-500 dark:text-slate-400">
//               <Gauge className="w-4 h-4" /> OEE (วันนี้)
//             </span>
//           }
//           right={<StatusPill variant="warn">-2% vs Yesterday</StatusPill>}
//         >
//           <div className="text-center">
//             <span className="text-[clamp(26px,5vw,36px)] leading-none font-extrabold">
//               74%
//             </span>
//           </div>
//           <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
//             <div>
//               <dt>Avail.</dt>
//               <dd className="font-semibold text-slate-700 dark:text-slate-200">88%</dd>
//             </div>
//             <div>
//               <dt>Perf.</dt>
//               <dd className="font-semibold text-slate-700 dark:text-slate-200">84%</dd>
//             </div>
//             <div>
//               <dt>Qual.</dt>
//               <dd className="font-semibold text-slate-700 dark:text-slate-200">99%</dd>
//             </div>
//           </dl>
//         </SectionCard>

//         <SectionCard
//           title={
//             <span className="flex items-center gap-2 text-xs uppercase text-slate-500 dark:text-slate-400">
//               <Factory className="w-4 h-4" /> Orders Status
//             </span>
//           }
//         >
//           <div className="grid grid-cols-3 gap-2">
//             {[
//               { label: "กำลังผลิต", value: 18, c: "text-emerald-600 dark:text-emerald-300" },
//               { label: "รอผลิต", value: 7, c: "text-amber-600 dark:text-amber-300" },
//               { label: "ล่าช้า", value: 3, c: "text-rose-600 dark:text-rose-400" },
//             ].map((x) => (
//               <div
//                 key={x.label}
//                 className="rounded-xl p-3 text-center bg-slate-50 dark:bg-slate-700/60 border border-slate-200/70 dark:border-slate-700"
//               >
//                 <div className="text-[11px] text-slate-500">{x.label}</div>
//                 <div className={`mt-1 text-lg font-bold ${x.c}`}>{x.value}</div>
//               </div>
//             ))}
//           </div>
//         </SectionCard>
//       </section>
//   );
// }

// /* ------------------ Page ------------------ */

// export default function AIPlannerDashboard() {
//   return (
//     <>
//       <PageHeader
//         title="Production Dashboard"
//         subtitle="ภาพรวมการผลิต, แจ้งเตือน, สถานะเครื่องจักร และวัตถุดิบ"
//       />
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
//         {/* <SectionCard>
//           <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//             <div className="flex items-center gap-2">
//               <Sparkles className="w-5 h-5 text-indigo-600" />
//               <p className="text-sm">
//                 <span className="font-semibold">AI Suggestion:</span>{" "}
//                 สลับลำดับผลิต <b>ORD-1007</b> ก่อน <b>ORD-1005</b> และโอนงานไป <b>MC-05</b> เพื่อลด OT ลง ~1.5 ชม.
//               </p>
//             </div>
//             <div className="flex gap-2">
//               <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50">
//                 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
//                 Apply Plan
//               </button>
//               <button className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
//                 Preview Gantt
//               </button>
//             </div>
//           </div>
//         </SectionCard> */}

//         {/* 1: Overview KPI (เต็มแถว) */}
//         <OverviewSection />

//         {/* 2: Alerts (ปัญหาหรือสิ่งต้องรีบรู้) */}
//         <section>
//           <AlertsList />
//         </section>

//         {/* 3: Machine Status + Material Shortages (เท่ากัน) */}
//         <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <MachineStatus />
//           <MaterialCard />
//         </section>

//         {/* 4: Recent Orders / Jobs */}
//         <section>
//           <RecentOrders />
//         </section>

//         {/* 5: Optional Gantt / Timeline View หรือ Scenario Planning */}
//         {/* <GanttView /> */}
//       </main>
//     </>
//   );
// }

