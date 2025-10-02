// @ts-nocheck

"use client";
import React, { useState, useMemo } from 'react';
import {
  Play, Pause, CheckCircle, AlertTriangle, Clock, Package,
  User, Calendar, Zap, RotateCcw, TrendingUp, TrendingDown,
  Filter, Search, ChevronRight, Settings, FileText, AlertCircle,
  X
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// Sample data
const INITIAL_JOBS = [
  {
    jobId: 'JOB001',
    orderNo: 'ORD001',
    itemNo: 1,
    seq: 1,
    product: 'Widget A',
    process: 'Machining',
    machineCode: 'M001',
    machineName: 'CNC Machine 1',
    operator: 'John Smith',
    plannedStart: '2025-10-01T08:00:00',
    plannedEnd: '2025-10-01T10:30:00',
    actualStart: '2025-10-01T08:15:00',
    actualEnd: null,
    status: 'In Progress',
    setupMin: 30,
    runMin: 120,
    qty: 100,
    qtyCompleted: 45,
    priority: 1,
    shift: 'Day Shift',
  },
  {
    jobId: 'JOB002',
    orderNo: 'ORD002',
    itemNo: 1,
    seq: 1,
    product: 'Widget C',
    process: 'Machining',
    machineCode: 'M002',
    machineName: 'CNC Machine 2',
    operator: 'Sarah Johnson',
    plannedStart: '2025-10-01T08:00:00',
    plannedEnd: '2025-10-01T10:00:00',
    actualStart: '2025-10-01T08:00:00',
    actualEnd: null,
    status: 'In Progress',
    setupMin: 30,
    runMin: 90,
    qty: 75,
    qtyCompleted: 60,
    priority: 2,
    shift: 'Day Shift',
  },
  {
    jobId: 'JOB003',
    orderNo: 'ORD001',
    itemNo: 1,
    seq: 2,
    product: 'Widget A',
    process: 'Drilling',
    machineCode: 'M001',
    machineName: 'CNC Machine 1',
    operator: null,
    plannedStart: '2025-10-01T10:30:00',
    plannedEnd: '2025-10-01T11:50:00',
    actualStart: null,
    actualEnd: null,
    status: 'Ready',
    setupMin: 20,
    runMin: 60,
    qty: 100,
    qtyCompleted: 0,
    priority: 1,
    shift: 'Day Shift',
  },
  {
    jobId: 'JOB004',
    orderNo: 'ORD003',
    itemNo: 1,
    seq: 1,
    product: 'Widget D',
    process: 'Pressing',
    machineCode: 'M004',
    machineName: 'Press Machine 1',
    operator: 'Mike Wilson',
    plannedStart: '2025-10-01T09:00:00',
    plannedEnd: '2025-10-01T12:00:00',
    actualStart: '2025-10-01T09:00:00',
    actualEnd: null,
    status: 'In Progress',
    setupMin: 25,
    runMin: 155,
    qty: 200,
    qtyCompleted: 85,
    priority: 1,
    shift: 'Day Shift',
  },
  {
    jobId: 'JOB005',
    orderNo: 'ORD004',
    itemNo: 1,
    seq: 1,
    product: 'Widget B',
    process: 'Pressing',
    machineCode: 'M004',
    machineName: 'Press Machine 1',
    operator: null,
    plannedStart: '2025-10-01T12:00:00',
    plannedEnd: '2025-10-01T14:00:00',
    actualStart: null,
    actualEnd: null,
    status: 'Ready',
    setupMin: 25,
    runMin: 95,
    qty: 120,
    qtyCompleted: 0,
    priority: 2,
    shift: 'Day Shift',
  },
  {
    jobId: 'JOB006',
    orderNo: 'ORD005',
    itemNo: 1,
    seq: 1,
    product: 'Widget C',
    process: 'Machining',
    machineCode: 'M001',
    machineName: 'CNC Machine 1',
    operator: null,
    plannedStart: '2025-10-01T11:50:00',
    plannedEnd: '2025-10-01T14:00:00',
    actualStart: null,
    actualEnd: null,
    status: 'Pending',
    setupMin: 30,
    runMin: 100,
    qty: 80,
    qtyCompleted: 0,
    priority: 3,
    shift: 'Day Shift',
  },
  {
    jobId: 'JOB007',
    orderNo: 'ORD001',
    itemNo: 2,
    seq: 1,
    product: 'Widget B',
    process: 'Pressing',
    machineCode: 'M004',
    machineName: 'Press Machine 1',
    operator: null,
    plannedStart: '2025-10-01T14:00:00',
    plannedEnd: '2025-10-01T16:00:00',
    actualStart: null,
    actualEnd: null,
    status: 'Scheduled',
    setupMin: 25,
    runMin: 95,
    qty: 50,
    qtyCompleted: 0,
    priority: 1,
    shift: 'Day Shift',
  },
];

const OPERATORS = [
  { id: 'OP001', name: 'John Smith' },
  { id: 'OP002', name: 'Sarah Johnson' },
  { id: 'OP003', name: 'Mike Wilson' },
  { id: 'OP004', name: 'Emily Davis' },
  { id: 'OP005', name: 'David Brown' },
];

const ProductionExecution = () => {
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'start' | 'complete' | 'pause' | 'report' | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterShift, setFilterShift] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime] = useState(new Date('2025-10-01T10:15:00'));

  // Form state
  const [formData, setFormData] = useState({
    operator: '',
    qtyCompleted: 0,
    notes: '',
    downReason: '',
    downDuration: 0,
  });

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'In Progress': return 'bg-green-100 text-green-700 border-green-300';
      case 'Ready': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Completed': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Paused': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Late': return 'bg-red-100 text-red-700 border-red-300';
      case 'Pending': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-700';
      case 2: return 'bg-yellow-100 text-yellow-700';
      case 3: return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateProgress = (job) => {
    if (job.qty === 0) return 0;
    return Math.round((job.qtyCompleted / job.qty) * 100);
  };

  const calculateTimeVariance = (job) => {
    if (!job.actualStart) return null;
    const planned = new Date(job.plannedStart);
    const actual = new Date(job.actualStart);
    return Math.round((actual - planned) / 60000); // minutes
  };

  const isLate = (job) => {
    if (job.status === 'Completed') return false;
    const planned = new Date(job.plannedEnd);
    return currentTime > planned;
  };

  // Statistics
  const stats = useMemo(() => {
    const inProgress = jobs.filter(j => j.status === 'In Progress').length;
    const completed = jobs.filter(j => j.status === 'Completed').length;
    const ready = jobs.filter(j => j.status === 'Ready').length;
    const late = jobs.filter(j => isLate(j)).length;

    const totalPlanned = jobs.length;
    const completionRate = totalPlanned > 0 ? Math.round((completed / totalPlanned) * 100) : 0;

    const onTimeJobs = jobs.filter(j => {
      if (j.status !== 'Completed') return false;
      const variance = calculateTimeVariance(j);
      return variance !== null && variance <= 0;
    }).length;

    const onTimeRate = completed > 0 ? Math.round((onTimeJobs / completed) * 100) : 100;

    return {
      inProgress,
      completed,
      ready,
      late,
      completionRate,
      onTimeRate,
    };
  }, [jobs, currentTime]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.machineCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesShift = filterShift === 'all' || job.shift === filterShift;
    return matchesSearch && matchesStatus && matchesShift;
  });

  // Group jobs by status
  const groupedJobs = {
    'In Progress': filteredJobs.filter(j => j.status === 'In Progress'),
    'Ready': filteredJobs.filter(j => j.status === 'Ready'),
    'Scheduled': filteredJobs.filter(j => j.status === 'Scheduled'),
    'Pending': filteredJobs.filter(j => j.status === 'Pending'),
  };

  const openModal = (job, mode) => {
    setSelectedJob(job);
    setModalMode(mode);
    setFormData({
      operator: job.operator || '',
      qtyCompleted: job.qtyCompleted,
      notes: '',
      downReason: '',
      downDuration: 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    setModalMode(null);
  };

  const handleStartJob = () => {
    if (!formData.operator) {
      alert('Please select an operator');
      return;
    }

    setJobs(jobs.map(j =>
      j.jobId === selectedJob.jobId
        ? {
          ...j,
          status: 'In Progress',
          actualStart: currentTime.toISOString(),
          operator: formData.operator
        }
        : j
    ));
    closeModal();
  };

  const handleCompleteJob = () => {
    setJobs(jobs.map(j =>
      j.jobId === selectedJob.jobId
        ? {
          ...j,
          status: 'Completed',
          actualEnd: currentTime.toISOString(),
          qtyCompleted: j.qty
        }
        : j
    ));
    closeModal();
  };

  const handlePauseJob = () => {
    setJobs(jobs.map(j =>
      j.jobId === selectedJob.jobId
        ? { ...j, status: 'Paused' }
        : j
    ));
    closeModal();
  };

  const handleResumeJob = (job) => {
    setJobs(jobs.map(j =>
      j.jobId === job.jobId
        ? { ...j, status: 'In Progress' }
        : j
    ));
  };

  const handleUpdateProgress = () => {
    setJobs(jobs.map(j =>
      j.jobId === selectedJob.jobId
        ? { ...j, qtyCompleted: formData.qtyCompleted }
        : j
    ));
    closeModal();
  };

  const getTimeRemaining = (job) => {
    if (!job.actualStart || job.status === 'Completed') return null;

    const elapsed = (currentTime - new Date(job.actualStart)) / 60000; // minutes
    const totalPlanned = job.setupMin + job.runMin;
    const remaining = totalPlanned - elapsed;

    return Math.round(remaining);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Production Execution</h1>
                <p className="text-sm text-gray-500 mt-1">Today's dispatch queue & job tracking</p>
                <p className="text-xs text-gray-400 mt-1">Current Time: {currentTime.toLocaleTimeString()}</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Zap size={18} />
                  Replan
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <FileText size={18} />
                  Shift Report
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-6 gap-4">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-green-600 font-medium">In Progress</span>
                  <Play size={16} className="text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-900">{stats.inProgress}</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-blue-600 font-medium">Ready</span>
                  <CheckCircle size={16} className="text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-900">{stats.ready}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 font-medium">Completed</span>
                  <CheckCircle size={16} className="text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-red-600 font-medium">Late</span>
                  <AlertTriangle size={16} className="text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-900">{stats.late}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-purple-600 font-medium">Completion</span>
                  <TrendingUp size={16} className="text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-900">{stats.completionRate}%</div>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-indigo-600 font-medium">On-Time</span>
                  <Clock size={16} className="text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-indigo-900">{stats.onTimeRate}%</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="In Progress">In Progress</option>
                <option value="Ready">Ready</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
              <select
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Shifts</option>
                <option value="Day Shift">Day Shift</option>
                <option value="Night Shift">Night Shift</option>
              </select>
            </div>
          </div>
        } 
      />

      {/* Job Queue */}
      <div className="p-6">
        <div className="space-y-6">
          {Object.entries(groupedJobs).map(([status, statusJobs]) => (
            statusJobs.length > 0 && (
              <div key={status}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  {status}
                  <span className="text-sm font-normal text-gray-500">({statusJobs.length})</span>
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {statusJobs.map(job => {
                    const progress = calculateProgress(job);
                    const timeVariance = calculateTimeVariance(job);
                    const timeRemaining = getTimeRemaining(job);
                    const late = isLate(job);

                    return (
                      <div
                        key={job.jobId}
                        className={`bg-white rounded-lg shadow-sm border-2 ${late ? 'border-red-300' : 'border-gray-200'} hover:shadow-md transition-shadow`}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-lg font-semibold text-gray-900">{job.jobId}</span>
                                <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(job.status)}`}>
                                  {job.status}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(job.priority)}`}>
                                  P{job.priority}
                                </span>
                                {late && (
                                  <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Late
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  <div className="text-gray-500 text-xs mb-1">Order / Item</div>
                                  <div className="font-medium text-gray-900">{job.orderNo}-{job.itemNo}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500 text-xs mb-1">Product / Process</div>
                                  <div className="font-medium text-gray-900">{job.product}</div>
                                  <div className="text-xs text-blue-600">Step {job.seq}: {job.process}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500 text-xs mb-1">Machine</div>
                                  <div className="font-medium text-gray-900">{job.machineCode}</div>
                                  <div className="text-xs text-gray-600">{job.machineName}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500 text-xs mb-1">Operator</div>
                                  <div className="font-medium text-gray-900">
                                    {job.operator || <span className="text-gray-400">Not assigned</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-4 gap-4 text-sm mt-3 pt-3 border-t border-gray-100">
                                <div>
                                  <div className="text-gray-500 text-xs mb-1">Quantity</div>
                                  <div className="font-medium text-gray-900">{job.qtyCompleted} / {job.qty}</div>
                                  <div className="text-xs text-gray-600">{progress}% complete</div>
                                </div>
                                <div>
                                  <div className="text-gray-500 text-xs mb-1">Planned Time</div>
                                  <div className="text-xs text-gray-700">
                                    {new Date(job.plannedStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                    {new Date(job.plannedEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  <div className="text-xs text-gray-600">{job.setupMin + job.runMin} min total</div>
                                </div>
                                {job.actualStart && (
                                  <div>
                                    <div className="text-gray-500 text-xs mb-1">Actual Start</div>
                                    <div className="text-xs text-gray-700">
                                      {new Date(job.actualStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    {timeVariance !== null && (
                                      <div className={`text-xs ${timeVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {timeVariance > 0 ? '+' : ''}{timeVariance} min vs plan
                                      </div>
                                    )}
                                  </div>
                                )}
                                {timeRemaining !== null && job.status === 'In Progress' && (
                                  <div>
                                    <div className="text-gray-500 text-xs mb-1">Time Remaining</div>
                                    <div className={`font-medium ${timeRemaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                      {Math.abs(timeRemaining)} min
                                    </div>
                                    {timeRemaining < 0 && (
                                      <div className="text-xs text-red-600">Overdue</div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Progress Bar */}
                              {job.status === 'In Progress' && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span>{progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${late ? 'bg-red-500' : 'bg-green-500'}`}
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 ml-4">
                              {job.status === 'Ready' && (
                                <button
                                  onClick={() => openModal(job, 'start')}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <Play size={16} />
                                  Start
                                </button>
                              )}

                              {job.status === 'In Progress' && (
                                <>
                                  <button
                                    onClick={() => openModal(job, 'complete')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
                                  >
                                    <CheckCircle size={16} />
                                    Complete
                                  </button>
                                  <button
                                    onClick={() => openModal(job, 'pause')}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 whitespace-nowrap"
                                  >
                                    <Pause size={16} />
                                    Pause
                                  </button>
                                  <button
                                    onClick={() => openModal(job, 'report')}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
                                  >
                                    <Settings size={16} />
                                    Update
                                  </button>
                                </>
                              )}

                              {job.status === 'Paused' && (
                                <button
                                  onClick={() => handleResumeJob(job)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <Play size={16} />
                                  Resume
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Action Modal */}
      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'start' && 'Start Job'}
                {modalMode === 'complete' && 'Complete Job'}
                {modalMode === 'pause' && 'Pause Job'}
                {modalMode === 'report' && 'Update Progress'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Job: <span className="font-semibold text-gray-900">{selectedJob.jobId}</span></div>
                <div className="text-sm text-gray-600">Order: <span className="font-semibold text-gray-900">{selectedJob.orderNo}-{selectedJob.itemNo}</span></div>
                <div className="text-sm text-gray-600">Product: <span className="font-semibold text-gray-900">{selectedJob.product}</span></div>
                <div className="text-sm text-gray-600">Process: <span className="font-semibold text-gray-900">{selectedJob.process}</span></div>
                <div className="text-sm text-gray-600">Machine: <span className="font-semibold text-gray-900">{selectedJob.machineCode}</span></div>
              </div>

              {modalMode === 'start' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Select Operator *</label>
                    <select
                      value={formData.operator}
                      onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Choose operator...</option>
                      {OPERATORS.map(op => (
                        <option key={op.id} value={op.name}>{op.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                    <div className="font-medium text-blue-900 mb-1">Job will start now</div>
                    <div className="text-blue-700">Planned duration: {selectedJob.setupMin + selectedJob.runMin} minutes</div>
                  </div>
                </div>
              )}

              {modalMode === 'complete' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Confirm Completion</label>
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="text-sm text-green-900 mb-2">
                        <div>Quantity: <span className="font-semibold">{selectedJob.qty} units</span></div>
                        <div>Operator: <span className="font-semibold">{selectedJob.operator}</span></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Notes (optional)</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Any notes about this job..."
                    />
                  </div>
                </div>
              )}

              {modalMode === 'pause' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Reason for Pause *</label>
                    <select
                      value={formData.downReason}
                      onChange={(e) => setFormData({ ...formData, downReason: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select reason...</option>
                      <option value="Material Shortage">Material Shortage</option>
                      <option value="Machine Issue">Machine Issue</option>
                      <option value="Quality Issue">Quality Issue</option>
                      <option value="Break Time">Break Time</option>
                      <option value="Tooling Change">Tooling Change</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Additional details..."
                    />
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    <AlertTriangle size={16} className="inline mr-2" />
                    Job will be paused. Remember to resume when ready.
                  </div>
                </div>
              )}

              {modalMode === 'report' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Quantity Completed
                    </label>
                    <input
                      type="number"
                      value={formData.qtyCompleted}
                      onChange={(e) => setFormData({ ...formData, qtyCompleted: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max={selectedJob.qty}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Total required: {selectedJob.qty} units
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Progress</div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min((formData.qtyCompleted / selectedJob.qty) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 text-right mt-1">
                      {Math.round((formData.qtyCompleted / selectedJob.qty) * 100)}%
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Any issues or observations..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (modalMode === 'start') handleStartJob();
                  else if (modalMode === 'complete') handleCompleteJob();
                  else if (modalMode === 'pause') handlePauseJob();
                  else if (modalMode === 'report') handleUpdateProgress();
                }}
                className={`px-4 py-2 rounded-lg text-white ${modalMode === 'start' ? 'bg-green-600 hover:bg-green-700' :
                  modalMode === 'complete' ? 'bg-blue-600 hover:bg-blue-700' :
                    modalMode === 'pause' ? 'bg-yellow-600 hover:bg-yellow-700' :
                      'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {modalMode === 'start' && 'Start Job'}
                {modalMode === 'complete' && 'Complete Job'}
                {modalMode === 'pause' && 'Pause Job'}
                {modalMode === 'report' && 'Update Progress'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionExecution;