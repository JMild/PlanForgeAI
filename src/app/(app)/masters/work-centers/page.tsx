"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Save, X, Upload, Download, Factory, Settings, Clock, AlertCircle, CheckCircle, LayoutGrid, Table } from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';
import Modal from '@/src/components/shared/Modal';
import { getMachines, getWorkCenters } from '@/src/services/master';
import { ERROR_MESSAGES } from '@/src/config/messages';
import toast from 'react-hot-toast';
import { DataTable } from '@/src/components/shared/table/Table';
import { Column } from '@/src/components/shared/Table';
import Loading from '@/src/components/Loading';

// Types
type WorkCenter = {
  work_center_code: string;
  work_center_name: string;
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

export default function WorkCenterPage() {
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedWC, setSelectedWC] = useState<WorkCenter | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Form State
  const [wcForm, setWcForm] = useState<Partial<WorkCenter>>({
    work_center_code: '',
    work_center_name: '',
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getWorkCenters();
        const resMachines = await getMachines();
        console.log('res',res)
        setWorkCenters(res);
        setMachines(resMachines);
      } catch (error) {
        console.error('Fetch data failed:', error);
        toast.error(ERROR_MESSAGES.fetchFailed);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(workCenters.map(wc => wc.department));
    return Array.from(depts).sort();
  }, [workCenters]);

  // Filter work centers
  const filteredWorkCenters = useMemo(() => {
    return workCenters.filter(wc => {
      const matchesSearch =
        wc.work_center_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wc.work_center_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      work_center_code: '',
      work_center_name: '',
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
    if (!wcForm.work_center_code || !wcForm.work_center_name || !wcForm.department) {
      alert('Code, name, and department are required');
      return;
    }

    if (selectedWC) {
      setWorkCenters(workCenters.map(wc =>
        wc.work_center_code === selectedWC.work_center_code ? { ...wcForm, createdAt: selectedWC.createdAt } as WorkCenter : wc
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
      setWorkCenters(workCenters.filter(wc => wc.work_center_code !== code));
    }
  };

  const exportToCSV = () => {
    const csv = 'Code,Name,Department,Type,Capacity,Unit,Status,Location,Supervisor,Shift,Machines,Target %\n' +
      workCenters.map(wc =>
        `${wc.work_center_code},${wc.work_center_name},${wc.department},${wc.type},${wc.capacity},${wc.capacityUnit},${wc.status},${wc.location},${wc.supervisor || ''},${wc.shiftPattern},${wc.machineCount},${wc.utilizationTarget}`
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
      case 'Active': return 'status-success';
      case 'Maintenance': return 'status-yellow';
      case 'Inactive': return 'status-inactive';
      default: return 'status-inactive';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Production': return 'status-info';
      case 'Assembly': return 'status-purple';
      case 'Quality': return 'status-success';
      case 'Packaging': return 'status-warning';
      case 'Maintenance': return 'status-inactive';
      default: return 'status-inactive';
    }
  };

  const columns: Column<WorkCenter>[] = [
    { key: "work_center_code", label: "Code" },
    { key: "work_center_name", label: "Name" },
    { key: "department", label: "Department" },
    {
      key: "type",
      label: "Type",
      render: (wc) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(wc.type)}`}>
          {wc.type}
        </span>
      ),
    },
    {
      key: "capacity",
      label: "Capacity",
      render: (wc) => `${wc.capacity} ${wc.capacityUnit}`,
    },
    { key: "machineCount", label: "Machines" },
    {
      key: "utilizationTarget",
      label: "Target %",
      render: (wc) => `${wc.utilizationTarget}%`,
    },
    {
      key: "status",
      label: "Status",
      render: (wc) => (
        <div className="flex items-center gap-1">
          <span className={`px-2 py-1 flex gap-1 rounded-full text-xs font-medium border ${getStatusColor(wc.status)}`}>
            {getStatusIcon(wc.status)}
            {wc.status}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (wc) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleEdit(wc)} className="text-sky-300 hover:text-sky-200">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(wc.work_center_code)} className="text-rose-300 hover:text-rose-200">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="text-white">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Work Centers / Production Lines
              </h1>
              <p className="text-sm text-white/60 mt-1">Master Data Management (MAS005)</p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleAdd}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Add Work Center
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
                    <div className="text-sm text-white/70">Total Work Centers</div>
                    <div className="text-2xl font-bold mt-1">{workCenters.length}</div>
                  </div>
                  <Factory className="w-10 h-10 text-sky-300" />
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/70">Active Lines</div>
                    <div className="text-2xl font-bold text-emerald-300 mt-1">{stats.active}</div>
                  </div>
                  <CheckCircle className="w-10 h-10 text-emerald-300" />
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/70">Total Machines</div>
                    <div className="text-2xl font-bold text-sky-300 mt-1">{stats.totalMachines}</div>
                  </div>
                  <Settings className="w-10 h-10 text-sky-300" />
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/70">Avg Target Utilization</div>
                    <div className="text-2xl font-bold text-purple-300 mt-1">{stats.avgUtilization.toFixed(0)}%</div>
                  </div>
                  <Clock className="w-10 h-10 text-purple-300" />
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 mt-4 mb-1 mx-0.5">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search work centers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                />
              </div>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="glass-input"
              >
                <option value="all" className="select option">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept} className="select option">{dept}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="glass-input"
              >
                <option value="all" className="select option">All Status</option>
                <option value="Active" className="select option">Active</option>
                <option value="Maintenance" className="select option">Maintenance</option>
                <option value="Inactive" className="select option">Inactive</option>
              </select>
              <div className="flex rounded-lg overflow-hidden border border-white/20">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-sky-500/20 text-sky-300' : 'bg-white/5 text-white/70 hover:text-white'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 border-l border-white/20 ${viewMode === 'list' ? 'bg-sky-500/20 text-sky-300' : 'bg-white/5 text-white/70 hover:text-white'}`}
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
        {loading ? (
          <Loading text="Loading work centers..." />
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkCenters.map((wc) => {
                  const wcMachines = getMachinesForWC(wc.work_center_code);
                  const runningMachines = wcMachines.filter(m => m.status === 'Running').length;

                  return (
                    <div key={wc.work_center_code} className="rounded-lg border border-white/10 bg-white/5 overflow-hidden hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1)] transition-shadow">
                      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-sky-500/10 to-transparent">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold">{wc.work_center_code}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(wc.status)}`}>
                                {wc.status}
                              </span>
                            </div>
                            <p className="text-sm text-white/80 font-medium">{wc.work_center_name}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(wc)}
                              className="p-2 text-sky-300 hover:bg-white/10 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(wc.work_center_code)}
                              className="p-2 text-rose-300 hover:bg-white/10 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Department</span>
                          <span className="font-medium">{wc.department}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Type</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(wc.type)}`}>
                            {wc.type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Capacity</span>
                          <span className="font-medium">{wc.capacity} {wc.capacityUnit}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Location</span>
                          <span className="font-medium text-right">{wc.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Supervisor</span>
                          <span className="font-medium">{wc.supervisor || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Shift Pattern</span>
                          <span className="font-medium">{wc.shiftPattern}</span>
                        </div>

                        <div className="pt-3 border-t border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/60">Machines</span>
                            <span className="text-sm font-medium">
                              {runningMachines}/{wc.machineCount} Running
                            </span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all"
                              style={{ width: `${wc.machineCount > 0 ? (runningMachines / wc.machineCount) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-white/60">Utilization Target</span>
                            <span className="text-xs font-medium">{wc.utilizationTarget}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div
                              className="bg-sky-500 h-1.5 rounded-full"
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
              <DataTable
                columns={columns}
                data={filteredWorkCenters}
                rowKey={(wc) => wc.work_center_code}
              // emptyMessage={
              //   <EmptyState
              //     icon={<Package size={48} className="mx-auto text-white/50 mb-4" />}
              //     title="No work centers found"
              //     message="Create your first products to get started"
              //     buttonLabel="Create Product"
              //     onButtonClick={() => openModal("create")}
              //   />
              // }
              />
              // <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
              //   <table className="w-full">
              //     <thead className="bg-white/5 border-b border-white/10">
              //       <tr>
              //         <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Code</th>
              //         <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Name</th>
              //         <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Department</th>
              //         <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Type</th>
              //         <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Capacity</th>
              //         <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Machines</th>
              //         <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Target %</th>
              //         <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Status</th>
              //         <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase">Actions</th>
              //       </tr>
              //     </thead>
              //     <tbody className="divide-y divide-white/10">
              //       {filteredWorkCenters.map((wc) => (
              //         <tr key={wc.work_center_code} className="hover:bg-white/5">
              //           <td className="px-6 py-4 text-sm font-medium">{wc.work_center_code}</td>
              //           <td className="px-6 py-4 text-sm">{wc.work_center_name}</td>
              //           <td className="px-6 py-4 text-sm text-white/80">{wc.department}</td>
              //           <td className="px-6 py-4 text-sm">
              //             <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(wc.type)}`}>
              //               {wc.type}
              //             </span>
              //           </td>
              //           <td className="px-6 py-4 text-sm text-white/80">{wc.capacity} {wc.capacityUnit}</td>
              //           <td className="px-6 py-4 text-sm text-white/80">{wc.machineCount}</td>
              //           <td className="px-6 py-4 text-sm text-white/80">{wc.utilizationTarget}%</td>
              //           <td className="px-6 py-4 text-sm">
              //             <div className="flex items-center gap-1">
              //               {getStatusIcon(wc.status)}
              //               <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(wc.status)}`}>
              //                 {wc.status}
              //               </span>
              //             </div>
              //           </td>
              //           <td className="px-6 py-4 text-sm text-right">
              //             <button
              //               onClick={() => handleEdit(wc)}
              //               className="text-sky-300 hover:text-sky-200 mr-3"
              //             >
              //               <Edit className="w-4 h-4" />
              //             </button>
              //             <button
              //               onClick={() => handleDelete(wc.work_center_code)}
              //               className="text-rose-300 hover:text-rose-200"
              //             >
              //               <Trash2 className="w-4 h-4" />
              //             </button>
              //           </td>
              //         </tr>
              //       ))}
              //     </tbody>
              //   </table>

              // </div>
            )}
          </>
        )}

        <Modal
          open={isEditing}
          onClose={() => setIsEditing(false)}
          size="2xl"
          title={<span className="text-xl font-semibold">{selectedWC ? "Edit" : "Add"} Work Center</span>}
          footer={
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary">
                <Save className="w-4 h-4" /> Save
              </button>
            </>
          }
        >
          <h3 className="text-sm font-medium text-white/80 mb-3">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Code</label>
              <input
                type="text"
                value={wcForm.work_center_code}
                onChange={e => setWcForm({ ...wcForm, work_center_code: e.target.value })}
                // ป้องกันเปลี่ยนรหัสตอนแก้ไข (เอาออกได้ถ้าไม่ต้องการ)
                disabled={!!selectedWC}
                className="glass-input w-full focus:border-transparent disabled:bg-white/10"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Name</label>
              <input
                type="text"
                value={wcForm.work_center_name}
                onChange={e => setWcForm({ ...wcForm, work_center_name: e.target.value })}
                className="glass-input w-full focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Department</label>
              <input
                type="text"
                value={wcForm.department}
                onChange={e => setWcForm({ ...wcForm, department: e.target.value })}
                className="glass-input w-full focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Type</label>
              <select
                value={wcForm.type}
                onChange={e => setWcForm({ ...wcForm, type: e.target.value as WorkCenter["type"] })}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              >
                <option value="Production" className="select option">Production</option>
                <option value="Assembly" className="select option">Assembly</option>
                <option value="Quality" className="select option">Quality</option>
                <option value="Packaging" className="select option">Packaging</option>
                <option value="Maintenance" className="select option">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Capacity</label>
              <input
                type="number"
                value={wcForm.capacity}
                onChange={e => setWcForm({ ...wcForm, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Unit</label>
              <select
                value={wcForm.capacityUnit}
                onChange={e => setWcForm({ ...wcForm, capacityUnit: e.target.value as WorkCenter["capacityUnit"] })}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              >
                <option value="units/hr" className="select option">units/hr</option>
                <option value="units/day" className="select option">units/day</option>
                <option value="kg/hr" className="select option">kg/hr</option>
                <option value="m/hr" className="select option">m/hr</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Status</label>
              <select
                value={wcForm.status}
                onChange={e => setWcForm({ ...wcForm, status: e.target.value as WorkCenter["status"] })}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              >
                <option value="Active" className="select option">Active</option>
                <option value="Maintenance" className="select option">Maintenance</option>
                <option value="Inactive" className="select option">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Location</label>
              <input
                type="text"
                value={wcForm.location}
                onChange={e => setWcForm({ ...wcForm, location: e.target.value })}
                className="glass-input w-full focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Supervisor</label>
              <input
                type="text"
                value={wcForm.supervisor}
                onChange={e => setWcForm({ ...wcForm, supervisor: e.target.value })}
                className="glass-input w-full focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Shift Pattern</label>
              <input
                type="text"
                value={wcForm.shiftPattern}
                onChange={e => setWcForm({ ...wcForm, shiftPattern: e.target.value })}
                className="glass-input w-full focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Machine Count</label>
              <input
                type="number"
                value={wcForm.machineCount}
                onChange={e => setWcForm({ ...wcForm, machineCount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Utilization Target %</label>
              <input
                type="number"
                value={wcForm.utilizationTarget}
                onChange={e => setWcForm({ ...wcForm, utilizationTarget: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-white/70 mb-1">Notes</label>
              <textarea
                value={wcForm.notes}
                onChange={e => setWcForm({ ...wcForm, notes: e.target.value })}
                className="glass-input w-full focus:border-transparent"
              />
            </div>
          </div>
        </Modal>

      </div>
    </div>
  )
}
