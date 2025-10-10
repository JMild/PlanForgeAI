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
  dueDate: string; // ISO
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

type ConflictType = "overlap" | "sequence" | "pm" | "capability";
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

/* =============== Sample Data =============== */
const MACHINES: Machine[] = [
  { code: "M001", name: "CNC Machine 1", workCenter: "Machining", status: "Idle", processes: ["MACH","DRILL"], attendance: "attended", requiresSetupOperator: true },
  { code: "M002", name: "CNC Machine 2", workCenter: "Machining", status: "Run", processes: ["MACH","DRILL"], attendance: "setup-attended", unattendedFrom: 18, unattendedTo: 24, requiresSetupOperator: true },
  { code: "M003", name: "Assembly Line 1", workCenter: "Assembly", status: "Idle", processes: ["ASSY","PACK"], attendance: "attended" },
  { code: "M004", name: "Press Machine 1", workCenter: "Pressing", status: "Idle", processes: ["PRESS"], attendance: "attended" },
  { code: "M005", name: "Paint Booth 1", workCenter: "Finishing", status: "Idle", processes: ["PAINT"], attendance: "unattended", unattendedFrom: 0, unattendedTo: 24 },
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
          { seq: 1, process: "MACH", processName: "Machining", setupMin: 30, runMin: 120, machineGroup: ["M001","M002"], attendanceOverride: "setup-attended" },
          { seq: 2, process: "DRILL", processName: "Drilling", setupMin: 20, runMin: 60, machineGroup: ["M001","M002"] },
          { seq: 3, process: "ASSY", processName: "Assembly", setupMin: 15, runMin: 90,  machineGroup: ["M003"], attendanceOverride: "attended" },
        ],
        status: "unplanned",
      },
      {
        itemNo: 2,
        product: "Widget B",
        qty: 50,
        routing: [
          { seq: 1, process: "PRESS", processName: "Pressing",  setupMin: 25, runMin: 80,  machineGroup: ["M004"] },
          { seq: 2, process: "PAINT", processName: "Painting",  setupMin: 30, runMin: 70,  machineGroup: ["M005"], attendanceOverride: "unattended" },
          { seq: 3, process: "ASSY",  processName: "Assembly",  setupMin: 15, runMin: 50,  machineGroup: ["M003"] },
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
          { seq: 1, process: "MACH",  processName: "Machining",  setupMin: 30, runMin: 100, machineGroup: ["M001","M002"] },
          { seq: 2, process: "PAINT", processName: "Painting",   setupMin: 30, runMin: 60,  machineGroup: ["M005"], attendanceOverride: "unattended" },
          { seq: 3, process: "PACK",  processName: "Packaging",  setupMin: 10, runMin: 40,  machineGroup: ["M003"] },
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
          { seq: 1, process: "PRESS", processName: "Pressing",  setupMin: 25, runMin: 150, machineGroup: ["M004"] },
          { seq: 2, process: "DRILL", processName: "Drilling",  setupMin: 20, runMin: 120, machineGroup: ["M001","M002"] },
          { seq: 3, process: "PAINT", processName: "Painting",  setupMin: 30, runMin: 130, machineGroup: ["M005"], attendanceOverride: "unattended" },
          { seq: 4, process: "ASSY",  processName: "Assembly",  setupMin: 15, runMin: 100, machineGroup: ["M003"], attendanceOverride: "attended" },
        ],
        status: "unplanned",
      },
    ],
  },
];

/** เวลากะ (แรเงาพื้นหลัง) */
const SHIFTS: Shift[] = [
  { name: "Day Shift", start: 8, end: 16 },
  { name: "Night Shift", start: 16, end: 24 },
];

/** BREAKS mock */
const BREAKS: BreakRule[] = [
  ...[1,2,3,4,5].flatMap((dow) => ([
    { dayOfWeek: dow as 1|2|3|4|5, start: "10:00", end: "10:15", appliesTo: "attended-only" as const },
    { dayOfWeek: dow as 1|2|3|4|5, start: "12:00", end: "13:00", appliesTo: "attended-only" as const },
    { dayOfWeek: dow as 1|2|3|4|5, start: "15:00", end: "15:15", appliesTo: "attended-only" as const },
  ])),
];

/* =============== Time helpers =============== */
const DAY_START = 8;
const DAY_END = 24;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (d: Date) => { const nd = new Date(d); nd.setHours(0,0,0,0); return nd; };
const addDays = (d: Date, n: number) => { const nd = new Date(d); nd.setDate(nd.getDate() + n); return nd; };
const getWeekStartMonday = (d: Date) => {
  const nd = startOfDay(d);
  const day = nd.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  return addDays(nd, diff);
};
const getMonthStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

/* =============== Labels =============== */
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
const getMonthSpans = (start: Date, days: number) => {
  const spans: { label: string; widthDays: number }[] = [];
  let i = 0;
  while (i < days) {
    const d = addDays(start, i);
    const monthIdx = d.getMonth();
    let len = 1;
    while (i + len < days && addDays(start, i + len).getMonth() === monthIdx) len++;
    spans.push({ label: d.toLocaleDateString(undefined, { month: "long", year: "numeric" }), widthDays: len });
    i += len;
  }
  return spans;
};

/* =============== Utils =============== */
const hhmmToHour = (s: string) => {
  const [hh, mm] = s.split(":").map((x) => parseInt(x, 10));
  return hh + (mm || 0) / 60;
};

