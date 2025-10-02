"use client";
import React, { useState, useMemo } from 'react';
import { Calendar, Zap, AlertTriangle, CheckCircle, Clock, Package, User, ChevronDown, ChevronRight, ArrowRight, GitBranch } from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// Sample data with routing/process sequences
const MACHINES = [
  { code: 'M001', name: 'CNC Machine 1', workCenter: 'Machining', status: 'Idle', processes: ['MACH', 'DRILL'] },
  { code: 'M002', name: 'CNC Machine 2', workCenter: 'Machining', status: 'Run', processes: ['MACH', 'DRILL'] },
  { code: 'M003', name: 'Assembly Line 1', workCenter: 'Assembly', status: 'Idle', processes: ['ASSY', 'PACK'] },
  { code: 'M004', name: 'Press Machine 1', workCenter: 'Pressing', status: 'Idle', processes: ['PRESS'] },
  { code: 'M005', name: 'Paint Booth 1', workCenter: 'Finishing', status: 'Idle', processes: ['PAINT'] },
];

const INITIAL_ORDERS = [
  {
    orderNo: 'ORD001',
    customer: 'ABC Corp',
    dueDate: '2025-10-03',
    priority: 1,
    items: [
      {
        itemNo: 1,
        product: 'Widget A',
        qty: 100,
        routing: [
          { seq: 1, process: 'MACH', processName: 'Machining', setupMin: 30, runMin: 120, machineGroup: ['M001', 'M002'] },
          { seq: 2, process: 'DRILL', processName: 'Drilling', setupMin: 20, runMin: 60, machineGroup: ['M001', 'M002'] },
          { seq: 3, process: 'ASSY', processName: 'Assembly', setupMin: 15, runMin: 90, machineGroup: ['M003'] },
        ],
        status: 'unplanned'
      },
      {
        itemNo: 2,
        product: 'Widget B',
        qty: 50,
        routing: [
          { seq: 1, process: 'PRESS', processName: 'Pressing', setupMin: 25, runMin: 80, machineGroup: ['M004'] },
          { seq: 2, process: 'PAINT', processName: 'Painting', setupMin: 30, runMin: 70, machineGroup: ['M005'] },
          { seq: 3, process: 'ASSY', processName: 'Assembly', setupMin: 15, runMin: 50, machineGroup: ['M003'] },
        ],
        status: 'unplanned'
      },
    ]
  },
  {
    orderNo: 'ORD002',
    customer: 'XYZ Ltd',
    dueDate: '2025-10-02',
    priority: 2,
    items: [
      {
        itemNo: 1,
        product: 'Widget C',
        qty: 75,
        routing: [
          { seq: 1, process: 'MACH', processName: 'Machining', setupMin: 30, runMin: 100, machineGroup: ['M001', 'M002'] },
          { seq: 2, process: 'PAINT', processName: 'Painting', setupMin: 30, runMin: 60, machineGroup: ['M005'] },
          { seq: 3, process: 'PACK', processName: 'Packaging', setupMin: 10, runMin: 40, machineGroup: ['M003'] },
        ],
        status: 'unplanned'
      },
    ]
  },
  {
    orderNo: 'ORD003',
    customer: 'Tech Inc',
    dueDate: '2025-10-04',
    priority: 1,
    items: [
      {
        itemNo: 1,
        product: 'Widget D',
        qty: 200,
        routing: [
          { seq: 1, process: 'PRESS', processName: 'Pressing', setupMin: 25, runMin: 150, machineGroup: ['M004'] },
          { seq: 2, process: 'DRILL', processName: 'Drilling', setupMin: 20, runMin: 120, machineGroup: ['M001', 'M002'] },
          { seq: 3, process: 'PAINT', processName: 'Painting', setupMin: 30, runMin: 130, machineGroup: ['M005'] },
          { seq: 4, process: 'ASSY', processName: 'Assembly', setupMin: 15, runMin: 100, machineGroup: ['M003'] },
        ],
        status: 'unplanned'
      },
    ]
  },
];

const SHIFTS = [
  { name: 'Day Shift', start: 8, end: 16 },
  { name: 'Night Shift', start: 16, end: 24 },
];

