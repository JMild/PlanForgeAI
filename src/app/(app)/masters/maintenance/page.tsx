"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Save, X, Upload, Download, Wrench, Calendar, Clock, AlertCircle, CheckCircle, Settings, TrendingUp, Activity, FileText, Table, LayoutGrid } from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

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
  estimatedCost: number;
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

type MaintenanceHistory = {
  id: string;
  planId: string;
  executedDate: string;
  executedBy: string;
  durationMinutes: number;
  status: 'Completed' | 'Partial' | 'Delayed' | 'Skipped';
  notes?: string;
  actualCost?: number;
};

// Sample Data
const initialPlans: MaintenancePlan[] = [
  {
    id: 'PM001',
    machineCode: 'M001',
    machineName: 'CNC Mill 1',
    planType: 'Preventive',
    title: 'Monthly Lubrication & Inspection',
    description: 'Complete lubrication of all moving parts and general inspection',
    frequency: 'Monthly',
    durationMinutes: 120,
    lastExecuted: '2025-09-15',
    nextDue: '2025-10-15',
    status: 'Active',
    priority: 'High',
    assignedTo: 'Maintenance Team A',
    estimatedCost: 250,
    spareParts: ['Lubricant Oil', 'Cleaning Supplies'],
    workCenter: 'WC001',
    checklist: [
      { id: 'c1', task: 'Check oil levels', completed: false },
      { id: 'c2', task: 'Lubricate bearings', completed: false },
      { id: 'c3', task: 'Inspect belts and chains', completed: false },
      { id: 'c4', task: 'Clean coolant system', completed: false },
      { id: 'c5', task: 'Check alignment', completed: false },
    ],
    createdAt: '2025-01-10'
  },
  {
    id: 'PM002',
    machineCode: 'M001',
    machineName: 'CNC Mill 1',
    planType: 'Preventive',
    title: 'Quarterly Deep Maintenance',
    description: 'Comprehensive maintenance including spindle check and calibration',
    frequency: 'Quarterly',
    durationMinutes: 480,
    lastExecuted: '2025-07-01',
    nextDue: '2025-10-01',
    status: 'Active',
    priority: 'Critical',
    assignedTo: 'Senior Technician',
    estimatedCost: 1200,
    spareParts: ['Spindle Bearings', 'Seals Kit', 'Filters'],
    workCenter: 'WC001',
    checklist: [
      { id: 'c6', task: 'Spindle inspection', completed: false },
      { id: 'c7', task: 'Replace filters', completed: false },
      { id: 'c8', task: 'Calibrate axes', completed: false },
      { id: 'c9', task: 'Check electrical connections', completed: false },
    ],
    createdAt: '2025-01-10'
  },
  {
    id: 'PM003',
    machineCode: 'M006',
    machineName: 'Assembly Station 1',
    planType: 'Inspection',
    title: 'Weekly Safety Inspection',
    description: 'Safety systems check and emergency stop testing',
    frequency: 'Weekly',
    durationMinutes: 30,
    lastExecuted: '2025-09-25',
    nextDue: '2025-10-02',
    status: 'Active',
    priority: 'Critical',
    assignedTo: 'Safety Officer',
    estimatedCost: 50,
    workCenter: 'WC002',
    checklist: [
      { id: 'c10', task: 'Test emergency stop', completed: false },
      { id: 'c11', task: 'Check safety guards', completed: false },
      { id: 'c12', task: 'Inspect warning labels', completed: false },
    ],
    createdAt: '2025-01-15'
  },
  {
    id: 'PM004',
    machineCode: 'M002',
    machineName: 'CNC Mill 2',
    planType: 'Predictive',
    title: 'Vibration Analysis',
    description: 'Predictive maintenance based on vibration monitoring',
    frequency: 'By Hours',
    frequencyValue: 500,
    durationMinutes: 60,
    lastExecuted: '2025-08-20',
    nextDue: '2025-10-10',
    status: 'Active',
    priority: 'Medium',
    assignedTo: 'Predictive Maintenance Team',
    estimatedCost: 300,
    workCenter: 'WC001',
    createdAt: '2025-01-12'
  },
  {
    id: 'PM005',
    machineCode: 'M008',
    machineName: 'QC Scanner 1',
    planType: 'Calibration',
    title: 'Semi-Annual Calibration',
    description: 'Precision calibration and measurement verification',
    frequency: 'Semi-Annual',
    durationMinutes: 180,
    lastExecuted: '2025-04-01',
    nextDue: '2025-10-01',
    status: 'Active',
    priority: 'Critical',
    assignedTo: 'Calibration Specialist',
    estimatedCost: 800,
    spareParts: ['Calibration Standards', 'Test Pieces'],
    workCenter: 'WC003',
    checklist: [
      { id: 'c13', task: 'Warm-up scanner', completed: false },
      { id: 'c14', task: 'Run calibration routine', completed: false },
      { id: 'c15', task: 'Verify measurements', completed: false },
      { id: 'c16', task: 'Document results', completed: false },
    ],
    createdAt: '2025-01-20'
  },
  {
    id: 'PM006',
    machineCode: 'M004',
    machineName: 'CNC Lathe 2',
    planType: 'Corrective',
    title: 'Chuck Mechanism Repair',
    description: 'Replace worn chuck jaws and alignment',
    frequency: 'Monthly',
    durationMinutes: 240,
    nextDue: '2025-10-05',
    status: 'Active',
    priority: 'High',
    assignedTo: 'Maintenance Team B',
    estimatedCost: 650,
    spareParts: ['Chuck Jaws Set', 'Alignment Tools'],
    workCenter: 'WC001',
    createdAt: '2025-09-01'
  },
];

