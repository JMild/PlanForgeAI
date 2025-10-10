"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus, Search, Edit, Trash2, Eye, Download, Upload, Calendar as CalIcon,
  Save, ChevronDown, ChevronRight, Clock, AlertCircle
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import { ModalMode } from "@/src/types";
import Modal from "@/src/components/shared/Modal";
import toast from "react-hot-toast";
import { ERROR_MESSAGES } from "@/src/config/messages";
import { getCalendar } from "@/src/lib/api";
import Loading from "@/src/components/Loading";
import EmptyState from "@/src/components/shared/EmptyState";

/* =========================
   Types
========================= */
type DayOfWeek =
  | "Monday" | "Tuesday" | "Wednesday" | "Thursday"
  | "Friday" | "Saturday" | "Sunday";

type CalendarStatus = "Active" | "Inactive" | "Draft";

interface Break { name: string; startTime: string; endTime: string; }
interface Shift { id: string; name: string; startTime: string; endTime: string; breaks: Break[]; }
interface Holiday { date: string; name: string; }

interface CalendarData {
  id: string;
  name: string;
  description: string;
  workingDays: DayOfWeek[];
  shifts: Shift[];
  holidays: Holiday[];
  status: CalendarStatus;
}

const DAYS_OF_WEEK: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/* =========================
   Component
========================= */
const ShiftsCalendarsMaster = () => {
  const [calendars, setCalendars] = useState<CalendarData[]>([]);
  const [loading, setLoading] = useState(true);

  // filters/search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<CalendarStatus | "all">("all");

  // expand + modal
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<CalendarData | null>(null);
  const [viewMode, setViewMode] = useState<ModalMode>(null);

  // form
  const emptyForm: CalendarData = {
    id: "", name: "", description: "", workingDays: [], shifts: [], holidays: [], status: "Active",
  };
  const [formData, setFormData] = useState<CalendarData>(emptyForm);

  /* ===== Load ===== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = (await getCalendar()) as CalendarData[];
        setCalendars(res || []);
      } catch (e) {
        console.error(e);
        toast.error(ERROR_MESSAGES.fetchFailed);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ===== Helpers ===== */
  const statusClass = (s: CalendarStatus) =>
    ({ Active: "status-success", Inactive: "status-inactive", Draft: "status-warning" }[s] || "status-inactive");

  const mm = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const span = (a: string, b: string) => { let d = mm(b) - mm(a); if (d < 0) d += 1440; return d; };
  const fmtDur = (mins: number) => `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ""}`;

  const calcShiftDur = (s: Shift) => {
    let m = span(s.startTime, s.endTime);
    s.breaks.forEach(b => (m -= span(b.startTime, b.endTime)));
    return Math.max(m, 0);
  };
  const calcHoursPerDay = (shifts: Shift[]) => (shifts.reduce((acc, s) => acc + calcShiftDur(s), 0) / 60).toFixed(1);

  /* ===== Stats ===== */
  const stats = useMemo(() => {
    const total = calendars.length;
    const by = (st: CalendarStatus) => calendars.filter(c => c.status === st).length;
    const totalShifts = calendars.reduce((s, c) => s + c.shifts.length, 0);
    const totalHolidays = calendars.reduce((s, c) => s + c.holidays.length, 0);
    return { total, active: by("Active"), draft: by("Draft"), inactive: by("Inactive"), totalShifts, totalHolidays };
  }, [calendars]);

  /* ===== Filtering ===== */
  const list = calendars.filter(c => {
    const q = searchTerm.toLowerCase().trim();
    const matchesQ = !q || [c.id, c.name, c.description].some(x => (x || "").toLowerCase().includes(q));
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesQ && matchesStatus;
  });

  /* ===== Expand ===== */
  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  /* ===== Modal openers ===== */
  const openCreate = () => {
    setFormData({
      id: `CAL-${String(Date.now()).slice(-6)}`,
      name: "",
      description: "",
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      shifts: [{ id: "S1", name: "Day Shift", startTime: "08:00", endTime: "17:00", breaks: [{ name: "Lunch", startTime: "12:00", endTime: "13:00" }] }],
      holidays: [],
      status: "Draft",
    });
    setEditingCalendar(null);
    setViewMode("edit");
    setIsModalOpen(true);
  };
  const openEdit = (c: CalendarData) => { setFormData(JSON.parse(JSON.stringify(c))); setEditingCalendar(c); setViewMode("edit"); setIsModalOpen(true); };
  const openView = (c: CalendarData) => { setEditingCalendar(c); setViewMode("view"); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingCalendar(null); setViewMode(null); };

  /* ===== Validate + Save ===== */
  const validate = (c: CalendarData) => {
    if (!c.name) return "Please fill in calendar name";
    if (c.workingDays.length === 0) return "Please select at least one working day";
    if (c.shifts.length === 0) return "Please add at least one shift";
    for (const s of c.shifts) if (span(s.startTime, s.endTime) === 0) return `Shift "${s.name}" must have a non-zero duration`;
    return null;
  };
  const handleSave = () => {
    const err = validate(formData);
    if (err) return toast.error(err);
    if (editingCalendar) {
      setCalendars(prev => prev.map(c => (c.id === editingCalendar.id ? { ...formData } : c)));
      toast.success("Calendar updated");
    } else {
      setCalendars(prev => [...prev, { ...formData }]);
      toast.success("Calendar created");
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm(`Delete calendar ${id}?`)) {
      setCalendars(prev => prev.filter(c => c.id !== id));
      toast.success("Calendar deleted");
    }
  };

  /* ===== Export (CSV) ===== */
  const exportCSV = () => {
    const rows = [
      ["Calendar", "Name", "Status", "WorkingDays", "Shifts", "Holidays", "Description"],
      ...calendars.map(c => [c.id, c.name, c.status, c.workingDays.join("|"), String(c.shifts.length), String(c.holidays.length), c.description?.replaceAll('"', '""') || ""]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `calendars_${new Date().toISOString().split("T")[0]}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  const handleImport = () => toast("Import is not implemented in this demo.", { icon: "ℹ️" });

  /* ===== Render ===== */
  return (
    <div className="text-white">
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Shifts & Calendars</h1>
              <p className="text-sm text-white/60 mt-1">Define working hours and schedules</p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-3">
            <button onClick={handleImport} className="btn btn-outline"><Upload size={18} />Import</button>
            <button onClick={exportCSV} className="btn btn-outline"><Download size={18} />Export</button>
            <button onClick={openCreate} className="btn btn-primary"><Plus size={18} />New Calendar</button>
          </div>
        }
        tabs={
          <>
            <div className="grid grid-cols-6 gap-4">
              <div className="glass-card glass-card-default-padding"><div className="flex items-center justify-between"><div><p className="text-sm text-white/70">Total Calendars</p><p className="text-2xl font-bold">{stats.total}</p></div><CalIcon size={32} className="text-white/70" /></div></div>
              <div className="glass-card glass-card-default-padding"><div className="flex items-center justify-between"><div><p className="text-sm text-white/70">Active</p><p className="text-2xl font-bold text-emerald-300">{stats.active}</p></div><span className="text-emerald-300 font-bold text-xl">A</span></div></div>
              <div className="glass-card glass-card-default-padding"><div className="flex items-center justify-between"><div><p className="text-sm text-white/70">Draft</p><p className="text-2xl font-bold text-amber-300">{stats.draft}</p></div><span className="text-amber-300 font-bold text-xl">D</span></div></div>
              <div className="glass-card glass-card-default-padding"><div className="flex items-center justify-between"><div><p className="text-sm text-white/70">Inactive</p><p className="text-2xl font-bold text-white/70">{stats.inactive}</p></div><span className="text-white/70 font-bold text-xl">I</span></div></div>
              <div className="glass-card glass-card-default-padding"><div className="flex items-center justify-between"><div><p className="text-sm text-white/70">Total Shifts</p><p className="text-2xl font-bold">{stats.totalShifts}</p></div><Clock size={32} className="text-sky-300" /></div></div>
              <div className="glass-card glass-card-default-padding"><div className="flex items-center justify-between"><div><p className="text-sm text-white/70">Holidays</p><p className="text-2xl font-bold">{stats.totalHolidays}</p></div><AlertCircle size={32} className="text-amber-300" /></div></div>
            </div>

            <div className="flex gap-4 mt-4 mb-1 mx-0.5">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="text" placeholder="Search calendars..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as CalendarStatus | "all")}
                className="glass-input"
              >
                {["all", "Active", "Inactive", "Draft"].map(v => (
                  <option key={v} value={v} className="select option">{v === "all" ? "All Status" : v}</option>
                ))}
              </select>
            </div>
          </>
        }
      />

      {/* ===== Table ===== */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <Loading text="Loading Shifts and Calendars..." />
        ) : list.length === 0 ? (
          <EmptyState
            icon={<CalIcon size={48} className="mx-auto text-white/40 mb-4" />}
            title="No calendars found"
            message="Create your first routing to get started"
            buttonLabel="Create calendar"
            onButtonClick={openCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  {["Calendar", "Working Days", "Shifts", "Hours/Day", "Holidays", "Status", "Actions"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-sm uppercase font-semibold text-white/80">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {list.map(c => {
                  const isOpen = !!expanded[c.id];
                  return (
                    <React.Fragment key={c.id}>
                      <tr className="hover:bg-white/5">
                        {/* Calendar */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <button onClick={() => toggle(c.id)} className="p-1 mt-0.5 rounded hover:bg-white/10" aria-label={isOpen ? "Collapse" : "Expand"}>
                              {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                            <div className="flex items-center gap-3">                       
                              <div>
                                <div className="font-medium">{c.name}</div>
                                <div className="text-sm text-white/70">{c.id}</div>
                                {c.description && <div className="text-xs text-white/60 mt-1 line-clamp-1">{c.description}</div>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Working days chips */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {DAYS_OF_WEEK.map(d => (
                              <span key={d} className={`px-2 py-0.5 rounded text-xs border ${c.workingDays.includes(d) ? "bg-sky-500/20 text-sky-300 border-sky-500/30" : "bg-white/5 text-white/35 border-white/10 line-through"}`} title={d}>
                                {d.slice(0, 3)}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Shifts summary */}
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <span className="font-medium">{c.shifts.length}</span>
                            <span className="text-white/60"> total</span>
                          </div>
                          {!!c.shifts.length && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {c.shifts.slice(0, 3).map(s => (
                                <span key={s.id} className="px-2 py-0.5 rounded text-xs bg-white/5 border border-white/10 text-white/80" title={`${s.name}: ${s.startTime}-${s.endTime}`}>{s.name}</span>
                              ))}
                              {c.shifts.length > 3 && <span className="text-xs text-white/60">+{c.shifts.length - 3} more</span>}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-white/80">{calcHoursPerDay(c.shifts)}</td>

                        {/* Holidays */}
                        <td className="px-6 py-4">
                          <div className="text-sm"><span className="font-medium">{c.holidays.length}</span><span className="text-white/60"> day(s)</span></div>
                          {!!c.holidays.length && (
                            <div className="mt-1 text-xs text-white/70 line-clamp-1">
                              {c.holidays.slice(0, 2).map(h => h.name).join(", ")}
                              {c.holidays.length > 2 && ` +${c.holidays.length - 2} more`}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4"><span className={`chip ${statusClass(c.status)}`}>{c.status}</span></td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openView(c)} className="p-1 hover:bg-white/10 rounded" title="View"><Eye size={16} className="text-white/70" /></button>
                            <button onClick={() => openEdit(c)} className="p-1 hover:bg-white/10 rounded" title="Edit"><Edit size={16} className="text-cyan-300" /></button>
                            <button onClick={() => handleDelete(c.id)} className="p-1 hover:bg-white/10 rounded" title="Delete"><Trash2 size={16} className="text-rose-300" /></button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail row (nested table) */}
                      {isOpen && (
                        <tr>
                          <td colSpan={7} className="px-6 pb-5">
                            <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-white/5">
                                  <tr>
                                    {["SHIFT", "TIME", "DURATION", "BREAKS"].map(h => (
                                      <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-white/60">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                  {c.shifts.map(s => {
                                    const mins = calcShiftDur(s);
                                    const breaks = s.breaks.length
                                      ? s.breaks.map(b => `${b.name} (${b.startTime}-${b.endTime})`).join(", ")
                                      : "-";
                                    return (
                                      <tr key={s.id} className="hover:bg-white/5">
                                        <td className="px-4 py-3 text-sm font-semibold">{s.name}</td>
                                        <td className="px-4 py-3 text-sm text-white/80">{s.startTime} — {s.endTime}</td>
                                        <td className="px-4 py-3 text-sm text-white/80">{fmtDur(mins)}</td>
                                        <td className="px-4 py-3 text-sm text-white/80">{breaks}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {!!c.holidays.length && (
                              <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
                                <div className="text-xs font-semibold text-white/70 mb-2">HOLIDAYS</div>
                                <div className="flex flex-wrap gap-2">
                                  {c.holidays.map((h, i) => (
                                    <span key={`${h.name}-${i}`} className="px-2 py-1 rounded text-xs bg-white/10 border border-white/15 text-white/80" title={new Date(h.date).toLocaleDateString()}>{h.name}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== Modal (View / Edit) ===== */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="2xl"
        title={<span className="text-xl font-semibold">{viewMode === "view" ? "Calendar Details" : editingCalendar ? "Edit Calendar" : "Create New Calendar"}</span>}
        footer={
          <>
            <button onClick={closeModal} className="btn btn-outline">Cancel</button>
            {viewMode === "view" ? (
              <button onClick={() => setViewMode("edit")} className="btn btn-primary"><Edit size={18} />Edit Calendar</button>
            ) : (
              <button onClick={handleSave} className="btn btn-primary"><Save size={18} />Save Calendar</button>
            )}
          </>
        }
      >
        {/* เนื้อหาในโมดัลเหมือนเวอร์ชันก่อนของคุณได้เลย — ไม่แตะต้องตรรกะฟอร์มเพื่อให้สอดคล้องกับโปรเจกต์ */}
        {/* (ตัดออกเพื่อย่อความยาว — ใช้ของคุณเดิมได้เลย) */}
      </Modal>
    </div>
  );
};

export default ShiftsCalendarsMaster;
