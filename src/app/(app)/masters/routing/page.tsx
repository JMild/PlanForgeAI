"use client";

import React, { useState } from 'react';
import { 
  Plus, Search, Edit, Trash2, Copy, Eye, Download, Upload,
  ArrowRight, Clock, Settings, Wrench, AlertCircle, Save, X,
  ChevronDown, ChevronRight, GitBranch
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// Sample product catalog
const PRODUCTS = [
  { code: 'WDGT-A', name: 'Widget A' },
  { code: 'WDGT-B', name: 'Widget B' },
  { code: 'WDGT-C', name: 'Widget C' },
  { code: 'WDGT-D', name: 'Widget D' },
  { code: 'GEAR-100', name: 'Gear Assembly 100' },
];

// Sample processes
const PROCESSES = [
  { code: 'MACH', name: 'Machining', category: 'Fabrication' },
  { code: 'DRILL', name: 'Drilling', category: 'Fabrication' },
  { code: 'PRESS', name: 'Pressing', category: 'Forming' },
  { code: 'PAINT', name: 'Painting', category: 'Finishing' },
  { code: 'ASSY', name: 'Assembly', category: 'Assembly' },
  { code: 'PACK', name: 'Packaging', category: 'Finishing' },
  { code: 'WELD', name: 'Welding', category: 'Fabrication' },
  { code: 'INSP', name: 'Inspection', category: 'Quality' },
];

// Sample work centers
const WORK_CENTERS = [
  { code: 'WC-MACH', name: 'Machining Center', machines: ['M001', 'M002'] },
  { code: 'WC-PRESS', name: 'Press Area', machines: ['M004'] },
  { code: 'WC-PAINT', name: 'Paint Booth', machines: ['M005'] },
  { code: 'WC-ASSY', name: 'Assembly Line', machines: ['M003'] },
];

// Initial routing data
const INITIAL_ROUTINGS = [
  {
    id: 'RT001',
    productCode: 'WDGT-A',
    productName: 'Widget A',
    version: '1.0',
    status: 'Active',
    effectiveDate: '2025-01-01',
    description: 'Standard routing for Widget A',
    steps: [
      {
        seq: 10,
        processCode: 'MACH',
        processName: 'Machining',
        workCenterCode: 'WC-MACH',
        machineList: ['M001', 'M002'],
        setupMin: 30,
        runMinPerUnit: 1.2,
        batchSize: 50,
        changeoverFamily: 'METAL-A',
        queueTimeMin: 0,
        moveTimeMin: 5,
        notes: 'Use carbide tooling'
      },
      {
        seq: 20,
        processCode: 'DRILL',
        processName: 'Drilling',
        workCenterCode: 'WC-MACH',
        machineList: ['M001', 'M002'],
        setupMin: 20,
        runMinPerUnit: 0.6,
        batchSize: 50,
        changeoverFamily: 'METAL-A',
        queueTimeMin: 30,
        moveTimeMin: 5,
        notes: '4 holes per unit'
      },
      {
        seq: 30,
        processCode: 'ASSY',
        processName: 'Assembly',
        workCenterCode: 'WC-ASSY',
        machineList: ['M003'],
        setupMin: 15,
        runMinPerUnit: 0.9,
        batchSize: 100,
        changeoverFamily: null,
        queueTimeMin: 60,
        moveTimeMin: 10,
        notes: 'Include fasteners'
      },
    ]
  },
  {
    id: 'RT002',
    productCode: 'WDGT-B',
    productName: 'Widget B',
    version: '1.0',
    status: 'Active',
    effectiveDate: '2025-01-01',
    description: 'Standard routing for Widget B',
    steps: [
      {
        seq: 10,
        processCode: 'PRESS',
        processName: 'Pressing',
        workCenterCode: 'WC-PRESS',
        machineList: ['M004'],
        setupMin: 25,
        runMinPerUnit: 1.6,
        batchSize: 20,
        changeoverFamily: 'PRESS-STD',
        queueTimeMin: 0,
        moveTimeMin: 5,
        notes: 'Use die #12'
      },
      {
        seq: 20,
        processCode: 'PAINT',
        processName: 'Painting',
        workCenterCode: 'WC-PAINT',
        machineList: ['M005'],
        setupMin: 30,
        runMinPerUnit: 1.4,
        batchSize: 30,
        changeoverFamily: 'PAINT-BLUE',
        queueTimeMin: 120,
        moveTimeMin: 10,
        notes: 'Dry time 2 hours'
      },
      {
        seq: 30,
        processCode: 'ASSY',
        processName: 'Assembly',
        workCenterCode: 'WC-ASSY',
        machineList: ['M003'],
        setupMin: 15,
        runMinPerUnit: 1.0,
        batchSize: 100,
        changeoverFamily: null,
        queueTimeMin: 0,
        moveTimeMin: 5,
        notes: ''
      },
    ]
  },
  {
    id: 'RT003',
    productCode: 'WDGT-C',
    productName: 'Widget C',
    version: '1.0',
    status: 'Active',
    effectiveDate: '2025-01-01',
    description: 'Standard routing for Widget C',
    steps: [
      {
        seq: 10,
        processCode: 'MACH',
        processName: 'Machining',
        workCenterCode: 'WC-MACH',
        machineList: ['M001', 'M002'],
        setupMin: 30,
        runMinPerUnit: 1.3,
        batchSize: 50,
        changeoverFamily: 'METAL-A',
        queueTimeMin: 0,
        moveTimeMin: 5,
        notes: ''
      },
      {
        seq: 20,
        processCode: 'PAINT',
        processName: 'Painting',
        workCenterCode: 'WC-PAINT',
        machineList: ['M005'],
        setupMin: 30,
        runMinPerUnit: 0.8,
        batchSize: 40,
        changeoverFamily: 'PAINT-RED',
        queueTimeMin: 120,
        moveTimeMin: 10,
        notes: ''
      },
      {
        seq: 30,
        processCode: 'PACK',
        processName: 'Packaging',
        workCenterCode: 'WC-ASSY',
        machineList: ['M003'],
        setupMin: 10,
        runMinPerUnit: 0.5,
        batchSize: 200,
        changeoverFamily: null,
        queueTimeMin: 0,
        moveTimeMin: 5,
        notes: 'Use protective wrapping'
      },
    ]
  },
];

const RoutingMasterData = () => {
  const [routings, setRoutings] = useState(INITIAL_ROUTINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedRoutings, setExpandedRoutings] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRouting, setEditingRouting] = useState(null);
  const [viewMode, setViewMode] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    productCode: '',
    version: '1.0',
    status: 'Active',
    effectiveDate: '',
    description: '',
    steps: []
  });

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-700',
      'Draft': 'bg-yellow-100 text-yellow-700',
      'Obsolete': 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredRoutings = routings.filter(routing => {
    const matchesSearch = routing.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         routing.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         routing.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || routing.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleRoutingExpand = (id) => {
    setExpandedRoutings(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openCreateModal = () => {
    setFormData({
      id: `RT${String(routings.length + 1).padStart(3, '0')}`,
      productCode: '',
      version: '1.0',
      status: 'Draft',
      effectiveDate: new Date().toISOString().split('T')[0],
      description: '',
      steps: [
        {
          seq: 10,
          processCode: '',
          workCenterCode: '',
          machineList: [],
          setupMin: 0,
          runMinPerUnit: 0,
          batchSize: 1,
          changeoverFamily: null,
          queueTimeMin: 0,
          moveTimeMin: 0,
          notes: ''
        }
      ]
    });
    setEditingRouting(null);
    setViewMode('edit');
    setIsModalOpen(true);
  };

  const openEditModal = (routing) => {
    setFormData({
      id: routing.id,
      productCode: routing.productCode,
      version: routing.version,
      status: routing.status,
      effectiveDate: routing.effectiveDate,
      description: routing.description,
      steps: routing.steps.map(step => ({ ...step }))
    });
    setEditingRouting(routing);
    setViewMode('edit');
    setIsModalOpen(true);
  };

  const openViewModal = (routing) => {
    setEditingRouting(routing);
    setViewMode('view');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRouting(null);
    setViewMode(null);
  };

  const handleSaveRouting = () => {
    if (!formData.productCode || formData.steps.length === 0) {
      alert('Please fill in product and at least one step');
      return;
    }

    if (formData.steps.some(s => !s.processCode || !s.workCenterCode || s.setupMin < 0 || s.runMinPerUnit <= 0)) {
      alert('Please complete all step details with valid values');
      return;
    }

    const product = PRODUCTS.find(p => p.code === formData.productCode);
    
    const newRouting = {
      id: formData.id,
      productCode: formData.productCode,
      productName: product?.name || '',
      version: formData.version,
      status: formData.status,
      effectiveDate: formData.effectiveDate,
      description: formData.description,
      steps: formData.steps.map(step => {
        const process = PROCESSES.find(p => p.code === step.processCode);
        return {
          ...step,
          processName: process?.name || ''
        };
      })
    };

    if (editingRouting) {
      setRoutings(routings.map(r => r.id === editingRouting.id ? newRouting : r));
    } else {
      setRoutings([...routings, newRouting]);
    }
    closeModal();
  };

  const handleDeleteRouting = (id) => {
    if (confirm(`Are you sure you want to delete routing ${id}?`)) {
      setRoutings(routings.filter(r => r.id !== id));
    }
  };

  const handleCopyRouting = (routing) => {
    const newId = `RT${String(routings.length + 1).padStart(3, '0')}`;
    const copiedRouting = {
      ...routing,
      id: newId,
      version: '1.0',
      status: 'Draft',
      description: `Copy of ${routing.description}`
    };
    setRoutings([...routings, copiedRouting]);
  };

  const addStep = () => {
    const maxSeq = Math.max(...formData.steps.map(s => s.seq), 0);
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          seq: maxSeq + 10,
          processCode: '',
          workCenterCode: '',
          machineList: [],
          setupMin: 0,
          runMinPerUnit: 0,
          batchSize: 1,
          changeoverFamily: null,
          queueTimeMin: 0,
          moveTimeMin: 0,
          notes: ''
        }
      ]
    });
  };

  const removeStep = (seq) => {
    if (formData.steps.length === 1) {
      alert('Routing must have at least one step');
      return;
    }
    setFormData({
      ...formData,
      steps: formData.steps.filter(s => s.seq !== seq)
    });
  };

  const updateStep = (seq, field, value) => {
    setFormData({
      ...formData,
      steps: formData.steps.map(step => {
        if (step.seq === seq) {
          const updated = { ...step, [field]: value };
          
          // Auto-populate machines when work center changes
          if (field === 'workCenterCode') {
            const wc = WORK_CENTERS.find(w => w.code === value);
            updated.machineList = wc ? wc.machines : [];
          }
          
          return updated;
        }
        return step;
      })
    });
  };

  const moveStep = (seq, direction) => {
    const index = formData.steps.findIndex(s => s.seq === seq);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === formData.steps.length - 1)) {
      return;
    }
    
    const newSteps = [...formData.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    // Resequence
    newSteps.forEach((step, idx) => {
      step.seq = (idx + 1) * 10;
    });
    
    setFormData({ ...formData, steps: newSteps });
  };

  const calculateTotalTime = (steps, qty = 100) => {
    return steps.reduce((total, step) => {
      const batches = Math.ceil(qty / step.batchSize);
      const batchTime = step.setupMin + (step.batchSize * step.runMinPerUnit);
      return total + (batches * batchTime) + step.queueTimeMin + step.moveTimeMin;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Routing / Process Plans</h1>
                <p className="text-sm text-gray-500 mt-1">Define production sequences and process parameters</p>
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
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={18} />
                  New Routing
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search routings..."
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
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Obsolete">Obsolete</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Routings List */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredRoutings.length === 0 ? (
            <div className="text-center py-12">
              <GitBranch size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No routings found</h3>
              <p className="text-gray-500 mb-4">Create your first routing to get started</p>
              <button 
                onClick={openCreateModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Routing
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRoutings.map(routing => {
                const isExpanded = expandedRoutings[routing.id];
                const totalTime = calculateTotalTime(routing.steps);

                return (
                  <div key={routing.id} className="hover:bg-gray-50 transition-colors">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <button
                            onClick={() => toggleRoutingExpand(routing.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </button>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {routing.productCode} - {routing.productName}
                              </h3>
                              <span className="text-sm text-gray-500">v{routing.version}</span>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(routing.status)}`}>
                                {routing.status}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <GitBranch size={14} />
                                <span>{routing.steps.length} steps</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>Est. {Math.round(totalTime)} min (100 units)</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Settings size={14} />
                                <span>ID: {routing.id}</span>
                              </div>
                            </div>
                            {routing.description && (
                              <div className="text-sm text-gray-500 mt-1">{routing.description}</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openViewModal(routing)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="View Details"
                          >
                            <Eye size={18} className="text-gray-600" />
                          </button>
                          <button 
                            onClick={() => handleCopyRouting(routing)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="Copy Routing"
                          >
                            <Copy size={18} className="text-gray-600" />
                          </button>
                          <button 
                            onClick={() => openEditModal(routing)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="Edit Routing"
                          >
                            <Edit size={18} className="text-blue-600" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRouting(routing.id)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="Delete Routing"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Steps */}
                      {isExpanded && (
                        <div className="mt-4 ml-12">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Process Steps:</h4>
                          <div className="space-y-2">
                            {routing.steps.map((step, idx) => (
                              <div key={step.seq} className="flex items-center gap-3">
                                <div className="flex-1 border border-gray-200 rounded-lg p-3 bg-white">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex-shrink-0">
                                        {idx + 1}
                                      </div>
                                      
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-semibold text-gray-900">{step.processName}</span>
                                          <span className="text-sm text-gray-500">({step.processCode})</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-4 gap-4 text-sm text-gray-600 mt-2">
                                          <div>
                                            <span className="text-gray-500">Work Center:</span>
                                            <div className="font-medium">{step.workCenterCode}</div>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">Setup:</span>
                                            <div className="font-medium">{step.setupMin} min</div>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">Run Time:</span>
                                            <div className="font-medium">{step.runMinPerUnit} min/unit</div>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">Batch Size:</span>
                                            <div className="font-medium">{step.batchSize} units</div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                          <div>
                                            <span className="text-gray-500">Machines:</span>
                                            <span className="font-medium ml-1">
                                              {step.machineList.join(', ')}
                                            </span>
                                          </div>
                                          {step.changeoverFamily && (
                                            <div>
                                              <span className="text-gray-500">Changeover Family:</span>
                                              <span className="font-medium ml-1">{step.changeoverFamily}</span>
                                            </div>
                                          )}
                                        </div>

                                        {step.notes && (
                                          <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                            {step.notes}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {idx < routing.steps.length - 1 && (
                                  <ArrowRight size={20} className="text-gray-400 flex-shrink-0" />
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {viewMode === 'view' ? 'Routing Details' : editingRouting ? 'Edit Routing' : 'Create New Routing'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {viewMode === 'view' && editingRouting ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Routing ID</label>
                      <p className="mt-1 text-lg font-semibold">{editingRouting.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Product</label>
                      <p className="mt-1 text-gray-900">{editingRouting.productCode} - {editingRouting.productName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Version</label>
                      <p className="mt-1 text-gray-900">v{editingRouting.version}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1">
                        <span className={`text-sm px-3 py-1 rounded ${getStatusColor(editingRouting.status)}`}>
                          {editingRouting.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Effective Date</label>
                      <p className="mt-1 text-gray-900">{new Date(editingRouting.effectiveDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Total Steps</label>
                      <p className="mt-1 text-gray-900">{editingRouting.steps.length}</p>
                    </div>
                  </div>

                  {editingRouting.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-gray-900">{editingRouting.description}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Process Steps</label>
                    <div className="space-y-3">
                      {editingRouting.steps.map((step, idx) => (
                        <div key={step.seq} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">{step.processName}</h4>
                                                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Work Center:</span>
                                  <div className="font-medium">{step.workCenterCode}</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Machines:</span>
                                  <div className="font-medium">{step.machineList.join(', ')}</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Setup Time:</span>
                                  <div className="font-medium">{step.setupMin} min</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Run Time:</span>
                                  <div className="font-medium">{step.runMinPerUnit} min/unit</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Batch Size:</span>
                                  <div className="font-medium">{step.batchSize} units</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Changeover Family:</span>
                                  <div className="font-medium">{step.changeoverFamily || 'None'}</div>
                                </div>
                              </div>
                              {step.notes && (
                                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
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
                <div className="space-y-6">
                  {/* Routing Header */}
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Routing ID</label>
                      <input
                        type="text"
                        value={formData.id}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Product *</label>
                      <select
                        value={formData.productCode}
                        onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Product</option>
                        {PRODUCTS.map(product => (
                          <option key={product.code} value={product.code}>
                            {product.code} - {product.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Version</label>
                      <input
                        type="text"
                        value={formData.version}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Status *</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Active">Active</option>
                        <option value="Obsolete">Obsolete</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Effective Date *</label>
                      <input
                        type="date"
                        value={formData.effectiveDate}
                        onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of this routing..."
                    />
                  </div>

                  {/* Process Steps */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">Process Steps *</label>
                      <button
                        type="button"
                        onClick={addStep}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add Step
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.steps.map((step, idx) => (
                        <div key={step.seq} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => moveStep(step.seq, 'up')}
                                disabled={idx === 0}
                                className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move Up"
                              >
                                ▲
                              </button>
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm">
                                {idx + 1}
                              </div>
                              <button
                                type="button"
                                onClick={() => moveStep(step.seq, 'down')}
                                disabled={idx === formData.steps.length - 1}
                                className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move Down"
                              >
                                ▼
                              </button>
                            </div>

                            <div className="flex-1 space-y-3">
                              {/* Row 1 */}
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-1">
                                    Process *
                                  </label>
                                  <select
                                    value={step.processCode}
                                    onChange={(e) => updateStep(step.seq, 'processCode', e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  >
                                    <option value="">Select Process</option>
                                    {PROCESSES.map(process => (
                                      <option key={process.code} value={process.code}>
                                        {process.name} ({process.code})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-1">
                                    Work Center *
                                  </label>
                                  <select
                                    value={step.workCenterCode}
                                    onChange={(e) => updateStep(step.seq, 'workCenterCode', e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  >
                                    <option value="">Select Work Center</option>
                                    {WORK_CENTERS.map(wc => (
                                      <option key={wc.code} value={wc.code}>
                                        {wc.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-1">
                                    Changeover Family
                                  </label>
                                  <input
                                    type="text"
                                    value={step.changeoverFamily || ''}
                                    onChange={(e) => updateStep(step.seq, 'changeoverFamily', e.target.value || null)}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., METAL-A"
                                  />
                                </div>
                              </div>

                              {/* Row 2 */}
                              <div className="grid grid-cols-4 gap-3">
                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-1">
                                    Setup Time (min) *
                                  </label>
                                  <input
                                    type="number"
                                    value={step.setupMin}
                                    onChange={(e) => updateStep(step.seq, 'setupMin', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    step="1"
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-1">
                                    Run Time (min/unit) *
                                  </label>
                                  <input
                                    type="number"
                                    value={step.runMinPerUnit}
                                    onChange={(e) => updateStep(step.seq, 'runMinPerUnit', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    step="0.1"
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-1">
                                    Batch Size *
                                  </label>
                                  <input
                                    type="number"
                                    value={step.batchSize}
                                    onChange={(e) => updateStep(step.seq, 'batchSize', parseInt(e.target.value) || 1)}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-1">
                                    Queue Time (min)
                                  </label>
                                  <input
                                    type="number"
                                    value={step.queueTimeMin}
                                    onChange={(e) => updateStep(step.seq, 'queueTimeMin', parseInt(e.target.value) || 0)}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                  />
                                </div>
                              </div>

                              {/* Row 3 */}
                              <div>
                                <label className="text-xs font-medium text-gray-700 block mb-1">
                                  Notes
                                </label>
                                <input
                                  type="text"
                                  value={step.notes}
                                  onChange={(e) => updateStep(step.seq, 'notes', e.target.value)}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Special instructions, tooling requirements, etc."
                                />
                              </div>

                              {step.machineList.length > 0 && (
                                <div className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                                  <span className="font-medium">Available Machines:</span> {step.machineList.join(', ')}
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeStep(step.seq)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium text-blue-900 mb-1">Routing Summary</div>
                          <div className="text-blue-800">
                            Total Steps: {formData.steps.length} | 
                            Estimated Time (100 units): {Math.round(calculateTotalTime(formData.steps, 100))} minutes
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {viewMode === 'view' ? (
                <button
                  onClick={() => setViewMode('edit')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit size={18} />
                  Edit Routing
                </button>
              ) : (
                <button
                  onClick={handleSaveRouting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Routing
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutingMasterData;