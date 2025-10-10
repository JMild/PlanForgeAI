"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Eye,
  Download,
  Upload,
  ArrowRight,
  Clock,
  Settings,
  AlertCircle,
  Save,
  ChevronDown,
  ChevronRight,
  GitBranch,
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import Modal from "@/src/components/shared/Modal";
import { getProcess, getProduct, getWorkCenterRoutings } from "@/src/lib/api";
import { getRoutings } from "@/src/services/master";
import EmptyState from "@/src/components/shared/EmptyState";
import Loading from "@/src/components/Loading";
import { ERROR_MESSAGES } from "@/src/config/messages";
import toast from "react-hot-toast";

/* ===================== Types ===================== */
type Status = "Active" | "Draft" | "Obsolete";
type ViewMode = "view" | "edit" | null;

interface Product {
  code: string;
  name: string;
}

interface Process {
  code: string;
  name: string;
  category: string;
}

interface WorkCenter {
  code: string;
  name: string;
  machines: string[];
}

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
  id: string;
  product_code: string;
  productName: string;
  version: string;
  status: Status;
  effectiveDate: string;
  description: string;
  steps: RoutingStep[];
}

/** Form routing (ไม่มี productName และใช้ steps แบบของฟอร์ม) */
interface RoutingFormData extends Omit<Routing, "productName" | "steps"> {
  steps: RoutingStepFormData[];
}

