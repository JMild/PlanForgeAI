"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Save, Upload, Download, Wrench, Calendar, Clock, AlertCircle, CheckCircle, Settings, FileText, Table, LayoutGrid } from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';
import Modal from '@/src/components/shared/Modal';
import { ERROR_MESSAGES } from '@/src/config/messages';
import toast from 'react-hot-toast';
import EmptyState from '@/src/components/shared/EmptyState';
import Loading from '@/src/components/Loading';
import { getMaintenanceMachines } from '@/src/services';
import { DataTable } from '@/src/components/shared/table/Table';

// Types
const statusOptions = ['Active', 'Suspended', 'Completed'] as const;
type Status = typeof statusOptions[number];
type PriorityType = "Critical" | "High" | "Medium" | "Low";
type PlanType = "Preventive" | "Predictive" | "Corrective" | "Calibration" | "Inspection";
type Frequency =
  | "Daily"
  | "Weekly"
  | "Bi-Weekly"
  | "Monthly"
  | "Quarterly"
  | "Semi-Annual"
  | "Annual"
  | "By Hours"
  | "By Cycles";


type MaintenancePlan = {
  id: string;
  machineCode: string;
  machineName: string;
  planType: PlanType;
  title: string;
  description: string;
  frequency: Frequency;
  frequencyValue?: number; // For hours/cycles based
  durationMinutes: number;
  lastExecuted?: string;
  nextDue: string;
  status: Status;
  priority: PriorityType;
  assignedTo?: string;
  spareParts?: string[];
  procedure?: string;
  checklist?: ChecklistItem[];
  workCenter?: string;
  createdAt: string;
};

type ChecklistItem = {
  id: string;
  task: string;
  completed: boolean;
};

