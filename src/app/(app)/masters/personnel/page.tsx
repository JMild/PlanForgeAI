"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  Upload,
  Download,
  Users,
  Award,
  Calendar,
  Briefcase,
  Phone,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Settings,
  Filter,
  Eye,
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import Modal from "@/src/components/shared/Modal";
import toast from "react-hot-toast";
import { ERROR_MESSAGES } from "@/src/config/messages";
import { getMachines, getProcesses, getPersonnel } from "@/src/services/master";
import { DataTable } from "@/src/components/shared/table/Table";

/* ========= Types ========= */
type Personnel = {
  empCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: "Active" | "On Leave" | "Inactive";
  hireDate: string;
  calendarId: string;
  shiftPattern: string;
  workCenter?: string;
  skillTags: string[];
  certifications?: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: string;
  birthDate?: string;
  photo?: string;
  notes?: string;
  createdAt: string;

  allowedProcesses?: string[];
  allowedMachines?: string[];
};

type Process = { process_code: string; process_name: string };
type Machine = { machineCode: string; machineName: string };

type ModalMode = "view" | "assign" | "edit" | null;

/* ========= Helpers ========= */
const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "status-success";
    case "On Leave":
      return "status-warning";
    case "Inactive":
      return "status-inactive";
    default:
      return "status-inactive";
  }
};
const getStatusIcon = (status: string) => {
  switch (status) {
    case "Active":
      return <CheckCircle className="w-4 h-4" />;
    case "On Leave":
      return <Clock className="w-4 h-4" />;
    case "Inactive":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return null;
  }
};
const toggleCode = (arr: string[], code: string) =>
  arr.includes(code) ? arr.filter((c) => c !== code) : [...arr, code];