/* ===================== Component ===================== */
const RoutingMasterData = () => {
  const [routings, setRoutings] = useState<Routing[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [expandedRoutings, setExpandedRoutings] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRouting, setEditingRouting] = useState<Routing | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(null);

  const emptyFormData: RoutingFormData = {
    id: "",
    product_code: "",
    version: "1.0",
    status: "Draft",
    effectiveDate: "",
    description: "",
    steps: [],
  };
  const [formData, setFormData] = useState<RoutingFormData>(emptyFormData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = (await getRoutings()) as Routing[];
        const resProducts = (await getProduct()) as Product[];
        const resProcesses = (await getProcess()) as Process[];
        const resWorkCenters = (await getWorkCenterRoutings()) as WorkCenter[];
        console.log('res',res)
        setRoutings(res);
        setProducts(resProducts);
        setProcesses(resProcesses);
        setWorkCenters(resWorkCenters);
      } catch (error) {
        console.error('Fetch data failed:', error);
        toast.error(ERROR_MESSAGES.fetchFailed);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: Status): string => {
    const colors: Record<Status, string> = {
      Active: "status-success",
      Draft: "status-warning",
      Obsolete: "status-inactive",
    };
    return colors[status];
  };

  const filteredRoutings = routings.filter((routing) => {
    const qs = searchTerm.toLowerCase();
    const matchesSearch =
      routing.product_code.toLowerCase().includes(qs) ||
      routing.productName.toLowerCase().includes(qs) ||
      routing.id.toLowerCase().includes(qs);
    const matchesStatus = filterStatus === "all" || routing.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleRoutingExpand = (id: string) => {
    setExpandedRoutings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openCreateModal = () => {
    setFormData({
      id: `RT${String(routings.length + 1).padStart(3, "0")}`,
      product_code: "",
      version: "1.0",
      status: "Draft",
      effectiveDate: new Date().toISOString().split("T")[0],
      description: "",
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
    const { productName: _ignore, steps, ...rest } = routing;
    const formSteps: RoutingStepFormData[] = steps.map(({ processName: _p, ...s }) => s);
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
    if (!formData.product_code || formData.steps.length === 0) {
      alert("Please fill in product and at least one step");
      return;
    }

    if (
      formData.steps.some(
        (s) => !s.processCode || !s.workCenterCode || s.setupMin < 0 || s.runMinPerUnit <= 0
      )
    ) {
      alert("Please complete all step details with valid values");
      return;
    }

    const product = products.find((p) => p.code === formData.product_code);

    const newRouting: Routing = {
      id: formData.id,
      product_code: formData.product_code,
      productName: product?.name || "",
      version: formData.version,
      status: formData.status,
      effectiveDate: formData.effectiveDate,
      description: formData.description,
      steps: formData.steps.map((step) => {
        const proc = processes.find((p) => p.code === step.processCode);
        return { ...step, processName: proc?.name || "" };
      }),
    };

    if (editingRouting) {
      setRoutings((prev) => prev.map((r) => (r.id === editingRouting.id ? newRouting : r)));
    } else {
      setRoutings((prev) => [...prev, newRouting]);
    }
    closeModal();
  };

  const handleDeleteRouting = (id: string) => {
    if (confirm(`Are you sure you want to delete routing ${id}?`)) {
      setRoutings((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleCopyRouting = (routing: Routing) => {
    const newId = `RT${String(routings.length + 1).padStart(3, "0")}`;
    const copiedRouting: Routing = {
      ...routing,
      id: newId,
      version: "1.0",
      status: "Draft",
      description: `Copy of ${routing.description}`,
    };
    setRoutings((prev) => [...prev, copiedRouting]);
  };

  const addStep = () => {
    const maxSeq = Math.max(...formData.steps.map((s) => s.seq), 0);
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

  const updateStep = (
    seq: number,
    field: keyof RoutingStepFormData,
    value: RoutingStepFormData[keyof RoutingStepFormData]
  ) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.seq !== seq) return step;
        const updated: RoutingStepFormData = { ...step, [field]: value } as RoutingStepFormData;

        if (field === "workCenterCode") {
          const wc = workCenters.find((w) => w.code === value);
          updated.machineList = wc ? wc.machines : [];
        }
        return updated;
      }),
    }));
  };

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

  const calculateTotalTime = (
    steps: (RoutingStep | RoutingStepFormData)[],
    qty: number = 100
  ): number => {
    return steps.reduce((total, step) => {
      const batchSize = step.batchSize ?? 1;
      if (batchSize <= 0) return total;
      const batches = Math.ceil(qty / batchSize);
      const batchTime = (step.setupMin ?? 0) + batchSize * (step.runMinPerUnit ?? 0);
      return total + batches * batchTime + (step.queueTimeMin ?? 0) + (step.moveTimeMin ?? 0);
    }, 0);
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
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | Status)}
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
            >
              <option value="all" className="select option">
                All Status
              </option>
              <option value="Active" className="select option">
                Active
              </option>
              <option value="Draft" className="select option">
                Draft
              </option>
              <option value="Obsolete" className="select option">
                Obsolete
              </option>
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
        <div className="rounded-lg border border-white/10 bg-white/5">
          {loading ? (
            <Loading text="Loading routing..." />
          ) : filteredRoutings.length === 0 ? (
            <EmptyState
              icon={<GitBranch size={48} className="mx-auto text-white/50 mb-4" />}
              title="No routings found"
              message="Create your first routing to get started"
              buttonLabel="Create Routing"
              onButtonClick={openCreateModal}
            />
          ) : (
            <div className="divide-y divide-white/10">
              {filteredRoutings.map((routing) => {
                const isExpanded = expandedRoutings[routing.id];
                const totalTime = calculateTotalTime(routing.steps);

                return (
                  <div key={routing.id} className="hover:bg-white/5 transition-colors">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <button
                            onClick={() => toggleRoutingExpand(routing.id)}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">
                                {routing.product_code} - {routing.productName}
                              </h3>
                              <span className="text-sm text-white/60">v{routing.version}</span>
                              <span className={`chip ${getStatusColor(routing.status)}`}>{routing.status}</span>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-white/70">
                              <div className="flex items-center gap-1">
                                <GitBranch size={14} className="text-white/50" />
                                <span>{routing.steps.length} steps</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} className="text-white/50" />
                                <span>Est. {Math.round(totalTime)} min (100 units)</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Settings size={14} className="text-white/50" />
                                <span>ID: {routing.id}</span>
                              </div>
                            </div>
                            {routing.description && (
                              <div className="text-sm text-white/60 mt-1">{routing.description}</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openViewModal(routing)}
                            className="p-2 hover:bg-white/10 rounded"
                            title="View Details"
                          >
                            <Eye size={18} className="text-white/70" />
                          </button>
                          <button
                            onClick={() => handleCopyRouting(routing)}
                            className="p-2 hover:bg-white/10 rounded"
                            title="Copy Routing"
                          >
                            <Copy size={18} className="text-white/70" />
                          </button>
                          <button
                            onClick={() => openEditModal(routing)}
                            className="p-2 text-sky-300 hover:bg-white/10 rounded"
                            title="Edit Routing"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteRouting(routing.id)}
                            className="p-2 text-rose-300 hover:bg-white/10 rounded"
                            title="Delete Routing"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Steps */}
                      {isExpanded && (
                        <div className="mt-4 ml-12">
                          <h4 className="text-sm font-semibold text-white/80 mb-3">Process Steps:</h4>
                          <div className="space-y-2">
                            {routing.steps.map((step, idx) => (
                              <div key={step.seq} className="flex items-center gap-3">
                                <div className="flex-1 border border-white/10 rounded-lg p-3 bg-white/5">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
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
                                              <span className="font-medium ml-1">
                                                {step.changeoverFamily}
                                              </span>
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
                                </div>

                                {idx < routing.steps.length - 1 && (
                                  <ArrowRight size={20} className="text-white/40 flex-shrink-0" />
                                )}
                              </div>
                            ))}
                          </div>
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
            {viewMode === "view" ? "Routing Details" : editingRouting ? "Edit Routing" : "Create New Routing"}
          </span>
        }
        footer={
          <>
            <button onClick={closeModal} className="btn btn-outline">
              Cancel
            </button>

            {viewMode === "view" ? (
              <button
                onClick={() => {
                  if (editingRouting) {
                    // เตรียมฟอร์มก่อนสลับเป็นโหมดแก้ไข
                    const { productName: _ignore, steps, ...rest } = editingRouting;
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
            ) : (
              <button onClick={handleSaveRouting} className="btn btn-primary">
                <Save size={18} />
                Save Routing
              </button>
            )}
          </>
        }
      >
        {/* Body */}
        {viewMode === "view" && editingRouting ? (
          <div className="space-y-6 text-white">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-white/70">Routing ID</label>
                <p className="mt-1 text-lg font-semibold">{editingRouting.id}</p>
              </div>
              <div>
                <label className="text-sm text-white/70">Product</label>
                <p className="mt-1">
                  {editingRouting.product_code} - {editingRouting.productName}
                </p>
              </div>
              <div>
                <label className="text-sm text-white/70">Version</label>
                <p className="mt-1">v{editingRouting.version}</p>
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
                <label className="text-sm text-white/70">Effective Date</label>
                <p className="mt-1">{new Date(editingRouting.effectiveDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm text-white/70">Total Steps</label>
                <p className="mt-1">{editingRouting.steps.length}</p>
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
                {editingRouting.steps.map((step, idx) => (
                  <div key={step.seq} className="border border-white/10 rounded-lg p-4 bg-white/5">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-500/20 text-sky-300 font-semibold">
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
                            <div className="font-medium">{step.changeoverFamily || "None"}</div>
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
                <label className="text-sm text-white/80 block mb-2">Routing ID</label>
                <input
                  type="text"
                  value={formData.id}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-white/80 block mb-2">Product *</label>
                <select
                  value={formData.product_code}
                  onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                  required
                >
                  <option value="" className="select option">
                    Select Product
                  </option>
                  {products.map((p) => (
                    <option key={p.code} value={p.code} className="select option">
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-white/80 block mb-2">Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
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
                    <option key={s} value={s} className="select option">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-white/80 block mb-2">Effective Date *</label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                />
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
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-600 text-white font-semibold text-sm">
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
                              <option value="" className="select option">
                                Select Process
                              </option>
                              {processes.map((proc) => (
                                <option key={proc.code} value={proc.code} className="select option">
                                  {proc.name} ({proc.code})
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
                              <option value="" className="select option">
                                Select Work Center
                              </option>
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
                              value={step.changeoverFamily || ""}
                              onChange={(e) =>
                                updateStep(step.seq, "changeoverFamily", e.target.value || null)
                              }
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
                                updateStep(step.seq, "setupMin", parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-2 py-1.5 text-sm rounded border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                              min={0}
                              step={1}
                              required
                            />
                          </div>

                          <div>
                            <label className="text-xs text-white/80 block mb-1">
                              Run Time (min/unit) *
                            </label>
                            <input
                              type="number"
                              value={step.runMinPerUnit}
                              onChange={(e) =>
                                updateStep(
                                  step.seq,
                                  "runMinPerUnit",
                                  parseFloat(e.target.value) || 0
                                )
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
                                updateStep(step.seq, "batchSize", parseInt(e.target.value) || 1)
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
                                updateStep(step.seq, "queueTimeMin", parseInt(e.target.value) || 0)
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
