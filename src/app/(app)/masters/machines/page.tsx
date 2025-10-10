"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Settings,
  Save,
  ChevronDown,
  ChevronRight,
  Cpu,
  AlertCircle,
  Activity,
  Calendar,
  Wrench,
  Clock,
  Zap,
  TrendingUp,
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import Modal from "@/src/components/shared/Modal";
import { getMachines, getProcesses, getWorkCenters, getDropdownMachineStatus } from "@/src/services/master";
import toast from "react-hot-toast";
import { ERROR_MESSAGES } from "@/src/config/messages";
import EmptyState from "@/src/components/shared/EmptyState";
import Loading from "@/src/components/Loading";

/* -------------------- Types -------------------- */
type ViewMode = "view" | "edit" | null;

type MachineStatus = {
  id: number;
  code: string;
  label: string;
  description: string | null;
  is_active: number;
  sort_order: number;
  type: string;
};

type WorkCenter = { work_center_code: string; work_center_name: string };
type PlantCalendar = { id: string; name: string };

type Process = {
  process_code: string;
  process_name: string;
  description: string;
};

type Machine = {
  machineCode: string;
  machineName: string;
  description: string;
  workCenterCode: string;
  workCenterName: string;
  processes: string[];
  calendarId: string;
  calendarName: string;
  status: string;
  capacityHoursPerDay: number;
  oeeTarget: number;
  currentOEE: number;
  location: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string; // YYYY-MM-DD
  warrantyExpiry: string; // YYYY-MM-DD
  maintenanceDueDays: number;
  lastPMDate: string; // YYYY-MM-DD
  nextPMDate: string; // YYYY-MM-DD
  notes: string;
};

type MachineForm = {
  machineCode: string;
  machineName: string;
  description: string;
  workCenterCode: string;
  processes: string[];
  calendarId: string;
  status: string;
  capacityHoursPerDay: number;
  oeeTarget: number;
  location: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  lastPMDate: string;
  nextPMDate: string;
  notes: string;
};

/* -------------------- Sample data -------------------- */
const CALENDARS: readonly PlantCalendar[] = [
  { id: "CAL-24x7", name: "24/7 Continuous" },
  { id: "CAL-2SHIFT", name: "Two Shift (Day/Night)" },
  { id: "CAL-1SHIFT", name: "Single Shift (Day)" },
  { id: "CAL-5DAY", name: "5 Day Week" },
] as const;

