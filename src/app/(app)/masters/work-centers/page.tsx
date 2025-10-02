"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Save, X, Upload, Download, Factory, Settings, Clock, AlertCircle, CheckCircle, LayoutGrid, Table } from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// Types
type WorkCenter = {
  code: string;
  name: string;
  department: string;
  type: 'Production' | 'Assembly' | 'Quality' | 'Packaging' | 'Maintenance';
  capacity: number;
  capacityUnit: 'units/hr' | 'units/day' | 'kg/hr' | 'm/hr';
  status: 'Active' | 'Inactive' | 'Maintenance';
  location: string;
  supervisor?: string;
  shiftPattern: string;
  machineCount: number;
  utilizationTarget: number;
  notes?: string;
  createdAt: string;
};

type Machine = {
  code: string;
  name: string;
  workCenterCode: string;
  status: 'Idle' | 'Running' | 'Down' | 'PM';
};

// Sample Data
const initialWorkCenters: WorkCenter[] = [
  {
    code: 'WC001',
    name: 'CNC Machining Line 1',
    department: 'Manufacturing',
    type: 'Production',
    capacity: 120,
    capacityUnit: 'units/hr',
    status: 'Active',
    location: 'Building A - Floor 1',
    supervisor: 'John Smith',
    shiftPattern: '3-Shift',
    machineCount: 5,
    utilizationTarget: 85,
    notes: 'High precision machining center',
    createdAt: '2025-01-10'
  },
  {
    code: 'WC002',
    name: 'Assembly Line A',
    department: 'Assembly',
    type: 'Assembly',
    capacity: 200,
    capacityUnit: 'units/hr',
    status: 'Active',
    location: 'Building B - Floor 2',
    supervisor: 'Sarah Johnson',
    shiftPattern: '2-Shift',
    machineCount: 8,
    utilizationTarget: 90,
    notes: 'Main assembly line for gear products',
    createdAt: '2025-01-12'
  },
  {
    code: 'WC003',
    name: 'Quality Control Station',
    department: 'Quality',
    type: 'Quality',
    capacity: 80,
    capacityUnit: 'units/hr',
    status: 'Active',
    location: 'Building B - Floor 1',
    supervisor: 'Mike Chen',
    shiftPattern: '2-Shift',
    machineCount: 3,
    utilizationTarget: 75,
    createdAt: '2025-01-15'
  },
  {
    code: 'WC004',
    name: 'Welding Line 1',
    department: 'Manufacturing',
    type: 'Production',
    capacity: 60,
    capacityUnit: 'units/hr',
    status: 'Active',
    location: 'Building A - Floor 2',
    supervisor: 'David Lee',
    shiftPattern: '3-Shift',
    machineCount: 6,
    utilizationTarget: 80,
    notes: 'Robotic welding station',
    createdAt: '2025-01-18'
  },
  {
    code: 'WC005',
    name: 'Packaging Line',
    department: 'Packaging',
    type: 'Packaging',
    capacity: 300,
    capacityUnit: 'units/hr',
    status: 'Maintenance',
    location: 'Building C - Floor 1',
    supervisor: 'Lisa Wong',
    shiftPattern: '2-Shift',
    machineCount: 4,
    utilizationTarget: 85,
    notes: 'Automated packaging system',
    createdAt: '2025-01-20'
  },
  {
    code: 'WC006',
    name: 'Paint & Coating',
    department: 'Finishing',
    type: 'Production',
    capacity: 100,
    capacityUnit: 'units/hr',
    status: 'Active',
    location: 'Building A - Floor 3',
    supervisor: 'Tom Brown',
    shiftPattern: '2-Shift',
    machineCount: 2,
    utilizationTarget: 70,
    createdAt: '2025-01-22'
  }
];

const sampleMachines: Machine[] = [
  { code: 'M001', name: 'CNC Mill 1', workCenterCode: 'WC001', status: 'Running' },
  { code: 'M002', name: 'CNC Mill 2', workCenterCode: 'WC001', status: 'Running' },
  { code: 'M003', name: 'CNC Lathe 1', workCenterCode: 'WC001', status: 'Idle' },
  { code: 'M004', name: 'CNC Lathe 2', workCenterCode: 'WC001', status: 'Running' },
  { code: 'M005', name: 'CNC Drill 1', workCenterCode: 'WC001', status: 'Down' },
  { code: 'M006', name: 'Assembly Station 1', workCenterCode: 'WC002', status: 'Running' },
  { code: 'M007', name: 'Assembly Station 2', workCenterCode: 'WC002', status: 'Running' },
  { code: 'M008', name: 'QC Scanner 1', workCenterCode: 'WC003', status: 'Running' },
];

export default function WorkCenterPage() {
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>(initialWorkCenters);
  const [machines] = useState<Machine[]>(sampleMachines);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedWC, setSelectedWC] = useState<WorkCenter | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form State
  const [wcForm, setWcForm] = useState<Partial<WorkCenter>>({
    code: '',
    name: '',
    department: '',
    type: 'Production',
    capacity: 100,
    capacityUnit: 'units/hr',
    status: 'Active',
    location: '',
    supervisor: '',
    shiftPattern: '2-Shift',
    machineCount: 0,
    utilizationTarget: 85,
    notes: '',
  });

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(workCenters.map(wc => wc.department));
    return Array.from(depts).sort();
  }, [workCenters]);

  // Filter work centers
  const filteredWorkCenters = useMemo(() => {
    return workCenters.filter(wc => {
      const matchesSearch =
        wc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wc.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDept === 'all' || wc.department === filterDept;
      const matchesStatus = filterStatus === 'all' || wc.status === filterStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [workCenters, searchTerm, filterDept, filterStatus]);

  // Get machines for a work center
  const getMachinesForWC = (wcCode: string) => {
    return machines.filter(m => m.workCenterCode === wcCode);
  };

  // Handlers
  const handleAdd = () => {
    setWcForm({
      code: '',
      name: '',
      department: '',
      type: 'Production',
      capacity: 100,
      capacityUnit: 'units/hr',
      status: 'Active',
      location: '',
      supervisor: '',
      shiftPattern: '2-Shift',
      machineCount: 0,
      utilizationTarget: 85,
      notes: '',
    });
    setSelectedWC(null);
    setIsEditing(true);
  };

  const handleEdit = (wc: WorkCenter) => {
    setWcForm(wc);
    setSelectedWC(wc);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!wcForm.code || !wcForm.name || !wcForm.department) {
      alert('Code, name, and department are required');
      return;
    }

    if (selectedWC) {
      setWorkCenters(workCenters.map(wc =>
        wc.code === selectedWC.code ? { ...wcForm, createdAt: selectedWC.createdAt } as WorkCenter : wc
      ));
    } else {
      const newWC: WorkCenter = {
        ...wcForm as WorkCenter,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setWorkCenters([...workCenters, newWC]);
    }
    setIsEditing(false);
    setSelectedWC(null);
  };

  const handleDelete = (code: string) => {
    const wcMachines = getMachinesForWC(code);
    if (wcMachines.length > 0) {
      alert(`Cannot delete work center ${code}. It has ${wcMachines.length} assigned machines.`);
      return;
    }
    if (confirm(`Delete work center ${code}?`)) {
      setWorkCenters(workCenters.filter(wc => wc.code !== code));
    }
  };

  const exportToCSV = () => {
    const csv = 'Code,Name,Department,Type,Capacity,Unit,Status,Location,Supervisor,Shift,Machines,Target %\n' +
      workCenters.map(wc =>
        `${wc.code},${wc.name},${wc.department},${wc.type},${wc.capacity},${wc.capacityUnit},${wc.status},${wc.location},${wc.supervisor || ''},${wc.shiftPattern},${wc.machineCount},${wc.utilizationTarget}`
      ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work_centers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Stats
  const stats = useMemo(() => {
    const active = workCenters.filter(wc => wc.status === 'Active').length;
    const maintenance = workCenters.filter(wc => wc.status === 'Maintenance').length;
    const avgUtilization = workCenters.reduce((sum, wc) => sum + wc.utilizationTarget, 0) / workCenters.length;
    const totalMachines = workCenters.reduce((sum, wc) => sum + wc.machineCount, 0);
    return { active, maintenance, avgUtilization, totalMachines };
  }, [workCenters]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Maintenance': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'Inactive': return <X className="w-4 h-4 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Production': return 'bg-blue-100 text-blue-800';
      case 'Assembly': return 'bg-purple-100 text-purple-800';
      case 'Quality': return 'bg-green-100 text-green-800';
      case 'Packaging': return 'bg-orange-100 text-orange-800';
      case 'Maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                  Work Centers / Production Lines
                </h1>
                <p className="text-sm text-gray-500 mt-1">Master Data Management (MAS005)</p>
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
                  Add Work Center
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Total Work Centers</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{workCenters.length}</div>
                  </div>
                  <Factory className="w-10 h-10 text-gray-300" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Active Lines</div>
                    <div className="text-2xl font-bold text-green-600 mt-1">{stats.active}</div>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-200" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Total Machines</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">{stats.totalMachines}</div>
                  </div>
                  <Settings className="w-10 h-10 text-blue-200" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Avg Target Utilization</div>
                    <div className="text-2xl font-bold text-purple-600 mt-1">{stats.avgUtilization.toFixed(0)}%</div>
                  </div>

                  <Clock className="w-10 h-10 text-purple-200" />
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search work centers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
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
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
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

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkCenters.map((wc) => {
                  const wcMachines = getMachinesForWC(wc.code);
                  const runningMachines = wcMachines.filter(m => m.status === 'Running').length;

                  return (
                    <div key={wc.code} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{wc.code}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(wc.status)}`}>
                                {wc.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 font-medium">{wc.name}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(wc)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(wc.code)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Department</span>
                          <span className="font-medium text-gray-900">{wc.department}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Type</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(wc.type)}`}>
                            {wc.type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Capacity</span>
                          <span className="font-medium text-gray-900">{wc.capacity} {wc.capacityUnit}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Location</span>
                          <span className="font-medium text-gray-900 text-right">{wc.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Supervisor</span>
                          <span className="font-medium text-gray-900">{wc.supervisor || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Shift Pattern</span>
                          <span className="font-medium text-gray-900">{wc.shiftPattern}</span>
                        </div>

                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Machines</span>
                            <span className="text-sm font-medium text-gray-900">
                              {runningMachines}/{wc.machineCount} Running
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${wc.machineCount > 0 ? (runningMachines / wc.machineCount) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Utilization Target</span>
                            <span className="text-xs font-medium text-gray-900">{wc.utilizationTarget}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${wc.utilizationTarget}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machines</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target %</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWorkCenters.map((wc) => (
                      <tr key={wc.code} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{wc.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{wc.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{wc.department}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(wc.type)}`}>
                            {wc.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{wc.capacity} {wc.capacityUnit}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{wc.machineCount}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{wc.utilizationTarget}%</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(wc.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(wc.status)}`}>
                              {wc.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <button
                            onClick={() => handleEdit(wc)}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(wc.code)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredWorkCenters.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No work centers found
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Edit Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedWC ? 'Edit' : 'Add'} Work Center
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
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                      <input
                        type="text"
                        value={wcForm.code}
                        onChange={e => setWcForm({ ...wcForm, code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={wcForm.name}
                        onChange={e => setWcForm({ ...wcForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={wcForm.department}
                        onChange={e => setWcForm({ ...wcForm, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={wcForm.type}
                        onChange={e => setWcForm({ ...wcForm, type: e.target.value as WorkCenter['type'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Production">Production</option>
                        <option value="Assembly">Assembly</option>
                        <option value="Quality">Quality</option>
                        <option value="Packaging">Packaging</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                      <input
                        type="number"
                        value={wcForm.capacity}
                        onChange={e => setWcForm({ ...wcForm, capacity: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select
                        value={wcForm.capacityUnit}
                        onChange={e => setWcForm({ ...wcForm, capacityUnit: e.target.value as WorkCenter['capacityUnit'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="units/hr">units/hr</option>
                        <option value="units/day">units/day</option>
                        <option value="kg/hr">kg/hr</option>
                        <option value="m/hr">m/hr</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={wcForm.status}
                        onChange={e => setWcForm({ ...wcForm, status: e.target.value as WorkCenter['status'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={wcForm.location}
                        onChange={e => setWcForm({ ...wcForm, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
                      <input
                        type="text"
                        value={wcForm.supervisor}
                        onChange={e => setWcForm({ ...wcForm, supervisor: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shift Pattern</label>
                      <input
                        type="text"
                        value={wcForm.shiftPattern}
                        onChange={e => setWcForm({ ...wcForm, shiftPattern: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Machine Count</label>
                      <input
                        type="number"
                        value={wcForm.machineCount}
                        onChange={e => setWcForm({ ...wcForm, machineCount: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Utilization Target %</label>
                      <input
                        type="number"
                        value={wcForm.utilizationTarget}
                        onChange={e => setWcForm({ ...wcForm, utilizationTarget: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={wcForm.notes}
                        onChange={e => setWcForm({ ...wcForm, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
