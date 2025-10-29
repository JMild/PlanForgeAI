"use client";
import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  Play, Pause, CheckCircle, AlertTriangle, Clock,
  Zap, TrendingUp, Search, Settings, FileText, AlertCircle
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import { JobStatusEnum } from "@/src/types";
import Modal from "@/src/components/shared/Modal";

/* ---------- Types ---------- */
// สถานะจริงของงาน (ไม่รวม "all")
type JobLifecycleStatus =
  | "In Progress"
  | "Ready"
  | "Completed"
  | "Paused"
  | "Late"
  | "Pending"
  | "Scheduled";

// สถานะสำหรับตัวกรอง (มี "all")
type JobStatusFilter = JobLifecycleStatus | "all";

type ShiftType = "Day Shift" | "Night Shift";

type Job = {
  jobId: string;
  orderNo: string;
  itemNo: number;
  seq: number;
  product: string;
  process: string;
  machineCode: string;
  machineName: string;
  operator: string | null;
  plannedStart: string; // ISO
  plannedEnd: string;   // ISO
  actualStart: string | null; // ISO | null
  actualEnd: string | null;   // ISO | null
  status: JobLifecycleStatus;
  setupMin: number;
  runMin: number;
  qty: number;
  qtyCompleted: number;
  priority: 1 | 2 | 3;
  shift: ShiftType;
};

type Operator = { id: string; name: string };

type FormState = {
  operator: string;
  qtyCompleted: number;
  notes: string;
  downReason: string;
  downDuration: number;
};

type Stats = {
  inProgress: number;
  completed: number;
  ready: number;
  late: number;
  completionRate: number; // %
  onTimeRate: number;     // %
};

/* ---------- Sample data ---------- */
const INITIAL_JOBS: Job[] = [
  {
    jobId: "JOB001",
    orderNo: "ORD001",
    itemNo: 1,
    seq: 1,
    product: "Widget A",
    process: "Machining",
    machineCode: "M001",
    machineName: "CNC Machine 1",
    operator: "John Smith",
    plannedStart: "2025-10-01T08:00:00",
    plannedEnd: "2025-10-01T10:30:00",
    actualStart: "2025-10-01T08:15:00",
    actualEnd: null,
    status: "In Progress",
    setupMin: 30,
    runMin: 120,
    qty: 100,
    qtyCompleted: 45,
    priority: 1,
    shift: "Day Shift",
  },
  {
    jobId: "JOB002",
    orderNo: "ORD002",
    itemNo: 1,
    seq: 1,
    product: "Widget C",
    process: "Machining",
    machineCode: "M002",
    machineName: "CNC Machine 2",
    operator: "Sarah Johnson",
    plannedStart: "2025-10-01T08:00:00",
    plannedEnd: "2025-10-01T10:00:00",
    actualStart: "2025-10-01T08:00:00",
    actualEnd: null,
    status: "In Progress",
    setupMin: 30,
    runMin: 90,
    qty: 75,
    qtyCompleted: 60,
    priority: 2,
    shift: "Day Shift",
  },
  {
    jobId: "JOB003",
    orderNo: "ORD001",
    itemNo: 1,
    seq: 2,
    product: "Widget A",
    process: "Drilling",
    machineCode: "M001",
    machineName: "CNC Machine 1",
    operator: null,
    plannedStart: "2025-10-01T10:30:00",
    plannedEnd: "2025-10-01T11:50:00",
    actualStart: null,
    actualEnd: null,
    status: "Ready",
    setupMin: 20,
    runMin: 60,
    qty: 100,
    qtyCompleted: 0,
    priority: 1,
    shift: "Day Shift",
  },
  {
    jobId: "JOB004",
    orderNo: "ORD003",
    itemNo: 1,
    seq: 1,
    product: "Widget D",
    process: "Pressing",
    machineCode: "M004",
    machineName: "Press Machine 1",
    operator: "Mike Wilson",
    plannedStart: "2025-10-01T09:00:00",
    plannedEnd: "2025-10-01T12:00:00",
    actualStart: "2025-10-01T09:00:00",
    actualEnd: null,
    status: "In Progress",
    setupMin: 25,
    runMin: 155,
    qty: 200,
    qtyCompleted: 85,
    priority: 1,
    shift: "Day Shift",
  },
  {
    jobId: "JOB005",
    orderNo: "ORD004",
    itemNo: 1,
    seq: 1,
    product: "Widget B",
    process: "Pressing",
    machineCode: "M004",
    machineName: "Press Machine 1",
    operator: null,
    plannedStart: "2025-10-01T12:00:00",
    plannedEnd: "2025-10-01T14:00:00",
    actualStart: null,
    actualEnd: null,
    status: "Ready",
    setupMin: 25,
    runMin: 95,
    qty: 120,
    qtyCompleted: 0,
    priority: 2,
    shift: "Day Shift",
  },
  {
    jobId: "JOB006",
    orderNo: "ORD005",
    itemNo: 1,
    seq: 1,
    product: "Widget C",
    process: "Machining",
    machineCode: "M001",
    machineName: "CNC Machine 1",
    operator: null,
    plannedStart: "2025-10-01T11:50:00",
    plannedEnd: "2025-10-01T14:00:00",
    actualStart: null,
    actualEnd: null,
    status: "Pending",
    setupMin: 30,
    runMin: 100,
    qty: 80,
    qtyCompleted: 0,
    priority: 3,
    shift: "Day Shift",
  },
  {
    jobId: "JOB007",
    orderNo: "ORD001",
    itemNo: 2,
    seq: 1,
    product: "Widget B",
    process: "Pressing",
    machineCode: "M004",
    machineName: "Press Machine 1",
    operator: null,
    plannedStart: "2025-10-01T14:00:00",
    plannedEnd: "2025-10-01T16:00:00",
    actualStart: null,
    actualEnd: null,
    status: "Scheduled",
    setupMin: 25,
    runMin: 95,
    qty: 50,
    qtyCompleted: 0,
    priority: 1,
    shift: "Day Shift",
  },
];

