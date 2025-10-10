"use client";

import React, { useState, ChangeEvent, FC } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, Download, Upload, AlertTriangle,
  CheckCircle, Save, Wrench, Zap, Clock, Settings, Copy, FileText,
  Package, Table, LayoutGrid
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';
import { ModalMode } from '@/src/types';
import Modal from '@/src/components/shared/Modal';

// --- TYPE DEFINITIONS ---

const CATEGORIES = ['Breakdown', 'Material', 'Setup', 'Quality', 'Utility', 'Scheduled', 'Maintenance', 'Technical', 'Process', 'Other'] as const;
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
const DEPARTMENTS = ['Production', 'Maintenance', 'Quality', 'Supply Chain', 'IT', 'Facilities', 'Safety'] as const;

type FailureCategory = typeof CATEGORIES[number];
type FailureSeverity = typeof SEVERITIES[number];
type Department = typeof DEPARTMENTS[number];

type FailureCode = {
  code: string;
  name: string;
  category: FailureCategory;
  severity: FailureSeverity;
  description: string;
  defaultAction: string;
  avgResolutionTime: number; // in minutes
  requiresApproval: boolean;
  affectsOEE: boolean;
  status: 'Active' | 'Inactive';
  occurrences: number;
  totalDowntime: number; // in minutes
  lastOccurrence: string | null; // YYYY-MM-DD, null for new codes
  responsibleDept: Department;
  associatedMachines: string[];
};

// --- SAMPLE DATA ---

const INITIAL_FAILURE_CODES: FailureCode[] = [
  {
    code: 'FC001',
    name: 'Machine Breakdown',
    category: 'Breakdown',
    severity: 'Critical',
    description: 'Complete machine failure requiring immediate attention',
    defaultAction: 'Call maintenance team immediately',
    avgResolutionTime: 180,
    requiresApproval: true,
    affectsOEE: true,
    status: 'Active',
    occurrences: 45,
    totalDowntime: 8100,
    lastOccurrence: '2025-09-28',
    responsibleDept: 'Maintenance',
    associatedMachines: ['M001', 'M002', 'M004'],
  },
  {
    code: 'FC002',
    name: 'Material Shortage',
    category: 'Material',
    severity: 'High',
    description: 'Required materials not available at workstation',
    defaultAction: 'Check inventory and notify purchasing',
    avgResolutionTime: 45,
    requiresApproval: false,
    affectsOEE: true,
    status: 'Active',
    occurrences: 82,
    totalDowntime: 3690,
    lastOccurrence: '2025-09-30',
    responsibleDept: 'Supply Chain',
    associatedMachines: ['M001', 'M002', 'M003', 'M004', 'M005'],
  },
  {
    code: 'FC003',
    name: 'Tooling Change',
    category: 'Setup',
    severity: 'Medium',
    description: 'Scheduled tool or fixture change required',
    defaultAction: 'Proceed with tooling change as per procedure',
    avgResolutionTime: 30,
    requiresApproval: false,
    affectsOEE: false,
    status: 'Active',
    occurrences: 156,
    totalDowntime: 4680,
    lastOccurrence: '2025-10-01',
    responsibleDept: 'Production',
    associatedMachines: ['M001', 'M002'],
  },
  {
    code: 'FC004',
    name: 'Quality Issue',
    category: 'Quality',
    severity: 'High',
    description: 'Product quality does not meet specifications',
    defaultAction: 'Stop production and notify quality control',
    avgResolutionTime: 60,
    requiresApproval: true,
    affectsOEE: true,
    status: 'Active',
    occurrences: 28,
    totalDowntime: 1680,
    lastOccurrence: '2025-09-26',
    responsibleDept: 'Quality',
    associatedMachines: ['M001', 'M003', 'M005'],
  },
  {
    code: 'FC005',
    name: 'Power Outage',
    category: 'Utility',
    severity: 'Critical',
    description: 'Electrical power supply interrupted',
    defaultAction: 'Switch to backup power if available, notify facilities',
    avgResolutionTime: 90,
    requiresApproval: false,
    affectsOEE: true,
    status: 'Active',
    occurrences: 12,
    totalDowntime: 1080,
    lastOccurrence: '2025-08-15',
    responsibleDept: 'Facilities',
    associatedMachines: ['M001', 'M002', 'M003', 'M004', 'M005'],
  },
  {
    code: 'FC006',
    name: 'Operator Break',
    category: 'Scheduled',
    severity: 'Low',
    description: 'Scheduled operator break time',
    defaultAction: 'Normal scheduled break - no action required',
    avgResolutionTime: 15,
    requiresApproval: false,
    affectsOEE: false,
    status: 'Active',
    occurrences: 420,
    totalDowntime: 6300,
    lastOccurrence: '2025-10-01',
    responsibleDept: 'Production',
    associatedMachines: ['M001', 'M002', 'M003', 'M004', 'M005'],
  },
  {
    code: 'FC007',
    name: 'Hydraulic Failure',
    category: 'Breakdown',
    severity: 'Critical',
    description: 'Hydraulic system malfunction',
    defaultAction: 'Emergency stop and call maintenance',
    avgResolutionTime: 120,
    requiresApproval: true,
    affectsOEE: true,
    status: 'Active',
    occurrences: 8,
    totalDowntime: 960,
    lastOccurrence: '2025-09-20',
    responsibleDept: 'Maintenance',
    associatedMachines: ['M004'],
  },
  {
    code: 'FC008',
    name: 'Sensor Calibration',
    category: 'Maintenance',
    severity: 'Medium',
    description: 'Sensor requires calibration or adjustment',
    defaultAction: 'Calibrate sensor as per maintenance schedule',
    avgResolutionTime: 45,
    requiresApproval: false,
    affectsOEE: false,
    status: 'Active',
    occurrences: 35,
    totalDowntime: 1575,
    lastOccurrence: '2025-09-25',
    responsibleDept: 'Maintenance',
    associatedMachines: ['M001', 'M002', 'M005'],
  },
  {
    code: 'FC009',
    name: 'Software Error',
    category: 'Technical',
    severity: 'High',
    description: 'Machine control software malfunction',
    defaultAction: 'Restart system, if persists call IT support',
    avgResolutionTime: 30,
    requiresApproval: false,
    affectsOEE: true,
    status: 'Active',
    occurrences: 22,
    totalDowntime: 660,
    lastOccurrence: '2025-09-29',
    responsibleDept: 'IT',
    associatedMachines: ['M002', 'M005'],
  },
  {
    code: 'FC010',
    name: 'Temperature Control Issue',
    category: 'Process',
    severity: 'Medium',
    description: 'Temperature outside acceptable range',
    defaultAction: 'Check cooling system and adjust parameters',
    avgResolutionTime: 40,
    requiresApproval: false,
    affectsOEE: true,
    status: 'Active',
    occurrences: 18,
    totalDowntime: 720,
    lastOccurrence: '2025-09-27',
    responsibleDept: 'Production',
    associatedMachines: ['M005'],
  },
];

