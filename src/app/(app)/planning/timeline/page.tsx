"use client";
import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Clock, Wrench, Layers, Download, Settings
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// 1. เพิ่ม type สำหรับ machine
type Machine = {
  code: string;
  name: string;
  workCenter: string;
  status: 'Running' | 'Idle' | 'PM' | 'Down';
};

type MachineStatus = 'Running' | 'Idle' | 'PM' | 'Down';

// 2. เพิ่ม type สำหรับ job
type ScheduledJob = {
  jobId: string;
  orderNo: string;
  product: string;
  process: string;
  machineCode: string;
  startTime: string;
  endTime: string;
  setupMin: number;
  runMin: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Late';
};

// 3. เพิ่ม type สำหรับ maintenance
type Maintenance = {
  id: string;
  machineCode: string;
  type: string;
  startTime: string;
  endTime: string;
  notes: string;
};

// 4. เพิ่ม union type สำหรับ selectedJob
type SelectedJob = (ScheduledJob & { type: 'job' }) | (Maintenance & { type: 'maintenance' });

// Sample machine data
const MACHINES: Machine[] = [
  { code: 'M001', name: 'CNC Mill 1', workCenter: 'Machining', status: 'Running' },
  { code: 'M002', name: 'CNC Mill 2', workCenter: 'Machining', status: 'Idle' },
  { code: 'M003', name: 'Assembly Line A', workCenter: 'Assembly', status: 'Running' },
  { code: 'M004', name: 'Press 1', workCenter: 'Pressing', status: 'Running' },
  { code: 'M005', name: 'Paint Booth', workCenter: 'Painting', status: 'PM' },
];

// Sample scheduled jobs
const SCHEDULED_JOBS: ScheduledJob[] = [
  {
    jobId: 'J001',
    orderNo: 'ORD001',
    product: 'Widget A',
    process: 'Machining',
    machineCode: 'M001',
    startTime: '2025-10-01T08:00:00',
    endTime: '2025-10-01T11:30:00',
    setupMin: 30,
    runMin: 180,
    status: 'In Progress'
  },
  {
    jobId: 'J002',
    orderNo: 'ORD001',
    product: 'Widget A',
    process: 'Drilling',
    machineCode: 'M001',
    startTime: '2025-10-01T11:30:00',
    endTime: '2025-10-01T14:00:00',
    setupMin: 20,
    runMin: 130,
    status: 'Planned'
  },
  {
    jobId: 'J003',
    orderNo: 'ORD002',
    product: 'Widget C',
    process: 'Machining',
    machineCode: 'M002',
    startTime: '2025-10-01T09:00:00',
    endTime: '2025-10-01T12:45:00',
    setupMin: 30,
    runMin: 195,
    status: 'Planned'
  },
  {
    jobId: 'J004',
    orderNo: 'ORD003',
    product: 'Widget D',
    process: 'Pressing',
    machineCode: 'M004',
    startTime: '2025-10-01T08:00:00',
    endTime: '2025-10-01T10:30:00',
    setupMin: 25,
    runMin: 125,
    status: 'Completed'
  },
  {
    jobId: 'J005',
    orderNo: 'ORD003',
    product: 'Widget D',
    process: 'Drilling',
    machineCode: 'M002',
    startTime: '2025-10-01T13:00:00',
    endTime: '2025-10-01T16:00:00',
    setupMin: 20,
    runMin: 160,
    status: 'Planned'
  },
  {
    jobId: 'J006',
    orderNo: 'ORD001',
    product: 'Widget B',
    process: 'Pressing',
    machineCode: 'M004',
    startTime: '2025-10-01T11:00:00',
    endTime: '2025-10-01T14:00:00',
    setupMin: 25,
    runMin: 155,
    status: 'Planned'
  },
  {
    jobId: 'J007',
    orderNo: 'ORD001',
    product: 'Widget A',
    process: 'Assembly',
    machineCode: 'M003',
    startTime: '2025-10-01T08:00:00',
    endTime: '2025-10-01T12:00:00',
    setupMin: 15,
    runMin: 225,
    status: 'In Progress'
  },
  {
    jobId: 'J008',
    orderNo: 'ORD002',
    product: 'Widget C',
    process: 'Packaging',
    machineCode: 'M003',
    startTime: '2025-10-01T13:00:00',
    endTime: '2025-10-01T15:30:00',
    setupMin: 10,
    runMin: 140,
    status: 'Planned'
  },
  // Next day jobs
  {
    jobId: 'J009',
    orderNo: 'ORD003',
    product: 'Widget D',
    process: 'Painting',
    machineCode: 'M005',
    startTime: '2025-10-02T08:00:00',
    endTime: '2025-10-02T12:00:00',
    setupMin: 30,
    runMin: 210,
    status: 'Planned'
  },
];