const OPERATORS: Operator[] = [
  { id: "OP001", name: "John Smith" },
  { id: "OP002", name: "Sarah Johnson" },
  { id: "OP003", name: "Mike Wilson" },
  { id: "OP004", name: "Emily Davis" },
  { id: "OP005", name: "David Brown" },
];

const ProductionExecution: React.FC = () => {
  const operatorRef = useRef<HTMLSelectElement>(null);

  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] =
    useState<"start" | "complete" | "pause" | "report" | null>(null);

  const [filterStatus, setFilterStatus] = useState<JobStatusFilter>(JobStatusEnum.All);
  const [filterShift, setFilterShift] = useState<"all" | ShiftType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime] = useState<Date>(new Date("2025-10-01T10:15:00"));

  const [formData, setFormData] = useState<FormState>({
    operator: "",
    qtyCompleted: 0,
    notes: "",
    downReason: "",
    downDuration: 0,
  });

  const calculateProgress = (job: Job): number => {
    if (job.qty === 0) return 0;
    return Math.round((job.qtyCompleted / job.qty) * 100);
  };

  // คงที่และไม่ต้องใส่ใน deps ที่อื่น
  const calculateTimeVariance = useCallback((job: Job): number | null => {
    if (!job.actualStart) return null;
    const planned = new Date(job.plannedStart).getTime();
    const actual = new Date(job.actualStart).getTime();
    return Math.round((actual - planned) / 60000); // minutes
  }, []);

  const isLate = useCallback((job: Job): boolean => {
    if (job.status === "Completed") return false;
    const plannedEnd = new Date(job.plannedEnd);
    return currentTime > plannedEnd;
  }, [currentTime]);

  const stats: Stats = useMemo(() => {
    const inProgress = jobs.filter(j => j.status === "In Progress").length;
    const completed = jobs.filter(j => j.status === "Completed").length;
    const ready = jobs.filter(j => j.status === "Ready").length;
    const late = jobs.filter(j => isLate(j)).length;

    const totalPlanned = jobs.length;
    const completionRate = totalPlanned > 0
      ? Math.round((completed / totalPlanned) * 100)
      : 0;

    const onTimeJobs = jobs.filter(j => {
      if (j.status !== "Completed") return false;
      const variance = calculateTimeVariance(j);
      return variance !== null && variance <= 0;
    }).length;

    const onTimeRate = completed > 0
      ? Math.round((onTimeJobs / completed) * 100)
      : 100;

    return { inProgress, completed, ready, late, completionRate, onTimeRate };
  }, [jobs, isLate, calculateTimeVariance]);

  const filteredJobs = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return jobs.filter(job => {
      const matchesSearch =
        job.orderNo.toLowerCase().includes(q) ||
        job.product.toLowerCase().includes(q) ||
        job.machineCode.toLowerCase().includes(q);

      const matchesShift =
        filterShift === "all" ? true : job.shift === filterShift;

      const matchesStatus =
        filterStatus === "all"
          ? true
          : filterStatus === "Late"
            ? isLate(job)
            : job.status === filterStatus;

      return matchesSearch && matchesShift && matchesStatus;
    });
  }, [jobs, searchTerm, filterStatus, filterShift, isLate]);

  // Group jobs (exclude "Late" ออก เพราะ Late เป็นสถานะคำนวณจากเวลา)
  type GroupKey = Exclude<JobLifecycleStatus, "Late"> | "all";
  const groupedJobs: Record<GroupKey, Job[]> = {
    "In Progress": filteredJobs.filter(j => j.status === "In Progress"),
    "Ready": filteredJobs.filter(j => j.status === "Ready"),
    "Scheduled": filteredJobs.filter(j => j.status === "Scheduled"),
    "Pending": filteredJobs.filter(j => j.status === "Pending"),
    "Paused": filteredJobs.filter(j => j.status === "Paused"),
    "Completed": filteredJobs.filter(j => j.status === "Completed"),
    all: [],
  };

  const openModal = (job: Job, mode: NonNullable<typeof modalMode>) => {
    setSelectedJob(job);
    setModalMode(mode);
    setFormData({
      operator: job.operator || "",
      qtyCompleted: job.qtyCompleted,
      notes: "",
      downReason: "",
      downDuration: 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    setModalMode(null);
  };

  const handleStartJob = () => {
    if (!selectedJob) return;
    if (!formData.operator) {
      alert("Please select an operator");
      return;
    }
    setJobs(prev => prev.map(j =>
      j.jobId === selectedJob.jobId
        ? {
          ...j,
          status: "In Progress",
          actualStart: currentTime.toISOString(),
          operator: formData.operator,
        }
        : j
    ));
    closeModal();
  };

  const handleCompleteJob = () => {
    if (!selectedJob) return;
    setJobs(prev => prev.map(j =>
      j.jobId === selectedJob.jobId
        ? {
          ...j,
          status: "Completed",
          actualEnd: currentTime.toISOString(),
          qtyCompleted: j.qty,
        }
        : j
    ));
    closeModal();
  };

  const handlePauseJob = () => {
    if (!selectedJob) return;
    setJobs(prev => prev.map(j =>
      j.jobId === selectedJob.jobId ? { ...j, status: "Paused" } : j
    ));
    closeModal();
  };

  const handleResumeJob = (job: Job) => {
    setJobs(prev => prev.map(j =>
      j.jobId === job.jobId ? { ...j, status: "In Progress" } : j
    ));
  };

  const handleUpdateProgress = () => {
    if (!selectedJob) return;
    setJobs(prev => prev.map(j =>
      j.jobId === selectedJob.jobId
        ? { ...j, qtyCompleted: formData.qtyCompleted }
        : j
    ));
    closeModal();
  };

  const getTimeRemaining = (job: Job): number | null => {
    if (!job.actualStart || job.status === "Completed") return null;
    const elapsedMin =
      (currentTime.getTime() - new Date(job.actualStart).getTime()) / 60000;
    const totalPlanned = job.setupMin + job.runMin;
    return Math.round(totalPlanned - elapsedMin);
  };

  return (
    <div className="text-white">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Production Execution</h1>
              <p className="text-sm text-white/60 mt-1">Today&apos;s dispatch queue &amp; job tracking</p>
              <p className="text-xs text-white/50 mt-1">
                Current Time: {currentTime.toLocaleTimeString()}
              </p>
            </div>
          </div>
        }
        // actions={
        //   <div className="flex gap-3">
        //     <button className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 flex items-center gap-2">
        //       <Zap size={18} />
        //       Replan
        //     </button>
        //     <button className="px-4 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-600 flex items-center gap-2">
        //       <FileText size={18} />
        //       Shift Report
        //     </button>
        //   </div>
        // }
        tabs={
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-6 gap-4">
              <div className="rounded-lg p-3 border border-emerald-300/20 bg-emerald-500/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-emerald-300 font-medium">In Progress</span>
                  <Play size={16} className="text-emerald-300" />
                </div>
                <div className="text-2xl font-bold text-emerald-200">{stats.inProgress}</div>
              </div>
              <div className="rounded-lg p-3 border border-sky-300/20 bg-sky-500/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-sky-300 font-medium">Ready</span>
                  <CheckCircle size={16} className="text-sky-300" />
                </div>
                <div className="text-2xl font-bold text-sky-200">{stats.ready}</div>
              </div>
              <div className="rounded-lg p-3 border border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/70 font-medium">Completed</span>
                  <CheckCircle size={16} className="text-white/70" />
                </div>
                <div className="text-2xl font-bold">{stats.completed}</div>
              </div>
              <div className="rounded-lg p-3 border border-rose-300/20 bg-rose-500/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-rose-300 font-medium">Late</span>
                  <AlertTriangle size={16} className="text-rose-300" />
                </div>
                <div className="text-2xl font-bold text-rose-200">{stats.late}</div>
              </div>
              <div className="rounded-lg p-3 border border-violet-300/20 bg-violet-500/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-violet-300 font-medium">Completion</span>
                  <TrendingUp size={16} className="text-violet-300" />
                </div>
                <div className="text-2xl font-bold text-violet-200">{stats.completionRate}%</div>
              </div>
              <div className="rounded-lg p-3 border border-cyan-300/20 bg-cyan-500/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-cyan-300 font-medium">On-Time</span>
                  <Clock size={16} className="text-cyan-300" />
                </div>
                <div className="text-2xl font-bold text-cyan-200">{stats.onTimeRate}%</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4 mb-1 mx-0.5">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input w-full !pl-10 pr-4"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as JobStatusEnum)}
                className="glass-input"
              >
                <option className="select option" value={JobStatusEnum.All}>All Status</option>
                <option className="select option" value={JobStatusEnum.InProgress}>In Progress</option>
                <option className="select option" value={JobStatusEnum.Ready}>Ready</option>
                <option className="select option" value={JobStatusEnum.Scheduled}>Scheduled</option>
                <option className="select option" value={JobStatusEnum.Pending}>Pending</option>
                <option className="select option" value={JobStatusEnum.Paused}>Paused</option>
                <option className="select option" value={JobStatusEnum.Completed}>Completed</option>
                <option className="select option" value={JobStatusEnum.Late}>Late</option>
              </select>
              <select
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value as 'all' | 'Day Shift' | 'Night Shift')}
                className="glass-input"
              >
                <option className="select option" value="all">All Shifts</option>
                <option className="select option" value="Day Shift">Day Shift</option>
                <option className="select option" value="Night Shift">Night Shift</option>
              </select>
            </div>
          </>
        }
      />

      {/* Job Queue */}
      <div className="px-4 py-6">
        <div className="space-y-6">
          {Object.entries(groupedJobs).map(([status, statusJobs]) =>
            statusJobs.length > 0 && (
              <div key={status}>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  {status}
                  <span className="text-sm font-normal text-white/60">({statusJobs.length})</span>
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {statusJobs.map((job) => {
                    const progress = calculateProgress(job);
                    const timeVariance = calculateTimeVariance(job);
                    const timeRemaining = getTimeRemaining(job);
                    const late = isLate(job);

                    return (
                      <div
                        key={job.jobId}
                        className={`rounded-lg border ${late ? 'border-rose-400/30' : 'border-white/10'
                          } bg-white/5 hover:bg-white/7.5 hover:shadow-md transition-shadow`}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-lg font-semibold">{job.jobId}</span>

                                {/* Status pill (โทน glass) */}
                                <span
                                  className={`text-xs px-2 py-1 rounded border ${job.status === 'In Progress'
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-300/20'
                                    : job.status === 'Ready'
                                      ? 'bg-sky-500/15 text-sky-300 border-sky-300/20'
                                      : job.status === 'Completed'
                                        ? 'bg-white/10 text-white/80 border-white/10'
                                        : job.status === 'Paused'
                                          ? 'bg-amber-500/15 text-amber-300 border-amber-300/20'
                                          : job.status === 'Late'
                                            ? 'bg-rose-500/15 text-rose-300 border-rose-300/20'
                                            : 'bg-slate-500/15 text-slate-300 border-slate-300/20'
                                    }`}
                                >
                                  {job.status}
                                </span>

                                {/* Priority pill */}
                                <span
                                  className={`text-xs px-2 py-1 rounded border ${job.priority === 1
                                    ? 'bg-rose-500/15 text-rose-300 border-rose-300/20'
                                    : job.priority === 2
                                      ? 'bg-amber-500/15 text-amber-300 border-amber-300/20'
                                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-300/20'
                                    }`}
                                >
                                  P{job.priority}
                                </span>

                                {late && (
                                  <span className="text-xs px-2 py-1 rounded bg-rose-500/15 text-rose-300 border border-rose-300/20 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Late
                                  </span>
                                )}
                              </div>

                              {/* Meta grid */}
                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  <div className="text-white/60 text-xs mb-1">Order / Item</div>
                                  <div className="font-medium">{job.orderNo}-{job.itemNo}</div>
                                </div>
                                <div>
                                  <div className="text-white/60 text-xs mb-1">Product / Process</div>
                                  <div className="font-medium">{job.product}</div>
                                  <div className="text-xs text-sky-300">Step {job.seq}: {job.process}</div>
                                </div>
                                <div>
                                  <div className="text-white/60 text-xs mb-1">Machine</div>
                                  <div className="font-medium">{job.machineCode}</div>
                                  <div className="text-xs text-white/60">{job.machineName}</div>
                                </div>
                                <div>
                                  <div className="text-white/60 text-xs mb-1">Operator</div>
                                  <div className="font-medium">
                                    {job.operator || <span className="text-white/40">Not assigned</span>}
                                  </div>
                                </div>
                              </div>

                              {/* Times & qty */}
                              <div className="grid grid-cols-4 gap-4 text-sm mt-3 pt-3 border-t border-white/10">
                                <div>
                                  <div className="text-white/60 text-xs mb-1">Quantity</div>
                                  <div className="font-medium">{job.qtyCompleted} / {job.qty}</div>
                                  <div className="text-xs text-white/60">{progress}% complete</div>
                                </div>
                                <div>
                                  <div className="text-white/60 text-xs mb-1">Planned Time</div>
                                  <div className="text-xs text-white/80">
                                    {new Date(job.plannedStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                                    {new Date(job.plannedEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  <div className="text-xs text-white/60">{job.setupMin + job.runMin} min total</div>
                                </div>
                                {job.actualStart && (
                                  <div>
                                    <div className="text-white/60 text-xs mb-1">Actual Start</div>
                                    <div className="text-xs text-white/80">
                                      {new Date(job.actualStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    {timeVariance !== null && (
                                      <div className={`text-xs ${timeVariance > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                                        {timeVariance > 0 ? '+' : ''}{timeVariance} min vs plan
                                      </div>
                                    )}
                                  </div>
                                )}
                                {timeRemaining !== null && job.status === 'In Progress' && (
                                  <div>
                                    <div className="text-white/60 text-xs mb-1">Time Remaining</div>
                                    <div className={`font-medium ${timeRemaining < 0 ? 'text-rose-300' : ''}`}>
                                      {Math.abs(timeRemaining)} min
                                    </div>
                                    {timeRemaining < 0 && (
                                      <div className="text-xs text-rose-300">Overdue</div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Progress Bar */}
                              {job.status === 'In Progress' && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-white/60 mb-1">
                                    <span>Progress</span>
                                    <span>{progress}%</span>
                                  </div>
                                  <div className="w-full bg-white/10 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${late ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 ml-4">
                              {job.status === 'Ready' && (
                                <button
                                  onClick={() => openModal(job, 'start')}
                                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <Play size={16} />
                                  Start
                                </button>
                              )}

                              {job.status === 'In Progress' && (
                                <>
                                  <button
                                    onClick={() => openModal(job, 'complete')}
                                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center gap-2 whitespace-nowrap"
                                  >
                                    <CheckCircle size={16} />
                                    Complete
                                  </button>
                                  <button
                                    onClick={() => openModal(job, 'pause')}
                                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2 whitespace-nowrap"
                                  >
                                    <Pause size={16} />
                                    Pause
                                  </button>
                                  <button
                                    onClick={() => openModal(job, 'report')}
                                    className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 flex items-center gap-2 whitespace-nowrap"
                                  >
                                    <Settings size={16} />
                                    Update
                                  </button>
                                </>
                              )}

                              {job.status === 'Paused' && (
                                <button
                                  onClick={() => handleResumeJob(job)}
                                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <Play size={16} />
                                  Resume
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Action Modal */}
      <Modal
        open={isModalOpen && !!selectedJob}
        onClose={closeModal}
        size="sm"
        title={
          <span className="text-xl font-semibold">
            {modalMode === "start" && "Start Job"}
            {modalMode === "complete" && "Complete Job"}
            {modalMode === "pause" && "Pause Job"}
            {modalMode === "report" && "Update Progress"}
          </span>
        }
        // initialFocusRef={modalMode === "start" ? operatorRef : undefined}
        footer={
          <>
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (modalMode === "start") handleStartJob();
                else if (modalMode === "complete") handleCompleteJob();
                else if (modalMode === "pause") handlePauseJob();
                else if (modalMode === "report") handleUpdateProgress();
              }}
              className={`px-4 py-2 rounded-lg text-white ${modalMode === "start"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : modalMode === "complete"
                    ? "bg-sky-600 hover:bg-sky-700"
                    : modalMode === "pause"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-sky-600 hover:bg-sky-700"
                }`}
            >
              {modalMode === "start" && "Start Job"}
              {modalMode === "complete" && "Complete Job"}
              {modalMode === "pause" && "Pause Job"}
              {modalMode === "report" && "Update Progress"}
            </button>
          </>
        }
      >
        {!selectedJob ? null : (
          <div className="p-0">
            {/* Job summary */}
            <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded">
              <div className="text-sm text-white/70">
                Job: <span className="font-semibold text-white">{selectedJob.jobId}</span>
              </div>
              <div className="text-sm text-white/70">
                Order:{" "}
                <span className="font-semibold text-white">
                  {selectedJob.orderNo}-{selectedJob.itemNo}
                </span>
              </div>
              <div className="text-sm text-white/70">
                Product: <span className="font-semibold text-white">{selectedJob.product}</span>
              </div>
              <div className="text-sm text-white/70">
                Process: <span className="font-semibold text-white">{selectedJob.process}</span>
              </div>
              <div className="text-sm text-white/70">
                Machine: <span className="font-semibold text-white">{selectedJob.machineCode}</span>
              </div>
            </div>

            {/* START */}
            {modalMode === "start" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Select Operator *
                  </label>
                  <select
                    ref={operatorRef}
                    value={formData.operator}
                    onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    required
                  >
                    <option className="select option" value="">
                      Choose operator...
                    </option>
                    {OPERATORS.map((op) => (
                      <option className="select option" key={op.id} value={op.name}>
                        {op.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="p-3 bg-sky-500/10 border border-sky-300/20 rounded text-sm">
                  <div className="font-medium text-sky-200 mb-1">Job will start now</div>
                  <div className="text-sky-200/80">
                    Planned duration: {selectedJob.setupMin + selectedJob.runMin} minutes
                  </div>
                </div>
              </div>
            )}

            {/* COMPLETE */}
            {modalMode === "complete" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Confirm Completion
                  </label>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-300/20 rounded">
                    <div className="text-sm text-emerald-200 mb-2">
                      <div>
                        Quantity:{" "}
                        <span className="font-semibold text-emerald-100">
                          {selectedJob.qty} units
                        </span>
                      </div>
                      <div>
                        Operator:{" "}
                        <span className="font-semibold text-emerald-100">
                          {selectedJob.operator}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full glass-input"
                    placeholder="Any notes about this job..."
                  />
                </div>
              </div>
            )}

            {/* PAUSE */}
            {modalMode === "pause" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Reason for Pause *
                  </label>
                  <select
                    value={formData.downReason}
                    onChange={(e) => setFormData({ ...formData, downReason: e.target.value })}
                    className="w-full glass-input"
                    required
                  >
                    <option className="select option" value="">
                      Select reason...
                    </option>
                    <option className="select option" value="Material Shortage">
                      Material Shortage
                    </option>
                    <option className="select option" value="Machine Issue">
                      Machine Issue
                    </option>
                    <option className="select option" value="Quality Issue">
                      Quality Issue
                    </option>
                    <option className="select option" value="Break Time">
                      Break Time
                    </option>
                    <option className="select option" value="Tooling Change">
                      Tooling Change
                    </option>
                    <option className="select option" value="Other">
                      Other
                    </option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full glass-input"
                    placeholder="Additional details..."
                  />
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-300/20 rounded text-sm text-amber-200">
                  <AlertTriangle size={16} className="inline mr-2" />
                  Job will be paused. Remember to resume when ready.
                </div>
              </div>
            )}

            {/* REPORT */}
            {modalMode === "report" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Quantity Completed
                  </label>
                  <input
                    type="number"
                    value={formData.qtyCompleted}
                    onChange={(e) =>
                      setFormData({ ...formData, qtyCompleted: parseInt(e.target.value) || 0 })
                    }
                    className="w-full glass-input"
                    min="0"
                    max={selectedJob.qty}
                  />
                  <div className="text-xs text-white/60 mt-1">
                    Total required: {selectedJob.qty} units
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white/80 mb-2">Progress</div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div
                      className="bg-sky-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          selectedJob.qty
                            ? (formData.qtyCompleted / selectedJob.qty) * 100
                            : 0,
                          100
                        )
                          }%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-white/60 text-right mt-1">
                    {Math.round(
                      selectedJob.qty
                        ? (formData.qtyCompleted / selectedJob.qty) * 100
                        : 0
                    )}
                    %
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full glass-input"
                    placeholder="Any issues or observations..."
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};

export default ProductionExecution;