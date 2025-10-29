"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Zap,
  CheckCircle,
  User,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  GitBranch,
  Check,
  Pencil,
  Loader2,
  Trash2,
  Lock,
  Filter
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";

/* =============== Types =============== */
type WorkCenter = "Machining" | "Assembly" | "Pressing" | "Finishing";
type MachineStatus = "Idle" | "Run" | "PM";
type ProcessCode = "MACH" | "DRILL" | "ASSY" | "PRESS" | "PAINT" | "PACK";
type ItemStatus = "unplanned" | "planned" | "complete" | "partial";

/** โหมดการดูแลเครื่อง */
type AttendanceMode = "attended" | "setup-attended" | "unattended";

/** กฎเวลาพัก */
type BreakRule = {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun..6=Sat
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
  appliesTo: "attended-only" | "all";
};

type Machine = {
  code: string;
  name: string;
  workCenter: WorkCenter;
  status: MachineStatus;
  processes: ProcessCode[];

  /** Master Data ใหม่ */
  attendance: AttendanceMode;
  unattendedFrom?: number;
  unattendedTo?: number;
  requiresSetupOperator?: boolean;
};

type RoutingStep = {
  seq: number;
  process: ProcessCode;
  processName: string;
  setupMin: number;
  runMin: number;
  machineGroup: string[];
  /** เดิมมี attendanceOverride — เอาออกจาก UI ฝั่งซ้ายตาม requirement */
  attendanceOverride?: AttendanceMode;
};

type OrderItem = {
  itemNo: number;
  product: string;
  qty: number;
  routing: RoutingStep[];
  status: ItemStatus | "unplanned";
};

type Order = {
  orderNo: string;
  customer: string;
  dueDate: string; // ISO (yyyy-mm-dd)
  priority: 1 | 2 | 3;
  items: OrderItem[];
};

type Shift = { name: string; start: number; end: number };

type Job = {
  jobId: string;
  orderNo: string;
  itemNo: number;
  seq: number;
  process: ProcessCode;
  processName: string;
  machineCode: string;
  start: string; // ISO
  end: string;   // ISO
  setupMin: number;
  runMin: number;
  product: string;
  qty: number;
};

type ConflictType = "overlap" | "sequence" | "pm" | "capability" | "break" | "ot";
type Conflict = { type: ConflictType; jobId: string; detail: string };

type ProcessWithStatus = RoutingStep & {
  jobId?: string;
  machineCode?: string;
  start?: string;
  end?: string;
  status: "scheduled" | "unscheduled";
};

type DraggedPayload = { order: Order; item: OrderItem; routingStep: RoutingStep };

type ViewScale = "day" | "week" | "month";
type LeftListFilter = "all" | "unplanned";

/* =============== Sample Data =============== */
const MACHINES: Machine[] = [
  {
    code: "M001",
    name: "CNC Machine 1",
    workCenter: "Machining",
    status: "Idle",
    processes: ["MACH", "DRILL"],
    attendance: "attended",
    requiresSetupOperator: true,
  },
  {
    code: "M002",
    name: "CNC Machine 2",
    workCenter: "Machining",
    status: "Run",
    processes: ["MACH", "DRILL"],
    attendance: "setup-attended",
    unattendedFrom: 18,
    unattendedTo: 24,
    requiresSetupOperator: true,
  },
  {
    code: "M003",
    name: "Assembly Line 1",
    workCenter: "Assembly",
    status: "Idle",
    processes: ["ASSY", "PACK"],
    attendance: "attended",
  },
  {
    code: "M004",
    name: "Press Machine 1",
    workCenter: "Pressing",
    status: "Idle",
    processes: ["PRESS"],
    attendance: "attended",
  },
  {
    code: "M005",
    name: "Paint Booth 1",
    workCenter: "Finishing",
    status: "Idle",
    processes: ["PAINT"],
    attendance: "unattended",
    unattendedFrom: 0,
    unattendedTo: 24,
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    orderNo: "ORD001",
    customer: "ABC Corp",
    dueDate: "2025-10-03",
    priority: 1,
    items: [
      {
        itemNo: 1,
        product: "Widget A",
        qty: 100,
        routing: [
          { seq: 1, process: "MACH", processName: "Machining", setupMin: 30, runMin: 120, machineGroup: ["M001", "M002"], attendanceOverride: "setup-attended" },
          { seq: 2, process: "DRILL", processName: "Drilling", setupMin: 20, runMin: 60, machineGroup: ["M001", "M002"] },
          { seq: 3, process: "ASSY", processName: "Assembly", setupMin: 15, runMin: 90, machineGroup: ["M003"], attendanceOverride: "attended" },
        ],
        status: "unplanned",
      },
      {
        itemNo: 2,
        product: "Widget B",
        qty: 50,
        routing: [
          { seq: 1, process: "PRESS", processName: "Pressing", setupMin: 25, runMin: 80, machineGroup: ["M004"] },
          { seq: 2, process: "PAINT", processName: "Painting", setupMin: 30, runMin: 70, machineGroup: ["M005"], attendanceOverride: "unattended" },
          { seq: 3, process: "ASSY", processName: "Assembly", setupMin: 15, runMin: 50, machineGroup: ["M003"] },
        ],
        status: "unplanned",
      },
    ],
  },
  {
    orderNo: "ORD002",
    customer: "XYZ Ltd",
    dueDate: "2025-10-02",
    priority: 2,
    items: [
      {
        itemNo: 1,
        product: "Widget C",
        qty: 75,
        routing: [
          { seq: 1, process: "MACH", processName: "Machining", setupMin: 30, runMin: 100, machineGroup: ["M001", "M002"] },
          { seq: 2, process: "PAINT", processName: "Painting", setupMin: 30, runMin: 60, machineGroup: ["M005"], attendanceOverride: "unattended" },
          { seq: 3, process: "PACK", processName: "Packaging", setupMin: 10, runMin: 40, machineGroup: ["M003"] },
        ],
        status: "unplanned",
      },
    ],
  },
  {
    orderNo: "ORD003",
    customer: "Tech Inc",
    dueDate: "2025-10-04",
    priority: 1,
    items: [
      {
        itemNo: 1,
        product: "Widget D",
        qty: 200,
        routing: [
          { seq: 1, process: "PRESS", processName: "Pressing", setupMin: 25, runMin: 150, machineGroup: ["M004"] },
          { seq: 2, process: "DRILL", processName: "Drilling", setupMin: 20, runMin: 120, machineGroup: ["M001", "M002"] },
          { seq: 3, process: "PAINT", processName: "Painting", setupMin: 30, runMin: 130, machineGroup: ["M005"], attendanceOverride: "unattended" },
          { seq: 4, process: "ASSY", processName: "Assembly", setupMin: 15, runMin: 100, machineGroup: ["M003"], attendanceOverride: "attended" },
        ],
        status: "unplanned",
      },
    ],
  },
];

/** เวลากะ */
const SHIFTS: Shift[] = [
  { name: "Day Shift", start: 8, end: 16 },
  { name: "Night Shift", start: 16, end: 24 },
];

/** BREAKS */
const BREAKS: BreakRule[] = [
  ...[1, 2, 3, 4, 5].flatMap((dow) => ([
    { dayOfWeek: dow as 1 | 2 | 3 | 4 | 5, start: "12:00", end: "13:00", appliesTo: "attended-only" as const },
    { dayOfWeek: dow as 1 | 2 | 3 | 4 | 5, start: "15:00", end: "15:15", appliesTo: "attended-only" as const },
  ])),
];

/* =============== Time helpers =============== */
const DAY_START = 8;
const DAY_END = 24;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (d: Date) => { const nd = new Date(d); nd.setHours(0, 0, 0, 0); return nd; };
const addDays = (d: Date, n: number) => { const nd = new Date(d); nd.setDate(nd.getDate() + n); return nd; };
const getWeekStartMonday = (d: Date) => {
  const nd = startOfDay(d);
  const day = nd.getDay(); // 0=Sun..6=Sat
  const diff = (day === 0 ? -6 : 1 - day);
  return addDays(nd, diff);
};
const getMonthStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

/** แปลง Date → ชั่วโมงทศนิยม (ภายในวัน) */
const toHourFloat = (d: Date) => d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;

/** ตรวจว่า machine โหมดใด “ต้องหยุดตามพัก” */
const machineUsesBreaks = (m: Machine) =>
  m.attendance === "attended" || m.attendance === "setup-attended";

/** job นี้ชนเวลาพักของ “วันนั้น” ไหม (คำนวณรายวัน) */
const isOverlappingBreakOnDay = (
  jobStart: Date,
  jobEnd: Date,
  day: Date,
  machine: Machine
) => {
  if (!machineUsesBreaks(machine)) return false;

  const dow = day.getDay() as BreakRule["dayOfWeek"];
  const rules = BREAKS.filter((b) => b.dayOfWeek === dow);
  if (!rules.length) return false;

  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + MS_PER_DAY - 1);

  const s = new Date(Math.max(jobStart.getTime(), dayStart.getTime()));
  const e = new Date(Math.min(jobEnd.getTime(), dayEnd.getTime()));
  if (e <= s) return false;

  const sH = toHourFloat(s);
  const eH = toHourFloat(e);

  return rules.some((b) => {
    const applies =
      b.appliesTo === "all" ||
      machine.attendance === "attended" ||
      machine.attendance === "setup-attended";

    if (!applies) return false;
    const bS = hhmmToHour(b.start);
    const bE = hhmmToHour(b.end);
    return Math.max(sH, bS) < Math.min(eH, bE);
  });
};

/** ชนเวลาพักเฉพาะ "ช่วง Setup" หรือไม่ (สำหรับ setup-attended) */
function jobSetupHitsBreak(job: Job, machine: Machine, viewStart: Date, viewDays: number): boolean {
  if (machine.attendance !== "setup-attended") return false;
  const js = new Date(job.start);
  const setupEnd = new Date(js.getTime() + (job.setupMin || 0) * 60000);
  if (setupEnd <= js) return false; // ไม่มี setup หรือ setup = 0

  // ใช้ตัวตรวจ overlap ต่อวัน เหมือน jobHitsBreak แต่จำกัดแค่ช่วง setup
  for (let d = 0; d < viewDays; d++) {
    const day = addDays(viewStart, d);
    if (isOverlappingBreakOnDay(js, setupEnd, day, machine)) return true;
  }
  return false;
}

/** ตรวจทั้งช่วง job ว่าชนพักอย่างน้อย 1 วันไหม */
const jobHitsBreak = (job: Job, machine: Machine, viewStart: Date, viewDays: number) => {
  const js = new Date(job.start);
  const je = new Date(job.end);
  for (let d = 0; d < viewDays; d++) {
    const day = addDays(viewStart, d);
    if (isOverlappingBreakOnDay(js, je, day, machine)) return true;
  }
  return false;
};

/* ======== NEW: ตรวจ OT ======== */
/** window ทำงานในแต่ละวันจาก SHIFTS */
const workingWindowsForDay = (): Array<[number, number]> => {
  return SHIFTS.map(s => [s.start, s.end]);
};

/** นาทีที่อยู่นอกช่วงเวลาทำงานของวันนั้น */
const overtimeMinutesOnDay = (jobStart: Date, jobEnd: Date, day: Date): number => {
  const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + MS_PER_DAY - 1);

  const s = new Date(Math.max(jobStart.getTime(), dayStart.getTime()));
  const e = new Date(Math.min(jobEnd.getTime(), dayEnd.getTime()));
  if (e <= s) return 0;

  const sH = toHourFloat(s);
  const eH = toHourFloat(e);

  const windows = workingWindowsForDay();

  let insideMin = 0;
  for (const [wS, wE] of windows) {
    const interStart = Math.max(sH, wS);
    const interEnd = Math.min(eH, wE);
    if (interEnd > interStart) insideMin += (interEnd - interStart) * 60;
  }

  const totalMin = (e.getTime() - s.getTime()) / 60000;
  const ot = Math.max(0, Math.round(totalMin - insideMin));
  return ot;
};

/** รวม OT ของทั้งช่วงงาน (หลายวัน) — นับเฉพาะเครื่องที่ต้องมีคนเฝ้า */
const getOvertimeMinutes = (job: Job, machine: Machine, _viewStart: Date, _viewDays: number): number => {
  if (!(machine.attendance === "attended" || machine.attendance === "setup-attended")) return 0;
  const js = new Date(job.start);
  const je = new Date(job.end);
  let minutes = 0;

  const startDay = startOfDay(js);
  const endDay = startOfDay(je);
  for (let d = 0, cur = new Date(startDay); cur <= endDay; d++, cur = addDays(startDay, d)) {
    minutes += overtimeMinutesOnDay(js, je, cur);
  }
  return minutes;
};

/* =============== Extras for header/labels =============== */
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
const getMonthSpans = (start: Date, days: number) => {
  const spans: { label: string; widthDays: number }[] = [];
  let i = 0;
  while (i < days) {
    const d = addDays(start, i);
    const monthIdx = d.getMonth();
    let len = 1;
    while (i + len < days && addDays(start, i + len).getMonth() === monthIdx) len++;
    spans.push({
      label: d.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
      widthDays: len,
    });
    i += len;
  }
  return spans;
};

/* =============== Utils =============== */
const hhmmToHour = (s: string) => {
  const [hh, mm] = s.split(":").map((x) => parseInt(x, 10));
  return hh + (mm || 0) / 60;
};

const laneBoxH = 80;
const laneRowH = laneBoxH + 16;

/* ===== Greedy fallback ===== */
function greedyAutoPlace(orders: Order[], machines: Machine[], anchorDateISO: string): Job[] {
  const jobs: Job[] = [];
  const machineNextFree: Record<string, number> = {};
  const anchorStart = new Date(anchorDateISO + "T00:00:00");
  const day0 = new Date(anchorStart);
  day0.setHours(DAY_START, 0, 0, 0);
  machines.forEach(m => (machineNextFree[m.code] = day0.getTime()));

  const pushJob = (machineCode: string, order: Order, item: OrderItem, step: RoutingStep, earliestStartMs: number) => {
    const startMs = Math.max(machineNextFree[machineCode], earliestStartMs);
    const setupEnd = startMs + step.setupMin * 60000;
    const runEnd = setupEnd + step.runMin * 60000;
    machineNextFree[machineCode] = runEnd;
    const sIso = new Date(startMs).toISOString();
    const eIso = new Date(runEnd).toISOString();
    const job: Job = {
      jobId: `JOB-${order.orderNo}-${item.itemNo}-${step.seq}-${machineCode}-${startMs}`,
      orderNo: order.orderNo,
      itemNo: item.itemNo,
      seq: step.seq,
      process: step.process,
      processName: step.processName,
      machineCode,
      start: sIso,
      end: eIso,
      setupMin: step.setupMin,
      runMin: step.runMin,
      product: item.product,
      qty: item.qty
    };
    jobs.push(job);
    return job;
  };

  for (const order of orders) {
    for (const item of order.items) {
      let prevEnd: number | null = null;
      for (const step of item.routing.sort((a, b) => a.seq - b.seq)) {
        let bestMachine: string | null = null;
        let bestStart = Number.POSITIVE_INFINITY;
        for (const mc of step.machineGroup) {
          const available = machineNextFree[mc] ?? day0.getTime();
          const earliest = Math.max(available, prevEnd ?? day0.getTime());
          if (earliest < bestStart) { bestStart = earliest; bestMachine = mc; }
        }
        if (!bestMachine) continue;
        const job = pushJob(bestMachine, order, item, step, prevEnd ?? day0.getTime());
        prevEnd = new Date(job.end).getTime();
      }
    }
  }
  return jobs;
}

const ProductionPlannerBoard: React.FC = () => {
  const [orders] = useState<Order[]>(INITIAL_ORDERS);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [aiKpis, setAiKpis] = useState<null | {
    baseline_min?: number;
    makespan_min?: number;
    total_setup_min?: number;
    total_tardiness_min?: number;
    machine_utilization?: Record<string, number>;
  }>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [draggedProcess, setDraggedProcess] = useState<DraggedPayload | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [pxPerHour] = useState<number>(90);
  const [filterWC, setFilterWC] = useState<"all" | WorkCenter>("all");

  const [viewScale, setViewScale] = useState<ViewScale>("day");
  const [anchorDate, setAnchorDate] = useState<string>("2025-10-01");

  // NEW: filter ซ้าย
  const [leftListFilter, setLeftListFilter] = useState<LeftListFilter>("unplanned");

  const timelineScrollRef = useRef<HTMLDivElement | null>(null);
  const timeHeaderRef = useRef<HTMLDivElement | null>(null);
  const [timeHeaderH, setTimeHeaderH] = useState<number>(40);

  useEffect(() => {
    const initOrders: Record<string, boolean> = {};
    orders.forEach(o => { initOrders[o.orderNo] = true; });
    setExpandedOrders(initOrders);
  }, [orders]);

  // === Drag-move existing job ===
  const [dragging, setDragging] = useState<{
    jobId: string;
    startClientX: number;
    origStart: Date;
    origEnd: Date;
  } | null>(null);

  const clickGuardRef = useRef(false);
  const isPointerMovingRef = useRef(false);

  const SNAP_MIN = 15;
  const snapMinutes = (min: number) => Math.round(min / SNAP_MIN) * SNAP_MIN;

  const startDragJob = (e: React.PointerEvent<HTMLDivElement>, job: Job) => {
    if (!editMode) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isPointerMovingRef.current = false;
    setDragging({
      jobId: job.jobId,
      startClientX: e.clientX,
      origStart: new Date(job.start),
      origEnd: new Date(job.end),
    });
  };

  const onLanePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    e.preventDefault();
    isPointerMovingRef.current = true;

    const dx = e.clientX - dragging.startClientX;
    theDelta: {
      const deltaMinRaw = (dx / pxPerHour) * 60;
      const deltaMin = snapMinutes(deltaMinRaw);

      setJobs((prev) =>
        prev.map((j) => {
          if (j.jobId !== dragging.jobId) return j;
          const newStart = new Date(dragging.origStart.getTime() + deltaMin * 60000);
          const newEnd = new Date(dragging.origEnd.getTime() + deltaMin * 60000);
          return { ...j, start: newStart.toISOString(), end: newEnd.toISOString() };
        })
      );
    }
  };

  const endDragJob = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { }
    setDragging(null);
    if (isPointerMovingRef.current) {
      clickGuardRef.current = true;
      setTimeout(() => { clickGuardRef.current = false; }, 120);
    }
    isPointerMovingRef.current = false;
  };

  // View range
  const viewStart = useMemo(() => {
    const d = new Date(anchorDate + "T00:00:00");
    if (viewScale === "day") return startOfDay(d);
    if (viewScale === "week") return getWeekStartMonday(d);
    return getMonthStart(d);
  }, [anchorDate, viewScale]);

  const viewDays = useMemo(() => {
    if (viewScale === "day") return 1;
    if (viewScale === "week") return 7;
    return getDaysInMonth(new Date(anchorDate + "T00:00:00"));
  }, [anchorDate, viewScale]);

  // sync header height
  useEffect(() => {
    const el = timeHeaderRef.current;
    if (!el) return;
    const measure = () => setTimeHeaderH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [viewScale, viewDays]);

  // Geometry
  const dayWidthPx = (DAY_END - DAY_START) * 90;
  const laneWidthPx = viewDays * dayWidthPx;

  // ====== Data helpers ======
  const getItemProcesses = (orderNo: string, itemNo: number): ProcessWithStatus[] => {
    const scheduledJobs = jobs.filter((j) => j.orderNo === orderNo && j.itemNo === itemNo);
    const order = orders.find((o) => o.orderNo === orderNo);
    const item = order?.items.find((i) => i.itemNo === itemNo);
    if (!item) return [];
    return item.routing.map<ProcessWithStatus>((step) => {
      const job = scheduledJobs.find((j) => j.seq === step.seq);
      return {
        ...step,
        jobId: job?.jobId,
        machineCode: job?.machineCode,
        start: job?.start,
        end: job?.end,
        status: job ? "scheduled" : "unscheduled",
      };
    });
  };

  const canScheduleProcess = (orderNo: string, itemNo: number, seq: number): boolean => {
    if (seq === 1) return true;
    const processes = getItemProcesses(orderNo, itemNo);
    const prevProcess = processes.find((p) => p.seq === seq - 1);
    return prevProcess?.status === "scheduled";
  };

  // KPIs (local UI)
  const kpis = useMemo(() => {
    const totalJobs = jobs.length;
    const onTimeJobs = jobs.filter((j) => {
      const order = orders.find((o) => o.orderNo === j.orderNo);
      return order && new Date(j.end).getTime() <= new Date(order.dueDate).getTime();
    }).length;
    const avgUtilization =
      jobs.length > 0
        ? (jobs.reduce((sum, j) => sum + j.runMin, 0) / (MACHINES.length * ((DAY_END - DAY_START) * 60))) * 100
        : 0;
    const totalProcesses = orders.reduce(
      (sum, o) => sum + o.items.reduce((itemSum, i) => itemSum + i.routing.length, 0),
      0
    );
    const scheduledProcesses = jobs.length;

    // NEW: รวม OT ทั้งหมด (เฉพาะ attended / setup-attended)
    const totalOTMin = jobs.reduce((acc, j) => {
      const m = MACHINES.find(mm => mm.code === j.machineCode);
      if (!m) return acc;
      return acc + getOvertimeMinutes(j, m, viewStart, viewDays);
    }, 0);

    return {
      onTimePercent: totalJobs > 0 ? Math.round((onTimeJobs / totalJobs) * 100) : 100,
      utilization: Math.round(avgUtilization),
      scheduledProcesses,
      unscheduledProcesses: totalProcesses - scheduledProcesses,
      totalOTMin
    };
  }, [jobs, orders, viewStart, viewDays]);

  // Conflicts (UI highlight)
  const conflicts = useMemo<Conflict[]>(() => {
    const detected: Conflict[] = [];
    jobs.forEach((job, idx) => {
      // overlap
      jobs.forEach((other, otherIdx) => {
        if (idx !== otherIdx && job.machineCode === other.machineCode) {
          const jobStart = new Date(job.start).getTime();
          const jobEnd = new Date(job.end).getTime();
          const otherStart = new Date(other.start).getTime();
          const otherEnd = new Date(other.end).getTime();
          if (jobStart < otherEnd && jobEnd > otherStart) {
            detected.push({
              type: "overlap",
              jobId: job.jobId,
              detail: `Overlap with ${other.orderNo}-${other.itemNo} (${other.processName})`,
            });
          }
        }
      });
      // sequence
      if (job.seq > 1) {
        const prevJob = jobs.find((j) => j.orderNo === job.orderNo && j.itemNo === job.itemNo && j.seq === job.seq - 1);
        if (prevJob) {
          const jobStart = new Date(job.start).getTime();
          const prevEnd = new Date(prevJob.end).getTime();
          if (jobStart < prevEnd)
            detected.push({ type: "sequence", jobId: job.jobId, detail: `Starts before ${prevJob.processName} completes` });
        }
      }
      // PM
      const machine = MACHINES.find((m) => m.code === job.machineCode);
      if (machine?.status === "PM") detected.push({ type: "pm", jobId: job.jobId, detail: `${job.machineCode} under maintenance` });

      // Capability
      const order = orders.find((o) => o.orderNo === job.orderNo);
      const item = order?.items.find((i) => i.itemNo === job.itemNo);
      const routingStep = item?.routing.find((r) => r.seq === job.seq);
      if (routingStep && !routingStep.machineGroup.includes(job.machineCode)) {
        detected.push({ type: "capability", jobId: job.jobId, detail: `${job.machineCode} cannot perform ${job.processName}` });
      }

      // Break (เฉพาะเครื่องที่ต้องหยุดพักตามกฎ)
      if (machine) {
        const breakFlag = machine.attendance === "setup-attended"
          ? jobSetupHitsBreak(job, machine, viewStart, viewDays)   // นับเฉพาะช่วง Setup
          : jobHitsBreak(job, machine, viewStart, viewDays);       // เครื่องอื่นๆ นับทั้งช่วงงาน
        if (breakFlag) {
          detected.push({ type: "break", jobId: job.jobId, detail: "Overlaps break time" });
        }
      }

      // NEW: OT — เกินช่วงเวลาทำงาน
      if (machine) {
        const otMin = getOvertimeMinutes(job, machine, viewStart, viewDays);
        if (otMin > 0) {
          detected.push({ type: "ot", jobId: job.jobId, detail: `Overtime ${otMin} min` });
        }
      }
    });
    return detected;
  }, [jobs, orders, viewStart, viewDays]);

  /* ===== Build AI payload ===== */
  const buildAiPayload = () => {
    const processMap = new Map<string, { name: string; base: number; machines: string[] }>();
    for (const o of orders) {
      for (const it of o.items) {
        for (const r of it.routing) {
          const k = r.process;
          if (!processMap.has(k)) {
            processMap.set(k, { name: r.process, base: r.runMin, machines: [...r.machineGroup] });
          } else {
            const cur = processMap.get(k)!;
            cur.base = Math.round((cur.base + r.runMin) / 2);
            cur.machines = Array.from(new Set([...cur.machines, ...r.machineGroup]));
          }
        }
      }
    }
    const process_defs = Array.from(processMap.values()).map(x => ({
      name: x.name,
      base_duration_min: x.base,
      compatible_machines: x.machines
    }));

    const productSet = new Map<string, string[]>();
    for (const o of orders) {
      for (const it of o.items) {
        const key = it.product;
        const seqPlan = [...it.routing].sort((a, b) => a.seq - b.seq).map(r => r.process);
        if (!productSet.has(key)) productSet.set(key, seqPlan);
      }
    }
    const product_defs = Array.from(productSet.entries()).map(([name, plan]) => ({
      name,
      process_plan: plan,
      bom: []
    }));

    const machines = MACHINES.map(m => ({ name: m.code }));

    const ordersPayload = orders.flatMap(o =>
      o.items.map(it => ({
        order_id: `${o.orderNo}-I${it.itemNo}`,
        product: it.product,
        qty: it.qty,
        due_date: `${o.dueDate}T17:00:00`
      }))
    );

    const calendar = {
      weekday_blocks: {
        "1": [["06:00", "14:00"], ["14:00", "22:00"]],
        "2": [["06:00", "14:00"], ["14:00", "22:00"]],
        "3": [["06:00", "14:00"], ["14:00", "22:00"]],
        "4": [["06:00", "14:00"], ["14:00", "22:00"]],
        "5": [["06:00", "14:00"], ["14:00", "22:00"]],
        "0": [],
        "6": []
      },
      breaks: [["12:00", "13:00"], ["15:00", "15:15"]],
      holidays: [],
      treat_weekend_as_off: true
    };

    return { process_defs, product_defs, machines, setup_sd: [], speed: [], orders: ordersPayload, orders_multiline: [], calendar };
  };

  /* ===== Helpers: extract + parse schedule from console ===== */
  function extractFinalScheduleCsv(consoleText: string): string | null {
    const lines = consoleText.split(/\r?\n/);
    const title = "=== FINAL SCHEDULE (console only) ===";

    const startIdx = lines.findIndex(l => l.trim().startsWith(title));
    if (startIdx === -1) return null;

    const headerLine =
      "batch_id,order_id,product_id,routing_id,operation,qty,machine,start,finish,setup_min,proc_min,splits";

    let headerIdx = -1;
    for (let i = startIdx + 1; i < lines.length; i++) {
      const s = lines[i].trim();
      if (!s) continue;
      if (s === headerLine) { headerIdx = i; break; }
    }
    if (headerIdx === -1) return null;

    const rows: string[] = [];
    for (let i = headerIdx; i < lines.length; i++) {
      const s = lines[i].trim();
      if (!s || s.startsWith("===")) break;
      rows.push(s);
    }
    return rows.length ? rows.join("\n") : null;
  }

  function parseFinalScheduleCsvToJobs(csv: string, orders: Order[]): Job[] {
    const PRODUCT_ID_TO_NAME: Record<string, string> = {
      P_A: "Widget A", P_B: "Widget B", P_C: "Widget C", P_D: "Widget D",
    };
    const PNAME_TO_CODE: Record<string, ProcessCode> = {
      Machining: "MACH", Drilling: "DRILL", Assembly: "ASSY",
      Pressing: "PRESS", Painting: "PAINT", Packaging: "PACK",
    };

    const buildSeqIndex = () => {
      const idx = new Map<string, Map<string, number>>();
      for (const o of orders) for (const it of o.items) {
        const m = idx.get(it.product) ?? new Map<string, number>();
        for (const st of it.routing) m.set(st.processName, st.seq);
        idx.set(it.product, m);
      }
      return idx;
    };

    const findItemNoByProduct = (orderNo: string, productName: string) => {
      const o = orders.find(x => x.orderNo === orderNo);
      const it = o?.items.find(i => i.product === productName);
      return it?.itemNo ?? 1;
    };

    const lines = csv.trim().split(/\r?\n/).filter(Boolean);
    if (!lines.length) return [];

    const header = lines.shift()!.split(",");
    const col = (n: string) => header.indexOf(n);

    const iOrder = col("order_id");
    const iProd = col("product_id");
    const iOp = col("operation");
    const iMac = col("machine");
    const iStart = col("start");
    const iEnd = col("finish");
    const iSetup = col("setup_min");
    const iProc = col("proc_min");
    const iQty = col("qty");

    const seqIndex = buildSeqIndex();

    return lines.map((ln, row) => {
      const t = ln.split(",");
      const orderNo = t[iOrder]?.trim();
      const productId = t[iProd]?.trim();
      const productName = PRODUCT_ID_TO_NAME[productId] ?? productId;

      const processName = t[iOp]?.trim();
      const process = (PNAME_TO_CODE[processName] ?? "MACH") as ProcessCode;

      const machine = t[iMac]?.trim();
      const startIso = new Date(t[iStart].trim().replace(" ", "T")).toISOString();
      const endIso = new Date(t[iEnd].trim().replace(" ", "T")).toISOString();
      const setupMin = parseFloat(t[iSetup] || "0");
      const runMin = parseFloat(t[iProc] || "0");
      const qty = parseInt(t[iQty] || "1", 10) || 1;

      const itemNo = findItemNoByProduct(orderNo, productName);
      const seqFromRouting = seqIndex.get(productName)?.get(processName);
      const seqFallback = 1 + ["Machining", "Drilling", "Pressing", "Painting", "Packaging", "Assembly"].indexOf(processName);
      const seq = seqFromRouting ?? (seqFallback > 0 ? seqFallback : 1);

      return {
        jobId: `JOB-${orderNo}-${itemNo}-${seq}-${machine}-${row}`,
        orderNo,
        itemNo,
        seq,
        process,
        processName,
        machineCode: machine,
        start: startIso,
        end: endIso,
        setupMin,
        runMin,
        product: productName,
        qty,
      };
    });
  }

  /* ===== เรียก AI / MOCK แล้ววางแผน ===== */
  const handleAutoPlaceAI = async () => {
    setAiLoading(true);
    setAiKpis(null);

    try {
      const payload = buildAiPayload();

      let consoleText = "";

      // ✅ Mock engine path (เปิดด้วย NEXT_PUBLIC_USE_MOCK_ENGINE=1)
      if (process.env.NEXT_PUBLIC_USE_MOCK_ENGINE === "1") {
        console.log("⚙️ Using MOCK ENGINE mode");

        consoleText = `=== FINAL SCHEDULE (console only) ===
          batch_id,order_id,product_id,routing_id,operation,qty,machine,start,finish,setup_min,proc_min,splits
          B0010101,ORD001,P_A,R_A,Machining,100,M001,2025-10-01 08:00,2025-10-01 10:30,30.0,120.0,0
          B0010101,ORD001,P_A,R_A,Drilling,100,M001,2025-10-01 10:30,2025-10-01 11:50,20.0,60.0,0
          B0010101,ORD001,P_A,R_A,Assembly,100,M003,2025-10-01 13:05,2025-10-01 14:50,15.0,90.0,0
          B0020101,ORD002,P_C,R_C,Machining,75,M002,2025-10-01 08:00,2025-10-01 10:09,30.0,100.0,0
          B0020101,ORD002,P_C,R_C,Painting,75,M005,2025-10-01 10:09,2025-10-01 11:39,30.0,60.0,0
          B0020101,ORD002,P_C,R_C,Packaging,75,M003,2025-10-01 15:20,2025-10-01 16:09,10.0,40.0,0
          B0030101,ORD003,P_D,R_D,Pressing,200,M004,2025-10-01 08:00,2025-10-01 10:55,25.0,150.0,0
          B0030101,ORD003,P_D,R_D,Drilling,200,M002,2025-10-01 10:55,2025-10-01 13:15,20.0,120.0,0
          B0030101,ORD003,P_D,R_D,Painting,200,M005,2025-10-01 13:15,2025-10-01 15:55,30.0,130.0,0
          B0030101,ORD003,P_D,R_D,Assembly,200,M003,2025-10-01 16:10,2025-10-01 18:05,15.0,100.0,0
          B0010201,ORD001,P_B,R_B,Pressing,50,M004,2025-10-01 13:10,2025-10-01 14:55,25.0,80.0,0
          B0010201,ORD001,P_B,R_B,Painting,50,M005,2025-10-01 15:55,2025-10-01 17:35,30.0,70.0,0
          B0010201,ORD001,P_B,R_B,Assembly,50,M003,2025-10-01 18:05,2025-10-01 19:10,15.0,50.0,0
        `;
      } else {
        // ✅ API path
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/ai/plan?day0=${anchorDate}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const ct = res.headers.get("content-type") || "";

        if (ct.includes("application/json")) {
          const data = await res.json();

          if (data?.result?.console_text) {
            consoleText = String(data.result.console_text);
            setAiKpis(data?.result?.kpis || null);
          } else if (data?.result?.schedule_csv) {
            const csv = String(data.result.schedule_csv).trim();
            consoleText = `=== FINAL SCHEDULE (console only) ===\n${csv}\n`;
            setAiKpis(data?.result?.kpis || null);
          } else {
            throw new Error("No console_text / schedule_csv in response");
          }
        } else {
          consoleText = await res.text();
        }
      }

      // Extract CSV
      const csv = extractFinalScheduleCsv(consoleText);
      if (!csv) throw new Error("Cannot extract FINAL SCHEDULE CSV from console output");

      // Parse → jobs
      const jobsParsed = parseFinalScheduleCsvToJobs(csv, orders);
      setJobs(jobsParsed);

      // ตั้ง anchorDate จากงานแรก
      if (jobsParsed.length > 0) {
        const firstStart = new Date(
          jobsParsed.reduce((min, j) => (new Date(j.start) < new Date(min) ? j.start : min), jobsParsed[0].start)
        );
        const y = firstStart.getFullYear();
        const m = String(firstStart.getMonth() + 1).padStart(2, "0");
        const d = String(firstStart.getDate()).padStart(2, "0");
        setAnchorDate(`${y}-${m}-${d}`);
      }

      alert("✅ Planned by engine (console format)");
    } catch (err) {
      console.error(err);
      const fallback = greedyAutoPlace(orders, MACHINES, anchorDate);
      setJobs(fallback);
      alert("⚠️ AI engine unavailable — used Greedy fallback.");
    } finally {
      setAiLoading(false);
    }
  };

  // DnD — drag from left to lanes
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    order: Order,
    item: OrderItem,
    routingStep: RoutingStep
  ): void => {
    if (!editMode) return;
    e.dataTransfer.effectAllowed = "move";
    setDraggedProcess({ order, item, routingStep });
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, machineCode: string): void => {
    e.preventDefault();
    if (!editMode) {
      alert("Switch to Edit mode to modify the plan.");
      return;
    }
    if (!draggedProcess) return;
    const { order, item, routingStep } = draggedProcess;

    if (!routingStep.machineGroup.includes(machineCode)) {
      alert(`${machineCode} cannot perform ${routingStep.processName}`);
      setDraggedProcess(null);
      return;
    }
    if (!canScheduleProcess(order.orderNo, item.itemNo, routingStep.seq)) {
      alert(`Cannot schedule ${routingStep.processName} - predecessor step must be scheduled first`);
      setDraggedProcess(null);
      return;
    }

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;

    const dayIdx = Math.max(0, Math.min(viewDays - 1, Math.floor(x / dayWidthPx)));
    const xInDay = x - dayIdx * dayWidthPx;

    const hour =
      viewScale === "month"
        ? DAY_START
        : Math.max(DAY_START, Math.min(DAY_END - 1, Math.floor(xInDay / 90) + DAY_START));

    let startTime = addDays(new Date(viewStart), dayIdx);
    startTime.setHours(hour, 0, 0, 0);

    if (routingStep.seq > 1) {
      const prevJob = jobs.find(
        (j) => j.orderNo === order.orderNo && j.itemNo === item.itemNo && j.seq === routingStep.seq - 1
      );
      if (prevJob) {
        const prevEndTime = new Date(prevJob.end);
        if (startTime < prevEndTime) startTime = prevEndTime;
      }
    }

    const setupEnd = new Date(startTime.getTime() + routingStep.setupMin * 60000);
    const runEnd = new Date(setupEnd.getTime() + routingStep.runMin * 60000);

    const newJob: Job = {
      jobId: `JOB${Date.now()}`,
      orderNo: order.orderNo,
      itemNo: item.itemNo,
      seq: routingStep.seq,
      process: routingStep.process,
      processName: routingStep.processName,
      machineCode,
      start: startTime.toISOString(),
      end: runEnd.toISOString(),
      setupMin: routingStep.setupMin,
      runMin: routingStep.runMin,
      product: item.product,
      qty: item.qty,
    };

    setJobs((prev) => [...prev, newJob]);
    setDraggedProcess(null);
  };

  const removeJob = (jobId: string): void => {
    const job = jobs.find((j) => j.jobId === jobId);
    if (!job) return;
    const hasSuccessors = jobs.some(
      (j) => j.orderNo === job.orderNo && j.itemNo === job.itemNo && j.seq > job.seq
    );
    if (hasSuccessors) {
      if (!confirm("Removing this job will also remove all subsequent steps. Continue?")) return;
      setJobs((prev) =>
        prev.filter((j) => !(j.orderNo === job.orderNo && j.itemNo === job.itemNo && j.seq >= job.seq))
      );
    } else {
      setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
    }
  };

  const toggleOrderExpand = (orderNo: string): void => {
    setExpandedOrders((prev) => ({ ...prev, [orderNo]: !prev[orderNo] }));
  };
  const toggleItemExpand = (key: string): void => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getItemStatus = (orderNo: string, itemNo: number): ItemStatus => {
    const processes = getItemProcesses(orderNo, itemNo);
    const scheduled = processes.filter((p) => p.status === "scheduled").length;
    if (scheduled === 0) return "unplanned";
    if (scheduled === processes.length) return "complete";
    return "partial";
  };

  const visibleMachines = useMemo(
    () => MACHINES.filter((m) => (filterWC === "all" ? true : m.workCenter === filterWC)),
    [filterWC]
  );

  // Header render
  const renderTimeHeader = () => {
    const pxPerHour = 90;
    if (viewScale === "day") {
      return (
        <div className="relative" style={{ width: laneWidthPx }}>
          <div className="text-center text-xs text-white/80 mb-1">
            {viewStart.toLocaleDateString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
          <div className="flex">
            {Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => i + DAY_START).map((h) => (
              <div key={h} style={{ width: pxPerHour }} className="text-center text-xs text-white/80">
                {h}:00
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Week/Month
    const days = Array.from({ length: viewDays }, (_, i) => addDays(viewStart, i));
    const monthSpans = getMonthSpans(viewStart, viewDays);

    return (
      <div className="relative" style={{ width: laneWidthPx }}>
        {/* Month bar */}
        <div className="flex border-b border-white/10">
          {monthSpans.map((m, i) => (
            <div key={i} style={{ width: m.widthDays * dayWidthPx }} className="text-center text-xs text-white/80 py-1">
              {m.label}
            </div>
          ))}
        </div>

        {/* Day row */}
        <div className="flex">
          {days.map((d, i) => (
            <div
              key={i}
              style={{ width: dayWidthPx }}
              className={`text-center py-1 ${isWeekend(d) ? "bg-white/5" : ""}`}
            >
              <div className="text-[11px] text-white/60">
                {d.toLocaleDateString(undefined, { weekday: "short" })}
              </div>
              <div className="text-xs text-white font-medium">{d.getDate()}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Badge helper
  const attendanceLabel = (mode: AttendanceMode) =>
    mode === "attended" ? "Attended"
      : mode === "setup-attended" ? "Setup-Attended"
        : "Unattended";

  const attendanceClass = (mode: AttendanceMode) =>
    mode === "attended"
      ? "bg-rose-500/15 text-rose-200 border-rose-400/30"
      : mode === "setup-attended"
        ? "bg-amber-500/15 text-amber-200 border-amber-400/30"
        : "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";

  return (
    <div className="text-white">
      <PageHeader
        title={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-white">Production Planner Board</h1>
              </div>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-3" aria-label="Planner actions">
            {/* Edit / Done Toggle */}
            <button
              type="button"
              onClick={() => setEditMode(v => !v)}
              aria-pressed={editMode}
              className={[
                "btn flex items-center gap-2 transition focus:outline-none",
                "focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                editMode
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "btn-outline border-emerald-600 text-emerald-500 hover:bg-emerald-50/10"
              ].join(" ")}
              title={editMode ? "Finish editing" : "Edit schedule"}
            >
              {editMode ? <Check size={18} /> : <Pencil size={18} />}
              <span className="whitespace-nowrap">{editMode ? "Done" : "Edit"}</span>
            </button>

            {/* Auto-Place (AI) */}
            <button
              type="button"
              onClick={handleAutoPlaceAI}
              className={[
                "btn btn-primary flex items-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              ].join(" ")}
              disabled={!editMode || aiLoading}
              aria-busy={aiLoading}
              title="Let AI place all orders automatically"
            >
              {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
              <span className="whitespace-nowrap">{aiLoading ? "AI plan..." : "AI plan"}</span>
            </button>

            {/* Clear All */}
            <button
              type="button"
              onClick={() => {
                if (!jobs.length) return;
                const ok = window.confirm("Clear all scheduled jobs?");
                if (ok) setJobs([]);
              }}
              className={[
                "btn btn-outline flex items-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              ].join(" ")}
              disabled={!editMode || aiLoading || jobs.length === 0}
              title={jobs.length === 0 ? "No jobs to clear" : "Clear all scheduled jobs"}
            >
              <Trash2 size={18} />
              <span className="whitespace-nowrap">Clear</span>
            </button>
          </div>

        }
        tabs={
          <>
            {/* KPI (local UI calc) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "On-Time %", val: `${kpis.onTimePercent}%`, tone: "text-emerald-300" },
                { label: "Utilization", val: `${kpis.utilization}%`, tone: "text-cyan-300" },
                { label: "Scheduled", val: kpis.scheduledProcesses, tone: "text-sky-300" },
                { label: "Unscheduled", val: kpis.unscheduledProcesses, tone: "text-amber-300" },
                { label: "Total OT (min)", val: kpis.totalOTMin, tone: "text-orange-300" },
              ].map((k, i) => (
                <div key={i} className="glass-card glass-card-default-padding">
                  <div className="text-xs font-medium text-white/80">{k.label}</div>
                  <div className={`text-2xl font-bold ${k.tone}`}>{k.val as never}</div>
                </div>
              ))}
            </div>

            {/* KPI จาก Engine จริง */}
            {
              aiKpis && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <div className="glass-card glass-card-default-padding">
                    <div className="text-xs font-medium text-white/80">Makespan (min)</div>
                    <div className="text-2xl font-bold text-emerald-300">{aiKpis.makespan_min}</div>
                  </div>
                  <div className="glass-card glass-card-default-padding">
                    <div className="text-xs font-medium text-white/80">Total Setup (min)</div>
                    <div className="text-2xl font-bold text-cyan-300">{aiKpis.total_setup_min ?? 0}</div>
                  </div>
                  <div className="glass-card glass-card-default-padding">
                    <div className="text-xs font-medium text-white/80">Tardiness (min)</div>
                    <div className="text-2xl font-bold text-rose-300">{aiKpis.total_tardiness_min ?? 0}</div>
                  </div>
                  <div className="glass-card glass-card-default-padding">
                    <div className="text-xs font-medium text-white/80">Baseline (min)</div>
                    <div className="text-2xl font-bold text-sky-300">{aiKpis.baseline_min ?? "-"}</div>
                  </div>
                </div>
              )
            }

            <div className="flex items-center justify-between mt-4 mb-1 mx-0.5">
              {/* Date & View controls */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={anchorDate}
                  onChange={(e) => setAnchorDate(e.target.value)}
                  className="glass-input"
                  aria-label="Anchor date"
                />

                <select
                  value={viewScale}
                  onChange={(e) => setViewScale(e.target.value as ViewScale)}
                  className="glass-input w-32"
                  aria-label="View scale"
                >
                  <option className="select option" value="day">Day</option>
                  <option className="select option" value="week">Week</option>
                  <option className="select option" value="month">Month</option>
                </select>

                <select
                  value={filterWC}
                  onChange={(e) => setFilterWC(e.target.value as never)}
                  className="glass-input w-44"
                  aria-label="Filter work center"
                >
                  <option className="select option" value="all">All Work Centers</option>
                  <option className="select option" value="Machining">Machining</option>
                  <option className="select option" value="Assembly">Assembly</option>
                  <option className="select option" value="Pressing">Pressing</option>
                  <option className="select option" value="Finishing">Finishing</option>
                </select>
              </div>

              {/* NEW: filter left list */}
              <div className="flex items-center gap-3">
                <Filter size={16} className="text-white/70" />
                <div className="inline-flex rounded-lg overflow-hidden border border-white/15">
                  <button
                    className={`w-20 px-2 py-2 ${leftListFilter === "all" ? "bg-cyan-600/30 text-white" : "bg-white/5 text-white/70 hover:text-white"}`}
                    onClick={() => setLeftListFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`w-36 px-2 py-2 ${leftListFilter === "unplanned" ? "bg-cyan-600/30 text-white" : "bg-white/5 text-white/70 hover:text-white"}`}
                    onClick={() => setLeftListFilter("unplanned")}
                    title="Show items with 0 scheduled steps"
                  >
                    Unplanned only
                  </button>
                </div>
              </div>
            </div>
          </>
        }
      />

      {/* === 2-column Layout === */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          {/* LEFT: Orders & Routing */}
          <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <GitBranch size={18} className="text-cyan-300" />
                Process Routing
              </h2>
              <p className="text-xs text-white/70 mt-1">
                Drag processes in sequence order
              </p>
              <div className="mt-1 grid grid-cols-[minmax(90px,auto)_minmax(120px,auto)_1fr] gap-2">
                <div className="tag status-success truncate">Follow Seq</div>
                <div className="tag status-info truncate">Predecessor Req</div>
                <div className="tag status-inactive truncate">No Skip</div>
              </div>
            </div>

            <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
              {orders.map((order) => {
                const isOrderExpanded = !!expandedOrders[order.orderNo];

                // สรุป qty ทั้ง order
                const orderQty = order.items.reduce((s, it) => s + it.qty, 0);

                // กรอง item ตาม leftListFilter
                const itemsForRender = order.items.filter((it) => {
                  if (leftListFilter === "all") return true;
                  const status = getItemStatus(order.orderNo, it.itemNo);
                  return status === "unplanned";
                });

                if (itemsForRender.length === 0 && leftListFilter === "unplanned") {
                  return null;
                }

                return (
                  <div key={order.orderNo} className="border-2 border-white/10 rounded-lg overflow-hidden bg-white/5">
                    {/* Order Header */}
                    <div
                      className="p-3 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => toggleOrderExpand(order.orderNo)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          {isOrderExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span className="font-semibold text-sm text-white">{order.orderNo}</span>
                        </div>
                        <div className="text-[11px] px-2 py-0.5 rounded border border-white/15 bg-white/10 text-white/90">
                          Total Qty: <span className="font-semibold text-white">{orderQty}</span>
                        </div>
                      </div>
                      <div className="text-xs text-white/80 space-y-1">
                        <div className="flex items-center gap-1">
                          <User size={12} className="text-white/70" />
                          {order.customer}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-white/70" />
                          Due: {new Date(order.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    {isOrderExpanded && (
                      <div className="bg-white/5">
                        {itemsForRender.map((item) => {
                          const itemKey = `${order.orderNo}-${item.itemNo}`;
                          const isItemExpanded = !!expandedItems[itemKey];
                          const itemStatus = getItemStatus(order.orderNo, item.itemNo);
                          const processes = getItemProcesses(order.orderNo, item.itemNo);
                          const plannedCount = processes.filter((p) => p.status === "scheduled").length;

                          return (
                            <div key={itemKey} className="border-t border-white/10">
                              {/* Item Header */}
                              <div
                                className="p-2 bg-white/5 cursor-pointer hover:bg-white/10 flex items-center justify-between"
                                onClick={() => toggleItemExpand(itemKey)}
                              >
                                <div className="flex items-center gap-2">
                                  {isItemExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                  <span className="text-xs font-medium text-white">
                                    {item.itemNo}. {item.product}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Qty badge */}
                                  <span className="text-[11px] px-2 py-0.5 rounded border border-cyan-400/30 bg-cyan-500/10 text-cyan-100">
                                    Qty: <span className="font-semibold text-white">{item.qty}</span>
                                  </span>

                                  {/* Progress badge */}
                                  <span
                                    className={[
                                      "text-xs px-2 py-0.5 rounded border",
                                      itemStatus === "complete"
                                        ? "bg-emerald-500/15 text-emerald-200 border-emerald-400/30"
                                        : itemStatus === "partial"
                                          ? "bg-cyan-500/15 text-cyan-200 border-cyan-400/30"
                                          : "bg-white/10 text-white/80 border-white/15",
                                    ].join(" ")}
                                  >
                                    {plannedCount}/{processes.length}
                                  </span>
                                </div>
                              </div>

                              {/* Steps */}
                              {isItemExpanded && (
                                <div className="p-2 space-y-1">
                                  {item.routing.map((step, idx) => {
                                    const processInfo = processes.find((p) => p.seq === step.seq);
                                    const isScheduled = processInfo?.status === "scheduled";
                                    const canSchedule = canScheduleProcess(order.orderNo, item.itemNo, step.seq);

                                    // ✅ เงื่อนไข "ล็อก"
                                    const isBlocked = !editMode || (!canSchedule && !isScheduled);

                                    return (
                                      <div key={step.seq} className="flex items-start gap-1">
                                        {/* Step number bubble */}
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 text-xs grid place-items-center font-medium mt-1">
                                          {step.seq}
                                        </div>

                                        {/* Step card */}
                                        <div
                                          draggable={editMode && canSchedule && !isScheduled}
                                          onDragStart={(e) =>
                                            editMode && canSchedule && !isScheduled && handleDragStart(e, order, item, step)
                                          }
                                          className={[
                                            "flex-1 p-2 border rounded text-xs transition-all",
                                            isScheduled
                                              ? "bg-emerald-500/10 border-emerald-400/30 opacity-80"
                                              : isBlocked
                                                ? "bg-white/5 border-white/10 opacity-60 cursor-not-allowed"
                                                : "bg-white/5 border-cyan-400/30 cursor-move hover:border-cyan-300 hover:shadow-[0_0_0_3px_rgba(34,211,238,0.15)]",
                                          ].join(" ")}
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-white">{step.processName}</span>
                                            {isScheduled && <CheckCircle size={12} className="text-emerald-300" />}
                                            {isBlocked && (
                                              <span className="text-white/50 text-xs">
                                                <Lock size={16} />
                                              </span>
                                            )}
                                          </div>

                                          {/* Step details */}
                                          <div className="text-white/80 space-y-0.5">
                                            <div className="flex items-center justify-between">
                                              <span className="text-white/70">Machines:</span>
                                              <span className="text-white/90">{step.machineGroup.join(", ")}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                              <span className="text-white/70">Run:</span>
                                              <span className="text-white/90">{step.runMin} min</span>
                                            </div>

                                            {isScheduled && processInfo && (
                                              <div className="text-cyan-200 font-medium mt-1 truncate">
                                                → {processInfo.machineCode} @{" "}
                                                {new Date(processInfo.start as string).toLocaleString([], {
                                                  month: "short",
                                                  day: "2-digit",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {idx < item.routing.length - 1 && (
                                          <ArrowRight size={14} className="text-white/50 mt-3" />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>

          {/* CENTER: Gantt */}
          <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur p-0 overflow-hidden">
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="flex">
                {/* ซ้าย: รายชื่อเครื่อง */}
                <div className="w-[14rem] flex-shrink-0">
                  <div
                    className="sticky top-0 z-20 bg-white/5 border-b border-white/10 flex items-center px-2 py-2"
                    style={{ height: timeHeaderH }}
                  >
                    <span className="text-xs text-white/70">Machines / Time</span>
                  </div>

                  {visibleMachines.map((m) => (
                    <div
                      key={m.code}
                      className="border-b border-white/10 bg-white/5 px-2 flex flex-col justify-center"
                      style={{ height: laneRowH }}
                    >
                      <div className="font-medium text-sm text-white flex items-center gap-2">
                        {m.name}
                        {/* Attendance tag */}
                        <span className={`tag ${attendanceClass(m.attendance)}`}>{attendanceLabel(m.attendance)}</span>
                      </div>
                      <div className="text-xs text-white/70">{m.workCenter}</div>
                      <div className="text-xs text-white/60 mt-1">{m.processes.join(", ")}</div>
                    </div>
                  ))}
                </div>

                {/* ขวา: header + lanes */}
                <div className="min-w-0 flex-1">
                  <div ref={timelineScrollRef} className="overflow-x-auto">
                    <div className="sticky top-0 z-20 bg-white/5 border-b border-white/10 px-2 py-2" ref={timeHeaderRef}>
                      {renderTimeHeader()}
                    </div>

                    {/* Lanes */}
                    {visibleMachines.map((machine) => (
                      <div key={machine.code} className="relative px-2 py-2 border-b border-white/10">
                        <div
                          className="relative bg-white/5 rounded outline-2 outline-dashed outline-white/15 hover:outline-cyan-400/40 transition-colors"
                          style={{ width: laneWidthPx, height: laneBoxH, touchAction: editMode ? "none" : "auto" }}
                          onDrop={(e) => handleDrop(e, machine.code)}
                          onDragOver={handleDragOver}
                          onPointerMove={onLanePointerMove}
                          onPointerUp={endDragJob}
                          onPointerCancel={endDragJob}
                        >
                          {/* Maintenance lane overlay */}
                          {machine.status === "PM" && (
                            <>
                              <div
                                className="absolute inset-0 z-0 rounded bg-fuchsia-500/10 ring-1 ring-fuchsia-400/30"
                                title="Machine under maintenance"
                              />
                              <div className="absolute top-1 left-1 z-10 text-[10px] px-1.5 py-0.5 rounded border border-fuchsia-400/40 bg-fuchsia-600/20 text-fuchsia-200">
                                MAINTENANCE
                              </div>
                            </>
                          )}

                          {/* Shift shading */}
                          {Array.from({ length: viewDays }, (_, d) =>
                            SHIFTS.map((shift) => (
                              <div
                                key={`shift-${d}-${shift.name}`}
                                className="absolute top-0 h-full bg-white/5 z-0"
                                style={{
                                  left: d * dayWidthPx + (shift.start - DAY_START) * 90,
                                  width: (shift.end - shift.start) * 90,
                                }}
                              />
                            ))
                          )}

                          {/* Day/Hour lines */}
                          {Array.from({ length: viewDays + 1 }, (_, i) => (
                            <div
                              key={`dayline-${i}`}
                              className="absolute top-0 bottom-0 border-l border-white/20 z-10"
                              style={{ left: i * dayWidthPx }}
                            />
                          ))}
                          {(viewScale === "day" || viewScale === "week") &&
                            Array.from({ length: viewDays }, (_, d) => (
                              <div key={`hours-${d}`}>
                                {Array.from({ length: (DAY_END - DAY_START) + 1 }, (_, i) => (
                                  <div
                                    key={`h-${d}-${i}`}
                                    className="absolute top-0 bottom-0 border-l border-white/10 z-10"
                                    style={{ left: d * dayWidthPx + i * 90 }}
                                  />
                                ))}
                              </div>
                            ))}

                          {/* BREAKS — สีขึ้นกับโหมดเครื่อง */}
                          {Array.from({ length: viewDays }, (_, d) => {
                            const day = addDays(viewStart, d);
                            const dow = day.getDay() as BreakRule["dayOfWeek"];
                            const rules = BREAKS.filter((b) => b.dayOfWeek === dow);
                            const requiresBreak = machineUsesBreaks(machine);

                            return rules.map((b, idx) => {
                              const startH = hhmmToHour(b.start);
                              const endH = hhmmToHour(b.end);

                              const applies =
                                b.appliesTo === "all" ||
                                machine.attendance === "attended" ||
                                machine.attendance === "setup-attended";
                              if (!applies) return null;

                              const from = Math.max(DAY_START, startH);
                              const to = Math.min(DAY_END, endH);
                              if (to <= from) return null;

                              return (
                                <div
                                  key={`break-${d}-${idx}`}
                                  className={`absolute top-0 h-full z-20 ${requiresBreak ? "bg-rose-400/15" : "bg-amber-400/15"
                                    }`}
                                  style={{
                                    left: d * dayWidthPx + (from - DAY_START) * pxPerHour,
                                    width: (to - from) * pxPerHour,
                                  }}
                                  title={`Break ${b.start}-${b.end}`}
                                />
                              );
                            });
                          })}

                          {/* Jobs */}
                          {jobs
                            .filter((j) => j.machineCode === machine.code)
                            .map((job) => {
                              const s = new Date(job.start);
                              const e = new Date(job.end);
                              const startX =
                                Math.floor((startOfDay(s).getTime() - startOfDay(viewStart).getTime()) / MS_PER_DAY) * dayWidthPx +
                                (s.getHours() + s.getMinutes() / 60 - DAY_START) * 90;
                              const width = ((e.getTime() - s.getTime()) / 3600000) * 90;

                              const setupHitsBreak = jobSetupHitsBreak(job, machine, viewStart, viewDays);
                              const hitsBreakAny = jobHitsBreak(job, machine, viewStart, viewDays);
                              const hitsBreak = machine.attendance === "setup-attended" ? setupHitsBreak : hitsBreakAny;

                              const otMin = getOvertimeMinutes(job, machine, viewStart, viewDays);
                              const isPmLane = machine.status === "PM";

                              const jobTone =
                                isPmLane
                                  ? "bg-fuchsia-600/80 border-fuchsia-300/70"
                                  : hitsBreak                           // 🔴 แดงเฉพาะเงื่อนไขที่กำหนด
                                    ? "bg-rose-500/90 border-rose-300/70"
                                    : otMin > 0
                                      ? "bg-orange-500/90 border-orange-300/70"
                                      : "bg-cyan-500/80 border-cyan-300/60";

                              const types = conflicts.filter((c) => c.jobId === job.jobId).map((c) => c.type);
                              const hasConflict = types.length > 0 || hitsBreak || otMin > 0;

                              const isCompact = width < 100;
                              const hideBadges = width < 80;

                              return (
                                <div
                                  key={job.jobId}
                                  style={{ left: startX, width, top: 4, height: laneBoxH - 8 }}
                                  className={[
                                    "absolute rounded shadow-md cursor-pointer group border z-30 transition-all",
                                    jobTone,
                                  ].join(" ")}
                                  onClick={() => {
                                    if (clickGuardRef.current) return;
                                    setSelectedJob(job);
                                    setJobModalOpen(true);
                                  }}
                                  onPointerDown={(e) => startDragJob(e, job)}
                                  title={
                                    hasConflict
                                      ? `Conflicts: ${[
                                        ...types,
                                        ...(hitsBreak ? ["break"] : []),
                                        ...(otMin > 0 ? ["ot"] : []),
                                      ].join(", ")}`
                                      : "Click to view"
                                  }
                                >
                                  {/* Remove */}
                                  <button
                                    type="button"
                                    className
                                    ={`absolute top-1 right-1 w-6 h-6 rounded-full grid place-items-center text-xs border ${editMode
                                      ? "bg-black/30 hover:bg-black/50 border-white/30"
                                      : "bg-black/20 border-transparent pointer-events-none opacity-0"
                                      }`}
                                    title="Remove"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (editMode) removeJob(job.jobId);
                                    }}
                                  >
                                    ×
                                  </button>

                                  {/* Badges — แสดงเฉพาะเมื่อกล่องกว้างพอ */}
                                  {!hideBadges && (
                                    <div className="absolute top-1.5 right-8 flex gap-1">
                                      {isPmLane && (
                                        <span className="px-1.5 py-0.5 rounded border border-fuchsia-300/50 bg-fuchsia-600/30 text-[10px]">
                                          PM
                                        </span>
                                      )}
                                      {hitsBreak && (
                                        <span className="px-1.5 py-0.5 rounded border border-rose-300/60 bg-rose-600/40 text-[10px]">
                                          BREAK
                                        </span>
                                      )}

                                      {otMin > 0 && (
                                        <span className="px-1.5 py-0.5 rounded border border-orange-300/60 bg-orange-600/40 text-[10px]">
                                          OT
                                        </span>
                                      )}
                                      {!hitsBreak && otMin === 0 && types.length > 0 && (
                                        <span className="px-1.5 py-0.5 rounded border border-amber-300/60 bg-amber-600/30 text-[10px]">
                                          {types[0].toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* เนื้อหา */}
                                  <div className="p-2 text-white text-[11px] h-full flex flex-col justify-between">
                                    {!isCompact && (
                                      <>
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="min-w-0">
                                            <div className="font-semibold truncate">
                                              {job.orderNo}-{job.itemNo}
                                            </div>
                                            <div className="opacity-90 truncate">Step {job.seq}: {job.processName}</div>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between opacity-90">
                                          <span className="truncate">{job.product}</span>
                                          <span className="opacity-90">Run {job.runMin}m</span>
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  {/* Hover overlay */}
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded" />
                                </div>
                              );
                            })}


                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: (optional panel) */}
        </div>
      </div>

      {/* Job Detail Modal */}
      {
        jobModalOpen && selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setJobModalOpen(false)} />
            <div className="relative w-full max-w-md rounded-xl border border-white/15 bg-white/10 backdrop-blur p-4 text-white shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{selectedJob.orderNo}-{selectedJob.itemNo} · {selectedJob.processName}</h3>
                <button
                  className="w-8 h-8 grid place-items-center rounded hover:bg-white/10"
                  onClick={() => setJobModalOpen(false)}
                  aria-label="Close"
                >×</button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/70">Machine</span><span className="font-medium">{selectedJob.machineCode}</span></div>
                <div className="flex justify-between"><span className="text-white/70">Product</span><span className="font-medium">{selectedJob.product}</span></div>
                <div className="flex justify-between"><span className="text-white/70">Qty</span><span className="font-medium">{selectedJob.qty}</span></div>
                <div className="flex justify-between"><span className="text-white/70">Setup</span><span className="font-medium">{selectedJob.setupMin} min</span></div>
                <div className="flex justify-between"><span className="text-white/70">Run</span><span className="font-medium">{selectedJob.runMin} min</span></div>
                <div className="flex justify-between"><span className="text-white/70">Start</span><span className="font-medium">{new Date(selectedJob.start).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-white/70">End</span><span className="font-medium">{new Date(selectedJob.end).toLocaleString()}</span></div>

                {/* NEW: แสดง OT ถ้ามี */}
                {(() => {
                  const m = MACHINES.find(mm => mm.code === selectedJob.machineCode);
                  const ot = m ? getOvertimeMinutes(selectedJob, m, viewStart, viewDays) : 0;
                  return ot > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-white/70">Overtime</span>
                      <span className="font-semibold text-orange-300">{ot} min</span>
                    </div>
                  ) : null;
                })()}
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  className="btn btn-outline"
                  onClick={() => setJobModalOpen(false)}
                >Close</button>
                <button
                  className={`btn ${editMode ? 'bg-rose-600 hover:bg-rose-500' : 'bg-neutral-600 cursor-not-allowed'}`}
                  onClick={() => { if (editMode && selectedJob) { removeJob(selectedJob.jobId); setJobModalOpen(false); } }}
                  title={editMode ? 'Remove job' : 'Enable Edit to remove'}
                >Remove</button>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default ProductionPlannerBoard;