/* -------------------- Component -------------------- */
const MachinesMasterData = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [machineStatus, setMachineStatus] = useState<MachineStatus[]>([]);
  const [workCenter, setWorkCenter] = useState<WorkCenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterWorkCenter, setFilterWorkCenter] = useState<"all" | string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | string>("all");
  const [expandedMachines, setExpandedMachines] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(null);

  const [formData, setFormData] = useState<MachineForm>({
    machineCode: "",
    machineName: "",
    description: "",
    workCenterCode: "",
    processes: [],
    calendarId: "",
    status: "Idle",
    capacityHoursPerDay: 8,
    oeeTarget: 85,
    location: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyExpiry: "",
    lastPMDate: "",
    nextPMDate: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resMachines = await getMachines();
        const resProcesses = await getProcesses();
        const resMachineStatus = await getDropdownMachineStatus();
        const resWorkCenter = await getWorkCenters();
        setMachines(resMachines);
        setProcesses(resProcesses);
        setMachineStatus(resMachineStatus)
        setWorkCenter(resWorkCenter)
      } catch (error) {
        console.error('Fetch data failed:', error);
        toast.error(ERROR_MESSAGES.fetchFailed);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* -------------------- Helpers -------------------- */
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      Running: "status-success",
      Idle: "status-inactive",
      PM: "status-yellow",
      Down: "status-error",
      Setup: "status-info",
    };
    return colors[status] ?? "status-inactive";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Running":
        return <Activity className="text-green-600" size={16} />;
      case "Idle":
        return <Clock className="text-gray-600" size={16} />;
      case "PM":
        return <Wrench className="text-yellow-600" size={16} />;
      case "Down":
        return <AlertCircle className="text-red-600" size={16} />;
      case "Setup":
        return <Settings className="text-blue-600" size={16} />;
      default:
        return <Cpu className="text-gray-600" size={16} />;
    }
  };

  const getOEEColor = (oee: number, target: number): string => {
    if (oee >= target) return "text-green-600";
    if (oee >= target * 0.9) return "text-yellow-600";
    return "text-red-600";
  };

  const getMaintenanceStatus = (dueDays: number): { text: string; color: string } => {
    if (dueDays <= 0) return { text: "Overdue", color: "status-error" };
    if (dueDays <= 7) return { text: "Due Soon", color: "status-warning" };
    if (dueDays <= 30) return { text: "Upcoming", color: "status-yellow" };
    return { text: "Scheduled", color: "status-success" };
  };

  /* -------------------- Filters -------------------- */
  const filteredMachines = machines.filter((m) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      m.machineCode.toLowerCase().includes(q) ||
      m.machineName.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q);

    const matchesWorkCenter = filterWorkCenter === "all" || m.workCenterCode === filterWorkCenter;
    const matchesStatus =
      filterStatus === "all" || m.status.includes(filterStatus);

    return matchesSearch && matchesWorkCenter && matchesStatus;
  });


  /* -------------------- Actions -------------------- */
  const toggleMachineExpand = (code: string) => {
    setExpandedMachines((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const openCreateModal = () => {
    setFormData({
      machineCode: `M${String(machines.length + 1).padStart(3, "0")}`,
      machineName: "",
      description: "",
      workCenterCode: "",
      processes: [],
      calendarId: "",
      status: "Idle",
      capacityHoursPerDay: 8,
      oeeTarget: 85,
      location: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      warrantyExpiry: "",
      lastPMDate: "",
      nextPMDate: "",
      notes: "",
    });
    setEditingMachine(null);
    setViewMode("edit");
    setIsModalOpen(true);
  };

  const openEditModal = (machine: Machine) => {
    setFormData({
      machineCode: machine.machineCode,
      machineName: machine.machineName,
      description: machine.description,
      workCenterCode: machine.workCenterCode,
      processes: [...machine.processes],
      calendarId: machine.calendarId,
      status: machine.status,
      capacityHoursPerDay: machine.capacityHoursPerDay,
      oeeTarget: machine.oeeTarget,
      location: machine.location,
      manufacturer: machine.manufacturer,
      model: machine.model,
      serialNumber: machine.serialNumber,
      purchaseDate: machine.purchaseDate,
      warrantyExpiry: machine.warrantyExpiry,
      lastPMDate: machine.lastPMDate,
      nextPMDate: machine.nextPMDate,
      notes: machine.notes,
    });
    setEditingMachine(machine);
    setViewMode("edit");
    setIsModalOpen(true);
  };

  const openViewModal = (machine: Machine) => {
    setEditingMachine(machine);
    setViewMode("view");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMachine(null);
    setViewMode(null);
  };

  const handleSaveMachine = () => {
    if (!formData.machineCode || !formData.machineName || !formData.workCenterCode) {
      alert("Please fill in required fields: Code, Name, and Work Center");
      return;
    }
    if (formData.processes.length === 0) {
      alert("Please select at least one process capability");
      return;
    }

    const calendar = CALENDARS.find((cal) => cal.id === formData.calendarId);
    const selectedWorkCenter = workCenter.find((wc) => wc.work_center_code === formData.workCenterCode);

    const newMachine: Machine = {
      ...formData,
      workCenterName: selectedWorkCenter?.work_center_name ?? "",
      calendarName: calendar?.name ?? "",
      currentOEE: editingMachine?.currentOEE ?? formData.oeeTarget,
      maintenanceDueDays: editingMachine?.maintenanceDueDays ?? 30,
    };

    if (editingMachine) {
      setMachines((prev) => prev.map((m) => (m.machineCode === editingMachine.machineCode ? newMachine : m)));
    } else {
      setMachines((prev) => [...prev, newMachine]);
    }
    closeModal();
  };

  const handleDeleteMachine = (code: string) => {
    if (confirm(`Are you sure you want to delete machine ${code}?`)) {
      setMachines((prev) => prev.filter((m) => m.machineCode !== code));
    }
  };

  const toggleProcess = (processCode: string) => {
    setFormData((prev) => ({
      ...prev,
      processes: prev.processes.includes(processCode)
        ? prev.processes.filter((p) => p !== processCode)
        : [...prev.processes, processCode],
    }));
  };

  /* -------------------- Render -------------------- */
  const avgOEE =
    machines.length > 0
      ? Math.round(machines.reduce((sum, m) => sum + m.currentOEE, 0) / machines.length)
      : 0;

  return (
    <div className="text-white">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Machines Master Data</h1>
              <p className="text-sm text-white/60 mt-1">Manage production equipment and resources</p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-3">
            <button className="btn btn-outline">
              <Upload size={18} />
              Import
            </button>
            <button className="btn btn-outline">
              <Download size={18} />
              Export
            </button>
            <button
              onClick={openCreateModal}
              className="btn btn-primary"
            >
              <Plus size={18} />
              New Machine
            </button>
          </div>
        }
        tabs={
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Total Machines</p>
                    <p className="text-2xl font-bold">{machines.length}</p>
                  </div>
                  <Cpu size={32} className="text-sky-300" />
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Running</p>
                    <p className="text-2xl font-bold text-emerald-300">
                      {machines.filter((m) => m.status === "Running").length}
                    </p>
                  </div>
                  <Activity size={32} className="text-emerald-300" />
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Avg OEE</p>
                    <p className="text-2xl font-bold">{avgOEE}%</p>
                  </div>
                  <TrendingUp size={32} className="text-sky-300" />
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">PM Due Soon</p>
                    <p className="text-2xl font-bold text-amber-300">
                      {machines.filter((m) => m.maintenanceDueDays <= 7).length}
                    </p>
                  </div>
                  <Wrench size={32} className="text-amber-300" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4 mb-1 mx-0.5">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  placeholder="Search machines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                />
              </div>
              <select
                value={filterWorkCenter}
                onChange={(e) => setFilterWorkCenter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              >
                <option value="all" className="select option">All Work Centers</option>
                {workCenter.map((wc) => (
                  <option key={wc.work_center_code} value={wc.work_center_code} className="select option">
                    {wc.work_center_name}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {machineStatus.map((status) => (
                  <option key={status.code} value={status.code}>
                    {status.label || status.code}
                  </option>
                ))}
              </select>

            </div>
          </>
        }
      />

      {/* Machines List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="rounded-lg border border-white/10 bg-white/5">
          {loading ? (
            <Loading text="Loading machines..." />
          ) : filteredMachines.length === 0 ? (
            <EmptyState
              icon={<Cpu size={48} className="mx-auto text-white/50 mb-4" />}
              title="No machines found"
              message="Create your first machines to get started"
              buttonLabel="Create Machine"
              onButtonClick={openCreateModal}
            />
          ) : (
            <div className="divide-y divide-white/10">
              {filteredMachines.map((machine) => {
                const isExpanded = !!expandedMachines[machine.machineCode];
                const maintenanceStatus = getMaintenanceStatus(machine.maintenanceDueDays);

                return (
                  <div key={machine.machineCode} className="hover:bg-white/5 transition-colors">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <button
                            onClick={() => toggleMachineExpand(machine.machineCode)}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{machine.machineName}</h3>
                              <span className="text-sm text-white/60">({machine.machineCode})</span>
                              <span
                                className={`text-xs px-2 py-1 rounded border flex items-center gap-1 ${getStatusColor(
                                  machine.status
                                )}`}
                              >
                                {getStatusIcon(machine.status)}
                                {machine.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-white/70">
                              <div className="flex items-center gap-1">
                                <Settings size={14} className="text-white/50" />
                                <span>{machine.workCenterName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Zap size={14} className="text-white/50" />
                                <span className={getOEEColor(machine.currentOEE, machine.oeeTarget)}>
                                  OEE: {machine.currentOEE}% (Target: {machine.oeeTarget}%)
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar size={14} className="text-white/50" />
                                <span>{machine.calendarName}</span>
                              </div>
                              <div className={`chip ${maintenanceStatus.color}`}>
                                <Wrench size={14} />
                                <span>PM: {maintenanceStatus.text}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openViewModal(machine)}
                            className="p-2 hover:bg-white/10 rounded"
                            title="View Details"
                          >
                            <Eye size={18} className="text-white/70" />
                          </button>
                          <button
                            onClick={() => openEditModal(machine)}
                            className="p-2 text-sky-300 hover:bg-white/10 rounded"
                            title="Edit Machine"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteMachine(machine.machineCode)}
                            className="p-2 text-rose-300 hover:bg-white/10 rounded"
                            title="Delete Machine"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 ml-12 grid grid-cols-3 gap-6">
                          <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                            <h4 className="text-sm font-semibold text-white/80 mb-3">Equipment Info</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-white/60">Description:</span>
                                <div className="text-white/90">{machine.description}</div>
                              </div>
                              <div>
                                <span className="text-white/60">Manufacturer:</span>
                                <div className="text-white/90">{machine.manufacturer}</div>
                              </div>
                              <div>
                                <span className="text-white/60">Model:</span>
                                <div className="text-white/90">{machine.model}</div>
                              </div>
                              <div>
                                <span className="text-white/60">Serial Number:</span>
                                <div className="text-white/90">{machine.serialNumber}</div>
                              </div>
                              <div>
                                <span className="text-white/60">Location:</span>
                                <div className="text-white/90">{machine.location}</div>
                              </div>
                            </div>
                          </div>

                          <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                            <h4 className="text-sm font-semibold text-white/80 mb-3">Capabilities</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-white/60">Processes:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {machine.processes.map((proc) => (
                                    <span
                                      key={proc}
                                      className="px-2 py-0.5 bg-sky-500/10 text-sky-300 text-xs rounded border border-sky-500/20"
                                    >
                                      {proc}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-white/60">Capacity:</span>
                                <div className="text-white/90">{machine.capacityHoursPerDay} hrs/day</div>
                              </div>
                              <div>
                                <span className="text-white/60">Current OEE:</span>
                                <div className={`font-semibold ${getOEEColor(machine.currentOEE, machine.oeeTarget)}`}>
                                  {machine.currentOEE}%
                                </div>
                              </div>
                              <div>
                                <span className="text-white/60">Target OEE:</span>
                                <div className="text-white/90">{machine.oeeTarget}%</div>
                              </div>
                            </div>
                          </div>

                          <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                            <h4 className="text-sm font-semibold text-white/80 mb-3">Maintenance</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-white/60">Last PM:</span>
                                <div className="text-white/90">{new Date(machine.lastPMDate).toLocaleDateString()}</div>
                              </div>
                              <div>
                                <span className="text-white/60">Next PM:</span>
                                <div className="text-white/90">{new Date(machine.nextPMDate).toLocaleDateString()}</div>
                              </div>
                              <div>
                                <span className="text-white/60">Due In:</span>
                                <div className={maintenanceStatus.color.split(" ")[0]}>
                                  {machine.maintenanceDueDays} days - {maintenanceStatus.text}
                                </div>
                              </div>
                              <div>
                                <span className="text-white/60">Purchase Date:</span>
                                <div className="text-white/90">{new Date(machine.purchaseDate).toLocaleDateString()}</div>
                              </div>
                              <div>
                                <span className="text-white/60">Warranty:</span>
                                <div className="text-white/90">
                                  Until {new Date(machine.warrantyExpiry).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          {machine.notes && (
                            <div className="col-span-3 border border-sky-500/20 rounded-lg p-4 bg-sky-500/10">
                              <div className="flex items-start gap-2">
                                <AlertCircle size={16} className="text-sky-300 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium text-sky-200 mb-1">Notes</div>
                                  <div className="text-sm text-sky-100/90">{machine.notes}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="2xl"
        title={
          <span className="text-xl font-semibold">
            {viewMode === "view"
              ? "Machine Details"
              : editingMachine
                ? "Edit Machine"
                : "Create New Machine"}
          </span>
        }
        footer={
          <>
            <button
              onClick={closeModal}
              className="btn btn-outline"
            >
              Cancel
            </button>
            {viewMode === "view" ? (
              <button
                onClick={() => setViewMode("edit")}
                className="btn btn-primary"
              >
                <Edit size={18} />
                Edit Machine
              </button>
            ) : (
              <button
                onClick={handleSaveMachine}
                className="btn btn-primary"
              >
                <Save size={18} />
                Save Machine
              </button>
            )}
          </>
        }
      >
        {/* Body */}
        {viewMode === "view" && editingMachine ? (
          <div className="space-y-6 text-white">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-white/70">Machine Code</label>
                <p className="mt-1 text-lg font-semibold">{editingMachine.machineCode}</p>
              </div>
              <div>
                <label className="text-sm text-white/70">Name</label>
                <p className="mt-1">{editingMachine.machineName}</p>
              </div>
              <div>
                <label className="text-sm text-white/70">Status</label>
                <p className="mt-1">
                  <span
                    className={`text-sm px-3 py-1 rounded border flex items-center gap-1 w-fit ${getStatusColor(
                      editingMachine.status
                    )}`}
                  >
                    {getStatusIcon(editingMachine.status)}
                    {editingMachine.status}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70">Description</label>
              <p className="mt-1">{editingMachine.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">Equipment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/80">
                    <span className="text-white/60">Work Center:</span>
                    <span className="font-medium">{editingMachine.workCenterName}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span className="text-white/60">Location:</span>
                    <span className="font-medium">{editingMachine.location}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span className="text-white/60">Manufacturer:</span>
                    <span className="font-medium">{editingMachine.manufacturer}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span className="text-white/60">Model:</span>
                    <span className="font-medium">{editingMachine.model}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span className="text-white/60">Serial Number:</span>
                    <span className="font-medium">{editingMachine.serialNumber}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Performance</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/80">
                    <span className="text-white/60">Calendar:</span>
                    <span className="font-medium">{editingMachine.calendarName}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span className="text-white/60">Capacity:</span>
                    <span className="font-medium">{editingMachine.capacityHoursPerDay} hrs/day</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span className="text-white/60">Current OEE:</span>
                    <span className={`font-semibold ${getOEEColor(editingMachine.currentOEE, editingMachine.oeeTarget)}`}>
                      {editingMachine.currentOEE}%
                    </span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span className="text-white/60">Target OEE:</span>
                    <span className="font-medium">{editingMachine.oeeTarget}%</span>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-white/60">Process Capabilities:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {editingMachine.processes.map((proc) => (
                        <span
                          key={proc}
                          className="px-2 py-0.5 bg-sky-500/10 text-sky-300 text-xs rounded border border-sky-500/20"
                        >
                          {proc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {editingMachine.notes && (
              <div>
                <label className="text-sm text-white/70">Notes</label>
                <p className="mt-1 p-3 bg-white/5 border border-white/10 rounded">{editingMachine.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 text-white">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 block mb-2">Machine Code *</label>
                  <input
                    type="text"
                    value={formData.machineCode}
                    onChange={(e) => setFormData({ ...formData, machineCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                    readOnly={!!editingMachine}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Machine Name *</label>
                  <input
                    type="text"
                    value={formData.machineName}
                    onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-white/80 block mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                    placeholder="Brief description of the machine..."
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Work Center *</label>
                  <select
                    value={formData.workCenterCode}
                    onChange={(e) => setFormData({ ...formData, workCenterCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                    required
                  >
                    <option value="" className="select option">Select Work Center</option>
                    {workCenter.map((wc) => (
                      <option key={wc.work_center_code} value={wc.work_center_code} className="select option">
                        {wc.work_center_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Current Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as string })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                  >
                    {machineStatus.map((status) => (
                      <option key={status.code} value={status.code}>
                        {status.label || status.code}
                      </option>
                    ))}

                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                    placeholder="e.g., Building A - Floor 1"
                  />
                </div>
              </div>
            </div>

            {/* Process Capabilities */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Process Capabilities *</h3>
              <p className="text-sm text-white/70 mb-3">Select all processes this machine can perform:</p>
              <div className="grid grid-cols-5 gap-2">
                {processes.map((proc) => (
                  <label
                    key={proc.process_code}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg cursor-pointer transition-colors border-2 ${formData.processes.includes(proc.process_code)
                      ? "border-sky-500 bg-sky-500/10 text-sky-300"
                      : "border-white/20 hover:border-white/40 bg-white/5 text-white"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.processes.includes(proc.process_code)}
                      onChange={() => toggleProcess(proc.process_code)}
                      className="mr-2 accent-sky-500"
                    />
                    <span className="text-sm font-medium">{proc.process_name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Operating Parameters */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Operating Parameters</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-white/80 block mb-2">Calendar</label>
                  <select
                    value={formData.calendarId}
                    onChange={(e) => setFormData({ ...formData, calendarId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                  >
                    <option value="" className="select option">Select Calendar</option>
                    {CALENDARS.map((cal) => (
                      <option key={cal.id} value={cal.id} className="select option">
                        {cal.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Capacity (hrs/day)</label>
                  <input
                    type="number"
                    value={formData.capacityHoursPerDay}
                    onChange={(e) =>
                      setFormData({ ...formData, capacityHoursPerDay: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                    min={0}
                    max={24}
                    step={0.5}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Target OEE (%)</label>
                  <input
                    type="number"
                    value={formData.oeeTarget}
                    onChange={(e) => setFormData({ ...formData, oeeTarget: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            </div>

            {/* Equipment Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Equipment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 block mb-2">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Warranty Expiry</label>
                  <input
                    type="date"
                    value={formData.warrantyExpiry}
                    onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Maintenance Schedule */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Maintenance Schedule</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 block mb-2">Last PM Date</label>
                  <input
                    type="date"
                    value={formData.lastPMDate}
                    onChange={(e) => setFormData({ ...formData, lastPMDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Next PM Date</label>
                  <input
                    type="date"
                    value={formData.nextPMDate}
                    onChange={(e) => setFormData({ ...formData, nextPMDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm text-white/80 block mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                placeholder="Special requirements, safety notes, operating instructions..."
              />
            </div>

            {/* Info Box */}
            <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="text-sky-300 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-sky-200">
                  <div className="font-medium mb-1">Machine Configuration Tips</div>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Select all process capabilities for accurate scheduling</li>
                    <li>Set realistic OEE targets based on historical performance</li>
                    <li>Keep maintenance schedules up to date for better planning</li>
                    <li>Assign to correct work center for proper resource grouping</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default MachinesMasterData;