type FailureCodeFormData = Omit<FailureCode, 'occurrences' | 'totalDowntime' | 'lastOccurrence'>;


const FailureCodesMasterData: FC = () => {
  const [failureCodes, setFailureCodes] = useState<FailureCode[]>(INITIAL_FAILURE_CODES);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedCode, setSelectedCode] = useState<FailureCode | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Form state
  const [formData, setFormData] = useState<FailureCodeFormData>({
    code: '',
    name: '',
    category: 'Breakdown',
    severity: 'Medium',
    description: '',
    defaultAction: '',
    avgResolutionTime: 0,
    requiresApproval: false,
    affectsOEE: true,
    status: 'Active',
    responsibleDept: 'Production',
    associatedMachines: [],
  });

  const filteredCodes = failureCodes.filter((code) => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || code.category === filterCategory;
    const matchesSeverity = filterSeverity === 'all' || code.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || code.status === filterStatus;
    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalCodes: failureCodes.length,
    activeCodes: failureCodes.filter(c => c.status === 'Active').length,
    totalOccurrences: failureCodes.reduce((sum, c) => sum + c.occurrences, 0),
    totalDowntime: failureCodes.reduce((sum, c) => sum + c.totalDowntime, 0),
    avgResolutionTime: failureCodes.length > 0
      ? Math.round(failureCodes.reduce((sum, c) => sum + c.avgResolutionTime, 0) / failureCodes.length)
      : 0,
  };

  const openModal = (mode: ModalMode, item: FailureCode | null = null) => {
    setModalMode(mode);
    setSelectedCode(item);

    if (mode === 'create') {
      setFormData({
        code: `FC${String(failureCodes.length + 1).padStart(3, '0')}`,
        name: '',
        category: 'Breakdown',
        severity: 'Medium',
        description: '',
        defaultAction: '',
        avgResolutionTime: 0,
        requiresApproval: false,
        affectsOEE: true,
        status: 'Active',
        responsibleDept: 'Production',
        associatedMachines: [],
      });
    } else if (item) {
      setFormData({
        code: item.code,
        name: item.name,
        category: item.category,
        severity: item.severity,
        description: item.description,
        defaultAction: item.defaultAction,
        avgResolutionTime: item.avgResolutionTime,
        requiresApproval: item.requiresApproval,
        affectsOEE: item.affectsOEE,
        status: item.status,
        responsibleDept: item.responsibleDept,
        associatedMachines: item.associatedMachines || [],
      });
    }
    setIsModalOpen(true);
  };


  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode(null);
    setSelectedCode(null);
  };

  const handleSave = () => {
    if (modalMode === 'create') {
      const newCode: FailureCode = {
        ...formData,
        occurrences: 0,
        totalDowntime: 0,
        lastOccurrence: null,
      };
      setFailureCodes([...failureCodes, newCode]);
    } else if (modalMode === 'edit' && selectedCode) {
      setFailureCodes(failureCodes.map(c =>
        c.code === selectedCode.code
          ? { ...selectedCode, ...formData }
          : c
      ));
    }
    closeModal();
  };

  const handleDelete = (codeId: string) => {
    if (window.confirm(`Are you sure you want to delete failure code ${codeId}?`)) {
      setFailureCodes(failureCodes.filter(c => c.code !== codeId));
    }
  };

  const handleDuplicate = (code: FailureCode) => {
    const newCode: FailureCode = {
      ...code,
      code: `${code.code}-COPY-${Date.now()}`, // Ensure unique code
      name: `${code.name} (Copy)`,
      occurrences: 0,
      totalDowntime: 0,
      lastOccurrence: null,
    };
    setFailureCodes([...failureCodes, newCode]);
  };

  const getSeverityColor = (severity: FailureSeverity): string => {
    switch (severity) {
      case 'Critical': return 'status-error';
      case 'High': return 'status-warning';
      case 'Medium': return 'status-yellow';
      case 'Low': return 'status-success';
      default: return 'status-inactive';
    }
  };

  const getCategoryIcon = (category: FailureCategory) => {
    switch (category) {
      case 'Breakdown': return <AlertTriangle size={18} className="text-red-600" />;
      case 'Material': return <Package size={18} className="text-blue-600" />;
      case 'Setup': return <Package size={18} className="text-purple-600" />;
      case 'Quality': return <CheckCircle size={18} className="text-green-600" />;
      case 'Utility': return <Zap size={18} className="text-yellow-600" />;
      case 'Scheduled': return <Clock size={18} className="text-gray-600" />;
      case 'Maintenance': return <Wrench size={18} className="text-orange-600" />;
      case 'Technical': return <Settings size={18} className="text-indigo-600" />;
      default: return <FileText size={18} className="text-gray-600" />;
    }
  };

  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div>
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Failure Codes & Downtime Reasons</h1>
              <p className="text-sm text-white/60 mt-1">
                Manage failure codes for downtime tracking and analysis
              </p>
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
              onClick={() => openModal('create')}
              className="btn btn-primary"
            >
              <Plus size={18} />
              New Failure Code
            </button>
          </div>
        }
        tabs={
          <>
            {/* Statistics */}
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <div className="text-xs text-sky-300 font-medium mb-1">Total Codes</div>
                <div className="text-2xl font-bold text-white">{stats.totalCodes}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <div className="text-xs text-emerald-300 font-medium mb-1">Active</div>
                <div className="text-2xl font-bold text-white">{stats.activeCodes}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <div className="text-xs text-violet-300 font-medium mb-1">Total Occurrences</div>
                <div className="text-2xl font-bold text-white">
                  {stats.totalOccurrences.toLocaleString()}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <div className="text-xs text-rose-300 font-medium mb-1">Total Downtime</div>
                <div className="text-2xl font-bold text-white">{formatMinutes(stats.totalDowntime)}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <div className="text-xs text-amber-300 font-medium mb-1">Avg Resolution</div>
                <div className="text-2xl font-bold text-white">
                  {formatMinutes(stats.avgResolutionTime)}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4 mb-1 mx-0.5">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                />
                <input
                  type="text"
                  placeholder="Search failure codes..."
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.target.value)}
                className="glass-input"
              >
                <option value="all" className="select option">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="select option">
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={filterSeverity}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterSeverity(e.target.value)}
                className="glass-input"
              >
                <option value="all" className="select option">All Severity</option>
                {SEVERITIES.map(sev => (
                  <option key={sev} value={sev} className="select option">
                    {sev}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
                className="glass-input"
              >
                <option value="all" className="select option">All Status</option>
                <option value="Active" className="select option">Active</option>
                <option value="Inactive" className="select option">Inactive</option>
              </select>

              <div className="flex border border-white/20 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid'
                    ? 'bg-sky-500/15 text-sky-300'
                    : 'bg-white/5 text-white/70 hover:text-white'
                    }`}
                  title="Grid View"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 border-l border-white/20 ${viewMode === 'table'
                    ? 'bg-sky-500/15 text-sky-300'
                    : 'bg-white/5 text-white/70 hover:text-white'
                    }`}
                  title="Table View"
                >
                  <Table size={18} />
                </button>
              </div>
            </div>
          </>
        }
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCodes.map((code) => (
              <div
                key={code.code}
                className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-shadow duration-200 flex flex-col"
              >
                <div className="p-5 flex-grow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(code.category)}
                      <div>
                        <h3 className="font-semibold text-white">{code.name}</h3>
                        <span className="text-xs text-white/60">{code.code}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openModal('view', code)} className="p-1 hover:bg-white/10 rounded" title="View">
                        <Eye size={14} className="text-white/80" />
                      </button>
                      <button onClick={() => openModal('edit', code)} className="p-1 hover:bg-white/10 rounded" title="Edit">
                        <Edit size={14} className="text-sky-300" />
                      </button>
                      <button onClick={() => handleDuplicate(code)} className="p-1 hover:bg-white/10 rounded" title="Duplicate">
                        <Copy size={14} className="text-emerald-300" />
                      </button>
                      <button onClick={() => handleDelete(code.code)} className="p-1 hover:bg-white/10 rounded" title="Delete">
                        <Trash2 size={14} className="text-rose-300" />
                      </button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`chip ${getSeverityColor(code.severity)}`}>
                      {code.severity}
                    </span>
                    <span className="chip bg-white/10 text-white font-medium border border-white/10">
                      {code.category}
                    </span>
                    {code.requiresApproval && (
                      <span className="chip bg-violet-500/15 text-violet-300 font-medium border border-violet-400/20">
                        Approval Required
                      </span>
                    )}
                    {code.affectsOEE && (
                      <span className="chip bg-amber-500/15 text-amber-300 font-medium border border-amber-400/20">
                        Affects OEE
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-white/70 mb-3 line-clamp-2 h-10">{code.description}</p>
                </div>

                {/* Stats & Footer */}
                <div className="p-5 pt-0">
                  <div className="grid grid-cols-3 gap-2 mb-3 pt-3 border-t border-white/10">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{code.occurrences}</div>
                      <div className="text-xs text-white/60">Occurrences</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-rose-300">{formatMinutes(code.totalDowntime)}</div>
                      <div className="text-xs text-white/60">Downtime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-sky-300">{formatMinutes(code.avgResolutionTime)}</div>
                      <div className="text-xs text-white/60">Avg Time</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/60 mt-2">
                    <span>
                      Dept: <strong className="text-white">{code.responsibleDept}</strong>
                    </span>
                    {code.lastOccurrence && (
                      <span>
                        Last:{' '}
                        <strong className="text-white">
                          {new Date(code.lastOccurrence).toLocaleDateString()}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Table View
          <div className="rounded-lg border border-white/10 bg-white/5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    {[
                      'Code', 'Name', 'Category', 'Severity', 'Occurrences', 'Total Downtime', 'Avg Resolution', 'Department', 'Actions'
                    ].map((h, i) => (
                      <th
                        key={i}
                        className={`px-6 py-3 text-xs font-medium uppercase text-white/60 ${i >= 4 && i <= 6 ? 'text-right' : 'text-left'
                          }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredCodes.map(code => (
                    <tr key={code.code} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{code.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">{code.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/80">{code.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex chip font-medium ${getSeverityColor(code.severity)}`}>
                          {code.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-white font-medium">{code.occurrences}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-rose-300 font-medium">
                          {formatMinutes(code.totalDowntime)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-sky-300 font-medium">
                          {formatMinutes(code.avgResolutionTime)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/80">{code.responsibleDept}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal('view', code)} className="p-1 hover:bg-white/10 rounded" title="View">
                            <Eye size={16} className="text-white/80" />
                          </button>
                          <button onClick={() => openModal('edit', code)} className="p-1 hover:bg-white/10 rounded" title="Edit">
                            <Edit size={16} className="text-sky-300" />
                          </button>
                          <button onClick={() => handleDuplicate(code)} className="p-1 hover:bg-white/10 rounded" title="Duplicate">
                            <Copy size={16} className="text-emerald-300" />
                          </button>
                          <button onClick={() => handleDelete(code.code)} className="p-1 hover:bg-white/10 rounded" title="Delete">
                            <Trash2 size={16} className="text-rose-300" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredCodes.length === 0 && (
          <div className="rounded-lg border border-white/10 bg-white/5 text-center py-12">
            <AlertTriangle size={48} className="mx-auto text-white/40 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No failure codes found</h3>
            <p className="text-white/60 mb-4">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="lg" 
        title={
          <span className="text-xl font-semibold text-white">
            {modalMode === "view" && "Failure Code Details"}
            {modalMode === "edit" && "Edit Failure Code"}
            {modalMode === "create" && "Create New Failure Code"}
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
            {modalMode !== "view" && (
              <button onClick={handleSave} className="btn btn-primary">
                <Save size={18} />
                {modalMode === "create" ? "Create Code" : "Save Changes"}
              </button>
            )}
          </>
        }
      >
        {/* Body */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Failure Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, code: e.target.value })
              }
              disabled={modalMode === "view" || modalMode === "edit"}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:bg-white/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Failure Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={modalMode === "view"}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:bg-white/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, category: e.target.value as FailureCategory })
              }
              disabled={modalMode === "view"}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="select option">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Severity</label>
            <select
              value={formData.severity}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, severity: e.target.value as FailureSeverity })
              }
              disabled={modalMode === "view"}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            >
              {SEVERITIES.map((sev) => (
                <option key={sev} value={sev} className="select option">
                  {sev}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-white/80 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={modalMode === "view"}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:bg-white/10"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-white/80 mb-1">Default Action / SOP</label>
            <textarea
              value={formData.defaultAction}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, defaultAction: e.target.value })
              }
              disabled={modalMode === "view"}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:bg-white/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Avg. Resolution Time (minutes)
            </label>
            <input
              type="number"
              value={formData.avgResolutionTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, avgResolutionTime: Number(e.target.value) })
              }
              disabled={modalMode === "view"}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:bg-white/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Responsible Department</label>
            <select
              value={formData.responsibleDept}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, responsibleDept: e.target.value as Department })
              }
              disabled={modalMode === "view"}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="select option">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-white/80 mb-1">
              Associated Machines (comma-separated)
            </label>
            <input
              type="text"
              value={formData.associatedMachines.join(", ")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({
                  ...formData,
                  associatedMachines: e.target.value
                    .split(",")
                    .map((m) => m.trim())
                    .filter(Boolean),
                })
              }
              disabled={modalMode === "view"}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:bg-white/10"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.requiresApproval}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, requiresApproval: e.target.checked })
                }
                disabled={modalMode === "view"}
                className="h-4 w-4 rounded border-white/20 text-sky-500 focus:ring-sky-500 disabled:bg-white/10"
              />
              <span className="text-sm font-medium text-white/80">Requires Approval</span>
            </label>
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.affectsOEE}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, affectsOEE: e.target.checked })
                }
                disabled={modalMode === "view"}
                className="h-4 w-4 rounded border-white/20 text-sky-500 focus:ring-sky-500 disabled:bg-white/10"
              />
              <span className="text-sm font-medium text-white/80">Affects OEE</span>
            </label>
          </div>
        </div>
      </Modal>

    </div>
  );
};



export default FailureCodesMasterData;