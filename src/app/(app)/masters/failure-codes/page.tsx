"use client";

import React, { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, Download, Upload, AlertTriangle,
  CheckCircle, X, Save, Wrench, Zap, Clock, Settings,
  TrendingUp, BarChart3, Filter, Copy, FileText,
  Package, Tool,
  Table,
  LayoutGrid
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// Sample failure codes data
const INITIAL_FAILURE_CODES = [
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

const CATEGORIES = ['Breakdown', 'Material', 'Setup', 'Quality', 'Utility', 'Scheduled', 'Maintenance', 'Technical', 'Process', 'Other'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const DEPARTMENTS = ['Production', 'Maintenance', 'Quality', 'Supply Chain', 'IT', 'Facilities', 'Safety'];

const FailureCodesMasterData = () => {
  const [failureCodes, setFailureCodes] = useState(INITIAL_FAILURE_CODES);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'view', 'edit', 'create'
  const [selectedCode, setSelectedCode] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Form state
  const [formData, setFormData] = useState({
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

  const filteredCodes = failureCodes.filter(code => {
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
    avgResolutionTime: Math.round(
      failureCodes.reduce((sum, c) => sum + c.avgResolutionTime, 0) / failureCodes.length
    ),
  };

  const openModal = (mode, code = null) => {
    setModalMode(mode);
    setSelectedCode(code);

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
    } else if (code) {
      setFormData({
        code: code.code,
        name: code.name,
        category: code.category,
        severity: code.severity,
        description: code.description,
        defaultAction: code.defaultAction,
        avgResolutionTime: code.avgResolutionTime,
        requiresApproval: code.requiresApproval,
        affectsOEE: code.affectsOEE,
        status: code.status,
        responsibleDept: code.responsibleDept,
        associatedMachines: code.associatedMachines || [],
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
      const newCode = {
        ...formData,
        occurrences: 0,
        totalDowntime: 0,
        lastOccurrence: null,
      };
      setFailureCodes([...failureCodes, newCode]);
    } else if (modalMode === 'edit') {
      setFailureCodes(failureCodes.map(c =>
        c.code === selectedCode.code
          ? { ...selectedCode, ...formData }
          : c
      ));
    }
    closeModal();
  };

  const handleDelete = (codeId) => {
    if (confirm(`Are you sure you want to delete failure code ${codeId}?`)) {
      setFailureCodes(failureCodes.filter(c => c.code !== codeId));
    }
  };

  const handleDuplicate = (code) => {
    const newCode = {
      ...code,
      code: `${code.code}-COPY`,
      name: `${code.name} (Copy)`,
      occurrences: 0,
      totalDowntime: 0,
      lastOccurrence: null,
    };
    setFailureCodes([...failureCodes, newCode]);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Breakdown': return <AlertTriangle size={18} className="text-red-600" />;
      case 'Material': return <Package size={18} className="text-blue-600" />;
      case 'Setup': return <Package size={18} className="text-purple-600" />;
      case 'Quality': return <CheckCircle size={18} className="text-green-600" />;
      case 'Utility': return <Zap size={18} className="text-yellow-600" />;
      case 'Scheduled': return <Clock size={18} className="text-gray-600" />;
      case 'Maintenance': return <Wrench size={18} className="text-orange-600" />;
      case 'Technical': return <Settings size={18} className="text-indigo-600" />;
      default: return <AlertTriangle size={18} className="text-gray-600" />;
    }
  };

  const formatMinutes = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Failure Codes & Downtime Reasons</h1>
                <p className="text-sm text-gray-500 mt-1">Manage failure codes for downtime tracking and analysis</p>
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
                  onClick={() => openModal('create')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={18} />
                  New Failure Code
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-5 gap-4 mt-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 font-medium mb-1">Total Codes</div>
                <div className="text-2xl font-bold text-blue-900">{stats.totalCodes}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-xs text-green-600 font-medium mb-1">Active</div>
                <div className="text-2xl font-bold text-green-900">{stats.activeCodes}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="text-xs text-purple-600 font-medium mb-1">Total Occurrences</div>
                <div className="text-2xl font-bold text-purple-900">{stats.totalOccurrences}</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="text-xs text-red-600 font-medium mb-1">Total Downtime</div>
                <div className="text-2xl font-bold text-red-900">{formatMinutes(stats.totalDowntime)}</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="text-xs text-orange-600 font-medium mb-1">Avg Resolution</div>
                <div className="text-2xl font-bold text-orange-900">{formatMinutes(stats.avgResolutionTime)}</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search failure codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severity</option>
                {SEVERITIES.map(sev => (
                  <option key={sev} value={sev}>{sev}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
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
        } />

      {/* Content */}
      <div className="p-6">
        {viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCodes.map(code => (
              <div key={code.code} className="bg-white rounded-lg shadow-sm border-2 border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(code.category)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{code.name}</h3>
                        <span className="text-xs text-gray-500">{code.code}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openModal('view', code)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View"
                      >
                        <Eye size={14} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => openModal('edit', code)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Edit size={14} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(code)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Duplicate"
                      >
                        <Copy size={14} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(code.code)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded border ${getSeverityColor(code.severity)}`}>
                      {code.severity}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {code.category}
                    </span>
                    {code.requiresApproval && (
                      <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                        Approval Required
                      </span>
                    )}
                    {code.affectsOEE && (
                      <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
                        Affects OEE
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{code.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-gray-200">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{code.occurrences}</div>
                      <div className="text-xs text-gray-500">Occurrences</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{formatMinutes(code.totalDowntime)}</div>
                      <div className="text-xs text-gray-500">Downtime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{formatMinutes(code.avgResolutionTime)}</div>
                      <div className="text-xs text-gray-500">Avg Time</div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{code.responsibleDept}</span>
                    {code.lastOccurrence && (
                      <span>Last: {new Date(code.lastOccurrence).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Table View
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Occurrences</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Downtime</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Resolution</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCodes.map(code => (
                    <tr key={code.code} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(code.category)}
                          <span className="text-sm font-medium text-gray-900">{code.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{code.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{code.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{code.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex text-xs px-2 py-1 rounded border ${getSeverityColor(code.severity)}`}>
                          {code.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-900 font-medium">{code.occurrences}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-red-600 font-medium">{formatMinutes(code.totalDowntime)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-blue-600 font-medium">{formatMinutes(code.avgResolutionTime)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{code.responsibleDept}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal('view', code)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="View"
                          >
                            <Eye size={16} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => openModal('edit', code)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Edit"
                          >
                            <Edit size={16} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(code)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Duplicate"
                          >
                            <Copy size={16} className="text-green-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(code.code)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-red-600" />
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
            <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No failure codes found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'view' && 'Failure Code Details'}
                {modalMode === 'edit' && 'Edit Failure Code'}
                {modalMode === 'create' && 'Create New Failure Code'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Failure Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      disabled={modalMode === 'view' || modalMode === 'edit'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Failure Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      {SEVERITIES.map(sev => (
                        <option key={sev} value={sev}>{sev}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Responsible Department</label>
                    <select
                      value={formData.responsibleDept}
                      onChange={(e) => setFormData({ ...formData, responsibleDept: e.target.value })}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Avg Resolution Time (minutes)</label>
                    <input
                      type="number"
                      value={formData.avgResolutionTime}
                      onChange={(e) => setFormData({ ...formData, avgResolutionTime: parseInt(e.target.value) || 0 })}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={modalMode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    rows="3"
                    placeholder="Describe the failure condition..."
                  />
                </div>

                {/* Default Action */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Action / Resolution Steps</label>
                  <textarea
                    value={formData.defaultAction}
                    onChange={(e) => setFormData({ ...formData, defaultAction: e.target.value })}
                    disabled={modalMode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    rows="3"
                    placeholder="Describe the recommended action to take..."
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Requires Approval</div>
                      <div className="text-xs text-gray-600">Supervisor approval needed before resolution</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requiresApproval}
                        onChange={(e) => modalMode !== 'view' && setFormData({ ...formData, requiresApproval: e.target.checked })}
                        disabled={modalMode === 'view'}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Affects OEE</div>
                      <div className="text-xs text-gray-600">Include in OEE calculations</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.affectsOEE}
                        onChange={(e) => modalMode !== 'view' && setFormData({ ...formData, affectsOEE: e.target.checked })}
                        disabled={modalMode === 'view'}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                    </label>
                  </div>
                </div>

                {/* Statistics (View mode only) */}
                {modalMode === 'view' && selectedCode && (
                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-sm text-purple-600 font-medium mb-1">Total Occurrences</div>
                        <div className="text-3xl font-bold text-purple-900">{selectedCode.occurrences}</div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-sm text-red-600 font-medium mb-1">Total Downtime</div>
                        <div className="text-3xl font-bold text-red-900">{formatMinutes(selectedCode.totalDowntime)}</div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-600 font-medium mb-1">Last Occurrence</div>
                        <div className="text-lg font-bold text-blue-900">
                          {selectedCode.lastOccurrence
                            ? new Date(selectedCode.lastOccurrence).toLocaleDateString()
                            : 'Never'}
                        </div>
                      </div>
                    </div>

                    {selectedCode.associatedMachines && selectedCode.associatedMachines.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Associated Machines</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedCode.associatedMachines.map(machine => (
                            <span key={machine} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {machine}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            {modalMode !== 'view' && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  {modalMode === 'create' ? 'Create Failure Code' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FailureCodesMasterData;