const getHourPosition = (hour) => ((hour - 8) / 16) * 100;
const getJobWidth = (durationMin) => (durationMin / 960) * 100;

const ProductionPlannerBoard = () => {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [jobs, setJobs] = useState([]);
  const [draggedProcess, setDraggedProcess] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [objectives, setObjectives] = useState({
    onTime: 70,
    utilization: 60,
    changeover: 40,
  });

  // Get all processes for an item with their status
  const getItemProcesses = (orderNo, itemNo) => {
    const scheduledJobs = jobs.filter(j => j.orderNo === orderNo && j.itemNo === itemNo);
    const order = orders.find(o => o.orderNo === orderNo);
    const item = order?.items.find(i => i.itemNo === itemNo);

    if (!item) return [];

    return item.routing.map(step => {
      const job = scheduledJobs.find(j => j.seq === step.seq);
      return {
        ...step,
        jobId: job?.jobId,
        machineCode: job?.machineCode,
        start: job?.start,
        end: job?.end,
        status: job ? 'scheduled' : 'unscheduled',
      };
    });
  };

  // Check if a process can be scheduled (predecessor completed)
  const canScheduleProcess = (orderNo, itemNo, seq) => {
    if (seq === 1) return true; // First process can always be scheduled

    const processes = getItemProcesses(orderNo, itemNo);
    const prevProcess = processes.find(p => p.seq === seq - 1);
    return prevProcess?.status === 'scheduled';
  };

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalJobs = jobs.length;
    const onTimeJobs = jobs.filter(j => {
      const order = orders.find(o => o.orderNo === j.orderNo);
      return order && new Date(j.end) <= new Date(order.dueDate);
    }).length;

    const avgUtilization = jobs.length > 0
      ? (jobs.reduce((sum, j) => sum + j.runMin, 0) / (MACHINES.length * 960)) * 100
      : 0;

    const totalProcesses = orders.reduce((sum, o) =>
      sum + o.items.reduce((itemSum, i) => itemSum + i.routing.length, 0), 0);
    const scheduledProcesses = jobs.length;

    return {
      onTimePercent: totalJobs > 0 ? Math.round((onTimeJobs / totalJobs) * 100) : 100,
      utilization: Math.round(avgUtilization),
      scheduledProcesses: scheduledProcesses,
      unscheduledProcesses: totalProcesses - scheduledProcesses,
    };
  }, [jobs, orders]);

  // Detect conflicts including sequence violations
  const conflicts = useMemo(() => {
    const detected = [];

    jobs.forEach((job, idx) => {
      // Check for overlaps on same machine
      jobs.forEach((other, otherIdx) => {
        if (idx !== otherIdx && job.machineCode === other.machineCode) {
          const jobStart = new Date(job.start);
          const jobEnd = new Date(job.end);
          const otherStart = new Date(other.start);
          const otherEnd = new Date(other.end);

          if (jobStart < otherEnd && jobEnd > otherStart) {
            detected.push({
              type: 'overlap',
              jobId: job.jobId,
              detail: `Overlaps with ${other.orderNo}-${other.itemNo} (${other.processName}) on ${job.machineCode}`,
            });
          }
        }
      });

      // Check sequence violations - job starts before predecessor ends
      if (job.seq > 1) {
        const prevJob = jobs.find(j =>
          j.orderNo === job.orderNo &&
          j.itemNo === job.itemNo &&
          j.seq === job.seq - 1
        );

        if (prevJob) {
          const jobStart = new Date(job.start);
          const prevEnd = new Date(prevJob.end);

          if (jobStart < prevEnd) {
            detected.push({
              type: 'sequence',
              jobId: job.jobId,
              detail: `Starts before ${prevJob.processName} (seq ${prevJob.seq}) completes`,
            });
          }
        }
      }

      // Check PM conflicts
      const machine = MACHINES.find(m => m.code === job.machineCode);
      if (machine?.status === 'PM') {
        detected.push({
          type: 'pm',
          jobId: job.jobId,
          detail: `${job.machineCode} is scheduled for maintenance`,
        });
      }

      // Check machine capability
      const order = orders.find(o => o.orderNo === job.orderNo);
      const item = order?.items.find(i => i.itemNo === job.itemNo);
      const routingStep = item?.routing.find(r => r.seq === job.seq);

      if (routingStep && !routingStep.machineGroup.includes(job.machineCode)) {
        detected.push({
          type: 'capability',
          jobId: job.jobId,
          detail: `${job.machineCode} cannot perform ${job.processName}`,
        });
      }
    });

    return detected;
  }, [jobs, orders]);

  const handleAIPlan = () => {
    // AI Planning with sequence constraints
    const allUnscheduledProcesses = [];

    orders.forEach(order => {
      order.items.forEach(item => {
        item.routing.forEach(step => {
          const isScheduled = jobs.some(j =>
            j.orderNo === order.orderNo &&
            j.itemNo === item.itemNo &&
            j.seq === step.seq
          );

          if (!isScheduled) {
            allUnscheduledProcesses.push({
              orderNo: order.orderNo,
              itemNo: item.itemNo,
              product: item.product,
              qty: item.qty,
              priority: order.priority,
              dueDate: order.dueDate,
              ...step,
            });
          }
        });
      });
    });

    // Sort by priority, due date, then sequence
    allUnscheduledProcesses.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.dueDate !== b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
      if (a.orderNo !== b.orderNo) return a.orderNo.localeCompare(b.orderNo);
      if (a.itemNo !== b.itemNo) return a.itemNo - b.itemNo;
      return a.seq - b.seq;
    });

    const newJobs = [...jobs];
    const machineNextAvailable = {};

    MACHINES.forEach(m => {
      machineNextAvailable[m.code] = new Date('2025-10-01T08:00:00');
    });

    allUnscheduledProcesses.forEach(process => {
      // Check if predecessor is scheduled
      if (process.seq > 1) {
        const prevJob = newJobs.find(j =>
          j.orderNo === process.orderNo &&
          j.itemNo === process.itemNo &&
          j.seq === process.seq - 1
        );

        if (!prevJob) return; // Skip if predecessor not scheduled
      }

      // Find best machine from allowed group
      const availableMachines = MACHINES.filter(m =>
        process.machineGroup.includes(m.code) && m.status !== 'PM'
      );

      if (availableMachines.length === 0) return;

      // Pick machine with earliest availability
      const bestMachine = availableMachines.reduce((best, curr) =>
        machineNextAvailable[curr.code] < machineNextAvailable[best.code] ? curr : best
      );

      // Calculate start time (max of machine availability and predecessor end)
      let startTime = new Date(machineNextAvailable[bestMachine.code]);

      if (process.seq > 1) {
        const prevJob = newJobs.find(j =>
          j.orderNo === process.orderNo &&
          j.itemNo === process.itemNo &&
          j.seq === process.seq - 1
        );

        if (prevJob) {
          const prevEndTime = new Date(prevJob.end);
          if (prevEndTime > startTime) {
            startTime = prevEndTime;
          }
        }
      }

      const setupEnd = new Date(startTime.getTime() + process.setupMin * 60000);
      const runEnd = new Date(setupEnd.getTime() + process.runMin * 60000);

      newJobs.push({
        jobId: `JOB${Date.now()}_${newJobs.length}`,
        orderNo: process.orderNo,
        itemNo: process.itemNo,
        seq: process.seq,
        process: process.process,
        processName: process.processName,
        machineCode: bestMachine.code,
        start: startTime.toISOString(),
        end: runEnd.toISOString(),
        setupMin: process.setupMin,
        runMin: process.runMin,
        product: process.product,
        qty: process.qty,
      });

      machineNextAvailable[bestMachine.code] = runEnd;
    });

    setJobs(newJobs);
  };

  const handleDragStart = (e, order, item, routingStep) => {
    setDraggedProcess({ order, item, routingStep });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, machineCode) => {
    e.preventDefault();
    if (!draggedProcess) return;

    const { order, item, routingStep } = draggedProcess;

    // Validate machine can perform this process
    if (!routingStep.machineGroup.includes(machineCode)) {
      alert(`${machineCode} cannot perform ${routingStep.processName}`);
      setDraggedProcess(null);
      return;
    }

    // Validate sequence - predecessor must be scheduled
    if (!canScheduleProcess(order.orderNo, item.itemNo, routingStep.seq)) {
      alert(`Cannot schedule ${routingStep.processName} - predecessor step must be scheduled first`);
      setDraggedProcess(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const hour = Math.floor((x / rect.width) * 16) + 8;

    let startTime = new Date('2025-10-01');
    startTime.setHours(hour, 0, 0, 0);

    // Ensure start time is after predecessor
    if (routingStep.seq > 1) {
      const prevJob = jobs.find(j =>
        j.orderNo === order.orderNo &&
        j.itemNo === item.itemNo &&
        j.seq === routingStep.seq - 1
      );

      if (prevJob) {
        const prevEndTime = new Date(prevJob.end);
        if (startTime < prevEndTime) {
          startTime = prevEndTime;
        }
      }
    }

    const setupEnd = new Date(startTime.getTime() + routingStep.setupMin * 60000);
    const runEnd = new Date(setupEnd.getTime() + routingStep.runMin * 60000);

    const newJob = {
      jobId: `JOB${Date.now()}`,
      orderNo: order.orderNo,
      itemNo: item.itemNo,
      seq: routingStep.seq,
      process: routingStep.process,
      processName: routingStep.processName,
      machineCode,
      start: startTime.toISOString(),
      end: runEnd.toISOString(),
      setupMin: routingStep.setupMin,
      runMin: routingStep.runMin,
      product: item.product,
      qty: item.qty,
    };

    setJobs([...jobs, newJob]);
    setDraggedProcess(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const removeJob = (jobId) => {
    const job = jobs.find(j => j.jobId === jobId);

    // Check if any successor jobs exist
    const hasSuccessors = jobs.some(j =>
      j.orderNo === job.orderNo &&
      j.itemNo === job.itemNo &&
      j.seq > job.seq
    );

    if (hasSuccessors) {
      if (!confirm('Removing this job will also remove all subsequent steps. Continue?')) {
        return;
      }
      // Remove this job and all successors
      setJobs(jobs.filter(j => !(
        j.orderNo === job.orderNo &&
        j.itemNo === job.itemNo &&
        j.seq >= job.seq
      )));
    } else {
      setJobs(jobs.filter(j => j.jobId !== jobId));
    }
  };

  const toggleOrderExpand = (orderNo) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderNo]: !prev[orderNo]
    }));
  };

  const toggleItemExpand = (key) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getItemStatus = (orderNo, itemNo) => {
    const processes = getItemProcesses(orderNo, itemNo);
    const scheduled = processes.filter(p => p.status === 'scheduled').length;
    if (scheduled === 0) return 'unscheduled';
    if (scheduled === processes.length) return 'complete';
    return 'partial';
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <PageHeader title={
        <div className='px-6 py-4'>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Production Planner Board</h1>
              <p className="text-sm text-gray-500">Process Sequence Planning with Routing Constraints</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAIPlan}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Zap size={18} />
                AI Plan
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Validate
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Save Scenario
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xs text-blue-600 font-medium">On-Time %</div>
              <div className="text-2xl font-bold text-blue-900">{kpis.onTimePercent}%</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xs text-green-600 font-medium">Utilization</div>
              <div className="text-2xl font-bold text-green-900">{kpis.utilization}%</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-xs text-purple-600 font-medium">Scheduled Processes</div>
              <div className="text-2xl font-bold text-purple-900">{kpis.scheduledProcesses}</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-xs text-orange-600 font-medium">Unscheduled</div>
              <div className="text-2xl font-bold text-orange-900">{kpis.unscheduledProcesses}</div>
            </div>
          </div>
        </div>
      } />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Order Pool */}
        <div className="w-96 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <GitBranch size={18} />
              Process Routing
            </h2>
            <p className="text-xs text-gray-500 mt-1">Drag processes in sequence order</p>
          </div>
          <div className="p-3 space-y-2">
            {orders.map(order => {
              const isOrderExpanded = expandedOrders[order.orderNo];

              return (
                <div key={order.orderNo} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  {/* Order Header */}
                  <div
                    className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleOrderExpand(order.orderNo)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        {isOrderExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span className="font-semibold text-sm">{order.orderNo}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${order.priority === 1 ? 'bg-red-100 text-red-700' :
                          order.priority === 2 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                        }`}>
                        P{order.priority}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        {order.customer}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        Due: {new Date(order.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  {isOrderExpanded && (
                    <div className="bg-white">
                      {order.items.map(item => {
                        const itemKey = `${order.orderNo}-${item.itemNo}`;
                        const isItemExpanded = expandedItems[itemKey];
                        const itemStatus = getItemStatus(order.orderNo, item.itemNo);
                        const processes = getItemProcesses(order.orderNo, item.itemNo);

                        return (
                          <div key={itemKey} className="border-t">
                            <div
                              className="p-2 bg-gray-50 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
                              onClick={() => toggleItemExpand(itemKey)}
                            >
                              <div className="flex items-center gap-2">
                                {isItemExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                <span className="text-xs font-medium">Item {item.itemNo}: {item.product}</span>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded ${itemStatus === 'complete' ? 'bg-green-100 text-green-700' :
                                  itemStatus === 'partial' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {processes.filter(p => p.status === 'scheduled').length}/{processes.length}
                              </span>
                            </div>

                            {/* Process Steps */}
                            {isItemExpanded && (
                              <div className="p-2 space-y-1">
                                {item.routing.map((step, idx) => {
                                  const processInfo = processes.find(p => p.seq === step.seq);
                                  const isScheduled = processInfo?.status === 'scheduled';
                                  const canSchedule = canScheduleProcess(order.orderNo, item.itemNo, step.seq);
                                  const isBlocked = !canSchedule && !isScheduled;

                                  return (
                                    <div key={step.seq} className="flex items-start gap-1">
                                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium mt-1">
                                        {step.seq}
                                      </div>
                                      <div
                                        draggable={canSchedule && !isScheduled}
                                        onDragStart={(e) => canSchedule && !isScheduled && handleDragStart(e, order, item, step)}
                                        className={`flex-1 p-2 border rounded text-xs ${isScheduled
                                            ? 'bg-green-50 border-green-300 opacity-70'
                                            : isBlocked
                                              ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
                                              : 'bg-white border-blue-300 cursor-move hover:border-blue-500 hover:shadow-sm'
                                          } transition-all`}
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-medium text-gray-900">{step.processName}</span>
                                          {isScheduled && <CheckCircle size={12} className="text-green-600" />}
                                          {isBlocked && <span className="text-gray-400 text-xs">🔒</span>}
                                        </div>
                                        <div className="text-gray-600 space-y-0.5">
                                          <div>Setup: {step.setupMin}m, Run: {step.runMin}m</div>
                                          <div className="text-gray-500">
                                            Machines: {step.machineGroup.join(', ')}
                                          </div>
                                          {isScheduled && processInfo && (
                                            <div className="text-green-700 font-medium mt-1">
                                              → {processInfo.machineCode} @ {new Date(processInfo.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {idx < item.routing.length - 1 && (
                                        <ArrowRight size={14} className="text-gray-400 mt-3" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center - Gantt Chart */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Time Header */}
            <div className="mb-4 ml-48">
              <div className="flex border-b border-gray-300 pb-2">
                {Array.from({ length: 17 }, (_, i) => i + 8).map(hour => (
                  <div key={hour} style={{ width: `${100 / 16}%` }} className="text-xs text-gray-600 text-center">
                    {hour}:00
                  </div>
                ))}
              </div>
            </div>

            {/* Machine Lanes */}
            <div className="space-y-3">
              {MACHINES.map(machine => (
                <div key={machine.code} className="flex items-center">
                  <div className="w-44 pr-4">
                    <div className="font-medium text-sm">{machine.name}</div>
                    <div className="text-xs text-gray-500">{machine.workCenter}</div>
                    <div className="text-xs text-gray-400 mt-1">{machine.processes.join(', ')}</div>
                    <div className={`text-xs px-2 py-0.5 rounded inline-block mt-1 ${machine.status === 'Run' ? 'bg-green-100 text-green-700' :
                        machine.status === 'PM' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                      {machine.status}
                    </div>
                  </div>
                  <div
                    className="flex-1 h-20 bg-gray-100 rounded relative border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors"
                    onDrop={(e) => handleDrop(e, machine.code)}
                    onDragOver={handleDragOver}
                  >
                    {/* Shift backgrounds */}
                    {SHIFTS.map(shift => (
                      <div
                        key={shift.name}
                        style={{
                          left: `${getHourPosition(shift.start)}%`,
                          width: `${getHourPosition(shift.end) - getHourPosition(shift.start)}%`
                        }}
                        className="absolute top-0 h-full bg-white border-l border-r border-gray-200"
                      />
                    ))}

                    {/* Jobs */}
                    {jobs.filter(j => j.machineCode === machine.code).map(job => {
                      const startHour = new Date(job.start).getHours() + new Date(job.start).getMinutes() / 60;
                      const hasConflict = conflicts.some(c => c.jobId === job.jobId);
                      const conflictTypes = conflicts.filter(c => c.jobId === job.jobId).map(c => c.type);

                      return (
                        <div
                          key={job.jobId}
                          style={{
                            left: `${getHourPosition(startHour)}%`,
                            width: `${getJobWidth(job.setupMin + job.runMin)}%`
                          }}
                          className={`absolute top-1 h-18 rounded shadow-md cursor-pointer group ${hasConflict ? 'bg-red-500 border-2 border-red-700' : 'bg-blue-500'
                            }`}
                          onClick={() => removeJob(job.jobId)}
                          title={hasConflict ? `Conflicts: ${conflictTypes.join(', ')}` : 'Click to remove'}
                        >
                          <div className="p-2 text-white text-xs h-full flex flex-col justify-between">
                            <div>
                              <div className="font-semibold truncate">{job.orderNo}-{job.itemNo}</div>
                              <div className="text-xs opacity-90 truncate">Step {job.seq}: {job.processName}</div>
                            </div>
                            <div>
                              <div className="text-xs opacity-90 truncate">{job.product}</div>
                              <div className="text-xs opacity-75">
                                {job.setupMin}m + {job.runMin}m
                              </div>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity rounded" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Objectives & Conflicts */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">Objectives & Constraints</h2>
          </div>

          <div className="p-4 space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                On-Time Priority: {objectives.onTime}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={objectives.onTime}
                onChange={(e) => setObjectives({ ...objectives, onTime: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Utilization: {objectives.utilization}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={objectives.utilization}
                onChange={(e) => setObjectives({ ...objectives, utilization: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Min Changeover: {objectives.changeover}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={objectives.changeover}
                onChange={(e) => setObjectives({ ...objectives, changeover: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold text-sm text-gray-900 mb-2">Sequence Rules</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-start gap-2">
                  <CheckCircle size={12} className="text-green-600 mt-0.5" />
                  <span>Steps must follow routing order</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={12} className="text-green-600 mt-0.5" />
                  <span>Predecessor must complete first</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={12} className="text-green-600 mt-0.5" />
                  <span>No skipping or reordering allowed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-orange-500" />
              Conflicts ({conflicts.length})
            </h3>
            {conflicts.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {conflicts.map((conflict, idx) => (
                  <div key={idx} className={`p-2 border rounded text-xs ${conflict.type === 'sequence' ? 'bg-purple-50 border-purple-200' :
                      conflict.type === 'capability' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-red-50 border-red-200'
                    }`}>
                    <div className={`font-medium uppercase ${conflict.type === 'sequence' ? 'text-purple-900' :
                        conflict.type === 'capability' ? 'text-yellow-900' :
                          'text-red-900'
                      }`}>
                      {conflict.type}
                    </div>
                    <div className={`${conflict.type === 'sequence' ? 'text-purple-700' :
                        conflict.type === 'capability' ? 'text-yellow-700' :
                          'text-red-700'
                      }`}>
                      {conflict.detail}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle size={16} />
                No conflicts detected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionPlannerBoard;