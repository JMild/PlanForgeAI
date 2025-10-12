"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  Upload,
  Download,
  Factory,
  CheckCircle
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import Modal from "@/src/components/shared/Modal";
import { getMachinesDropdown, getWorkCenters } from "@/src/services/master";
import { ERROR_MESSAGES } from "@/src/config/messages";
import toast from "react-hot-toast";
import { DataTable } from "@/src/components/shared/table/Table";
import Loading from "@/src/components/Loading";

/* ================= Types (ตามสคีมา) ================ */
type WorkCenterStatus = "Active" | "Inactive";

type WorkCenter = {
  work_center_code: string;
  work_center_name: string;
  department: string;
  description?: string;
  status: WorkCenterStatus;
  machine_count: number
};

type Machine = {
  machine_code: string;
  machine_name: string;
};

export default function WorkCenterPage() {
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [machine, setMachine] = useState<Machine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // filters/search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | WorkCenterStatus>("all");

  // modal/form
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWC, setSelectedWC] = useState<WorkCenter | null>(null);
  const [wcForm, setWcForm] = useState<Partial<WorkCenter>>({
    work_center_code: "",
    work_center_name: "",
    department: "",
    description: "",
    status: "Active",
  });

  /* ================= Load ================= */
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const resWC = await getWorkCenters();
        const resM = await getMachinesDropdown();
        setWorkCenters(resWC || []);
        setMachine(resM || []);
      } catch (e) {
        console.error(e);
        toast.error(ERROR_MESSAGES.fetchFailed);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  /* ================= Helpers ================= */
  const departments = useMemo(() => {
    const s = new Set<string>();
    workCenters.forEach((w) => w.department && s.add(w.department));
    return ["all", ...Array.from(s).sort()];
  }, [workCenters]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return workCenters.filter((w) => {
      const matchQ =
        !q ||
        w.work_center_code.toLowerCase().includes(q) ||
        w.work_center_name.toLowerCase().includes(q) ||
        (w.department || "").toLowerCase().includes(q) ||
        (w.description || "").toLowerCase().includes(q);
      const matchDept = filterDept === "all" || w.department === filterDept;
      const matchStatus = filterStatus === "all" || w.status === filterStatus;
      return matchQ && matchDept && matchStatus;
    });
  }, [workCenters, searchTerm, filterDept, filterStatus]);

  const statusChip = (s: WorkCenterStatus) =>
    s === "Active" ? "status-success" : "status-inactive";

  /* ================= Handlers ================= */
  const openCreate = () => {
    setSelectedWC(null);
    setWcForm({
      work_center_code: "",
      work_center_name: "",
      department: "",
      description: "",
      status: "Active",
    });
    setIsEditing(true);
  };

  const openEdit = (wc: WorkCenter) => {
    setSelectedWC(wc);
    setWcForm({
      work_center_code: wc.work_center_code,
      work_center_name: wc.work_center_name,
      department: wc.department,
      description: wc.description || "",
      status: wc.status,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    // validate
    if (!wcForm.work_center_code || !wcForm.work_center_name || !wcForm.department) {
      toast.error("Please fill in Code, Name, and Department.");
      return;
    }

    if (selectedWC) {
      // update
      setWorkCenters((prev) =>
        prev.map((w) =>
          w.work_center_code === selectedWC.work_center_code
            ? {
              ...w,
              work_center_name: wcForm.work_center_name!,
              department: wcForm.department!,
              description: wcForm.description || "",
              status: wcForm.status as WorkCenterStatus,
            }
            : w
        )
      );
      toast.success("Work center updated.");
    } else {
      // prevent duplicate PK
      if (workCenters.some((w) => w.work_center_code === wcForm.work_center_code)) {
        toast.error(`Code "${wcForm.work_center_code}" already exists.`);
        return;
      }
      const row: WorkCenter = {
        work_center_code: wcForm.work_center_code!,
        work_center_name: wcForm.work_center_name!,
        department: wcForm.department!,
        description: wcForm.description || "",
        status: (wcForm.status as WorkCenterStatus) || "Active",
        machine_count: wcForm.machine_count!
      };
      setWorkCenters((prev) => [...prev, row]);
      toast.success("Work center created.");
    }

    setIsEditing(false);
    setSelectedWC(null);
  };

  const handleDelete = (code: string) => {
    if (confirm(`Delete work center ${code}?`)) {
      setWorkCenters((prev) => prev.filter((w) => w.work_center_code !== code));
      toast.success("Deleted.");
    }
  };

  const exportCSV = () => {
    const rows = [
      ["work_center_code", "work_center_name", "department", "description", "status", "created_date", "updated_date", "machine_count"],
      ...workCenters.map((w) => [
        w.work_center_code,
        w.work_center_name,
        w.department,
        (w.description || "").replaceAll('"', '""'),
        w.status,
        w.machine_count
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `work_centers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ================= Columns ================= */
  const columns = [
    { key: "work_center_code", label: "Code" },
    { key: "work_center_name", label: "Name" },
    { key: "department", label: "Department" },
    {
      key: "machine_count",
      label: "Machines",
      align: "center",
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (w: WorkCenter) => (
        <span className={`chip inline-flex ${statusChip(w.status)}`}>
          {w.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (w: WorkCenter) => (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => openEdit(w)} className="p-1 text-sky-300 hover:text-sky-200" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(w.work_center_code)} className="p-1 text-rose-300 hover:text-rose-200" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ] as const;

  /* ================= Render ================= */
  return (
    <div className="text-white">
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Work Centers
              </h1>
              <p className="text-sm text-white/60 mt-1">Master Data • MAS005</p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button onClick={exportCSV} className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button onClick={openCreate} className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Add Work Center
            </button>
          </div>
        }
        tabs={
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/70">Total Work Centers</div>
                    <div className="text-2xl font-bold mt-1">{workCenters.length}</div>
                  </div>
                  <Factory className="w-10 h-10 text-sky-300" />
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/70">Active</div>
                    <div className="text-2xl font-bold text-emerald-300 mt-1">
                      {workCenters.filter((w) => w.status === "Active").length}
                    </div>
                  </div>
                  <CheckCircle className="w-10 h-10 text-emerald-300" />
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/70">Total Machines</div>
                    <div className="text-2xl font-bold text-sky-300 mt-1">{machine.length}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-4 mb-1 mx-0.5">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by code, name, department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input w-full !pl-10 pr-4"
                />
              </div>

              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="glass-input w-44"
              >
                {departments.map((d) => (
                  <option key={d} value={d} className="select option">
                    {d === "all" ? "All Departments" : d}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "all" | WorkCenterStatus)}
                className="glass-input w-32"
              >
                {["all", "Active", "Inactive"].map((s) => (
                  <option key={s} value={s} className="select option">
                    {s === "all" ? "All Status" : s}
                  </option>
                ))}
              </select>
            </div>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(w) => w.work_center_code}
          isLoading={loading}
        />
      </div>

      {/* ===== Modal ===== */}
      <Modal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        size="lg"
        title={<span className="text-xl font-semibold">{selectedWC ? "Edit" : "Add"} Work Center</span>}
        footer={
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Code *</label>
            <input
              type="text"
              value={wcForm.work_center_code || ""}
              onChange={(e) => setWcForm({ ...wcForm, work_center_code: e.target.value })}
              disabled={!!selectedWC}
              className="glass-input w-full focus:border-transparent disabled:bg-white/10"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Name *</label>
            <input
              type="text"
              value={wcForm.work_center_name || ""}
              onChange={(e) => setWcForm({ ...wcForm, work_center_name: e.target.value })}
              className="glass-input w-full focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Department *</label>
            <input
              type="text"
              value={wcForm.department || ""}
              onChange={(e) => setWcForm({ ...wcForm, department: e.target.value })}
              className="glass-input w-full focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Status *</label>
            <select
              value={wcForm.status || "Active"}
              onChange={(e) => setWcForm({ ...wcForm, status: e.target.value as WorkCenterStatus })}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
            >
              <option value="Active" className="select option">Active</option>
              <option value="Inactive" className="select option">Inactive</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-white/70 mb-1">Description</label>
            <textarea
              value={wcForm.description || ""}
              onChange={(e) => setWcForm({ ...wcForm, description: e.target.value })}
              rows={2}
              className="glass-input w-full focus:border-transparent"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