const sampleHistory: MaintenanceHistory[] = [
  {
    id: 'MH001',
    planId: 'PM001',
    executedDate: '2025-09-15',
    executedBy: 'John Smith',
    durationMinutes: 110,
    status: 'Completed',
    notes: 'All tasks completed. Bearings in good condition.',
    actualCost: 230
  },
  {
    id: 'MH002',
    planId: 'PM003',
    executedDate: '2025-09-25',
    executedBy: 'Sarah Johnson',
    durationMinutes: 25,
    status: 'Completed',
    notes: 'Safety systems operating normally.',
    actualCost: 45
  },
  {
    id: 'MH003',
    planId: 'PM001',
    executedDate: '2025-08-15',
    executedBy: 'Mike Chen',
    durationMinutes: 130,
    status: 'Completed',
    notes: 'Found minor wear on belt. Replaced as precaution.',
    actualCost: 280
  },
];

const Maintenance = () => {
  const [plans, setPlans] = useState<MaintenancePlan[]>(initialPlans);
  const [history] = useState<MaintenanceHistory[]>(sampleHistory);
  const [searchTerm, setSearchTerm] = useState('');
  // const [filterType, setFilterType] = useState<string>('all');
  const filterType = 'all';
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<MaintenancePlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  // const [showHistory, setShowHistory] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'calendar'>('cards');

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
    estimatedCost: 0,
    checklist: [],
  });

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
    const totalCost = plans.reduce((sum, p) => sum + p.estimatedCost, 0);
    const activePlans = plans.filter(p => p.status === 'Active').length;
    return { overdue, dueThisWeek, totalCost, activePlans };
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
      estimatedCost: 0,
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
      return { status: 'Overdue', color: 'text-red-600 bg-red-100', icon: <AlertCircle className="w-4 h-4" /> };
    } else if (days === 0) {
      return { status: 'Due Today', color: 'text-orange-600 bg-orange-100', icon: <Clock className="w-4 h-4" /> };
    } else if (days <= 7) {
      return { status: `Due in ${days}d`, color: 'text-yellow-600 bg-yellow-100', icon: <Calendar className="w-4 h-4" /> };
    } else {
      return { status: `Due in ${days}d`, color: 'text-green-600 bg-green-100', icon: <CheckCircle className="w-4 h-4" /> };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Preventive': return 'bg-blue-100 text-blue-800';
      case 'Predictive': return 'bg-purple-100 text-purple-800';
      case 'Corrective': return 'bg-orange-100 text-orange-800';
      case 'Calibration': return 'bg-green-100 text-green-800';
      case 'Inspection': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    const csv = 'Plan ID,Machine,Type,Title,Frequency,Duration (min),Next Due,Status,Priority,Cost\n' +
      plans.map(p =>
        `${p.id},${p.machineCode},${p.planType},${p.title},${p.frequency},${p.durationMinutes},${p.nextDue},${p.status},${p.priority},${p.estimatedCost}`
      ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance_plans_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Maintenance Plans Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">Master Data Management (MAS012)</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Plan
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Active Plans</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{stats.activePlans}</div>
                  </div>
                  <Wrench className="w-10 h-10 text-gray-300" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Overdue</div>
                    <div className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</div>
                  </div>
                  <AlertCircle className="w-10 h-10 text-red-200" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Due This Week</div>
                    <div className="text-2xl font-bold text-orange-600 mt-1">{stats.dueThisWeek}</div>
                  </div>
                  <Calendar className="w-10 h-10 text-orange-200" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Estimated Cost</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">${stats.totalCost.toLocaleString()}</div>
                  </div>
                  <TrendingUp className="w-10 h-10 text-blue-200" />
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={planForm.planType}
                onChange={(e) => setPlanForm({ ...planForm, planType: e.target.value as PlanType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Preventive">Preventive</option>
                <option value="Predictive">Predictive</option>
                <option value="Corrective">Corrective</option>
                <option value="Calibration">Calibration</option>
                <option value="Inspection">Inspection</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Completed">Completed</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 ${viewMode === 'cards' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 border-l border-gray-300 ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                >
                  <Table size={18} />
                </button>
              </div>
            </div>
          </div>
        }
      />

      {/* Main Content */}
      <div className="p-6">
        {!isEditing ? (
          <>

            {/* Cards View */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlans.map((plan) => {
                  const dueStatus = getDueStatus(plan);
                  const planHistory = history.filter(h => h.planId === plan.id);

                  return (
                    <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{plan.id}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${dueStatus.color}`}>
                                {dueStatus.icon}
                                {dueStatus.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 font-medium">{plan.title}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(plan)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(plan.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Machine</span>
                          <span className="font-medium text-gray-900">{plan.machineCode} - {plan.machineName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(plan.planType)}`}>
                            {plan.planType}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(plan.priority)}`}>
                            {plan.priority}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600">
                          {plan.description}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                          <div>
                            <div className="text-xs text-gray-500">Frequency</div>
                            <div className="text-sm font-medium text-gray-900">
                              {plan.frequency}
                              {plan.frequencyValue && ` (${plan.frequencyValue})`}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Duration</div>
                            <div className="text-sm font-medium text-gray-900">{plan.durationMinutes} min</div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-200 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Last Executed</span>
                            <span className="font-medium text-gray-900">{plan.lastExecuted || 'Never'}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Next Due</span>
                            <span className="font-medium text-gray-900">{plan.nextDue}</span>
                          </div>
                          {plan.assignedTo && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Assigned To</span>
                              <span className="font-medium text-gray-900">{plan.assignedTo}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Estimated Cost</span>
                            <span className="text-lg font-bold text-blue-600">${plan.estimatedCost}</span>
                          </div>
                        </div>

                        {plan.checklist && plan.checklist.length > 0 && (
                          <div className="pt-2 border-t border-gray-200">
                            <div className="text-xs text-gray-500 mb-1">Checklist ({plan.checklist.length} items)</div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3 text-gray-400" />
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full"
                                  style={{ width: '0%' }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {planHistory.length > 0 && (
                          <div className="pt-2 border-t border-gray-200">
                            <div className="text-xs text-gray-500">
                              <Activity className="w-3 h-3 inline mr-1" />
                              Executed {planHistory.length} time(s)
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Due</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPlans.map((plan) => {
                        const dueStatus = getDueStatus(plan);
                        return (
                          <tr key={plan.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{plan.id}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{plan.machineCode}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{plan.title}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(plan.planType)}`}>
                                {plan.planType}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(plan.priority)}`}>
                                {plan.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{plan.frequency}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${dueStatus.color}`}>
                                {dueStatus.icon}
                                {plan.nextDue}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{plan.status}</td>
                            <td className="px-4 py-3 text-sm text-right">
                              <button
                                onClick={() => handleEdit(plan)}
                                className="text-blue-600 hover:text-blue-800 mr-3"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(plan.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredPlans.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No maintenance plans found
                  </div>
                )}
              </div>
            )}

            {filteredPlans.length === 0 && viewMode === 'cards' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12 text-gray-500">
                No maintenance plans found
              </div>
            )}
          </>
        ) : (
          <>
            {/* Edit Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedPlan ? 'Edit' : 'Add'} Maintenance Plan
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Machine Code *
                      </label>
                      <select
                        value={planForm.machineCode}
                        onChange={(e) => {
                          const selected = machines.find(m => m.code === e.target.value);
                          setPlanForm({
                            ...planForm,
                            machineCode: e.target.value,
                            machineName: selected?.name || '',
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Machine</option>
                        {machines.map(m => (
                          <option key={m.code} value={m.code}>{m.code} - {m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plan Type *
                      </label>
                      <select
                        value={planForm.planType}
                        onChange={(e) => setPlanForm({ ...planForm, planType: e.target.value as PlanType })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Preventive">Preventive</option>
                        <option value="Predictive">Predictive</option>
                        <option value="Corrective">Corrective</option>
                        <option value="Calibration">Calibration</option>
                        <option value="Inspection">Inspection</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan Title *
                    </label>
                    <input
                      type="text"
                      value={planForm.title}
                      onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={planForm.description}
                      onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency *
                      </label>
                      <select
                        value={planForm.frequency}
                        onChange={(e) => setPlanForm({ ...planForm, frequency: e.target.value as Frequency })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Bi-Weekly">Bi-Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Semi-Annual">Semi-Annual</option>
                        <option value="Annual">Annual</option>
                        <option value="By Hours">By Hours</option>
                        <option value="By Cycles">By Cycles</option>
                      </select>
                    </div>
                    {(planForm.frequency === 'By Hours' || planForm.frequency === 'By Cycles') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency Value
                        </label>
                        <input
                          type="number"
                          value={planForm.frequencyValue || ''}
                          onChange={(e) => setPlanForm({ ...planForm, frequencyValue: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={planForm.durationMinutes}
                        onChange={(e) => setPlanForm({ ...planForm, durationMinutes: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Executed
                      </label>
                      <input
                        type="date"
                        value={planForm.lastExecuted || ''}
                        onChange={(e) => setPlanForm({ ...planForm, lastExecuted: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Next Due Date *
                      </label>
                      <input
                        type="date"
                        value={planForm.nextDue}
                        onChange={(e) => setPlanForm({ ...planForm, nextDue: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Priority & Assignment */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Priority & Assignment
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={planForm.priority}
                        onChange={(e) => setPlanForm({ ...planForm, priority: e.target.value as PriorityType })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={planForm.status}
                        onChange={(e) =>
                          setPlanForm({ ...planForm, status: e.target.value as Status })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Cost ($)
                      </label>
                      <input
                        type="number"
                        value={planForm.estimatedCost}
                        onChange={(e) => setPlanForm({ ...planForm, estimatedCost: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned To
                      </label>
                      <input
                        type="text"
                        value={planForm.assignedTo || ''}
                        onChange={(e) => setPlanForm({ ...planForm, assignedTo: e.target.value })}
                        placeholder="Team or person name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Work Center
                      </label>
                      <input
                        type="text"
                        value={planForm.workCenter || ''}
                        onChange={(e) => setPlanForm({ ...planForm, workCenter: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Maintenance Checklist
                    </h3>
                    <button
                      onClick={handleAddChecklistItem}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {(planForm.checklist || []).length > 0 ? (
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-20">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {(planForm.checklist || []).map((item) => (
                            <tr key={item.id}>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={item.task}
                                  onChange={(e) => handleUpdateChecklistItem(item.id, 'task', e.target.value)}
                                  placeholder="Enter task description"
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <button
                                  onClick={() => handleDeleteChecklistItem(item.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No checklist items. Click &quot;Add Task&quot; to add tasks.
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Additional Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spare Parts / Materials Required
                    </label>
                    <input
                      type="text"
                      value={(planForm.spareParts || []).join(', ')}
                      onChange={(e) => setPlanForm({
                        ...planForm,
                        spareParts: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      })}
                      placeholder="Enter comma-separated list"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Procedure / Instructions
                    </label>
                    <textarea
                      value={planForm.procedure || ''}
                      onChange={(e) => setPlanForm({ ...planForm, procedure: e.target.value })}
                      rows={4}
                      placeholder="Enter detailed maintenance procedure..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Plan
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Overdue Alert Panel */}
      {!isEditing && stats.overdue > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900">Overdue Maintenance Alert</h3>
                <p className="text-sm text-red-700 mt-1">
                  {stats.overdue} maintenance plan(s) are overdue. Please schedule and execute these tasks immediately.
                </p>
                <div className="mt-3">
                  <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
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