/** ความสูง lane / row */
const laneBoxH = 80;
const laneRowH = laneBoxH + 16;

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
  const [filterWC, setFilterWC] = useState<"all" | WorkCenter>("all");

  const [viewScale, setViewScale] = useState<ViewScale>("day");
  const [anchorDate, setAnchorDate] = useState<string>("2025-10-01");

  const timelineScrollRef = useRef<HTMLDivElement | null>(null);
  const timeHeaderRef = useRef<HTMLDivElement | null>(null);
  const [timeHeaderH, setTimeHeaderH] = useState<number>(40);

  // ===== Dragging existing job (move by grab) =====
  const [dragging, setDragging] = useState<null | {
    jobId: string;
    machineCode: string;
    laneRect: DOMRect;
    offsetX: number; // px from job left to mouse down
    durationMs: number;
  }>(null);
  const [suppressClick, setSuppressClick] = useState(false);

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
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [viewScale, viewDays]);

  // Geometry
  const pxPerHour = 90;
  const dayWidthPx = (DAY_END - DAY_START) * pxPerHour;
  const laneWidthPx = viewDays * dayWidthPx;

  // ===== Helpers =====
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

  // KPI (local)
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
    return {
      onTimePercent: totalJobs > 0 ? Math.round((onTimeJobs / totalJobs) * 100) : 100,
      utilization: Math.round(avgUtilization),
      scheduledProcesses,
      unscheduledProcesses: totalProcesses - scheduledProcesses,
    };
  }, [jobs, orders]);

  // Conflicts
  const conflicts = useMemo<Conflict[]>(() => {
    const detected: Conflict[] = [];
    jobs.forEach((job, idx) => {
      // overlap (same machine)
      jobs.forEach((other, otherIdx) => {
        if (idx !== otherIdx && job.machineCode === other.machineCode) {
          const jobStart = new Date(job.start).getTime();
          const jobEnd = new Date(job.end).getTime();
          const otherStart = new Date(other.start).getTime();
          const otherEnd = new Date(other.end).getTime();
          if (jobStart < otherEnd && jobEnd > otherStart) {
            detected.push({ type: "overlap", jobId: job.jobId, detail: `Overlap with ${other.orderNo}-${other.itemNo} (${other.processName})` });
          }
        }
      });
      // sequence
      if (job.seq > 1) {
        const prevJob = jobs.find((j) => j.orderNo === job.orderNo && j.itemNo === job.itemNo && j.seq === job.seq - 1);
        if (prevJob) {
          const jobStart = new Date(job.start).getTime();
          const prevEnd = new Date(prevJob.end).getTime();
          if (jobStart < prevEnd) detected.push({ type: "sequence", jobId: job.jobId, detail: `Starts before ${prevJob.processName} completes` });
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
    });
    return detected;
  }, [jobs, orders]);

  // === Convert x(px from lane-left) -> Date in current view ===
  const xToDate = (xPx: number) => {
    const totalHoursFromDayStart = xPx / pxPerHour + DAY_START;
    let dayIdx = Math.floor(totalHoursFromDayStart / (DAY_END - DAY_START));
    let hourInDay = totalHoursFromDayStart % (DAY_END - DAY_START);
    if (dayIdx < 0) dayIdx = 0;
    if (dayIdx > viewDays - 1) dayIdx = viewDays - 1;
    const h = Math.max(DAY_START, Math.min(DAY_END - 1, DAY_START + hourInDay));
    const dt = addDays(new Date(viewStart), dayIdx);
    dt.setHours(h, 0, 0, 0);
    return dt;
  };

  // mouse handlers for moving existing jobs
  const handleJobMouseDown = (e: React.MouseEvent<HTMLDivElement>, job: Job, machineCode: string) => {
    if (!editMode) return;
    e.preventDefault();
    const lane = e.currentTarget.parentElement as HTMLElement; // lane container (relative)
    const rect = lane.getBoundingClientRect();
    // get current job's left px
    const currentLeft = parseFloat((e.currentTarget as HTMLDivElement).style.left || "0");
    const offsetX = e.clientX - rect.left - currentLeft;
    const durationMs = new Date(job.end).getTime() - new Date(job.start).getTime();
    setDragging({ jobId: job.jobId, machineCode, laneRect: rect, offsetX, durationMs });
    setSuppressClick(false);
  };

  useEffect(() => {
    const onMove = (ev: MouseEvent) => {
      if (!dragging) return;
      setSuppressClick(true);
      const laneWidth = viewDays * dayWidthPx;
      const xFromLane = ev.clientX - dragging.laneRect.left - dragging.offsetX;
      const clamped = Math.max(0, Math.min(xFromLane, laneWidth - 1));
      const startDt = xToDate(clamped);
      setJobs(prev =>
        prev.map(j => {
          if (j.jobId !== dragging.jobId) return j;
          const newStartISO = startDt.toISOString();
          const newEndISO = new Date(startDt.getTime() + dragging.durationMs).toISOString();
          return { ...j, start: newStartISO, end: newEndISO };
        })
      );
    };
    const onUp = () => { if (dragging) setDragging(null); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, dayWidthPx, viewDays]); // eslint-disable-line

  // ====== เรียก AI Plan จริงจาก Backend ======
  const handleAIPlan = async () => {
    try {
      setAiLoading(true);
      setAiKpis(null);

      const payload = {
        process_defs: [
          { name: "MACH",  base_duration_min: 75, compatible_machines: ["M001","M002"] },
          { name: "DRILL", base_duration_min: 36, compatible_machines: ["M001","M002"] },
          { name: "ASSY",  base_duration_min: 48, compatible_machines: ["M003"] },
        ],
        product_defs: [{ name: "WDGT-A", process_plan: ["MACH","DRILL","ASSY"], bom: [] }],
        machines: [{ name: "M001" },{ name: "M002" },{ name: "M003" }],
        setup_sd: [],
        speed: [],
        orders: [{ order_id: "ORD-100", product: "WDGT-A", qty: 10, due_date: "2025-09-23T17:00:00" }],
        orders_multiline: [],
        calendar: {
          weekday_blocks: {
            "1": [["06:00","14:00"],["14:00","22:00"]],
            "2": [["06:00","14:00"],["14:00","22:00"]],
            "3": [["06:00","14:00"],["14:00","22:00"]],
            "4": [["06:00","14:00"],["14:00","22:00"]],
            "5": [["06:00","14:00"],["14:00","22:00"]],
            "0": [], "6": []
          },
          breaks: [["10:00","10:15"],["12:00","13:00"],["15:00","15:15"]],
          holidays: [],
          treat_weekend_as_off: true
        }
      };

      const res = await fetch("http://localhost:4000/api/ai/plan?day0=2025-09-22", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.ok || !data.result?.schedule_csv) throw new Error("No schedule data received");

      // parse CSV (safe)
      const csv = data.result.schedule_csv.trim();
      const lines = csv.split("\n");
      const header = lines.shift()!.split(",");
      const idx = (name: string) => header.indexOf(name);

      const jobsParsed: Job[] = lines.map((line) => {
        const cols = line.split(",");
        const get = (name: string) => cols[idx(name)];
        const startIso = new Date(get("start_ts").trim().replace(" ", "T")).toISOString();
        const endIso   = new Date(get("end_ts").trim().replace(" ", "T")).toISOString();
        return {
          jobId: `JOB-${get("task_id")}`,
          orderNo: get("order_id"),
          itemNo: 1,
          seq: parseInt(get("task_id"), 10),
          process: get("process") as ProcessCode,
          processName: get("process"),
          machineCode: get("machine"),
          start: startIso,
          end: endIso,
          setupMin: parseFloat(get("setup_min")),
          runMin: parseFloat(get("end_min")) - parseFloat(get("start_min")),
          product: get("product"),
          qty: 10,
        };
      });

      setJobs(jobsParsed);
      setAiKpis(data.result.kpis || null);

      // auto jump to first day with jobs
      if (jobsParsed.length > 0) {
        const firstStart = new Date(
          jobsParsed.reduce((min, j) => (new Date(j.start) < new Date(min) ? j.start : min), jobsParsed[0].start)
        );
        const y = firstStart.getFullYear();
        const m = String(firstStart.getMonth() + 1).padStart(2, "0");
        const d = String(firstStart.getDate()).padStart(2, "0");
        setAnchorDate(`${y}-${m}-${d}`);
      }
      if (data.result?.kpis?.makespan_min != null) {
        alert(`✅ AI Plan loaded\nMakespan: ${data.result.kpis.makespan_min} min`);
      } else {
        alert(`✅ AI Plan loaded`);
      }
    } catch (err) {
      console.error(err);
      alert("AI Plan failed: " + (err as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  // DnD: วางจาก Routing → ลง lane (ต้อง Edit)
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
    if (!editMode) { alert("Switch to Edit mode to modify the plan."); return; }
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
        : Math.max(DAY_START, Math.min(DAY_END - 1, Math.floor(xInDay / pxPerHour) + DAY_START));

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
        <div className="flex border-b border-white/10">
          {monthSpans.map((m, i) => (
            <div key={i} style={{ width: m.widthDays * dayWidthPx }} className="text-center text-xs text-white/80 py-1">
              {m.label}
            </div>
          ))}
        </div>
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
                <p className="text-sm text-white/70">เพิ่ม Master Data (Attendance) + Breaks mock</p>
              </div>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-3">
            <button onClick={() => setEditMode((v) => !v)} className={`btn ${editMode ? 'btn-outline' : 'btn-secondary'}`}>
              {editMode ? 'Done' : 'Edit'}
            </button>
            <button onClick={handleAIPlan} className="btn btn-primary" disabled={aiLoading}>
              <Zap size={18} />
              {aiLoading ? "Planning..." : "AI Plan"}
            </button>
            <button className="btn btn-outline" onClick={() => setJobs([])} title="Clear all scheduled jobs">
              Clear
            </button>
            <button className="btn bg-emerald-600 hover:bg-emerald-500 text-white">Save Scenario</button>
          </div>
        }
        tabs={
          <>
            {/* KPI (local) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "On-Time %", val: `${kpis.onTimePercent}%`, tone: "text-emerald-300" },
                { label: "Utilization", val: `${kpis.utilization}%`, tone: "text-cyan-300" },
                { label: "Scheduled", val: kpis.scheduledProcesses, tone: "text-sky-300" },
                { label: "Unscheduled", val: kpis.unscheduledProcesses, tone: "text-amber-300" },
              ].map((k, i) => (
                <div key={i} className="glass-card glass-card-default-padding kpi-card">
                  <div className="text-xs font-medium text-white/80">{k.label}</div>
                  <div className={`text-2xl font-bold ${k.tone}`}>{k.val as never}</div>
                </div>
              ))}
            </div>

            {/* KPI จาก Engine จริง */}
            {aiKpis && (
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
            )}

            <div className="flex items-center justify-between mt-4 mb-1 mx-0.5">
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
                  className="glass-input"
                  aria-label="View scale"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
                <select
                  value={filterWC}
                  onChange={(e) => setFilterWC(e.target.value as never)}
                  className="glass-input"
                  aria-label="Filter work center"
                >
                  <option value="all">All Work Centers</option>
                  <option value="Machining">Machining</option>
                  <option value="Assembly">Assembly</option>
                  <option value="Pressing">Pressing</option>
                  <option value="Finishing">Finishing</option>
                </select>
              </div>
            </div>
          </>
        }
      />

      {/* === 2-column Layout === */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* LEFT: Orders & Routing */}
          <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <GitBranch size={18} className="text-cyan-300" />
                Process Routing
              </h2>
              <p className="text-xs text-white/70 mt-1">Drag processes in sequence order</p>
              <div className="mt-1 grid grid-cols-[minmax(90px,auto)_minmax(120px,auto)_1fr] gap-2">
                <div className="tag status-success truncate">Follow Seq</div>
                <div className="tag status-info truncate">Predecessor Req</div>
                <div className="tag status-inactive truncate">No Skip</div>
              </div>
            </div>

            <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
              {orders.map((order) => {
                const isOrderExpanded = !!expandedOrders[order.orderNo];
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
                        <span
                          className={[
                            "text-xs px-2 py-1 rounded border",
                            order.priority === 1
                              ? "bg-rose-500/15 text-rose-200 border-rose-400/30"
                              : order.priority === 2
                                ? "bg-amber-500/15 text-amber-200 border-amber-400/30"
                                : "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
                          ].join(" ")}
                        >
                          P{order.priority}
                        </span>
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
                        {order.items.map((item) => {
                          const itemKey = `${order.orderNo}-${item.itemNo}`;
                          const isItemExpanded = !!expandedItems[itemKey];
                          const itemStatus = getItemStatus(order.orderNo, item.itemNo);
                          const processes = getItemProcesses(order.orderNo, item.itemNo);

                          return (
                            <div key={itemKey} className="border-t border-white/10">
                              <div
                                className="p-2 bg-white/5 cursor-pointer hover:bg-white/10 flex items-center justify-between"
                                onClick={() => toggleItemExpand(itemKey)}
                              >
                                <div className="flex items-center gap-2">
                                  {isItemExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                  <span className="text-xs font-medium text-white">
                                    Item {item.itemNo}: {item.product}
                                  </span>
                                </div>
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
                                  {processes.filter((p) => p.status === "scheduled").length}/{processes.length}
                                </span>
                              </div>

                              {isItemExpanded && (
                                <div className="p-2 space-y-1">
                                  {item.routing.map((step, idx) => {
                                    const processInfo = processes.find((p) => p.seq === step.seq);
                                    const isScheduled = processInfo?.status === "scheduled";
                                    const canDo = canScheduleProcess(order.orderNo, item.itemNo, step.seq);
                                    const isBlocked = !canDo && !isScheduled;

                                    return (
                                      <div key={step.seq} className="flex items-start gap-1">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 text-xs grid place-items-center font-medium mt-1">
                                          {step.seq}
                                        </div>
                                        <div
                                          draggable={editMode && canDo && !isScheduled}
                                          onDragStart={(e) => editMode && canDo && !isScheduled && handleDragStart(e, order, item, step)}
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
                                            {isBlocked && <span className="text-white/50 text-xs">🔒</span>}
                                          </div>
                                          <div className="text-white/80 space-y-0.5">
                                            <div>Setup: {step.setupMin}m, Run: {step.runMin}m</div>
                                            <div className="text-white/70">Machines: {step.machineGroup.join(", ")}</div>
                                            {step.attendanceOverride && (
                                              <div className="text-[11px]">
                                                Attendance: <span className={`px-1.5 py-0.5 rounded border ${attendanceClass(step.attendanceOverride)}`}>{attendanceLabel(step.attendanceOverride)}</span>
                                              </div>
                                            )}
                                            {isScheduled && processInfo && (
                                              <div className="text-cyan-200 font-medium mt-1 truncate">
                                                → {processInfo.machineCode} @{" "}
                                                {new Date(processInfo.start as string).toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        {idx < item.routing.length - 1 && <ArrowRight size={14} className="text-white/50 mt-3" />}
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
                {/* Left: machines */}
                <div className="w-[14rem] flex-shrink-0">
                  <div className="sticky top-0 z-20 bg-white/5 border-b border-white/10 flex items-center px-2 py-2" style={{ height: timeHeaderH }}>
                    <span className="text-xs text-white/70">Machines / Time</span>
                  </div>
                  {visibleMachines.map((m) => (
                    <div key={m.code} className="border-b border-white/10 bg-white/5 px-2 flex flex-col justify-center" style={{ height: laneRowH }}>
                      <div className="font-medium text-sm text-white flex items-center gap-2">
                        {m.name}
                        <span className={`tag ${attendanceClass(m.attendance)}`}>{attendanceLabel(m.attendance)}</span>
                      </div>
                      <div className="text-xs text-white/70">{m.workCenter}</div>
                      <div className="text-xs text-white/60 mt-1">{m.processes.join(", ")}</div>
                    </div>
                  ))}
                </div>

                {/* Right: header + lanes */}
                <div className="min-w-0 flex-1">
                  <div ref={timelineScrollRef} className="overflow-x-auto">
                    <div className="sticky top-0 z-20 bg-white/5 border-b border-white/10 px-2 py-2" ref={timeHeaderRef}>
                      {renderTimeHeader()}
                    </div>

                    {visibleMachines.map((machine) => (
                      <div key={machine.code} className="relative px-2 py-2 border-b border-white/10">
                        <div
                          className="relative bg-white/5 rounded outline-2 outline-dashed outline-white/15 hover:outline-cyan-400/40 transition-colors"
                          style={{ width: laneWidthPx, height: laneBoxH }}
                          onDrop={(e) => handleDrop(e, machine.code)}
                          onDragOver={handleDragOver}
                        >
                          {/* shift background */}
                          {Array.from({ length: viewDays }, (_, d) =>
                            SHIFTS.map((shift) => (
                              <div
                                key={`shift-${d}-${shift.name}`}
                                className="absolute top-0 h-full bg-white/5 z-0"
                                style={{
                                  left: d * dayWidthPx + (shift.start - DAY_START) * pxPerHour,
                                  width: (shift.end - shift.start) * pxPerHour,
                                }}
                              />
                            ))
                          )}
                          {/* day/hour lines */}
                          {Array.from({ length: viewDays + 1 }, (_, i) => (
                            <div key={`dayline-${i}`} className="absolute top-0 bottom-0 border-l border-white/20 z-10" style={{ left: i * dayWidthPx }} />
                          ))}
                          {(viewScale === "day" || viewScale === "week") &&
                            Array.from({ length: viewDays }, (_, d) => (
                              <div key={`hours-${d}`}>
                                {Array.from({ length: (DAY_END - DAY_START) + 1 }, (_, i) => (
                                  <div key={`h-${d}-${i}`} className="absolute top-0 bottom-0 border-l border-white/10 z-10" style={{ left: d * dayWidthPx + i * pxPerHour }} />
                                ))}
                              </div>
                            ))}

                          {/* breaks mask (attended only / all) */}
                          {Array.from({ length: viewDays }, (_, d) => {
                            const day = addDays(viewStart, d);
                            const dow = day.getDay() as BreakRule["dayOfWeek"];
                            const rules = BREAKS.filter((b) => b.dayOfWeek === dow);
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
                                  className="absolute top-0 h-full bg-amber-400/15 z-20"
                                  style={{ left: d * dayWidthPx + (from - DAY_START) * pxPerHour, width: (to - from) * pxPerHour }}
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
                                (s.getHours() + s.getMinutes() / 60 - DAY_START) * pxPerHour;
                              const width = ((e.getTime() - s.getTime()) / 3600000) * pxPerHour;

                              const types = conflicts.filter((c) => c.jobId === job.jobId).map((c) => c.type);
                              const hasConflict = types.length > 0;

                              return (
                                <div
                                  key={job.jobId}
                                  style={{ left: startX, width, top: 4, height: laneBoxH - 8, position: "absolute" }}
                                  className={[
                                    "rounded shadow-md group border z-30 select-none",
                                    editMode ? "cursor-grab active:cursor-grabbing" : "cursor-not-allowed opacity-60 saturate-0",
                                    hasConflict
                                      ? (editMode ? "bg-rose-500/80 border-rose-400/60" : "bg-white/10 border-white/20")
                                      : (editMode ? "bg-cyan-500/80 border-cyan-300/60" : "bg-white/10 border-white/20"),
                                  ].join(" ")}
                                  onMouseDown={(e) => handleJobMouseDown(e, job, machine.code)}
                                  onClick={() => { if (suppressClick) return; setSelectedJob(job); setJobModalOpen(true); }}
                                  title={hasConflict ? `Conflicts: ${types.join(", ")}` : (editMode ? "Drag to move · Click to view" : "Click to view")}
                                >
                                  <div className="p-2 text-white text-[11px] h-full flex flex-col justify-between">
                                    <div>
                                      <div className="font-semibold truncate">{job.orderNo}-{job.itemNo}</div>
                                      <div className="opacity-90 truncate">Step {job.seq}: {job.processName}</div>
                                    </div>
                                    <div className="flex items-center justify-between opacity-90">
                                      <span className="truncate">{job.product}</span>
                                      <span className="opacity-80">{job.setupMin}m + {job.runMin}m</span>
                                    </div>
                                  </div>
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded" />
                                  {/* remove button (Edit only) */}
                                  <button
                                    type="button"
                                    className={`absolute top-1 right-1 w-6 h-6 rounded-full grid place-items-center text-xs border ${editMode ? 'bg-black/30 hover:bg-black/50 border-white/30' : 'bg-black/20 border-transparent pointer-events-none opacity-0'}`}
                                    title="Remove"
                                    onClick={(e) => { e.stopPropagation(); if (editMode) removeJob(job.jobId); }}
                                  >×</button>
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

          {/* RIGHT: (optional) */}
        </div>
      </div>

      {/* Job Detail Modal */}
      {jobModalOpen && selectedJob && (
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
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <button className="btn btn-outline" onClick={() => setJobModalOpen(false)}>Close</button>
              <button
                className={`btn ${editMode ? 'bg-rose-600 hover:bg-rose-500' : 'bg-neutral-600 cursor-not-allowed'}`}
                onClick={() => { if (editMode && selectedJob) { removeJob(selectedJob.jobId); setJobModalOpen(false); } }}
                title={editMode ? 'Remove job' : 'Enable Edit to remove'}
              >Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionPlannerBoard;