const Maintenance = () => {
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState('');
  // const [filterType, setFilterType] = useState<string>('all');
  const filterType = 'all';
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<MaintenancePlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  // const [showHistory, setShowHistory] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Form State
  const [planForm, setPlanForm] = useState<Partial<MaintenancePlan>>({
    machineCode: '',
    machineName: '',
    planType: 'Preventive',
    title: '',
    description: '',
    frequency: 'Monthly',
    durationMinutes: 60,
    status: 'Active',
    priority: 'Medium',
    checklist: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getMaintenanceMachines();
        console.log('res', res)
        setPlans(res);
        // const resBoms = (await getBOM()) as BOM[];
        // setProducts(resProducts);
        // setBoms(resBoms);
      } catch (error) {
        console.error('Fetch data failed:', error);
        toast.error(ERROR_MESSAGES.fetchFailed);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get unique machines
  const machines = useMemo(() => {
    const machineSet = new Set(plans.map(p => `${p.machineCode}|${p.machineName}`));
    return Array.from(machineSet).map(m => {
      const [code, name] = m.split('|');
      return { code, name };
    }).sort((a, b) => a.code.localeCompare(b.code));
  }, [plans]);

  // Filter plans
  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      const matchesSearch =
        plan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.machineCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || plan.planType === filterType;
      const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || plan.priority === filterPriority;
      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });
  }, [plans, searchTerm, filterType, filterStatus, filterPriority]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const overdue = plans.filter(p => p.nextDue < today && p.status === 'Active').length;
    const dueThisWeek = plans.filter(p => {
      const dueDate = new Date(p.nextDue);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return dueDate <= weekFromNow && dueDate >= new Date() && p.status === 'Active';
    }).length;
    const activePlans = plans.filter(p => p.status === 'Active').length;
    return { overdue, dueThisWeek, activePlans };
  }, [plans]);

  // Handlers
  const handleAdd = () => {
    setPlanForm({
      machineCode: '',
      machineName: '',
      planType: 'Preventive',
      title: '',
      description: '',
      frequency: 'Monthly',
      durationMinutes: 60,
      status: 'Active',
      priority: 'Medium',
      checklist: [],
    });
    setSelectedPlan(null);
    setIsEditing(true);
  };

  const handleEdit = (plan: MaintenancePlan) => {
    setPlanForm(plan);
    setSelectedPlan(plan);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!planForm.machineCode || !planForm.title) {
      alert('Machine code and title are required');
      return;
    }

    const planData = planForm as MaintenancePlan;
    if (selectedPlan) {
      setPlans(plans.map(p => p.id === selectedPlan.id ? planData : p));
    } else {
      const newPlan: MaintenancePlan = {
        ...planData,
        id: `PM${String(plans.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setPlans([...plans, newPlan]);
    }
    setIsEditing(false);
    setSelectedPlan(null);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Delete maintenance plan ${id}?`)) {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  const handleAddChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: `c${Date.now()}`,
      task: '',
      completed: false,
    };
    setPlanForm({
      ...planForm,
      checklist: [...(planForm.checklist || []), newItem],
    });
  };

  const handleUpdateChecklistItem = <K extends keyof ChecklistItem>(
    itemId: string,
    field: K,
    value: ChecklistItem[K]
  ) => {
    setPlanForm({
      ...planForm,
      checklist: (planForm.checklist || []).map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    });
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    setPlanForm({
      ...planForm,
      checklist: (planForm.checklist || []).filter(item => item.id !== itemId),
    });
  };

  const getDaysUntilDue = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDueStatus = (plan: MaintenancePlan): { status: string; color: string; icon: React.ReactNode } => {
    const days = getDaysUntilDue(plan.nextDue);
    if (days < 0) {
      return { status: 'Overdue', color: 'status-error', icon: <AlertCircle className="w-4 h-4" /> };
    } else if (days === 0) {
      return { status: 'Due Today', color: 'status-warning', icon: <Clock className="w-4 h-4" /> };
    } else if (days <= 7) {
      return { status: `Due in ${days}d`, color: 'status-yellow', icon: <Calendar className="w-4 h-4" /> };
    } else {
      return { status: `Due in ${days}d`, color: 'status-success', icon: <CheckCircle className="w-4 h-4" /> };
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Preventive': return 'status-info';
      case 'Predictive': return 'status-purple';
      case 'Corrective': return 'status-warning';
      case 'Calibration': return 'status-success';
      case 'Inspection': return 'status-inactive';;
      default: return 'status-inactive';;
    }
  };

  const exportToCSV = () => {
    const csv = 'Plan ID,Machine,Type,Title,Frequency,Duration (min),Next Due,Status,Priority,Cost\n' +
      plans.map(p =>
        `${p.id},${p.machineCode},${p.planType},${p.title},${p.frequency},${p.durationMinutes},${p.nextDue},${p.status},${p.priority}`
      ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance_plans_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const maintenancePlanColumns = [
    {
      key: "machineCode",
      label: "Machine",
      render: (plan: MaintenancePlan) => (
        <>
          <div className="text-sm">{plan.machineName}</div>
          <div className="text-xs text-white/60">{plan.machineCode}</div>
        </>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (plan: MaintenancePlan) => (
        <span className="text-sm text-white/80">{plan.title}</span>
      ),
    },
    {
      key: "planType",
      label: "Type",
      align: "center",
      render: (plan: MaintenancePlan) => (
        <span className="text-sm text-white">{plan.planType}</span>
      ),
    },
    {
      key: "nextDue",
      label: "Next Due",
      align: "center",
      render: (plan: MaintenancePlan) => {
        const dueStatus = getDueStatus(plan);
        return (
          <span className={`items-center justify-center ${dueStatus.color}`} style={{ backgroundColor: 'transparent' }}>
            {plan.nextDue}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (plan: MaintenancePlan) => (
        <span
          className={`chip items-center justify-center ${plan.status === "Active"
            ? "status-success"
            : plan.status === "Suspended"
              ? "status-warning"
              : plan.status === "Completed"
                ? "status-indigo"
                : "status-inactive"
            }`}
          style={{ minWidth: 'fit-content' }}
        >
          {plan.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (plan: MaintenancePlan) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleEdit(plan)}
            className="p-1 text-sky-300 hover:text-sky-200"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(plan.id)}
            className="p-1 text-rose-300 hover:text-rose-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ] as const;

  return (
    <div>
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Maintenance Machines Management
              </h1>
              {/* <p className="text-sm text-white/70 mt-1">Master Data Management (MAS012)</p> */}
            </div>
          </div>
        }
        actions={
          <div className="flex gap-2">
            <button className="btn btn-outline">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={exportToCSV}
              className="btn btn-outline"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleAdd}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Add Plan
            </button>
          </div>
        }
        tabs={
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-white/10 p-4 bg-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/70">Active Plans</div>
                    <div className="text-2xl font-bold text-sky-300 mt-1">{stats.activePlans}</div>
                  </div>
                  <Wrench className="w-10 h-10 text-white/30" />
                </div>
              </div>
              <div className="rounded-lg border border-white/10 p-4 bg-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/70">Overdue</div>
                    <div className="text-2xl font-bold text-rose-300 mt-1">{stats.overdue}</div>
                  </div>
                  <AlertCircle className="w-10 h-10 text-rose-300/30" />
                </div>
              </div>
              <div className="rounded-lg border border-white/10 p-4 bg-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/70">Due This Week</div>
                    <div className="text-2xl font-bold text-amber-300 mt-1">{stats.dueThisWeek}</div>
                  </div>
                  <Calendar className="w-10 h-10 text-amber-300/30" />
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
                    placeholder="Search plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-input w-full !pl-10 pr-4"
                  />
                </div>
              </div>

              <select
                value={planForm.planType}
                onChange={(e) => setPlanForm({ ...planForm, planType: e.target.value as PlanType })}
                className="glass-input w-32"
              >
                {["Preventive", "Predictive", "Corrective", "Calibration", "Inspection"].map(v => (
                  <option key={v} value={v} className="select option">{v}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="glass-input w-32"
              >
                {["all", "Active", "Suspended", "Completed"].map(v => (
                  <option key={v} value={v} className="select option">
                    {v === "all" ? "All Status" : v}
                  </option>
                ))}
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="glass-input w-36"
              >
                {["all", "Critical", "High", "Medium", "Low"].map(v => (
                  <option key={v} value={v} className="select option">
                    {v === "all" ? "All Priorities" : v}
                  </option>
                ))}
              </select>
              <div className="flex border border-white/20 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 ${viewMode === 'cards' ? 'bg-sky-500/20 text-sky-300' : 'bg-white/5 text-white/70 hover:text-white'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 border-l border-white/20 ${viewMode === 'table' ? 'bg-sky-500/20 text-sky-300' : 'bg-white/5 text-white/70 hover:text-white'}`}
                >
                  <Table size={18} />
                </button>
              </div>

            </div>
          </>
        }
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Cards View */}
        {loading && viewMode === 'cards' && (
          <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5">
            <Loading />
          </div>
        )}
        {!loading && filteredPlans.length === 0 && viewMode === 'cards' && (
          <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5">
            <EmptyState />
          </div>
        )}

        {viewMode === 'cards' && !loading && filteredPlans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map((plan) => {
              const dueStatus = getDueStatus(plan);

              return (
                <div key={plan.id} className="rounded-lg border border-white/10 bg-white/5 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">{plan.id}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${dueStatus.color}`}>
                            {dueStatus.icon}
                            {dueStatus.status}
                          </span>
                        </div>
                        <p className="text-sm text-white/80 font-medium">{plan.title}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(plan)}
                          className="p-2 text-sky-300 hover:bg-white/10 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="p-2 text-rose-300 hover:bg-white/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Machine</span>
                      <span className="font-medium text-white">{plan.machineCode} - {plan.machineName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(plan.planType)}`}>
                        {plan.planType}
                      </span>
                    </div>

                    <div className="text-sm text-white/80">
                      {plan.description}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                      <div>
                        <div className="text-xs text-white/60">Frequency</div>
                        <div className="text-sm font-medium text-white">
                          {plan.frequency}
                          {plan.frequencyValue && ` (${plan.frequencyValue})`}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60">Duration</div>
                        <div className="text-sm font-medium text-white">{plan.durationMinutes} min</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Last Executed</span>
                        <span className="font-medium text-white">{plan.lastExecuted || 'Never'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Next Due</span>
                        <span className="font-medium text-white">{plan.nextDue}</span>
                      </div>
                      {plan.assignedTo && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Assigned To</span>
                          <span className="font-medium text-white">{plan.assignedTo}</span>
                        </div>
                      )}
                    </div>

                    {plan.checklist && plan.checklist.length > 0 && (
                      <div className="pt-2 border-t border-white/10">
                        <div className="text-xs text-white/60 mb-1">
                          {(() => {
                            const completedCount = plan.checklist.filter(item => item.completed).length;
                            const totalCount = plan.checklist.length;
                            return `Checklist (${completedCount} of ${totalCount} items)`;
                          })()}
                        </div>

                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-white/50" />
                          <div className="flex-1 bg-white/10 rounded-full h-1.5">
                            <div
                              className="bg-sky-500 h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: `${(plan.checklist.filter(item => item.completed).length / plan.checklist.length) * 100
                                  }%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <DataTable
            columns={maintenancePlanColumns}
            data={filteredPlans}
            rowKey={(p) => p.id}
            isLoading={loading}
          />
        )}
      </div>

      {/* Modal*/}
      <Modal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        size="2xl"
        title={`${selectedPlan ? "Edit" : "Add"} Maintenance Plan`}
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
              Save Plan
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Machine *
                </label>
                <select
                  value={planForm.machineCode}
                  onChange={(e) => {
                    const selected = machines.find((m) => m.code === e.target.value);
                    setPlanForm({
                      ...planForm,
                      machineCode: e.target.value,
                      machineName: selected?.name || "",
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                >
                  <option value="" className="select option">Select Machine</option>
                  {machines.map((m) => (
                    <option key={m.code} value={m.code} className="select option">
                      {m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Plan Type *
                </label>
                <select
                  value={planForm.planType}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, planType: e.target.value as PlanType })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                >
                  {[
                    "Preventive",
                    "Predictive",
                    "Corrective",
                    "Calibration",
                    "Inspection",
                  ].map((v) => (
                    <option key={v} value={v} className="select option">
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-white/80 mb-1">
                Plan Title *
              </label>
              <input
                type="text"
                value={planForm.title}
                onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-white/80 mb-1">
                Description
              </label>
              <textarea
                value={planForm.description}
                onChange={(e) =>
                  setPlanForm({ ...planForm, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              />
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Frequency *
                </label>
                <select
                  value={planForm.frequency}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, frequency: e.target.value as Frequency })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                >
                  {[
                    "Daily",
                    "Weekly",
                    "Bi-Weekly",
                    "Monthly",
                    "Quarterly",
                    "Semi-Annual",
                    "Annual",
                    "By Hours",
                    "By Cycles",
                  ].map((v) => (
                    <option key={v} value={v} className="select option">
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {(planForm.frequency === "By Hours" ||
                planForm.frequency === "By Cycles") && (
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Frequency Value
                    </label>
                    <input
                      type="number"
                      value={planForm.frequencyValue || ""}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          frequencyValue: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                    />
                  </div>
                )}

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={planForm.durationMinutes}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      durationMinutes: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Last Executed
                </label>
                <input
                  type="date"
                  value={planForm.lastExecuted || ""}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, lastExecuted: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Next Due Date *
                </label>
                <input
                  type="date"
                  value={planForm.nextDue}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, nextDue: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Priority & Assignment */}
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Priority & Assignment
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Priority
                </label>
                <select
                  value={planForm.priority}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      priority: e.target.value as PriorityType,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                >
                  {["Critical", "High", "Medium", "Low"].map((v) => (
                    <option key={v} value={v} className="select option">
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Status
                </label>
                <select
                  value={planForm.status}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, status: e.target.value as Status })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status} className="select option">
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={planForm.assignedTo || ""}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, assignedTo: e.target.value })
                  }
                  placeholder="Team or person name"
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Work Center
                </label>
                <input
                  type="text"
                  value={planForm.workCenter || ""}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, workCenter: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Maintenance Checklist
              </h3>
              <button
                onClick={handleAddChecklistItem}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
            <div className="border border-white/10 rounded-lg overflow-hidden">
              {(planForm.checklist || []).length > 0 ? (
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-white/70 uppercase">
                        Task
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-white/70 uppercase w-20">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {(planForm.checklist || []).map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.task}
                            onChange={(e) =>
                              handleUpdateChecklistItem(item.id, "task", e.target.value)
                            }
                            placeholder="Enter task description"
                            className="w-full px-2 py-1 rounded border border-white/20 bg-white/5 text-white text-sm placeholder-white/40 focus:ring-1 focus:ring-sky-500/50"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleDeleteChecklistItem(item.id)}
                            className="text-rose-300 hover:text-rose-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-white/60 text-sm">
                  No checklist items. Click &quot;Add Task&quot; to add tasks.
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-3">
              Additional Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Spare Parts / Materials Required
              </label>
              <input
                type="text"
                value={(planForm.spareParts || []).join(", ")}
                onChange={(e) =>
                  setPlanForm({
                    ...planForm,
                    spareParts: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter((s) => s),
                  })
                }
                placeholder="Enter comma-separated list"
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-white/80 mb-1">
                Procedure / Instructions
              </label>
              <textarea
                value={planForm.procedure || ""}
                onChange={(e) =>
                  setPlanForm({ ...planForm, procedure: e.target.value })
                }
                rows={4}
                placeholder="Enter detailed maintenance procedure..."
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Overdue Alert Panel */}
      {!isEditing && stats.overdue > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-300 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-rose-300">Overdue Maintenance Alert</h3>
                <p className="text-sm text-rose-200/90 mt-1">
                  {stats.overdue} maintenance plan(s) are overdue. Please schedule and execute these tasks immediately.
                </p>
                <div className="mt-3">
                  <button className="px-3 py-1 bg-rose-600 text-white text-sm rounded hover:bg-rose-700">
                    View Overdue Plans
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;