// Maintenance/PM schedule
const MAINTENANCE_SCHEDULE: Maintenance[] = [
  {
    id: 'PM001',
    machineCode: 'M005',
    type: 'Preventive Maintenance',
    startTime: '2025-10-01T08:00:00',
    endTime: '2025-10-01T17:00:00',
    notes: 'Quarterly maintenance - paint system overhaul'
  },
  {
    id: 'PM002',
    machineCode: 'M002',
    type: 'Calibration',
    startTime: '2025-10-02T13:00:00',
    endTime: '2025-10-02T14:00:00',
    notes: 'Monthly calibration check'
  },
];

// Shift schedule
// const SHIFTS = [
//   { name: 'Day Shift', start: '08:00', end: '17:00', color: 'bg-blue-50' },
//   { name: 'Night Shift', start: '17:00', end: '02:00', color: 'bg-indigo-50' },
// ];

const BREAK_TIMES = [
  { start: '10:00', end: '10:15', name: 'Morning Break' },
  { start: '12:00', end: '13:00', name: 'Lunch' },
  { start: '15:00', end: '15:15', name: 'Afternoon Break' },
];

const MachineTimeline = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2025-10-01'));
  const [filterWorkCenter, setFilterWorkCenter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<SelectedJob | null>(null);
  const [showPM, setShowPM] = useState<boolean>(true);
  const [showBreaks, setShowBreaks] = useState<boolean>(true);

  // const [zoomLevel, setZoomLevel] = useState('day'); // 'day', 'week'

  // Filter machines
  const filteredMachines = useMemo(() => {
    if (filterWorkCenter === 'all') return MACHINES;
    return MACHINES.filter(m => m.workCenter === filterWorkCenter);
  }, [filterWorkCenter]);

  // Get unique work centers
  const workCenters = useMemo(() => {
    return [...new Set(MACHINES.map(m => m.workCenter))];
  }, []);

  // Navigate dates
  const changeDate = useCallback((days: number) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  }, []);

  // Time helpers
  const getTimePosition = (timeStr: string | number | Date) => {
    const time = new Date(timeStr);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    return ((hours * 60 + minutes) / (24 * 60)) * 100;
  };

  const getJobWidth = (startStr: string | number | Date, endStr: string | number | Date): number => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const startMs = start.getTime();
    const endMs = end.getTime();
    const durationMin = (endMs - startMs) / (1000 * 60);
    return (durationMin / (24 * 60)) * 100;
  };


  const isJobOnDate = (jobDate: string | number | Date, selectedDate: Date) => {
    const job = new Date(jobDate);
    return job.toDateString() === selectedDate.toDateString();
  };

  const formatTime = (dateStr: string | number | Date) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'Completed': 'bg-green-500',
      'In Progress': 'bg-blue-500',
      'Planned': 'bg-gray-400',
      'Late': 'bg-red-500',
    };
    return colors[status] || 'bg-gray-400';
  };

  const getMachineStatusBadge = (status: MachineStatus) => {
    const styles: Record<MachineStatus, string> = {
      Running: 'bg-green-100 text-green-700',
      Idle: 'bg-gray-100 text-gray-700',
      PM: 'bg-yellow-100 text-yellow-700',
      Down: 'bg-red-100 text-red-700',
    };

    return styles[status];
  };

  // Generate hour markers
  const hourMarkers = useMemo(() => {
    const markers = [];
    for (let i = 0; i < 24; i++) {
      markers.push({
        hour: i,
        label: `${String(i).padStart(2, '0')}:00`,
        position: (i / 24) * 100
      });
    }
    return markers;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader title={
        <>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Machine Timeline</h1>
                <p className="text-sm text-gray-500 mt-1">Production schedule and machine availability</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Download size={18} />
                  Export Schedule
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Settings size={18} />
                  Settings
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Date Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeDate(-1)}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="px-4 py-2 border border-gray-300 rounded-lg bg-white min-w-[180px] text-center">
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => changeDate(1)}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Today
                  </button>
                </div>

                {/* Work Center Filter */}
                <select
                  value={filterWorkCenter}
                  onChange={(e) => setFilterWorkCenter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Work Centers</option>
                  {workCenters.map(wc => (
                    <option key={wc} value={wc}>{wc}</option>
                  ))}
                </select>
              </div>

              {/* View Options */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPM}
                    onChange={(e) => setShowPM(e.target.checked)}
                    className="rounded"
                  />
                  <Wrench size={16} />
                  Show Maintenance
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showBreaks}
                    onChange={(e) => setShowBreaks(e.target.checked)}
                    className="rounded"
                  />
                  <Clock size={16} />
                  Show Breaks
                </label>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="px-6 py-3 bg-white border-t">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                <span>Planned</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Late</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded border-2 border-yellow-600"></div>
                <span>Maintenance</span>
              </div>
            </div>
          </div>
        </>
      } />



      {/* Timeline Grid */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Time Header */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-48 flex-shrink-0 px-4 py-3 border-r border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Machine</span>
            </div>
            <div className="flex-1 relative" style={{ minWidth: '800px' }}>
              {/* Hour markers */}
              <div className="flex h-full">
                {hourMarkers.map(marker => (
                  <div
                    key={marker.hour}
                    className="flex-1 px-2 py-3 border-r border-gray-200 text-xs text-gray-500 text-center"
                  >
                    {marker.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Machine Rows */}
          <div className="divide-y divide-gray-200">
            {filteredMachines.map(machine => {
              const machineJobs = SCHEDULED_JOBS.filter(
                job => job.machineCode === machine.code && isJobOnDate(job.startTime, selectedDate)
              );
              const machinePM = MAINTENANCE_SCHEDULE.filter(
                pm => pm.machineCode === machine.code && isJobOnDate(pm.startTime, selectedDate)
              );

              return (
                <div key={machine.code} className="flex hover:bg-gray-50">
                  {/* Machine Info */}
                  <div className="w-48 flex-shrink-0 px-4 py-4 border-r border-gray-200">
                    <div className="text-sm font-semibold text-gray-900">{machine.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{machine.code}</div>
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${getMachineStatusBadge(machine.status)}`}>
                        {machine.status}
                      </span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex-1 relative" style={{ minHeight: '80px', minWidth: '800px' }}>
                    {/* Hour grid lines */}
                    <div className="absolute inset-0 flex">
                      {hourMarkers.map(marker => (
                        <div
                          key={marker.hour}
                          className="flex-1 border-r border-gray-100"
                        ></div>
                      ))}
                    </div>

                    {/* Shift backgrounds */}
                    <div className="absolute inset-0">
                      <div
                        className="absolute bg-blue-50 h-full opacity-30"
                        style={{ left: '33.33%', width: '37.5%' }}
                      ></div>
                    </div>

                    {/* Break times */}
                    {showBreaks && BREAK_TIMES.map((breakTime, idx) => {
                      const hour = parseInt(breakTime.start.split(':')[0]);
                      const minute = parseInt(breakTime.start.split(':')[1]);
                      const position = ((hour * 60 + minute) / (24 * 60)) * 100;

                      const endHour = parseInt(breakTime.end.split(':')[0]);
                      const endMinute = parseInt(breakTime.end.split(':')[1]);
                      const endPosition = ((endHour * 60 + endMinute) / (24 * 60)) * 100;
                      const width = endPosition - position;

                      return (
                        <div
                          key={idx}
                          className="absolute h-full bg-gray-200 opacity-20"
                          style={{
                            left: `${position}%`,
                            width: `${width}%`,
                          }}
                          title={breakTime.name}
                        ></div>
                      );
                    })}

                    {/* Maintenance blocks */}
                    {showPM && machinePM.map(pm => (
                      <div
                        key={pm.id}
                        className="absolute bg-yellow-500 rounded border-2 border-yellow-600 cursor-pointer group"
                        style={{
                          left: `${getTimePosition(pm.startTime)}%`,
                          width: `${getJobWidth(pm.startTime, pm.endTime)}%`,
                          top: '8px',
                          height: 'calc(100% - 16px)',
                        }}
                        onClick={() => setSelectedJob({ ...pm, type: 'maintenance' })}
                      >
                        <div className="px-2 py-1 h-full flex flex-col justify-center">
                          <div className="text-xs font-semibold text-yellow-900 flex items-center gap-1">
                            <Wrench size={12} />
                            {pm.type}
                          </div>
                          <div className="text-xs text-yellow-800 mt-0.5">
                            {formatTime(pm.startTime)} - {formatTime(pm.endTime)}
                          </div>
                        </div>
                        {/* Tooltip */}
                        <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 p-2 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                          <div className="font-semibold">{pm.type}</div>
                          <div>{pm.notes}</div>
                        </div>
                      </div>
                    ))}

                    {/* Job blocks */}
                    {machineJobs.map(job => (
                      <div
                        key={job.jobId}
                        className={`absolute ${getStatusColor(job.status)} rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow group`}
                        style={{
                          left: `${getTimePosition(job.startTime)}%`,
                          width: `${getJobWidth(job.startTime, job.endTime)}%`,
                          top: '8px',
                          height: 'calc(100% - 16px)',
                        }}
                        onClick={() => setSelectedJob({ ...job, type: 'job' })}
                      >
                        <div className="px-2 py-1 h-full flex flex-col justify-center text-white">
                          <div className="text-xs font-semibold truncate">
                            {job.orderNo} - {job.product}
                          </div>
                          <div className="text-xs opacity-90 truncate">
                            {job.process}
                          </div>
                          <div className="text-xs opacity-75 mt-0.5">
                            {formatTime(job.startTime)} - {formatTime(job.endTime)}
                          </div>
                        </div>
                        {/* Tooltip */}
                        <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                          <div className="font-semibold mb-1">{job.orderNo} - {job.product}</div>
                          <div>Process: {job.process}</div>
                          <div>Setup: {job.setupMin} min | Run: {job.runMin} min</div>
                          <div>Time: {formatTime(job.startTime)} - {formatTime(job.endTime)}</div>
                          <div className="mt-1 pt-1 border-t border-gray-700">Status: {job.status}</div>
                        </div>
                      </div>
                    ))}

                    {/* Current time indicator */}
                    {selectedDate.toDateString() === new Date().toDateString() && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                        style={{
                          left: `${getTimePosition(new Date().toISOString())}%`,
                        }}
                      >
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {filteredMachines.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Layers size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No machines found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Job Detail Panel */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedJob.type === 'maintenance' ? 'Maintenance Details' : 'Job Details'}
              </h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedJob.type === 'maintenance' ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <p className="mt-1 text-gray-900">{selectedJob.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Machine</label>
                    <p className="mt-1 text-gray-900">{selectedJob.machineCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Schedule</label>
                    <p className="mt-1 text-gray-900">
                      {formatTime(selectedJob.startTime)} - {formatTime(selectedJob.endTime)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <p className="mt-1 text-gray-900">{selectedJob.notes}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Order Number</label>
                    <p className="mt-1 text-gray-900 font-semibold">{selectedJob.orderNo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Product</label>
                    <p className="mt-1 text-gray-900">{selectedJob.product}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Process</label>
                    <p className="mt-1 text-gray-900">{selectedJob.process}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Machine</label>
                    <p className="mt-1 text-gray-900">{selectedJob.machineCode}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Setup Time</label>
                      <p className="mt-1 text-gray-900">{selectedJob.setupMin} min</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Run Time</label>
                      <p className="mt-1 text-gray-900">{selectedJob.runMin} min</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Schedule</label>
                    <p className="mt-1 text-gray-900">
                      {formatTime(selectedJob.startTime)} - {formatTime(selectedJob.endTime)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">
                      <span className={`text-sm px-3 py-1 rounded ${getStatusColor(selectedJob.status).replace('bg-', 'bg-opacity-20 bg-')} font-medium`}>
                        {selectedJob.status}
                      </span>
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineTimeline;