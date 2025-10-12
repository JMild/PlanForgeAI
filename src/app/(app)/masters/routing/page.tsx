"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  ArrowRight,
  Clock,
  AlertCircle,
  Save,
  GitBranch,
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import Modal from "@/src/components/shared/Modal";
import { getProcesses, getRoutings, getWorkCenterDropdown } from "@/src/services/master";
import { ERROR_MESSAGES } from "@/src/config/messages";
import toast from "react-hot-toast";
import { ExpandableDataTable } from "@/src/components/shared/table/ExpandableDataTable";

/* ===================== Types ===================== */
type Status = "Active" | "Draft" | "Obsolete";
type ViewMode = "view" | "edit" | null;

interface Process {
  process_code: string;
  process_name: string;
}

interface WorkCenter {
  code: string;
  name: string;
  machines: string[];
}

type TableCol<T> = {
  key: keyof T | string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (item: T) => React.ReactNode;
};

/** Final routing step (มี processName ที่ derive แล้ว) */
interface RoutingStep {
  seq: number;
  processCode: string;
  processName?: string;
  workCenterCode: string;
  machineList: string[];
  setupMin: number;
  runMinPerUnit: number;
  batchSize: number;
  changeoverFamily: string | null;
  queueTimeMin: number;
  moveTimeMin: number;
  notes: string;
}

/** Form routing step (ยังไม่มี processName) */
type RoutingStepFormData = Omit<RoutingStep, "processName">;

/** Final routing (มี productName) */
interface Routing {
  routing_id: string;
  routing_name: string;
  status: Status;
  description: string;
  steps: RoutingStep[];
  step_count: number;
  total_minutes: number;
}

/** Form routing (ไม่มี productName และใช้ steps แบบของฟอร์ม) */
interface RoutingFormData extends Omit<Routing, "steps"> {
  steps: RoutingStepFormData[];
}

/* ===================== Component ===================== */
const RoutingMasterData = () => {
  const [routings, setRoutings] = useState<Routing[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRouting, setEditingRouting] = useState<Routing | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(null);

  const emptyFormData: RoutingFormData = {
    routing_id: "",
    routing_name: "",
    status: "Draft",
    description: "",
    steps: [],
    step_count: 0,
    total_minutes: 0
  };
  const [formData, setFormData] = useState<RoutingFormData>(emptyFormData);

  /* ============ Loads ============ */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getRoutings();
        const resProcesses = await getProcesses();
        const resWorkCenters = await getWorkCenterDropdown();

        // Set state
        console.log('resProcesses', resProcesses)
        setRoutings(res);
        setProcesses(resProcesses);
        setWorkCenters(resWorkCenters);

      } catch (error) {
        console.error("❌ Fetch data failed:", error);
        toast.error(ERROR_MESSAGES.fetchFailed);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ============ Memos / Maps ============ */
  const processMap = useMemo(
    () => new Map(processes.map((p) => [p.process_code, p.process_name] as const)),
    [processes]
  );

  /* ============ Helpers ============ */
  const getStatusColor = (status: Status): string => {
    const colors: Record<Status, string> = {
      Active: "status-success",
      Draft: "status-warning",
      Obsolete: "status-inactive",
    };
    return colors[status];
  };

  const getRoutingStatusClass = (s: Status) => getStatusColor(s);

  const calculateTotalTime = (
    steps: (RoutingStep | RoutingStepFormData)[] = [],
    qty: number = 100
  ): number =>
    steps.reduce((total, step) => {
      const batchSize = step.batchSize ?? 1;
      const setupMin = step.setupMin ?? 0;
      const runMinPerUnit = step.runMinPerUnit ?? 0;
      const queueTimeMin = step.queueTimeMin ?? 0;
      const moveTimeMin = step.moveTimeMin ?? 0;
      if (batchSize <= 0) return total;

      // จำนวน batch ที่ต้องผลิตจาก qty
      const batches = Math.ceil(qty / batchSize);
      // เวลา 1 batch = setup + (run * batchSize)
      const batchTime = setupMin + batchSize * runMinPerUnit;

      return total + batches * batchTime + queueTimeMin + moveTimeMin;
    }, 0);

  /* ============ Filters ============ */
  const filteredRoutings = useMemo(() => {
    const qs = searchTerm.trim().toLowerCase();
    return routings.filter((r) => {
      const matchesSearch =
        r.routing_name.toLowerCase().includes(qs) ||
        (r.description ?? "").toLowerCase().includes(qs);
      const matchesStatus = filterStatus === "all" || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [routings, searchTerm, filterStatus]);

  /* ============ Actions ============ */
  const openCreateModal = () => {
    const nextNumber =
      routings
        .map(r => parseInt(r.routing_id.replace(/^RT/, ""), 10))
        .filter(n => !Number.isNaN(n))
        .reduce((max, n) => Math.max(max, n), 0) + 1;

    const nextId = `RT${String(nextNumber).padStart(3, "0")}`;

    setFormData({
      routing_id: nextId,
      routing_name: "",
      status: "Draft",
      description: "",
      step_count: 0,
      total_minutes: 0,
      steps: [
        {
          seq: 10,
          processCode: "",
          workCenterCode: "",
          machineList: [],
          setupMin: 0,
          runMinPerUnit: 0,
          batchSize: 1,
          changeoverFamily: null,
          queueTimeMin: 0,
          moveTimeMin: 0,
          notes: "",
        },
      ],
    });
    setEditingRouting(null);
    setViewMode("edit");
    setIsModalOpen(true);
  };

  const openEditModal = (routing: Routing) => {
    const { steps, ...rest } = routing;
    const formSteps: RoutingStepFormData[] = steps
      .slice()
      .sort((a, b) => a.seq - b.seq)
    setFormData({ ...rest, steps: formSteps });
    setEditingRouting(routing);
    setViewMode("edit");
    setIsModalOpen(true);
  };

  const openViewModal = (routing: Routing) => {
    setEditingRouting(routing);
    setViewMode("view");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRouting(null);
    setViewMode(null);
  };

  const handleSaveRouting = () => {
    // validation เบื้องต้น
    if (!formData.routing_name || formData.steps.length === 0) {
      alert("Please fill in product and at least one step");
      return;
    }
    if (
      formData.steps.some(
        (s) =>
          !s.processCode ||
          !s.workCenterCode ||
          s.setupMin < 0 ||
          s.runMinPerUnit <= 0 ||
          s.batchSize <= 0
      )
    ) {
      alert("Please complete all step details with valid values");
      return;
    }

    // ป้องกัน routing_id ซ้ำ เมื่อเป็นการสร้างใหม่
    if (!editingRouting) {
      const dup = routings.some((r) => r.routing_id === formData.routing_id);
      if (dup) {
        alert(`Routing ID ${formData.routing_id} already exists`);
        return;
      }
    }

    const newRouting: Routing = {
      routing_id: formData.routing_id,
      routing_name: formData.routing_name,
      status: formData.status,
      description: formData.description,
      steps: formData.steps
        .slice()
        .sort((a, b) => a.seq - b.seq)
        .map((step) => ({
          ...step,
          processName: processMap.get(step.processCode) || "",
        })),
      step_count: 0,
      total_minutes: 0
    };

    if (editingRouting) {
      setRoutings((prev) =>
        prev.map((r) => (r.routing_id === editingRouting.routing_id ? newRouting : r))
      );
    } else {
      setRoutings((prev) => [...prev, newRouting]);
    }
    closeModal();
  };

  const handleDeleteRouting = (id: string) => {
    if (confirm(`Are you sure you want to delete routing ${id}?`)) {
      setRoutings((prev) => prev.filter((r) => r.routing_id !== id));
    }
  };

  const addStep = () => {
    const maxSeq = Math.max(0, ...formData.steps.map((s) => s.seq));
    setFormData((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          seq: maxSeq + 10,
          processCode: "",
          workCenterCode: "",
          machineList: [],
          setupMin: 0,
          runMinPerUnit: 0,
          batchSize: 1,
          changeoverFamily: null,
          queueTimeMin: 0,
          moveTimeMin: 0,
          notes: "",
        },
      ],
    }));
  };

  const removeStep = (seq: number) => {
    if (formData.steps.length === 1) {
      alert("Routing must have at least one step");
      return;
    }
    setFormData((prev) => ({ ...prev, steps: prev.steps.filter((s) => s.seq !== seq) }));
  };

  const updateStep = useCallback(
    (
      seq: number,
      field: keyof RoutingStepFormData,
      value: RoutingStepFormData[keyof RoutingStepFormData]
    ) => {
      setFormData((prev) => ({
        ...prev,
        steps: prev.steps.map((step) => {
          if (step.seq !== seq) return step;
          const updated: RoutingStepFormData = { ...step, [field]: value } as RoutingStepFormData;
          // เปลี่ยน Work Center → เติม machineList ตาม WC
          if (field === "workCenterCode") {
            const wc = workCenters.find((w) => w.code === value);
            updated.machineList = wc ? wc.machines : [];
          }
          return updated;
        }),
      }));
    },
    [workCenters]
  );

  const moveStep = (seq: number, direction: "up" | "down") => {
    const idx = formData.steps.findIndex((s) => s.seq === seq);
    if (idx < 0) return;
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === formData.steps.length - 1))
      return;

    const newSteps = [...formData.steps];
    const targetIndex = direction === "up" ? idx - 1 : idx + 1;
    [newSteps[idx], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[idx]];

    const resequenced = newSteps.map((s, i) => ({ ...s, seq: (i + 1) * 10 }));
    setFormData((prev) => ({ ...prev, steps: resequenced }));
  };

  /* ====== Columns ของตาราง Routing ====== */
  type RoutingRow = Routing;
  const routingColumns: readonly TableCol<RoutingRow>[] = [
    {
      key: "routing_name",
      label: "Name",
      render: (r: RoutingRow) => (
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">
            {r.routing_name}
          </div>
          {r.description && (
            <div className="text-xs text-white/60 truncate">{r.description}</div>
          )}
        </div>
      ),
    },
    {
      key: "step_count",
      label: "Steps",
      align: "center" as const,
      render: (r: RoutingRow) => (
        <div className="flex items-center justify-center gap-1 text-sm text-white/80">
          <GitBranch size={14} className="text-white/50" />
          <span>{r?.step_count ?? 0} steps</span>
        </div>
      ),
    },
    {
      key: "total_minutes",
      label: "Est. Time (min)",
      align: "center" as const,
      render: (r: RoutingRow) => (
        <div className="flex items-center justify-center gap-1 text-sm text-white/80">
          <Clock size={14} className="text-white/50" />
          <span>{r?.total_minutes ?? 0}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "center" as const,
      render: (r: RoutingRow) => (
        <span className={`chip ${getRoutingStatusClass(r.status)}`}>{r.status}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center" as const,
      render: (r: RoutingRow) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openViewModal(r)}
            className="p-2 hover:bg-white/10 rounded"
            title="View Details"
          >
            <Eye size={18} className="text-white/70" />
          </button>
          <button
            onClick={() => openEditModal(r)}
            className="p-2 text-sky-300 hover:bg-white/10 rounded"
            title="Edit Routing"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDeleteRouting(r.routing_id)}
            className="p-2 text-rose-300 hover:bg-white/10 rounded"
            title="Delete Routing"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ] as const;

  /* ====== Expanded Row ====== */
  const renderRoutingExpanded = (routing: Routing) => {
    const totalTime = calculateTotalTime(routing.steps, 100);
    return (
      <div className="mt-2">
        <h4 className="text-sm font-semibold text-white/80 mb-3">
          Process Steps:{" "}
          <span className="text-white/60 font-normal">
            Est. {Math.round(totalTime)} min (100 units)
          </span>
        </h4>

        <div className="space-y-2">
          {routing.steps?.sort((a, b) => a.seq - b.seq).map((step, idx) => (
            <div key={step.seq} className="flex items-center gap-3">
              <div className="flex-1 border border-white/10 rounded-lg p-3 bg-white/5">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-500/20 text-sky-300 font-semibold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{step.processName}</span>
                      <span className="text-sm text-white/60">({step.processCode})</span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm text-white/70 mt-2">
                      <div>
                        <span className="text-white/60">Work Center:</span>
                        <div className="font-medium">{step.workCenterCode}</div>
                      </div>
                      <div>
                        <span className="text-white/60">Setup:</span>
                        <div className="font-medium">{step.setupMin} min</div>
                      </div>
                      <div>
                        <span className="text-white/60">Run Time:</span>
                        <div className="font-medium">{step.runMinPerUnit} min/unit</div>
                      </div>
                      <div>
                        <span className="text-white/60">Batch Size:</span>
                        <div className="font-medium">{step.batchSize} units</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-white/70 mt-2">
                      <div>
                        <span className="text-white/60">Machines:</span>
                        <span className="font-medium ml-1">
                          {step.machineList.join(", ")}
                        </span>
                      </div>
                      {step.changeoverFamily && (
                        <div>
                          <span className="text-white/60">Changeover Family:</span>
                          <span className="font-medium ml-1">{step.changeoverFamily}</span>
                        </div>
                      )}
                    </div>

                    {step.notes && (
                      <div className="mt-2 text-xs text-sky-300 bg-sky-500/10 p-2 rounded">
                        {step.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {idx < routing.steps.length - 1 && (
                <ArrowRight size={20} className="text-white/40 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="text-white">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Routing / Process Plans</h1>
              <p className="text-sm text-white/60 mt-1">
                Define production sequences and process parameters
              </p>
            </div>
          </div>
        }
        tabs={
          <div className="flex gap-4 mt-0.5 mb-1 mx-0.5">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
              />
              <input
                type="text"
                placeholder="Search routings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input w-full !pl-10 pr-4"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | Status)}
              className="glass-input w-32"
            >
              <option value="all" className="select option">All Status</option>
              <option value="Active" className="select option">Active</option>
              <option value="Draft" className="select option">Draft</option>
              <option value="Obsolete" className="select option">Obsolete</option>
            </select>
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
            <button onClick={openCreateModal} className="btn btn-primary">
              <Plus size={18} />
              New Routing
            </button>
          </div>
        }
      />

      {/* Routings List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ExpandableDataTable<Routing>
          columns={routingColumns}
          data={filteredRoutings}
          rowKey={(r) => r.routing_id}
          renderExpandedRow={renderRoutingExpanded}
          isLoading={loading}
        />
      </div>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="2xl"
        title={
          <span className="text-xl font-semibold">
            {viewMode === "view" ? "Routing Details" : editingRouting ? "Edit Routing" : "Create New Routing"}
          </span>
        }
        footer={
          <>

            {viewMode === "view" ? (
              <div className="flex items-center justify-end gap-3 w-full">
                <button onClick={closeModal} className="btn btn-outline">
                  Close
                </button>
                <button
                  onClick={() => {
                    if (editingRouting) {
                      const { steps, ...rest } = editingRouting;
                      const formSteps: RoutingStepFormData[] = steps.map(({ processName: _p, ...s }) => s);
                      setFormData({ ...rest, steps: formSteps });
                    }
                    setViewMode("edit");
                  }}
                  className="btn btn-primary"
                >
                  <Edit size={18} />
                  Edit Routing
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 w-full">
                <button onClick={closeModal} className="btn btn-outline">Cancel</button>
                <button onClick={handleSaveRouting} className="btn btn-primary">
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            )}
          </>
        }
      >
        {/* Body */}
        {viewMode === "view" && editingRouting ? (
          <div className="space-y-6 text-white">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-white/70">Routing Name</label>
                <p className="mt-1 text-lg font-semibold">{editingRouting.routing_name}</p>
              </div>
              <div>
                <label className="text-sm text-white/70">Status</label>
                <p className="mt-1">
                  <span className={`chip ${getStatusColor(editingRouting.status)}`}>
                    {editingRouting.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-white/70">Total Steps</label>
                <p className="mt-1">{editingRouting?.step_count ?? 0}</p>
              </div>
            </div>

            {editingRouting.description && (
              <div>
                <label className="text-sm text-white/70">Description</label>
                <p className="mt-1">{editingRouting.description}</p>
              </div>
            )}

            <div>
              <label className="text-sm text-white/70 mb-3 block">Process Steps</label>
              <div className="space-y-3">
                {(editingRouting?.steps ?? [])
                  .sort((a, b) => a.seq - b.seq)
                  .map((step, idx) => (
                    <div key={step.seq} className="border border-white/10 rounded-lg p-4 bg-white/5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-300 font-semibold grid place-items-center">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">{step.processName}</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm text-white/80">
                            <div>
                              <span className="text-white/60">Work Center:</span>
                              <div className="font-medium">{step.workCenterCode}</div>
                            </div>
                            <div>
                              <span className="text-white/60">Machines:</span>
                              <div className="font-medium">{step.machineList.join(", ")}</div>
                            </div>
                            <div>
                              <span className="text-white/60">Setup Time:</span>
                              <div className="font-medium">{step.setupMin} min</div>
                            </div>
                            <div>
                              <span className="text-white/60">Run Time:</span>
                              <div className="font-medium">{step.runMinPerUnit} min/unit</div>
                            </div>
                            <div>
                              <span className="text-white/60">Batch Size:</span>
                              <div className="font-medium">{step.batchSize} units</div>
                            </div>
                            <div>
                              <span className="text-white/60">Changeover Family:</span>
                              <div className="font-medium">
                                {step.changeoverFamily || "None"}
                              </div>
                            </div>
                          </div>
                          {step.notes && (
                            <div className="mt-2 text-sm text-sky-300 bg-sky-500/10 p-2 rounded">
                              {step.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-white">
            {/* Routing Header */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-white/80 block mb-2">Routing Name</label>
                <input
                  type="text"
                  value={formData.routing_name}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white"
                />
              </div>              
              <div>
                <label className="text-sm text-white/80 block mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                >
                  {(["Draft", "Active", "Obsolete"] as Status[]).map((s) => (
                    <option key={s} value={s} className="select option">{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-white/80 block mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                placeholder="Brief description of this routing..."
              />
            </div>

            {/* Process Steps */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-white/80">Process Steps *</label>
                <button
                  type="button"
                  onClick={addStep}
                  className="px-3 py-1 bg-sky-500 text-white text-sm rounded hover:bg-sky-600 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Step
                </button>
              </div>

              <div className="space-y-4">
                {formData.steps.map((step, idx) => (
                  <div key={step.seq} className="border-2 border-white/10 rounded-lg p-4 bg-white/5">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => moveStep(step.seq, "up")}
                          disabled={idx === 0}
                          className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <div className="w-8 h-8 rounded-full bg-sky-600 text-white grid place-items-center font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => moveStep(step.seq, "down")}
                          disabled={idx === formData.steps.length - 1}
                          className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Down"
                        >
                          ▼
                        </button>
                      </div>

                      <div className="flex-1 space-y-3">
                        {/* Row 1 */}
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-white/80 block mb-1">Process *</label>
                            <select
                              value={step.processCode}
                              onChange={(e) => updateStep(step.seq, "processCode", e.target.value)}
                              className="w-full px-2 py-1.5 text-sm rounded border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                              required
                            >
                              <option value="" className="select option">Select Process</option>
                              {processes.map((proc) => (
                                <option key={proc.process_code} value={proc.process_code} className="select option">
                                  {proc.process_name} ({proc.process_code})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-xs text-white/80 block mb-1">Work Center *</label>
                            <select
                              value={step.workCenterCode}
                              onChange={(e) => updateStep(step.seq, "workCenterCode", e.target.value)}
                              className="w-full px-2 py-1.5 text-sm rounded border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                              required
                            >
                              <option value="" className="select option">Select Work Center</option>
                              {workCenters.map((wc) => (
                                <option key={wc.code} value={wc.code} className="select option">
                                  {wc.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-xs text-white/80 block mb-1">Changeover Family</label>
                            <input
                              type="text"
                              value={step.changeoverFamily ?? ""}
                              onChange={(e) => updateStep(step.seq, "changeoverFamily", e.target.value || null)}
                              className="w-full px-2 py-1.5 text-sm rounded border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                              placeholder="e.g., METAL-A"
                            />
                          </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs text-white/80 block mb-1">Setup Time (min) *</label>
                            <input
                              type="number"
                              value={step.setupMin}
                              onChange={(e) =>
                                updateStep(step.seq, "setupMin", Number.isNaN(+e.target.value) ? 0 : parseFloat(e.target.value))
                              }
                              className="w-full px-2 py-1.5 text-sm rounded border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                              min={0}
                              step={1}
                              required
                            />
                          </div>

                          <div>
                            <label className="text-xs text-white/80 block mb-1">Run Time (min/unit) *</label>
                            <input
                              type="number"
                              value={step.runMinPerUnit}
                              onChange={(e) =>
                                updateStep(step.seq, "runMinPerUnit", Number.isNaN(+e.target.value) ? 0 : parseFloat(e.target.value))
                              }
                              className="w-full px-2 py-1.5 text-sm rounded border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                              min={0}
                              step={0.1}
                              required
                            />
                          </div>

                          <div>
                            <label className="text-xs text-white/80 block mb-1">Batch Size *</label>
                            <input
                              type="number"
                              value={step.batchSize}
                              onChange={(e) =>
                                updateStep(step.seq, "batchSize", Number.isNaN(+e.target.value) ? 1 : parseInt(e.target.value))
                              }
                              className="w-full px-2 py-1.5 text-sm rounded border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                              min={1}
                              required
                            />
                          </div>

                          <div>
                            <label className="text-xs text-white/80 block mb-1">Queue Time (min)</label>
                            <input
                              type="number"
                              value={step.queueTimeMin}
                              onChange={(e) =>
                                updateStep(step.seq, "queueTimeMin", Number.isNaN(+e.target.value) ? 0 : parseInt(e.target.value))
                              }
                              className="w-full px-2 py-1.5 text-sm rounded border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                              min={0}
                            />
                          </div>
                        </div>

                        {/* Row 3 */}
                        <div>
                          <label className="text-xs text-white/80 block mb-1">Notes</label>
                          <input
                            type="text"
                            value={step.notes}
                            onChange={(e) => updateStep(step.seq, "notes", e.target.value)}
                            className="w-full px-2 py-1.5 text-sm rounded border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                            placeholder="Special instructions, tooling requirements, etc."
                          />
                        </div>

                        {step.machineList.length > 0 && (
                          <div className="text-xs text-white/80 bg-white/5 p-2 rounded border border-white/10">
                            <span className="font-medium">Available Machines:</span>{" "}
                            {step.machineList.join(", ")}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeStep(step.seq)}
                        className="p-2 text-rose-300 hover:bg-white/10 rounded"
                        title="Remove Step"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {formData.steps.length > 0 && (
              <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="text-sky-300 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-sky-200">
                    <div className="font-medium text-sky-300 mb-1">Routing Summary</div>
                    <div>
                      Total Steps: {formData.steps.length} | Estimated Time (100 units):{" "}
                      {Math.round(calculateTotalTime(formData.steps, 100))} minutes
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RoutingMasterData;