/* ========= Page ========= */
const PersonnelPage = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | Personnel["status"]>("all");

  // unified modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [modalPerson, setModalPerson] = useState<Personnel | null>(null);

  // assignment selections (used in "assign" mode)
  const [assignProcQuery, setAssignProcQuery] = useState("");
  const [assignMachQuery, setAssignMachQuery] = useState("");
  const [assignSelectedProcs, setAssignSelectedProcs] = useState<string[]>([]);
  const [assignSelectedMach, setAssignSelectedMach] = useState<string[]>([]);

  // edit form
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);
  const [personForm, setPersonForm] = useState<Partial<Personnel>>({
    empCode: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    status: "Active",
    hireDate: new Date().toISOString().split("T")[0],
    calendarId: "CAL001",
    shiftPattern: "2-Shift",
    skillTags: [],
    certifications: [],
    allowedProcesses: [],
    allowedMachines: [],
  });
  const firstNameRef = useRef<HTMLInputElement>(null);

  /* ===== Load data ===== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resPeople = (await getPersonnel()) as Personnel[];
        const resProcesses = await getProcesses();
        const resMachines = await getMachines();
        setProcesses(resProcesses);
        setMachines(resMachines);
        setPersonnel(resPeople);
      } catch (error) {
        console.error("Fetch data failed:", error);
        toast.error(ERROR_MESSAGES.fetchFailed);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ===== Derived ===== */
  const departments = useMemo(() => {
    const depts = new Set(personnel.map((p) => p.department));
    return Array.from(depts).sort();
  }, [personnel]);

  const filteredPersonnel = useMemo(() => {
    return personnel.filter((person) => {
      const matchesSearch =
        person.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDept === "all" || person.department === filterDept;
      const matchesStatus = filterStatus === "all" || person.status === filterStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [personnel, searchTerm, filterDept, filterStatus]);

  const stats = useMemo(() => {
    const activeCount = personnel.filter((p) => p.status === "Active").length;
    const avgTenure =
      personnel.reduce((sum, p) => {
        const years = (Date.now() - new Date(p.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
        return sum + years;
      }, 0) / Math.max(personnel.length, 1);
    const departments = new Set(personnel.map((p) => p.department)).size;
    return { activeCount, avgTenure, departments };
  }, [personnel]);

  // lookups
  const getProcessName = useCallback(
    (code: string) => processes.find((p) => p.process_code === code)?.process_name || code,
    [processes]
  );
  const getMachineName = useCallback(
    (code: string) => machines.find((m) => m.machineCode === code)?.machineName || code,
    [machines]
  );

  /* ===== Actions ===== */
  const openEdit = (person?: Personnel) => {
    if (person) {
      setPersonForm({
        ...person,
        allowedProcesses: person.allowedProcesses ?? [],
        allowedMachines: person.allowedMachines ?? [],
      });
      setSelectedPerson(person);
      setModalPerson(person);
    } else {
      setPersonForm({
        empCode: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "",
        position: "",
        status: "Active",
        hireDate: new Date().toISOString().split("T")[0],
        calendarId: "CAL001",
        shiftPattern: "2-Shift",
        skillTags: [],
        certifications: [],
        allowedProcesses: [],
        allowedMachines: [],
      });
      setSelectedPerson(null);
      setModalPerson(null);
    }
    setModalMode("edit");
    setModalOpen(true);
  };

  const openView = (person: Personnel) => {
    setModalPerson(person);
    setModalMode("view");
    setModalOpen(true);
  };

  const openAssign = (person: Personnel | null) => {
    // seed form for preview chips
    const base = person ?? (personForm as Personnel);
    setPersonForm({
      ...base,
      allowedProcesses: base.allowedProcesses ?? [],
      allowedMachines: base.allowedMachines ?? [],
    });

    // seed selections
    setAssignSelectedProcs([...(base.allowedProcesses ?? [])]);
    setAssignSelectedMach([...(base.allowedMachines ?? [])]);
    setAssignProcQuery("");
    setAssignMachQuery("");

    setSelectedPerson(person ?? null);
    setModalPerson(person ?? null);
    setModalMode("assign");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode(null);
    setModalPerson(null);
  };

  const handleSave = () => {
    if (!personForm.empCode || !personForm.firstName || !personForm.lastName || !personForm.email) {
      alert("Employee code, name, and email are required");
      return;
    }
    const personData = {
      ...personForm,
      fullName: `${personForm.firstName} ${personForm.lastName}`.trim(),
    } as Personnel;

    if (selectedPerson) {
      setPersonnel((prev) =>
        prev.map((p) => (p.empCode === selectedPerson.empCode ? { ...p, ...personData } : p))
      );
    } else {
      const newPerson: Personnel = {
        ...personData,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setPersonnel((prev) => [...prev, newPerson]);
    }
    closeModal();
    setSelectedPerson(null);
  };

  const handleDelete = (empCode: string) => {
    if (confirm(`Delete employee ${empCode}?`)) {
      setPersonnel((prev) => prev.filter((p) => p.empCode !== empCode));
    }
  };

  const exportToCSV = () => {
    const csv =
      "Code,Name,Email,Phone,Department,Position,Type,Status,Hire Date,Shift,Processes,Machines\n" +
      personnel
        .map((p) => {
          const procs = (p.allowedProcesses ?? []).map(getProcessName).join("|");
          const machs = (p.allowedMachines ?? []).map(getMachineName).join("|");
          return `${p.empCode},${p.fullName},${p.email},${p.phone},${p.department},${p.position},${p.status},${p.hireDate},${p.shiftPattern},"${procs}","${machs}"`;
        })
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `personnel_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  /* ===== Assign handlers ===== */
  const saveAssignments = () => {
    // update form
    setPersonForm((prev) => ({
      ...prev,
      allowedProcesses: [...assignSelectedProcs],
      allowedMachines: [...assignSelectedMach],
    }));

    // persist to list if editing existing person from table
    if (selectedPerson) {
      setPersonnel((prev) =>
        prev.map((p) =>
          p.empCode === selectedPerson.empCode
            ? {
              ...p,
              allowedProcesses: [...assignSelectedProcs],
              allowedMachines: [...assignSelectedMach],
            }
            : p
        )
      );
    }
    closeModal();
  };

  const filteredProcs = useMemo(() => {
    const q = assignProcQuery.toLowerCase();
    return processes.filter(
      (p) => p.process_name.toLowerCase().includes(q) || p.process_code.toLowerCase().includes(q)
    );
  }, [assignProcQuery, processes]);

  const filteredMach = useMemo(() => {
    const q = assignMachQuery.toLowerCase();
    return machines.filter(
      (m) => m.machineName.toLowerCase().includes(q) || m.machineCode.toLowerCase().includes(q)
    );
  }, [assignMachQuery, machines]);

  const selectAllProcs = () => setAssignSelectedProcs(filteredProcs.map((p) => p.process_code));
  const clearAllProcs = () => setAssignSelectedProcs([]);
  const selectAllMach = () => setAssignSelectedMach(filteredMach.map((m) => m.machineCode));
  const clearAllMach = () => setAssignSelectedMach([]);

  const modalPersonName =
    (personForm as Personnel).fullName ||
    [personForm.firstName, personForm.lastName].filter(Boolean).join(" ");

  /* ===== Table columns ===== */
  const personnelColumns = [
    {
      key: "empCode",
      label: "Employee",
      render: (person: Personnel) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full grid place-items-center bg-cyan-500/10 border border-cyan-400/30 text-cyan-200">
            {person.firstName[0]}
            {person.lastName[0]}
          </div>
          <div>
            <div className="text-sm font-medium">{person.fullName}</div>
            <div className="text-xs text-white/60">{person.empCode}</div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (person: Personnel) => (
        <>
          <div className="text-sm">{person.email}</div>
          <div className="text-xs text-white/60">{person.phone}</div>
        </>
      ),
    },
    { key: "department", label: "Department", align: "left" },
    { key: "position", label: "Position", align: "left" },
    {
      key: "status",
      label: "Status",
      render: (person: Personnel) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit border ${getStatusColor(
            person.status
          )}`}
        >
          {getStatusIcon(person.status)}
          {person.status}
        </span>
      ),
    },
    {
      key: "eligible",
      label: "Eligible",
      render: (person: Personnel) => (
        <span className="text-sm text-white/70">
          {(person.allowedProcesses?.length ?? 0)} proc • {(person.allowedMachines?.length ?? 0)} mach
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (person: Personnel) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => openView(person)} className="p-1 hover:bg-white/10 rounded" title="View">
            <Eye size={16} className="text-white/70" />
          </button>
          <button onClick={() => openEdit(person)} className="text-sky-300 hover:text-sky-200 p-1 rounded" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openAssign(person)}
            className="text-white/80 hover:text-white p-1 rounded"
            title="Assign Processes/Machines"
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(person.empCode)}
            className="text-rose-300 hover:text-rose-200 p-1 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ] as const;

  /* ===== Render ===== */
  return (
    <div className="text-white">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-7 h-7 text-sky-400" />
                Personnel Management
              </h1>
              <p className="text-sm text-white/60 mt-1">Master Data Management (MAS007)</p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-2">
            <button className="btn btn-outline">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button onClick={exportToCSV} className="btn btn-outline">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button onClick={() => openEdit()} className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Add Employee
            </button>
          </div>
        }
        tabs={
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4">
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/60">Total Employees</div>
                    <div className="text-2xl font-bold mt-1">{personnel.length}</div>
                  </div>
                  <Users className="w-10 h-10 text-white/30" />
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/60">Active</div>
                    <div className="text-2xl font-bold text-emerald-300 mt-1">
                      {personnel.filter((p) => p.status === "Active").length}
                    </div>
                  </div>
                  <UserCheck className="w-10 h-10 text-emerald-300/30" />
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/60">Departments</div>
                    <div className="text-2xl font-bold text-sky-300 mt-1">{stats.departments}</div>
                  </div>
                  <Briefcase className="w-10 h-10 text-sky-300/30" />
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/60">Avg Tenure</div>
                    <div className="text-2xl font-bold text-violet-300 mt-1">{stats.avgTenure.toFixed(1)}y</div>
                  </div>
                  <Calendar className="w-10 h-10 text-violet-300/30" />
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 mt-4 mb-1 mx-0.5">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-input w-full !pl-10 pr-4"
                  />
                </div>
              </div>

              <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="glass-input w-44">
                <option value="all" className="select option">
                  All Departments
                </option>
                {departments.map((dept) => (
                  <option key={dept} value={dept} className="select option">
                    {dept}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="glass-input w-32"
              >
                <option value="all" className="select option">
                  All Status
                </option>
                <option value="Active" className="select option">
                  Active
                </option>
                <option value="On Leave" className="select option">
                  On Leave
                </option>
                <option value="Inactive" className="select option">
                  Inactive
                </option>
              </select>
            </div>
          </>
        }
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <DataTable
          columns={personnelColumns}
          data={filteredPersonnel}
          rowKey={(p) => p.empCode}
          isLoading={loading}
        />
      </div>

      {/* ===== Unified Modal: View / Assign / Edit ===== */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        size={modalMode === "assign" ? "2xl" : modalMode === "edit" ? "2xl" : "lg"}
        initialFocusRef={modalMode === "edit" ? (firstNameRef as React.RefObject<HTMLElement>) : undefined}
        title={
          modalMode === "view" ? (
            <span className="inline-flex items-center gap-2">
              <Eye className="w-5 h-5 text-white/80" />
              View Employee — {modalPerson?.fullName ?? modalPerson?.empCode}
            </span>
          ) : modalMode === "assign" ? (
            <span className="inline-flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-300" />
              Assign Processes & Machines {modalPersonName ? `— ${modalPersonName}` : ""}
            </span>
          ) : modalMode === "edit" ? (
            <span>{selectedPerson ? "Edit" : "Add"} Employee</span>
          ) : (
            ""
          )
        }
        footer={
          modalMode === "view" ? (
            <div className="flex gap-2">
              <button onClick={() => openEdit(modalPerson!)} className="btn btn-primary">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => openAssign(modalPerson!)} className="btn btn-outline">
                <Settings className="w-4 h-4" />
                Assign
              </button>
              <button onClick={closeModal} className="btn btn-outline">
                Close
              </button>
            </div>
          ) : modalMode === "assign" ? (
            <>
              <button onClick={closeModal} className="btn btn-outline">
                Cancel
              </button>
              <button onClick={saveAssignments} className="btn btn-primary">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </>
          ) : modalMode === "edit" ? (
            <>
              <button onClick={closeModal} className="px-4 py-2 text-white/80 border border-white/20 rounded-lg hover:bg-white/10">
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </>
          ) : null
        }
      >
        {/* ===== VIEW BODY ===== */}
        {modalMode === "view" && modalPerson && (
          <div className="space-y-6 text-white">
            {/* Header card */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 grid place-items-center font-bold">
                {modalPerson.firstName?.[0]}
                {modalPerson.lastName?.[0]}
              </div>
              <div>
                <div className="text-lg font-semibold">{modalPerson.fullName}</div>
                <div className="text-sm text-white/70">{modalPerson.empCode}</div>
              </div>
            </div>

            {/* Basic */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-white/60">Email</div>
                <div className="font-medium">{modalPerson.email}</div>
              </div>
              <div>
                <div className="text-xs text-white/60">Phone</div>
                <div className="font-medium">{modalPerson.phone || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-white/60">Department</div>
                <div className="font-medium">{modalPerson.department || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-white/60">Position</div>
                <div className="font-medium">{modalPerson.position || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-white/60">Status</div>
                <span className={`chip ${getStatusColor(modalPerson.status)}`}>{modalPerson.status}</span>
              </div>
              <div>
                <div className="text-xs text-white/60">Hire Date</div>
                <div className="font-medium">
                  {modalPerson.hireDate ? new Date(modalPerson.hireDate).toLocaleDateString() : "-"}
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-white/60">Calendar</div>
                <div className="font-medium">{modalPerson.calendarId || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-white/60">Shift Pattern</div>
                <div className="font-medium">{modalPerson.shiftPattern || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-white/60">Work Center</div>
                <div className="font-medium">{modalPerson.workCenter || "-"}</div>
              </div>
            </div>

            {/* Skills & Certifications */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-white/60 mb-1">Skill Tags</div>
                <div className="flex flex-wrap gap-1">
                  {(modalPerson.skillTags ?? []).length ? (
                    (modalPerson.skillTags ?? []).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-xs bg-white/10 border border-white/15">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/60 text-sm">-</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Certifications</div>
                <div className="flex flex-wrap gap-1">
                  {(modalPerson.certifications ?? []).length ? (
                    (modalPerson.certifications ?? []).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-xs bg-white/10 border border-white/15">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/60 text-sm">-</span>
                  )}
                </div>
              </div>
            </div>

            {/* Eligible */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-white/10 p-3 bg-white/5">
                <div className="text-xs text-white/60 mb-2">
                  Processes ({modalPerson.allowedProcesses?.length ?? 0})
                </div>
                <div className="flex flex-wrap gap-1">
                  {(modalPerson.allowedProcesses ?? []).length ? (
                    (modalPerson.allowedProcesses ?? []).map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 text-xs rounded border border-sky-400/30 bg-sky-500/10 text-sky-200"
                      >
                        {getProcessName(c)}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/60 text-sm">-</span>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 p-3 bg-white/5">
                <div className="text-xs text-white/60 mb-2">
                  Machines ({modalPerson.allowedMachines?.length ?? 0})
                </div>
                <div className="flex flex-wrap gap-1">
                  {(modalPerson.allowedMachines ?? []).length ? (
                    (modalPerson.allowedMachines ?? []).map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 text-xs rounded border border-teal-400/30 bg-teal-500/10 text-teal-200"
                      >
                        {getMachineName(c)}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/60 text-sm">-</span>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency & Address */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-white/60">Emergency Contact</div>
                <div className="font-medium">{modalPerson.emergencyContact || "-"}</div>
                <div className="text-white/80">{modalPerson.emergencyPhone || ""}</div>
              </div>
              <div>
                <div className="text-xs text-white/60">Address</div>
                <div className="font-medium break-words">{modalPerson.address || "-"}</div>
              </div>
            </div>

            {modalPerson.notes && (
              <div>
                <div className="text-xs text-white/60 mb-1">Notes</div>
                <div className="text-white/80 whitespace-pre-wrap">{modalPerson.notes}</div>
              </div>
            )}
          </div>
        )}

        {/* ===== ASSIGN BODY ===== */}
        {modalMode === "assign" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
            {/* Processes */}
            <div className="rounded-lg border border-white/10 bg-white/5">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="font-medium text-white/90">Processes</div>
                <div className="flex items-center gap-2">
                  <button onClick={selectAllProcs} className="px-2 py-1 text-xs rounded border border-white/20 hover:bg-white/10">
                    Select All
                  </button>
                  <button onClick={clearAllProcs} className="px-2 py-1 text-xs rounded border border-white/20 hover:bg-white/10">
                    Clear
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    value={assignProcQuery}
                    onChange={(e) => setAssignProcQuery(e.target.value)}
                    placeholder="Search process by name/code..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>
                <div className="max-h-[40vh] overflow-auto space-y-1">
                  {filteredProcs.map((p) => {
                    const checked = assignSelectedProcs.includes(p.process_code);
                    return (
                      <label key={p.process_code} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-white/10 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setAssignSelectedProcs((prev) => toggleCode(prev, p.process_code))}
                          className="rounded border-white/30 bg-white/10"
                        />
                        <div className="flex-1">
                          <div className="text-sm">
                            {p.process_name} <span className="text-xs text-white/50">({p.process_code})</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                  {filteredProcs.length === 0 && <div className="text-sm text-white/60 px-2 py-4">No processes</div>}
                </div>
              </div>
            </div>

            {/* Machines */}
            <div className="rounded-lg border border-white/10 bg-white/5">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="font-medium text-white/90">Machines</div>
                <div className="flex items-center gap-2">
                  <button onClick={selectAllMach} className="px-2 py-1 text-xs rounded border border-white/20 hover:bg-white/10">
                    Select All
                  </button>
                  <button onClick={clearAllMach} className="px-2 py-1 text-xs rounded border border-white/20 hover:bg-white/10">
                    Clear
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    value={assignMachQuery}
                    onChange={(e) => setAssignMachQuery(e.target.value)}
                    placeholder="Search machine by name/code..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>
                <div className="max-h-[40vh] overflow-auto space-y-1">
                  {filteredMach.map((m) => {
                    const checked = assignSelectedMach.includes(m.machineCode);
                    return (
                      <label key={m.machineCode} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-white/10 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setAssignSelectedMach((prev) => toggleCode(prev, m.machineCode))}
                          className="rounded border-white/30 bg-white/10"
                        />
                        <div className="flex-1">
                          <div className="text-sm">
                            {m.machineName} <span className="text-xs text-white/50">({m.machineCode})</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                  {filteredMach.length === 0 && <div className="text-sm text-white/60 px-2 py-4">No machines</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== EDIT BODY ===== */}
        {modalMode === "edit" && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Basic Information
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Employee Code *</label>
                  <input
                    type="text"
                    value={personForm.empCode}
                    onChange={(e) => setPersonForm({ ...personForm, empCode: e.target.value })}
                    disabled={!!selectedPerson}
                    className="glass-input w-full focus:border-transparent disabled:bg-white/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">First Name *</label>
                  <input
                    ref={firstNameRef}
                    type="text"
                    value={personForm.firstName}
                    onChange={(e) => setPersonForm({ ...personForm, firstName: e.target.value })}
                    className="glass-input w-full focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={personForm.lastName}
                    onChange={(e) => setPersonForm({ ...personForm, lastName: e.target.value })}
                    className="glass-input w-full focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Email *</label>
                  <input
                    type="email"
                    value={personForm.email}
                    onChange={(e) => setPersonForm({ ...personForm, email: e.target.value })}
                    className="glass-input w-full focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={personForm.phone}
                    onChange={(e) => setPersonForm({ ...personForm, phone: e.target.value })}
                    className="glass-input w-full focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Employment Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Department *</label>
                  <select
                    value={personForm.department}
                    onChange={(e) => setPersonForm({ ...personForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                  >
                    <option value="" className="select option">
                      Select Department
                    </option>
                    {["Manufacturing", "Assembly", "Quality", "Maintenance", "Packaging", "Warehouse", "Engineering"].map(
                      (d) => (
                        <option key={d} value={d} className="select option">
                          {d}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Position *</label>
                  <input
                    type="text"
                    value={personForm.position}
                    onChange={(e) => setPersonForm({ ...personForm, position: e.target.value })}
                    className="glass-input w-full focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Status</label>
                  <select
                    value={personForm.status}
                    onChange={(e) =>
                      setPersonForm({ ...personForm, status: e.target.value as Personnel["status"] })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                  >
                    {(["Active", "On Leave", "Inactive"] as Personnel["status"][]).map((s) => (
                      <option key={s} value={s} className="select option">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Hire Date</label>
                  <input
                    type="date"
                    value={personForm.hireDate}
                    onChange={(e) => setPersonForm({ ...personForm, hireDate: e.target.value })}
                    className="glass-input w-full focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Work Schedule */}
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Work Schedule
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Calendar ID</label>
                  <select
                    value={personForm.calendarId}
                    onChange={(e) => setPersonForm({ ...personForm, calendarId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                  >
                    <option value="CAL001" className="select option">
                      CAL001 - Standard
                    </option>
                    <option value="CAL002" className="select option">
                      CAL002 - Day Shift
                    </option>
                    <option value="CAL003" className="select option">
                      CAL003 - Part-Time
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Shift Pattern</label>
                  <select
                    value={personForm.shiftPattern}
                    onChange={(e) => setPersonForm({ ...personForm, shiftPattern: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                  >
                    {["Day Shift", "2-Shift", "3-Shift Rotating", "Part-Time Evening", "Flexible"].map((s) => (
                      <option key={s} value={s} className="select option">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Work Center</label>
                  <input
                    type="text"
                    value={personForm.workCenter || ""}
                    onChange={(e) => setPersonForm({ ...personForm, workCenter: e.target.value })}
                    placeholder="e.g., WC001"
                    className="glass-input w-full focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Skills & Certifications + Assign preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Skills & Certifications
                </h3>
                <button
                  type="button"
                  onClick={() => openAssign(selectedPerson ?? null)}
                  className="px-3 py-1.5 rounded-lg border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/10 text-sm inline-flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Assign Processes/Machines
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Skill Tags</label>
                  <input
                    type="text"
                    value={(personForm.skillTags || []).join(", ")}
                    onChange={(e) =>
                      setPersonForm({
                        ...personForm,
                        skillTags: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Enter comma-separated skills"
                    className="glass-input w-full focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Certifications</label>
                  <input
                    type="text"
                    value={(personForm.certifications || []).join(", ")}
                    onChange={(e) =>
                      setPersonForm({
                        ...personForm,
                        certifications: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Enter comma-separated certifications"
                    className="glass-input w-full focus:border-transparent"
                  />
                </div>
              </div>

              {/* Preview assignments */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/10 p-3 bg-white/5">
                  <div className="text-xs text-white/60 mb-2">
                    Processes ({personForm.allowedProcesses?.length ?? 0})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(personForm.allowedProcesses ?? []).slice(0, 6).map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 text-xs rounded border border-sky-400/30 bg-sky-500/10 text-sky-200"
                      >
                        {getProcessName(c)}
                      </span>
                    ))}
                    {(personForm.allowedProcesses?.length ?? 0) > 6 && (
                      <span className="text-xs text-white/60">
                        +{(personForm.allowedProcesses?.length ?? 0) - 6} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 p-3 bg-white/5">
                  <div className="text-xs text-white/60 mb-2">
                    Machines ({personForm.allowedMachines?.length ?? 0})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(personForm.allowedMachines ?? []).slice(0, 6).map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 text-xs rounded border border-teal-400/30 bg-teal-500/10 text-teal-200"
                      >
                        {getMachineName(c)}
                      </span>
                    ))}
                    {(personForm.allowedMachines?.length ?? 0) > 6 && (
                      <span className="text-xs text-white/60">
                        +{(personForm.allowedMachines?.length ?? 0) - 6} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Emergency Contact
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={personForm.emergencyContact || ""}
                    onChange={(e) => setPersonForm({ ...personForm, emergencyContact: e.target.value })}
                    className="glass-input w-full focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={personForm.emergencyPhone || ""}
                    onChange={(e) => setPersonForm({ ...personForm, emergencyPhone: e.target.value })}
                    className="glass-input w-full focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-3">Additional Information</h3>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Address</label>
                <input
                  type="text"
                  value={personForm.address || ""}
                  onChange={(e) => setPersonForm({ ...personForm, address: e.target.value })}
                  className="glass-input w-full focus:border-transparent"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-white/80 mb-1">Notes</label>
                <textarea
                  value={personForm.notes || ""}
                  onChange={(e) => setPersonForm({ ...personForm, notes: e.target.value })}
                  rows={3}
                  className="glass-input w-full focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PersonnelPage;
