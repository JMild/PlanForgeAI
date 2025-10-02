"use client";

import React, { useState } from "react";
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
  X,
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

/* -------------------- Types -------------------- */
type ViewMode = "view" | "edit" | null;

type MachineStatus = "Running" | "Idle" | "PM" | "Down" | "Setup";

type WorkCenter = { code: string; name: string };
type PlantCalendar = { id: string; name: string };

const PROCESSES = [
  "MACH",
  "DRILL",
  "PRESS",
  "PAINT",
  "ASSY",
  "PACK",
  "WELD",
  "INSP",
  "MILL",
  "TURN",
] as const;
type ProcessCode = typeof PROCESSES[number];

type Machine = {
  code: string;
  name: string;
  description: string;
  workCenterCode: string;
  workCenterName: string;
  processes: ProcessCode[];
  calendarId: string;
  calendarName: string;
  status: MachineStatus;
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
  code: string;
  name: string;
  description: string;
  workCenterCode: string;
  processes: ProcessCode[];
  calendarId: string;
  status: MachineStatus;
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
const WORK_CENTERS: readonly WorkCenter[] = [
  { code: "WC-MACH", name: "Machining Center" },
  { code: "WC-PRESS", name: "Press Area" },
  { code: "WC-PAINT", name: "Paint Booth" },
  { code: "WC-ASSY", name: "Assembly Line" },
  { code: "WC-WELD", name: "Welding Station" },
  { code: "WC-INSP", name: "Inspection Area" },
] as const;

const CALENDARS: readonly PlantCalendar[] = [
  { id: "CAL-24x7", name: "24/7 Continuous" },
  { id: "CAL-2SHIFT", name: "Two Shift (Day/Night)" },
  { id: "CAL-1SHIFT", name: "Single Shift (Day)" },
  { id: "CAL-5DAY", name: "5 Day Week" },
] as const;

const INITIAL_MACHINES: Machine[] = [
  {
    code: "M001",
    name: "CNC Mill 1",
    description: "Haas VF-2 CNC Vertical Machining Center",
    workCenterCode: "WC-MACH",
    workCenterName: "Machining Center",
    processes: ["MACH", "DRILL", "MILL"],
    calendarId: "CAL-2SHIFT",
    calendarName: "Two Shift (Day/Night)",
    status: "Running",
    capacityHoursPerDay: 16,
    oeeTarget: 85,
    currentOEE: 82,
    location: "Building A - Floor 1",
    manufacturer: "Haas Automation",
    model: "VF-2",
    serialNumber: "VF2-2024-001",
    purchaseDate: "2024-01-15",
    warrantyExpiry: "2027-01-15",
    maintenanceDueDays: 15,
    lastPMDate: "2025-09-15",
    nextPMDate: "2025-10-15",
    notes: "Requires special coolant",
  },
  {
    code: "M002",
    name: "CNC Mill 2",
    description: "Haas VF-3 CNC Vertical Machining Center",
    workCenterCode: "WC-MACH",
    workCenterName: "Machining Center",
    processes: ["MACH", "DRILL", "MILL"],
    calendarId: "CAL-2SHIFT",
    calendarName: "Two Shift (Day/Night)",
    status: "Idle",
    capacityHoursPerDay: 16,
    oeeTarget: 85,
    currentOEE: 88,
    location: "Building A - Floor 1",
    manufacturer: "Haas Automation",
    model: "VF-3",
    serialNumber: "VF3-2024-002",
    purchaseDate: "2024-02-20",
    warrantyExpiry: "2027-02-20",
    maintenanceDueDays: 45,
    lastPMDate: "2025-08-20",
    nextPMDate: "2025-11-20",
    notes: "",
  },
  {
    code: "M003",
    name: "Assembly Line A",
    description: "Manual assembly workstation with conveyor",
    workCenterCode: "WC-ASSY",
    workCenterName: "Assembly Line",
    processes: ["ASSY", "PACK", "INSP"],
    calendarId: "CAL-1SHIFT",
    calendarName: "Single Shift (Day)",
    status: "Running",
    capacityHoursPerDay: 8,
    oeeTarget: 75,
    currentOEE: 78,
    location: "Building B - Floor 2",
    manufacturer: "Custom Built",
    model: "ASM-LINE-01",
    serialNumber: "ASM-2023-001",
    purchaseDate: "2023-05-10",
    warrantyExpiry: "2025-05-10",
    maintenanceDueDays: 8,
    lastPMDate: "2025-09-25",
    nextPMDate: "2025-10-10",
    notes: "Conveyor speed adjustable",
  },
  {
    code: "M004",
    name: "Press 1",
    description: "Hydraulic press 200 ton capacity",
    workCenterCode: "WC-PRESS",
    workCenterName: "Press Area",
    processes: ["PRESS"],
    calendarId: "CAL-2SHIFT",
    calendarName: "Two Shift (Day/Night)",
    status: "Running",
    capacityHoursPerDay: 16,
    oeeTarget: 80,
    currentOEE: 75,
    location: "Building A - Floor 1",
    manufacturer: "Cincinnati Press",
    model: "HYD-200",
    serialNumber: "CP-HYD-2022-045",
    purchaseDate: "2022-03-15",
    warrantyExpiry: "2025-03-15",
    maintenanceDueDays: 2,
    lastPMDate: "2025-09-02",
    nextPMDate: "2025-10-04",
    notes: "Safety inspection required monthly",
  },
  {
    code: "M005",
    name: "Paint Booth",
    description: "Powder coating booth with curing oven",
    workCenterCode: "WC-PAINT",
    workCenterName: "Paint Booth",
    processes: ["PAINT"],
    calendarId: "CAL-1SHIFT",
    calendarName: "Single Shift (Day)",
    status: "PM",
    capacityHoursPerDay: 8,
    oeeTarget: 70,
    currentOEE: 68,
    location: "Building C - Floor 1",
    manufacturer: "Wagner Systems",
    model: "PC-BOOTH-5000",
    serialNumber: "WS-PC-2021-078",
    purchaseDate: "2021-08-20",
    warrantyExpiry: "2024-08-20",
    maintenanceDueDays: 0,
    lastPMDate: "2025-10-01",
    nextPMDate: "2025-10-02",
    notes: "Filter replacement in progress",
  },
];

/* -------------------- Component -------------------- */
const MachinesMasterData = () => {
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterWorkCenter, setFilterWorkCenter] = useState<"all" | string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | MachineStatus>("all");
  const [expandedMachines, setExpandedMachines] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(null);

  const [formData, setFormData] = useState<MachineForm>({
    code: "",
    name: "",
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

  /* -------------------- Helpers -------------------- */
  const getStatusColor = (status: MachineStatus): string => {
    const colors: Record<MachineStatus, string> = {
      Running: "bg-green-100 text-green-700",
      Idle: "bg-gray-100 text-gray-700",
      PM: "bg-yellow-100 text-yellow-700",
      Down: "bg-red-100 text-red-700",
      Setup: "bg-blue-100 text-blue-700",
    };
    return colors[status] ?? "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status: MachineStatus) => {
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
    if (dueDays <= 0) return { text: "Overdue", color: "text-red-600 bg-red-50" };
    if (dueDays <= 7) return { text: "Due Soon", color: "text-orange-600 bg-orange-50" };
    if (dueDays <= 30) return { text: "Upcoming", color: "text-yellow-600 bg-yellow-50" };
    return { text: "Scheduled", color: "text-green-600 bg-green-50" };
  };

  /* -------------------- Filters -------------------- */
  const filteredMachines = machines.filter((m) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      m.code.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q);
    const matchesWorkCenter = filterWorkCenter === "all" || m.workCenterCode === filterWorkCenter;
    const matchesStatus = filterStatus === "all" || m.status === filterStatus;
    return matchesSearch && matchesWorkCenter && matchesStatus;
  });

  /* -------------------- Actions -------------------- */
  const toggleMachineExpand = (code: string) => {
    setExpandedMachines((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const openCreateModal = () => {
    setFormData({
      code: `M${String(machines.length + 1).padStart(3, "0")}`,
      name: "",
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
      code: machine.code,
      name: machine.name,
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
    if (!formData.code || !formData.name || !formData.workCenterCode) {
      alert("Please fill in required fields: Code, Name, and Work Center");
      return;
    }
    if (formData.processes.length === 0) {
      alert("Please select at least one process capability");
      return;
    }

    const workCenter = WORK_CENTERS.find((wc) => wc.code === formData.workCenterCode);
    const calendar = CALENDARS.find((cal) => cal.id === formData.calendarId);

    const newMachine: Machine = {
      ...formData,
      workCenterName: workCenter?.name ?? "",
      calendarName: calendar?.name ?? "",
      currentOEE: editingMachine?.currentOEE ?? formData.oeeTarget,
      maintenanceDueDays: editingMachine?.maintenanceDueDays ?? 30,
    };

    if (editingMachine) {
      setMachines((prev) => prev.map((m) => (m.code === editingMachine.code ? newMachine : m)));
    } else {
      setMachines((prev) => [...prev, newMachine]);
    }
    closeModal();
  };

  const handleDeleteMachine = (code: string) => {
    if (confirm(`Are you sure you want to delete machine ${code}?`)) {
      setMachines((prev) => prev.filter((m) => m.code !== code));
    }
  };

  const toggleProcess = (processCode: ProcessCode) => {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Machines Master Data</h1>
                <p className="text-sm text-gray-500 mt-1">Manage production equipment and resources</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Upload size={18} />
                  Import
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Download size={18} />
                  Export
                </button>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={18} />
                  New Machine
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Machines</p>
                    <p className="text-2xl font-bold text-gray-900">{machines.length}</p>
                  </div>
                  <Cpu size={32} className="text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Running</p>
                    <p className="text-2xl font-bold text-green-600">
                      {machines.filter((m) => m.status === "Running").length}
                    </p>
                  </div>
                  <Activity size={32} className="text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg OEE</p>
                    <p className="text-2xl font-bold text-gray-900">{avgOEE}%</p>
                  </div>
                  <TrendingUp size={32} className="text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">PM Due Soon</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {machines.filter((m) => m.maintenanceDueDays <= 7).length}
                    </p>
                  </div>
                  <Wrench size={32} className="text-orange-600" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search machines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterWorkCenter}
                onChange={(e) => setFilterWorkCenter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Work Centers</option>
                {WORK_CENTERS.map((wc) => (
                  <option key={wc.code} value={wc.code}>
                    {wc.name}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as MachineStatus | "all")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Running">Running</option>
                <option value="Idle">Idle</option>
                <option value="PM">Maintenance</option>
                <option value="Down">Down</option>
                <option value="Setup">Setup</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Machines List */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredMachines.length === 0 ? (
            <div className="text-center py-12">
              <Cpu size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No machines found</h3>
              <p className="text-gray-500 mb-4">Create your first machine to get started</p>
              <button onClick={openCreateModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Machine
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMachines.map((machine) => {
                const isExpanded = !!expandedMachines[machine.code];
                const maintenanceStatus = getMaintenanceStatus(machine.maintenanceDueDays);

                return (
                  <div key={machine.code} className="hover:bg-gray-50 transition-colors">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <button onClick={() => toggleMachineExpand(machine.code)} className="p-1 hover:bg-gray-200 rounded">
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{machine.name}</h3>
                              <span className="text-sm text-gray-500">({machine.code})</span>
                              <span
                                className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${getStatusColor(
                                  machine.status
                                )}`}
                              >
                                {getStatusIcon(machine.status)}
                                {machine.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Settings size={14} />
                                <span>{machine.workCenterName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Zap size={14} />
                                <span className={getOEEColor(machine.currentOEE, machine.oeeTarget)}>
                                  OEE: {machine.currentOEE}% (Target: {machine.oeeTarget}%)
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{machine.calendarName}</span>
                              </div>
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${maintenanceStatus.color}`}>
                                <Wrench size={14} />
                                <span>PM: {maintenanceStatus.text}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openViewModal(machine)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="View Details"
                          >
                            <Eye size={18} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => openEditModal(machine)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="Edit Machine"
                          >
                            <Edit size={18} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteMachine(machine.code)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="Delete Machine"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 ml-12 grid grid-cols-3 gap-6">
                          <div className="border border-gray-200 rounded-lg p-4 bg-white">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Equipment Info</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-500">Description:</span>
                                <div className="text-gray-900">{machine.description}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Manufacturer:</span>
                                <div className="text-gray-900">{machine.manufacturer}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Model:</span>
                                <div className="text-gray-900">{machine.model}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Serial Number:</span>
                                <div className="text-gray-900">{machine.serialNumber}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Location:</span>
                                <div className="text-gray-900">{machine.location}</div>
                              </div>
                            </div>
                          </div>

                          <div className="border border-gray-200 rounded-lg p-4 bg-white">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Capabilities</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-500">Processes:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {machine.processes.map((proc) => (
                                    <span key={proc} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                      {proc}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Capacity:</span>
                                <div className="text-gray-900">{machine.capacityHoursPerDay} hrs/day</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Current OEE:</span>
                                <div className={`font-semibold ${getOEEColor(machine.currentOEE, machine.oeeTarget)}`}>
                                  {machine.currentOEE}%
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Target OEE:</span>
                                <div className="text-gray-900">{machine.oeeTarget}%</div>
                              </div>
                            </div>
                          </div>

                          <div className="border border-gray-200 rounded-lg p-4 bg-white">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Maintenance</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-500">Last PM:</span>
                                <div className="text-gray-900">{new Date(machine.lastPMDate).toLocaleDateString()}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Next PM:</span>
                                <div className="text-gray-900">{new Date(machine.nextPMDate).toLocaleDateString()}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Due In:</span>
                                <div className={maintenanceStatus.color.split(" ")[0]}>
                                  {machine.maintenanceDueDays} days - {maintenanceStatus.text}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Purchase Date:</span>
                                <div className="text-gray-900">{new Date(machine.purchaseDate).toLocaleDateString()}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Warranty:</span>
                                <div className="text-gray-900">Until {new Date(machine.warrantyExpiry).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </div>

                          {machine.notes && (
                            <div className="col-span-3 border border-blue-200 rounded-lg p-4 bg-blue-50">
                              <div className="flex items-start gap-2">
                                <AlertCircle size={16} className="text-blue-600 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium text-blue-900 mb-1">Notes</div>
                                  <div className="text-sm text-blue-800">{machine.notes}</div>
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {viewMode === "view" ? "Machine Details" : editingMachine ? "Edit Machine" : "Create New Machine"}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {viewMode === "view" && editingMachine ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Machine Code</label>
                      <p className="mt-1 text-lg font-semibold">{editingMachine.code}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-gray-900">{editingMachine.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1">
                        <span
                          className={`text-sm px-3 py-1 rounded flex items-center gap-1 w-fit ${getStatusColor(
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
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-gray-900">{editingMachine.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Equipment Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Work Center:</span>
                          <span className="font-medium">{editingMachine.workCenterName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{editingMachine.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Manufacturer:</span>
                          <span className="font-medium">{editingMachine.manufacturer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Model:</span>
                          <span className="font-medium">{editingMachine.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Serial Number:</span>
                          <span className="font-medium">{editingMachine.serialNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Performance</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Calendar:</span>
                          <span className="font-medium">{editingMachine.calendarName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium">{editingMachine.capacityHoursPerDay} hrs/day</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current OEE:</span>
                          <span
                            className={`font-semibold ${getOEEColor(
                              editingMachine.currentOEE,
                              editingMachine.oeeTarget
                            )}`}
                          >
                            {editingMachine.currentOEE}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Target OEE:</span>
                          <span className="font-medium">{editingMachine.oeeTarget}%</span>
                        </div>
                        <div className="pt-2 border-t">
                          <span className="text-gray-600">Process Capabilities:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {editingMachine.processes.map((proc) => (
                              <span key={proc} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
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
                      <label className="text-sm font-medium text-gray-700">Notes</label>
                      <p className="mt-1 text-gray-900 p-3 bg-gray-50 rounded">{editingMachine.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Machine Code *</label>
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly={!!editingMachine}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Machine Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Brief description of the machine..."
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Work Center *</label>
                        <select
                          value={formData.workCenterCode}
                          onChange={(e) => setFormData({ ...formData, workCenterCode: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Work Center</option>
                          {WORK_CENTERS.map((wc) => (
                            <option key={wc.code} value={wc.code}>
                              {wc.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Current Status *</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as MachineStatus })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Idle">Idle</option>
                          <option value="Running">Running</option>
                          <option value="Setup">Setup</option>
                          <option value="PM">Maintenance</option>
                          <option value="Down">Down</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Location</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Building A - Floor 1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Process Capabilities */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Capabilities *</h3>
                    <p className="text-sm text-gray-600 mb-3">Select all processes this machine can perform:</p>
                    <div className="grid grid-cols-5 gap-2">
                      {PROCESSES.map((proc) => (
                        <label
                          key={proc}
                          className={`flex items-center justify-center px-3 py-2 border-2 rounded-lg cursor-pointer transition-colors ${
                            formData.processes.includes(proc)
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.processes.includes(proc)}
                            onChange={() => toggleProcess(proc)}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium">{proc}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Operating Parameters */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Parameters</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Calendar</label>
                        <select
                          value={formData.calendarId}
                          onChange={(e) => setFormData({ ...formData, calendarId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Calendar</option>
                          {CALENDARS.map((cal) => (
                            <option key={cal.id} value={cal.id}>
                              {cal.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Capacity (hrs/day)</label>
                        <input
                          type="number"
                          value={formData.capacityHoursPerDay}
                          onChange={(e) =>
                            setFormData({ ...formData, capacityHoursPerDay: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min={0}
                          max={24}
                          step={0.5}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Target OEE (%)</label>
                        <input
                          type="number"
                          value={formData.oeeTarget}
                          onChange={(e) => setFormData({ ...formData, oeeTarget: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min={0}
                          max={100}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Equipment Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Manufacturer</label>
                        <input
                          type="text"
                          value={formData.manufacturer}
                          onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Model</label>
                        <input
                          type="text"
                          value={formData.model}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Serial Number</label>
                        <input
                          type="text"
                          value={formData.serialNumber}
                          onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Purchase Date</label>
                        <input
                          type="date"
                          value={formData.purchaseDate}
                          onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Warranty Expiry</label>
                        <input
                          type="date"
                          value={formData.warrantyExpiry}
                          onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Schedule */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Schedule</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Last PM Date</label>
                        <input
                          type="date"
                          value={formData.lastPMDate}
                          onChange={(e) => setFormData({ ...formData, lastPMDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Next PM Date</label>
                        <input
                          type="date"
                          value={formData.nextPMDate}
                          onChange={(e) => setFormData({ ...formData, nextPMDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Special requirements, safety notes, operating instructions..."
                    />
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
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
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              {viewMode === "view" ? (
                <button
                  onClick={() => setViewMode("edit")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit size={18} />
                  Edit Machine
                </button>
              ) : (
                <button
                  onClick={handleSaveMachine}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Machine
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachinesMasterData;
