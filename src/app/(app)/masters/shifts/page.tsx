"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Calendar as CalIcon,
  Save,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import { ModalMode } from "@/src/types";
import Modal from "@/src/components/shared/Modal";
import toast from "react-hot-toast";
import { ERROR_MESSAGES } from "@/src/config/messages";
import { ExpandableDataTable } from "@/src/components/shared/table/ExpandableDataTable";
import { getCalendarsFull } from "@/src/services/master";

/* =========================
   Types
========================= */
type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type CalendarStatus = "Active" | "Inactive" | "Draft";

interface Break {
  name: string;
  startTime: string;
  endTime: string;
}
interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breaks: Break[];
}
interface Holiday {
  date: string;
  name: string;
}

interface CalendarData {
  id: string;
  name: string;
  description: string;
  workingDays: DayOfWeek[];
  shifts: Shift[];
  holidays: Holiday[];
  status: CalendarStatus;
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/* =========================
   Component
========================= */
const ShiftsCalendarsMaster = () => {
  const [calendars, setCalendars] = useState<CalendarData[]>([]);
  const [loading, setLoading] = useState(true);

  // filters/search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<CalendarStatus | "all">("all");

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<CalendarData | null>(
    null
  );
  const [viewMode, setViewMode] = useState<ModalMode>(null);

  // form
  const emptyForm: CalendarData = {
    id: "",
    name: "",
    description: "",
    workingDays: [],
    shifts: [],
    holidays: [],
    status: "Active",
  };
  const [formData, setFormData] = useState<CalendarData>(emptyForm);

  /* ===== Time helpers for durations ===== */
  const mm = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
  };
  const span = (a: string, b: string) => {
    let d = mm(b) - mm(a);
    if (d < 0) d += 1440; // รองรับข้ามวัน
    return d;
  };
  const fmtDur = (mins: number) =>
    `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ""}`;
  const calcShiftDur = (s: Shift) => {
    let m = span(s.startTime, s.endTime);
    s.breaks.forEach((b) => (m -= span(b.startTime, b.endTime)));
    return Math.max(m, 0);
  };
  const calculateWorkingHours = (shifts: Shift[]) => {
    const totalMin = shifts.reduce((acc, s) => acc + calcShiftDur(s), 0);
    return (totalMin / 60).toFixed(1);
  };
  const calcHoursPerDay = (shifts: Shift[]) =>
    (shifts.reduce((acc, s) => acc + calcShiftDur(s), 0) / 60).toFixed(1);

  /* ===== API mapper: resC -> CalendarData[] ===== */
  type ApiBreak = {
    break_name?: string;
    name?: string;
    start_time?: string;
    end_time?: string;
    startTime?: string;
    endTime?: string;
  };
  type ApiShift = {
    shift_id?: number | string;
    shift_name?: string;
    name?: string;
    start_time?: string;
    end_time?: string;
    startTime?: string;
    endTime?: string;
    breaks?: ApiBreak[];
  };
  type ApiHoliday = {
    holiday_date?: string;
    holiday_name?: string;
    date?: string;
    name?: string;
  };
  type ApiCalendar = {
    calendar_id?: string;
    calendar_name?: string;
    description?: string;
    status?: string;
    created_date?: string;
    working_days?: string[];
    shifts?: ApiShift[];
    holidays?: ApiHoliday[];
  };

  const mapFromApi = (row: ApiCalendar): CalendarData => {
    const mapBreak = (b: ApiBreak, i: number): Break => ({
      name: b.break_name ?? b.name ?? `Break ${i + 1}`,
      startTime: b.start_time ?? b.startTime ?? "",
      endTime: b.end_time ?? b.endTime ?? "",
    });

    const mapShift = (s: ApiShift, idx: number): Shift => ({
      id: String(s.shift_id ?? `S${idx + 1}`),
      name: s.shift_name ?? s.name ?? `Shift ${idx + 1}`,
      startTime: s.start_time ?? s.startTime ?? "",
      endTime: s.end_time ?? s.endTime ?? "",
      breaks: (s.breaks ?? []).map(mapBreak),
    });

    const mapHoliday = (h: ApiHoliday): Holiday => ({
      date: h.holiday_date ?? h.date ?? "",
      name: h.holiday_name ?? h.name ?? "Holiday",
    });

    return {
      id: row.calendar_id ?? "",
      name: row.calendar_name ?? "",
      description: row.description ?? "",
      workingDays: (row.working_days ?? []) as DayOfWeek[],
      shifts: (row.shifts ?? []).map(mapShift),
      holidays: (row.holidays ?? []).map(mapHoliday),
      status:
        (row.status as CalendarStatus) && ["Active", "Inactive", "Draft"].includes(row.status as string)
          ? (row.status as CalendarStatus)
          : "Active",
    };
  };

