// lib/api.ts
import axios from "axios";

// =========== Dashboard ===============
export const getDashboard = async () => {
  // const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/setting/holiday`);
  // return res.data;

  return {
    kpis: {
      utilizationRate: 78,
      utilizationTrend: 5.2,
      onTimeDelivery: 92,
      onTimeTrend: -2.1,
      throughput: 1847,
      throughputTrend: 8.5,
      lateOrders: 3,
      lateTrend: -1,
    },
    orderStatus: {
      unplanned: 12,
      planned: 28,
      inProgress: 15,
      completed: 94,
      late: 3,
    },
    machineStatus: [
      { code: 'M001', name: 'CNC Machine 1', status: 'Running', utilization: 85, currentJob: 'ORD001-1', timeRemaining: 45 },
      { code: 'M002', name: 'CNC Machine 2', status: 'Running', utilization: 92, currentJob: 'ORD003-2', timeRemaining: 120 },
      { code: 'M003', name: 'Assembly Line 1', status: 'Idle', utilization: 45, currentJob: null, timeRemaining: 0 },
      { code: 'M004', name: 'Press Machine 1', status: 'Running', utilization: 78, currentJob: 'ORD002-1', timeRemaining: 90 },
      { code: 'M005', name: 'Paint Booth 1', status: 'Idle', utilization: 62, currentJob: null, timeRemaining: 0 },
      { code: 'M006', name: 'Drill Press 1', status: 'Down', utilization: 0, currentJob: null, timeRemaining: 0, downReason: 'Maintenance' },
      { code: 'M007', name: 'Welding Station 1', status: 'Running', utilization: 88, currentJob: 'ORD004-3', timeRemaining: 60 },
      { code: 'M008', name: 'Packaging Line 1', status: 'Idle', utilization: 55, currentJob: null, timeRemaining: 0 },
    ],
    utilizationTrend: [
      { date: '10/25', utilization: 72 },
      { date: '10/26', utilization: 75 },
      { date: '10/27', utilization: 71 },
      { date: '10/28', utilization: 78 },
      { date: '10/29', utilization: 76 },
      { date: '10/30', utilization: 80 },
      { date: '10/31', utilization: 78 },
    ],
    workCenterUtilization: [
      { name: 'Machining', utilization: 88 },
      { name: 'Assembly', utilization: 45 },
      { name: 'Pressing', utilization: 78 },
      { name: 'Finishing', utilization: 62 },
      { name: 'Welding', utilization: 88 },
      { name: 'Packaging', utilization: 55 },
    ],
    upcomingMaintenance: [
      { machine: 'M006', name: 'Drill Press 1', type: 'PM', scheduledDate: '2025-10-01', duration: 120, status: 'In Progress' },
      { machine: 'M002', name: 'CNC Machine 2', type: 'PM', scheduledDate: '2025-10-02', duration: 180, status: 'Scheduled' },
      { machine: 'M007', name: 'Welding Station 1', type: 'Inspection', scheduledDate: '2025-10-03', duration: 60, status: 'Scheduled' },
    ],
    criticalOrders: [
      { orderNo: 'ORD015', customer: 'ABC Corp', dueDate: '2025-10-01', status: 'In Progress', completion: 75, priority: 1 },
      { orderNo: 'ORD018', customer: 'XYZ Ltd', dueDate: '2025-10-02', status: 'Late', completion: 60, priority: 1 },
      { orderNo: 'ORD022', customer: 'Tech Inc', dueDate: '2025-10-02', status: 'In Progress', completion: 40, priority: 2 },
      { orderNo: 'ORD009', customer: 'Global Co', dueDate: '2025-10-02', status: 'Late', completion: 85, priority: 1 },
    ],
    recentAlerts: [
      { time: '09:45', type: 'warning', message: 'M006 Drill Press 1 - Maintenance started' },
      { time: '09:30', type: 'error', message: 'ORD018 is running behind schedule by 2 hours' },
      { time: '09:15', type: 'info', message: 'ORD015 Step 3 completed on M001' },
      { time: '08:50', type: 'warning', message: 'M003 Assembly Line 1 idle for 45 minutes' },
      { time: '08:30', type: 'error', message: 'ORD009 missed target completion time' },
    ],
  }
};

// =========== Master ===============
export const getMachines = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/master/machines`);
  return res.data;
};

// =========== User ===============

export const getUsers = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/users`);
  return res.data;
};


// =========== Setting ===============

import type { Holiday, Shift, BreakRow, OTRules, SetupRule, Constraints, MaintWin } from "@/src/types";

const mockShifts: Shift[] = [
  { code: "A", start: "08:00", end: "17:00", lines: ["Assembly", "Packing"] },
  { code: "B", start: "20:00", end: "05:00", lines: ["Assembly"] },
];

const mockBreaks: BreakRow[] = [
  { shift_code: "A", start: "12:00", end: "13:00" },
  { shift_code: "B", start: "00:00", end: "00:30" },
];

const mockOTRules: OTRules = {
  daily_cap_hours: 2,
  allow_weekend_ot: true,
  default_setup_min: 10,
  default_buffer_min: 30,
};

const mockSetupMatrix: SetupRule[] = [
  { from: "P1", to: "P2", setup_min: 12 },
  { from: "P2", to: "P3", setup_min: 18 },
];

const mockConstraints: Constraints = {
  enforce_maintenance: true,
  enforce_material_ready: true,
  material_ready_offset_min: 0,
  freeze_window_min: 120,
};

const mockMaint: MaintWin[] = [
  { machine_id: "M2", start_dt: "2025-08-20T13:00", end_dt: "2025-08-20T15:00", type: "PM", note: "quarterly" },
  { machine_id: "M1", start_dt: "2025-08-22T09:00", end_dt: "2025-08-22T10:00", type: "Unplanned", note: "vibration" },
];

export const getHolidays = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/setting/holiday`);
  return res.data;
};
export const getShifts = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/setting/shift`);
  return res.data;
};
export const getBreaks = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/setting/break`);
  return res.data;
};

export const getOTRules = async () => mockOTRules;
export const getSetupMatrix = async () => mockSetupMatrix;
export const getConstraints = async () => mockConstraints;
export const getMaintenances = async () => mockMaint;