  /* ===== Load ===== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resC = await getCalendarsFull(); // ← ใช้ตัวนี้แทน
        const mapped = (resC ?? []).map(mapFromApi);
        setCalendars(mapped);
      } catch (e) {
        console.error(e);
        toast.error(ERROR_MESSAGES.fetchFailed || "Failed to fetch calendars.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ===== Helpers ===== */
  const statusClass = (s: CalendarStatus) =>
    (
      {
        Active: "status-success",
        Inactive: "status-inactive",
        Draft: "status-warning",
      } as const
    )[s] || "status-inactive";

  /* ===== Stats ===== */
  const stats = useMemo(() => {
    const total = calendars.length;
    const by = (st: CalendarStatus) => calendars.filter((c) => c.status === st).length;
    const totalShifts = calendars.reduce((s, c) => s + c.shifts.length, 0);
    const totalHolidays = calendars.reduce((s, c) => s + c.holidays.length, 0);
    return {
      total,
      active: by("Active"),
      draft: by("Draft"),
      inactive: by("Inactive"),
      totalShifts,
      totalHolidays,
    };
  }, [calendars]);

  /* ===== Filtering ===== */
  const list = calendars.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesQ =
      !q ||
      [c.id, c.name, c.description].some((x) =>
        (x || "").toLowerCase().includes(q)
      );
    const matchesStatus =
      filterStatus === "all" || c.status === filterStatus;
    return matchesQ && matchesStatus;
  });

  /* ===== Modal openers ===== */
  const openCreate = () => {
    setFormData({
      id: `CAL-${String(Date.now()).slice(-6)}`,
      name: "",
      description: "",
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      shifts: [
        {
          id: "S1",
          name: "Day Shift",
          startTime: "08:00",
          endTime: "17:00",
          breaks: [{ name: "Lunch", startTime: "12:00", endTime: "13:00" }],
        },
      ],
      holidays: [],
      status: "Draft",
    });
    setEditingCalendar(null);
    setViewMode("edit");
    setIsModalOpen(true);
  };
  const openEdit = (c: CalendarData) => {
    setFormData(JSON.parse(JSON.stringify(c)));
    setEditingCalendar(c);
    setViewMode("edit");
    setIsModalOpen(true);
  };
  const openView = (c: CalendarData) => {
    setEditingCalendar(c);
    setViewMode("view");
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCalendar(null);
    setViewMode(null);
  };

  /* ===== Form helpers ===== */
  const toggleWorkingDay = (day: DayOfWeek) => {
    setFormData((prev) => {
      const exists = prev.workingDays.includes(day);
      return {
        ...prev,
        workingDays: exists
          ? prev.workingDays.filter((d) => d !== day)
          : [...prev.workingDays, day],
      };
    });
  };

  const addShift = () => {
    const id = `S${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setFormData((prev) => ({
      ...prev,
      shifts: [
        ...prev.shifts,
        {
          id,
          name: "New Shift",
          startTime: "08:00",
          endTime: "17:00",
          breaks: [],
        },
      ],
    }));
  };
  const updateShift = <K extends keyof Shift>(
    shiftId: string,
    key: K,
    value: Shift[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      shifts: prev.shifts.map((s) =>
        s.id === shiftId ? { ...s, [key]: value } : s
      ),
    }));
  };
  const removeShift = (shiftId: string) => {
    setFormData((prev) => ({
      ...prev,
      shifts: prev.shifts.filter((s) => s.id !== shiftId),
    }));
  };

  const addBreak = (shiftId: string) => {
    setFormData((prev) => ({
      ...prev,
      shifts: prev.shifts.map((s) =>
        s.id === shiftId
          ? {
              ...s,
              breaks: [
                ...s.breaks,
                { name: "Break", startTime: "12:00", endTime: "12:15" },
              ],
            }
          : s
      ),
    }));
  };
  const updateBreak = (
    shiftId: string,
    breakIdx: number,
    key: keyof Break,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      shifts: prev.shifts.map((s) => {
        if (s.id !== shiftId) return s;
        const next = [...s.breaks];
        next[breakIdx] = { ...next[breakIdx], [key]: value };
        return { ...s, breaks: next };
      }),
    }));
  };
  const removeBreak = (shiftId: string, breakIdx: number) => {
    setFormData((prev) => ({
      ...prev,
      shifts: prev.shifts.map((s) =>
        s.id === shiftId
          ? { ...s, breaks: s.breaks.filter((_, i) => i !== breakIdx) }
          : s
      ),
    }));
  };

  const addHoliday = () => {
    setFormData((prev) => ({
      ...prev,
      holidays: [
        ...prev.holidays,
        { date: new Date().toISOString().slice(0, 10), name: "Holiday" },
      ],
    }));
  };
  const updateHoliday = (idx: number, key: keyof Holiday, value: string) => {
    setFormData((prev) => {
      const next = [...prev.holidays];
      next[idx] = { ...next[idx], [key]: value };
      return { ...prev, holidays: next };
    });
  };
  const removeHoliday = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      holidays: prev.holidays.filter((_, i) => i !== idx),
    }));
  };

  /* ===== Validate + Save ===== */
  const validate = (c: CalendarData) => {
    if (!c.name) return "Please fill in calendar name";
    if (c.workingDays.length === 0)
      return "Please select at least one working day";
    if (c.shifts.length === 0) return "Please add at least one shift";
    for (const s of c.shifts)
      if (span(s.startTime, s.endTime) === 0)
        return `Shift "${s.name}" must have a non-zero duration`;
    return null;
  };

  const handleSave = () => {
    const err = validate(formData);
    if (err) return toast.error(err);
    if (editingCalendar) {
      setCalendars((prev) =>
        prev.map((c) => (c.id === editingCalendar.id ? { ...formData } : c))
      );
      toast.success("Calendar updated");
    } else {
      setCalendars((prev) => [...prev, { ...formData }]);
      toast.success("Calendar created");
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm(`Delete calendar ${id}?`)) {
      setCalendars((prev) => prev.filter((c) => c.id !== id));
      toast.success("Calendar deleted");
    }
  };

  /* ===== Export (CSV) ===== */
  const exportCSV = () => {
    const rows = [
      [
        "Calendar",
        "Name",
        "Status",
        "WorkingDays",
        "Shifts",
        "Holidays",
        "Description",
      ],
      ...calendars.map((c) => [
        c.id,
        c.name,
        c.status,
        c.workingDays.join("|"),
        String(c.shifts.length),
        String(c.holidays.length),
        c.description?.replaceAll('"', '""') || "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calendars_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleImport = () =>
    toast("Import is not implemented in this demo.", { icon: "ℹ️" });

  /* ===== Render ===== */
  return (
    <div className="text-white">
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Shifts &amp; Calendars</h1>
              <p className="text-sm text-white/60 mt-1">
                Define working hours and schedules
              </p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-3">
            <button onClick={handleImport} className="btn btn-outline">
              <Upload size={18} />
              Import
            </button>
            <button onClick={exportCSV} className="btn btn-outline">
              <Download size={18} />
              Export
            </button>
            <button onClick={openCreate} className="btn btn-primary">
              <Plus size={18} />
              New Calendar
            </button>
          </div>
        }
        tabs={
          <>
            <div className="grid grid-cols-6 gap-4">
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Total Calendars</p>
                    <p className="text-2xl font-bold">{calendars.length}</p>
                  </div>
                  <CalIcon size={32} className="text-white/70" />
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Active</p>
                    <p className="text-2xl font-bold text-emerald-300">
                      {calendars.filter((c) => c.status === "Active").length}
                    </p>
                  </div>
                  <span className="text-emerald-300 font-bold text-xl">A</span>
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Draft</p>
                    <p className="text-2xl font-bold text-amber-300">
                      {calendars.filter((c) => c.status === "Draft").length}
                    </p>
                  </div>
                  <span className="text-amber-300 font-bold text-xl">D</span>
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Inactive</p>
                    <p className="text-2xl font-bold text-white/70">
                      {calendars.filter((c) => c.status === "Inactive").length}
                    </p>
                  </div>
                  <span className="text-white/70 font-bold text-xl">I</span>
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Total Shifts</p>
                    <p className="text-2xl font-bold">
                      {calendars.reduce((s, c) => s + c.shifts.length, 0)}
                    </p>
                  </div>
                  <Clock size={32} className="text-sky-300" />
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Holidays</p>
                    <p className="text-2xl font-bold">
                      {calendars.reduce((s, c) => s + c.holidays.length, 0)}
                    </p>
                  </div>
                  <AlertCircle size={32} className="text-amber-300" />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-4 mb-1 mx-0.5">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                />
                <input
                  type="text"
                  placeholder="Search calendars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input w-full !pl-10 pr-4"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as CalendarStatus | "all")
                }
                className="glass-input w-32"
              >
                {["all", "Active", "Inactive", "Draft"].map((v) => (
                  <option key={v} value={v} className="select option">
                    {v === "all" ? "All Status" : v}
                  </option>
                ))}
              </select>
            </div>
          </>
        }
      />

      {/* ===== Table ===== */}
      <div className="px-4 py-6">
        <ExpandableDataTable
          data={list}
          rowKey={(c) => c.id}
          columns={[
            {
              key: "calendar",
              label: "Calendar",
              render: (c: any) => (
                <div className="flex items-start gap-3">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    {c.description && (
                      <div className="text-xs text-white/60 line-clamp-1">
                        {c.description}
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: "workingDays",
              label: "Working Days",
              render: (c: any) => (
                <div className="flex flex-wrap gap-1">
                  {DAYS_OF_WEEK.map((d) => (
                    <span
                      key={d}
                      className={`px-2 py-0.5 rounded text-xs border ${
                        c.workingDays.includes(d)
                          ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                          : "bg-white/5 text-white/35 border-white/10 line-through"
                      }`}
                      title={d}
                    >
                      {d.slice(0, 3)}
                    </span>
                  ))}
                </div>
              ),
            },
            {
              key: "shifts",
              label: "Shifts",
              render: (c: any) => (
                <div className="text-sm">
                  <span className="font-medium">{c.shifts.length}</span>
                  <span className="text-white/60"> total</span>
                </div>
              ),
            },
            {
              key: "hoursPerDay",
              label: "Hours/Day",
              render: (c: any) => (
                <div className="text-sm text-white/80">
                  {calcHoursPerDay(c.shifts)}
                </div>
              ),
            },
            {
              key: "holidays",
              label: "Holidays",
              render: (c: any) => (
                <div className="text-sm">
                  <span className="font-medium">{c.holidays.length}</span>
                  <span className="text-white/60"> day(s)</span>
                </div>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (c: any) => (
                <span className={`chip ${statusClass(c.status)}`}>
                  {c.status}
                </span>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              align: "center",
              render: (c: any) => (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => openView(c)}
                    className="p-1 hover:bg-white/10 rounded"
                    title="View"
                  >
                    <Eye size={16} className="text-white/70" />
                  </button>
                  <button
                    onClick={() => openEdit(c)}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Edit"
                  >
                    <Edit size={16} className="text-cyan-300" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-rose-300" />
                  </button>
                </div>
              ),
            },
          ]}
          renderExpandedRow={(c) => (
            <div className="space-y-3">
              {/* Shifts Table */}
              <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      {["SHIFT", "TIME", "DURATION", "BREAKS"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-white/60"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {c.shifts.map((s: any) => {
                      const mins = calcShiftDur(s);
                      const breaks = s.breaks.length
                        ? s.breaks
                            .map(
                              (b: any) =>
                                `${b.name} (${b.startTime}-${b.endTime})`
                            )
                            .join(", ")
                        : "-";
                      return (
                        <tr key={s.id} className="hover:bg-white/5">
                          <td className="px-4 py-3 text-sm font-semibold">
                            {s.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-white/80">
                            {s.startTime} — {s.endTime}
                          </td>
                          <td className="px-4 py-3 text-sm text-white/80">
                            {fmtDur(mins)}
                          </td>
                          <td className="px-4 py-3 text-sm text-white/80">
                            {breaks}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Holidays */}
              {c.holidays.length > 0 && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="text-xs font-semibold text-white/70 mb-2">
                    HOLIDAYS
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.holidays.map((h: any, i: number) => (
                      <span
                        key={`${h.name}-${i}`}
                        className="px-2 py-1 rounded text-xs bg-white/10 border border-white/15 text-white/80"
                        title={new Date(h.date).toLocaleDateString()}
                      >
                        {h.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          isLoading={loading}
        />
      </div>

      {/* ===== Modal (View / Edit) ===== */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="2xl"
        title={
          <span className="text-xl font-semibold">
            {viewMode === "view"
              ? "Calendar Details"
              : editingCalendar
              ? "Edit Calendar"
              : "Create New Calendar"}
          </span>
        }
        footer={
          <>
            <button onClick={closeModal} className="btn btn-outline">
              Cancel
            </button>
            {viewMode === "view" ? (
              <button
                onClick={() => setViewMode("edit")}
                className="btn btn-primary"
              >
                <Edit size={18} />
                Edit Calendar
              </button>
            ) : (
              <button onClick={handleSave} className="btn btn-primary">
                <Save size={18} />
                Save Calendar
              </button>
            )}
          </>
        }
      >
        {viewMode === "view" && editingCalendar ? (
          <div className="space-y-6 text-white">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Calendar ID
                </label>
                <p className="mt-1 text-lg font-semibold">
                  {editingCalendar.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Name</label>
                <p className="mt-1 text-white">{editingCalendar.name}</p>
              </div>
            </div>

            {editingCalendar.description && (
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Description
                </label>
                <p className="mt-1 text-white">{editingCalendar.description}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Working Days
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <span
                    key={day}
                    className={`px-3 py-1 rounded text-sm ${
                      editingCalendar.workingDays.includes(day)
                        ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                        : "bg-white/5 text-white/35 border-white/10 line-through"
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block">
                Shifts
              </label>
              <div className="space-y-3">
                {editingCalendar.shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="border border-white/15 rounded-lg p-4 bg-white/5"
                  >
                    <h4 className="font-semibold text-white mb-2">
                      {shift.name}
                    </h4>
                    <div className="text-sm text-white/80 space-y-1">
                      <div>
                        Time: {shift.startTime} - {shift.endTime}
                      </div>
                      {shift.breaks.length > 0 && (
                        <div>
                          Breaks:{" "}
                          {shift.breaks
                            .map(
                              (br) => `${br.name} (${br.startTime}-${br.endTime})`
                            )
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {editingCalendar.holidays.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-300 mb-3 block">
                  Holidays
                </label>
                <div className="space-y-2">
                  {editingCalendar.holidays.map((holiday, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm p-2 bg-white/5 border border-white/10 rounded"
                    >
                      <span className="text-white">{holiday.name}</span>
                      <span className="text-white/70">
                        {new Date(holiday.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 text-white">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Calendar ID
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-white/15 bg-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as CalendarStatus,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-white/15 bg-white/10 text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-white/15 bg-white/10 text-white"
                    placeholder="e.g., Standard 5-Day Week"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-white/15 bg-white/10 text-white"
                    placeholder="Brief description of this calendar..."
                  />
                </div>
              </div>
            </div>

            {/* Working Days */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Working Days *
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <label
                    key={day}
                    onClick={() => toggleWorkingDay(day)}
                    className={`flex flex-col items-center px-3 py-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.workingDays.includes(day)
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-white/15 hover:border-white/30"
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {day.substring(0, 3)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Shifts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Shifts *</h3>
                <button
                  type="button"
                  onClick={addShift}
                  className="px-3 py-1 text-white text-sm rounded flex items-center gap-1 btn-primary"
                >
                  <Plus size={16} />
                  Add Shift
                </button>
              </div>

              <div className="space-y-4">
                {formData.shifts.map((shift, idx) => (
                  <div
                    key={shift.id}
                    className="border-2 border-white/15 rounded-lg p-4 bg-white/5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm flex-shrink-0">
                        {idx + 1}
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-medium text-white/80 block mb-1">
                              Shift Name *
                            </label>
                            <input
                              type="text"
                              value={shift.name}
                              onChange={(e) =>
                                updateShift(shift.id, "name", e.target.value)
                              }
                              className="w-full px-2 py-1.5 text-sm rounded border border-white/15 bg-white/10 text-white"
                              placeholder="e.g., Day Shift"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-white/80 block mb-1">
                              Start Time *
                            </label>
                            <input
                              type="time"
                              value={shift.startTime}
                              onChange={(e) =>
                                updateShift(
                                  shift.id,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1.5 text-sm rounded border border-white/15 bg-white/10 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-white/80 block mb-1">
                              End Time *
                            </label>
                            <input
                              type="time"
                              value={shift.endTime}
                              onChange={(e) =>
                                updateShift(shift.id, "endTime", e.target.value)
                              }
                              className="w-full px-2 py-1.5 text-sm rounded border border-white/15 bg-white/10 text-white"
                            />
                          </div>
                        </div>

                        {/* Breaks */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-white/80">
                              Breaks
                            </label>
                            <button
                              type="button"
                              onClick={() => addBreak(shift.id)}
                              className="text-xs text-blue-300 hover:text-blue-200 flex items-center gap-1"
                            >
                              <Plus size={14} />
                              Add Break
                            </button>
                          </div>
                          {shift.breaks.length > 0 && (
                            <div className="space-y-2">
                              {shift.breaks.map((br, brIdx) => (
                                <div
                                  key={brIdx}
                                  className="flex items-center gap-2 bg-white/5 p-2 rounded border border-white/10"
                                >
                                  <input
                                    type="text"
                                    value={br.name}
                                    onChange={(e) =>
                                      updateBreak(
                                        shift.id,
                                        brIdx,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    className="flex-1 px-2 py-1 text-xs rounded border border-white/15 bg-white/10 text-white"
                                    placeholder="Break name"
                                  />
                                  <input
                                    type="time"
                                    value={br.startTime}
                                    onChange={(e) =>
                                      updateBreak(
                                        shift.id,
                                        brIdx,
                                        "startTime",
                                        e.target.value
                                      )
                                    }
                                    className="w-24 px-2 py-1 text-xs rounded border border-white/15 bg-white/10 text-white"
                                  />
                                  <span className="text-white/50">-</span>
                                  <input
                                    type="time"
                                    value={br.endTime}
                                    onChange={(e) =>
                                      updateBreak(
                                        shift.id,
                                        brIdx,
                                        "endTime",
                                        e.target.value
                                      )
                                    }
                                    className="w-24 px-2 py-1 text-xs rounded border border-white/15 bg-white/10 text-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeBreak(shift.id, brIdx)}
                                    className="p-1 text-red-300 hover:bg-rose-500/10 rounded"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-white/80 bg-white/5 p-2 rounded border border-white/10">
                          Duration: {fmtDur(calcShiftDur(shift))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeShift(shift.id)}
                        className="p-2 text-red-300 hover:bg-rose-500/10 rounded"
                        title="Remove Shift"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Holidays */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Holidays (Optional)
                </h3>
                <button
                  type="button"
                  onClick={addHoliday}
                  className="px-3 py-1 text-white text-sm rounded flex items-center gap-1 btn-primary"
                >
                  <Plus size={16} />
                  Add Holiday
                </button>
              </div>

              {formData.holidays.length > 0 ? (
                <div className="space-y-2">
                  {formData.holidays.map((holiday, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg"
                    >
                      <input
                        type="date"
                        value={holiday.date}
                        onChange={(e) =>
                          updateHoliday(idx, "date", e.target.value)
                        }
                        className="w-40 px-3 py-2 text-sm rounded border border-white/15 bg-white/10 text-white"
                      />
                      <input
                        type="text"
                        value={holiday.name}
                        onChange={(e) =>
                          updateHoliday(idx, "name", e.target.value)
                        }
                        className="flex-1 px-3 py-2 text-sm rounded border border-white/15 bg-white/10 text-white"
                        placeholder="Holiday name"
                      />
                      <button
                        type="button"
                        onClick={() => removeHoliday(idx)}
                        className="p-2 text-red-300 hover:bg-rose-500/10 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/70 italic">
                  No holidays defined. Click &quot;Add Holiday&quot; to add one.
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle
                  size={18}
                  className="text-sky-300 mt-0.5 flex-shrink-0"
                />
                <div className="text-sm text-sky-100">
                  <div className="font-medium mb-1">Calendar Summary</div>
                  <div className="space-y-1">
                    <div>Working Days: {formData.workingDays.length} days/week</div>
                    <div>Total Shifts: {formData.shifts.length}</div>
                    <div>
                      Working Hours: {calculateWorkingHours(formData.shifts)} hrs/day
                    </div>
                    <div>Holidays: {formData.holidays.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShiftsCalendarsMaster;
