"use client";

import React, { useState } from 'react';
import {
    Plus, Search, Edit, Trash2, Eye, Download, Upload, ToolCase,
    CheckCircle, X, Save, Wrench, AlertCircle, Calendar, Clock,
    Package, TrendingUp, Activity, Copy, Settings, MapPin, AlertTriangle
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// Sample tools & molds data
const INITIAL_TOOLS = [
    {
        code: 'TOOL001',
        name: 'Carbide End Mill 10mm',
        type: 'Cutting Tool',
        category: 'End Mill',
        status: 'Available',
        condition: 'Good',
        location: 'Tool Crib A-12',
        compatibleProcesses: ['MACH', 'DRILL'],
        compatibleMachines: ['M001', 'M002'],
        specifications: {
            diameter: '10mm',
            length: '75mm',
            material: 'Carbide',
            coating: 'TiN',
        },
        maintenance: {
            lastMaintenance: '2025-09-15',
            nextMaintenance: '2025-12-15',
            maintenanceCycle: 90, // days
            setupTimeExtra: 15, // minutes
        },
        lifecycle: {
            purchaseDate: '2024-06-01',
            purchaseCost: 2500,
            expectedLife: 365, // days
            currentUsage: 180, // days
            totalCycles: 450,
            remainingCycles: 150,
        },
        vendor: {
            supplier: 'Precision Tools Ltd',
            partNumber: 'EM-10-CAR-TIN',
            leadTime: 14, // days
        },
        quantity: {
            total: 5,
            available: 3,
            inUse: 2,
            damaged: 0,
        },
        notes: 'High-performance tool for precision machining',
    },
    {
        code: 'MOLD001',
        name: 'Injection Mold - Widget A',
        type: 'Mold',
        category: 'Injection Mold',
        status: 'In Use',
        condition: 'Good',
        location: 'Mold Storage B-05',
        compatibleProcesses: ['PRESS'],
        compatibleMachines: ['M004'],
        specifications: {
            cavities: '4',
            material: 'P20 Steel',
            weight: '250kg',
            dimensions: '600x400x300mm',
        },
        maintenance: {
            lastMaintenance: '2025-09-20',
            nextMaintenance: '2025-10-20',
            maintenanceCycle: 30, // days
            setupTimeExtra: 45, // minutes
        },
        lifecycle: {
            purchaseDate: '2023-03-15',
            purchaseCost: 180000,
            expectedLife: 1825, // days (5 years)
            currentUsage: 565, // days
            totalCycles: 12500,
            remainingCycles: 37500,
        },
        vendor: {
            supplier: 'Mold Tech Asia',
            partNumber: 'INJ-WDGT-A-4CAV',
            leadTime: 90, // days
        },
        quantity: {
            total: 1,
            available: 0,
            inUse: 1,
            damaged: 0,
        },
        notes: 'Critical mold for Widget A production - handle with care',
    },
    {
        code: 'TOOL002',
        name: 'Drill Bit Set HSS 1-13mm',
        type: 'Cutting Tool',
        category: 'Drill Bit',
        status: 'Available',
        condition: 'Good',
        location: 'Tool Crib A-15',
        compatibleProcesses: ['DRILL'],
        compatibleMachines: ['M001', 'M002'],
        specifications: {
            sizes: '1-13mm (13pcs)',
            material: 'HSS',
            coating: 'Black Oxide',
            shankType: 'Straight',
        },
        maintenance: {
            lastMaintenance: '2025-09-10',
            nextMaintenance: '2025-12-10',
            maintenanceCycle: 90,
            setupTimeExtra: 10,
        },
        lifecycle: {
            purchaseDate: '2024-08-01',
            purchaseCost: 1200,
            expectedLife: 180,
            currentUsage: 60,
            totalCycles: 300,
            remainingCycles: 900,
        },
        vendor: {
            supplier: 'Industrial Tools Co',
            partNumber: 'DB-HSS-13PC',
            leadTime: 7,
        },
        quantity: {
            total: 3,
            available: 2,
            inUse: 1,
            damaged: 0,
        },
        notes: 'Standard drill bit set for general purpose',
    },
    {
        code: 'MOLD002',
        name: 'Die Casting Mold - Widget B',
        type: 'Mold',
        category: 'Die Cast Mold',
        status: 'Maintenance',
        condition: 'Fair',
        location: 'Maintenance Shop',
        compatibleProcesses: ['PRESS'],
        compatibleMachines: ['M004'],
        specifications: {
            cavities: '2',
            material: 'H13 Steel',
            weight: '180kg',
            dimensions: '500x350x250mm',
        },
        maintenance: {
            lastMaintenance: '2025-09-28',
            nextMaintenance: '2025-10-05',
            maintenanceCycle: 21,
            setupTimeExtra: 60,
        },
        lifecycle: {
            purchaseDate: '2022-11-10',
            purchaseCost: 150000,
            expectedLife: 2190,
            currentUsage: 880,
            totalCycles: 18000,
            remainingCycles: 22000,
        },
        vendor: {
            supplier: 'Precision Mold Works',
            partNumber: 'DC-WDGT-B-2CAV',
            leadTime: 75,
        },
        quantity: {
            total: 1,
            available: 0,
            inUse: 0,
            damaged: 0,
        },
        notes: 'Scheduled maintenance - minor wear on ejector pins',
    },
    {
        code: 'TOOL003',
        name: 'Precision Boring Bar',
        type: 'Cutting Tool',
        category: 'Boring Tool',
        status: 'Available',
        condition: 'Excellent',
        location: 'Tool Crib A-20',
        compatibleProcesses: ['MACH'],
        compatibleMachines: ['M001', 'M002'],
        specifications: {
            diameter: '12-20mm',
            reach: '150mm',
            material: 'Carbide Insert',
            accuracy: '±0.01mm',
        },
        maintenance: {
            lastMaintenance: '2025-09-25',
            nextMaintenance: '2025-12-25',
            maintenanceCycle: 90,
            setupTimeExtra: 20,
        },
        lifecycle: {
            purchaseDate: '2024-05-15',
            purchaseCost: 8500,
            expectedLife: 730,
            currentUsage: 140,
            totalCycles: 200,
            remainingCycles: 800,
        },
        vendor: {
            supplier: 'Advanced Tooling Systems',
            partNumber: 'BB-PREC-12-20',
            leadTime: 21,
        },
        quantity: {
            total: 2,
            available: 2,
            inUse: 0,
            damaged: 0,
        },
        notes: 'High-precision tool for critical bore operations',
    },
    {
        code: 'FIXTURE001',
        name: 'Welding Jig - Assembly',
        type: 'Fixture',
        category: 'Welding Jig',
        status: 'Available',
        condition: 'Good',
        location: 'Assembly Area F-08',
        compatibleProcesses: ['ASSY'],
        compatibleMachines: ['M003'],
        specifications: {
            material: 'Steel Frame',
            capacity: '50kg',
            dimensions: '800x600x400mm',
            adjustable: 'Yes',
        },
        maintenance: {
            lastMaintenance: '2025-09-01',
            nextMaintenance: '2025-12-01',
            maintenanceCycle: 90,
            setupTimeExtra: 30,
        },
        lifecycle: {
            purchaseDate: '2023-07-20',
            purchaseCost: 15000,
            expectedLife: 1825,
            currentUsage: 440,
            totalCycles: 500,
            remainingCycles: 2000,
        },
        vendor: {
            supplier: 'Custom Fixtures Inc',
            partNumber: 'WJ-ASSY-001',
            leadTime: 45,
        },
        quantity: {
            total: 2,
            available: 1,
            inUse: 1,
            damaged: 0,
        },
        notes: 'Custom welding jig for Widget assembly',
    },
    {
        code: 'TOOL004',
        name: 'Thread Tap Set M6-M12',
        type: 'Cutting Tool',
        category: 'Tap',
        status: 'Available',
        condition: 'Good',
        location: 'Tool Crib A-18',
        compatibleProcesses: ['MACH', 'DRILL'],
        compatibleMachines: ['M001', 'M002'],
        specifications: {
            sizes: 'M6, M8, M10, M12',
            material: 'HSS-E',
            type: 'Hand Tap',
            pitch: 'Metric Coarse',
        },
        maintenance: {
            lastMaintenance: '2025-09-05',
            nextMaintenance: '2025-12-05',
            maintenanceCycle: 90,
            setupTimeExtra: 8,
        },
        lifecycle: {
            purchaseDate: '2024-07-10',
            purchaseCost: 850,
            expectedLife: 365,
            currentUsage: 85,
            totalCycles: 400,
            remainingCycles: 600,
        },
        vendor: {
            supplier: 'Threading Solutions',
            partNumber: 'TAP-METRIC-SET',
            leadTime: 10,
        },
        quantity: {
            total: 4,
            available: 3,
            inUse: 1,
            damaged: 0,
        },
        notes: 'Standard metric threading set',
    },
];

const TOOL_TYPES = ['Cutting Tool', 'Mold', 'Fixture', 'Gauge', 'Template', 'Jig'];
const CATEGORIES = ['End Mill', 'Drill Bit', 'Boring Tool', 'Tap', 'Injection Mold', 'Die Cast Mold', 'Welding Jig', 'Inspection Gauge'];
const STATUSES = ['Available', 'In Use', 'Maintenance', 'Damaged', 'Retired'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];

const ToolsMoldsMasterData = () => {
    const [tools, setTools] = useState(INITIAL_TOOLS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState(null);
    const [selectedTool, setSelectedTool] = useState(null);
    const [activeTab, setActiveTab] = useState('basic');

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        type: 'Cutting Tool',
        category: 'End Mill',
        status: 'Available',
        condition: 'Good',
        location: '',
        compatibleProcesses: [],
        compatibleMachines: [],
        specifications: {},
        maintenance: {
            lastMaintenance: '',
            nextMaintenance: '',
            maintenanceCycle: 90,
            setupTimeExtra: 0,
        },
        quantity: {
            total: 1,
            available: 1,
            inUse: 0,
            damaged: 0,
        },
        notes: '',
    });

    const filteredTools = tools.filter(tool => {
        const matchesSearch = tool.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || tool.type === filterType;
        const matchesStatus = filterStatus === 'all' || tool.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    // Statistics
    const stats = {
        totalTools: tools.length,
        available: tools.filter(t => t.status === 'Available').length,
        inUse: tools.reduce((sum, t) => sum + t.quantity.inUse, 0),
        maintenance: tools.filter(t => t.status === 'Maintenance').length,
        totalValue: tools.reduce((sum, t) => sum + (t.lifecycle?.purchaseCost || 0), 0),
    };

    const openModal = (mode, tool = null) => {
        setModalMode(mode);
        setSelectedTool(tool);
        setActiveTab('basic');

        if (mode === 'create') {
            setFormData({
                code: `TOOL${String(tools.length + 1).padStart(3, '0')}`,
                name: '',
                type: 'Cutting Tool',
                category: 'End Mill',
                status: 'Available',
                condition: 'Good',
                location: '',
                compatibleProcesses: [],
                compatibleMachines: [],
                specifications: {},
                maintenance: {
                    lastMaintenance: '',
                    nextMaintenance: '',
                    maintenanceCycle: 90,
                    setupTimeExtra: 0,
                },
                quantity: {
                    total: 1,
                    available: 1,
                    inUse: 0,
                    damaged: 0,
                },
                notes: '',
            });
        } else if (tool) {
            setFormData({
                code: tool.code,
                name: tool.name,
                type: tool.type,
                category: tool.category,
                status: tool.status,
                condition: tool.condition,
                location: tool.location,
                compatibleProcesses: tool.compatibleProcesses || [],
                compatibleMachines: tool.compatibleMachines || [],
                specifications: tool.specifications || {},
                maintenance: { ...tool.maintenance },
                quantity: { ...tool.quantity },
                notes: tool.notes || '',
            });
        }

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalMode(null);
        setSelectedTool(null);
    };

    const handleSave = () => {
        if (modalMode === 'create') {
            const newTool = {
                ...formData,
                lifecycle: selectedTool?.lifecycle || {
                    purchaseDate: new Date().toISOString().split('T')[0],
                    purchaseCost: 0,
                    expectedLife: 365,
                    currentUsage: 0,
                    totalCycles: 0,
                    remainingCycles: 0,
                },
                vendor: selectedTool?.vendor || {
                    supplier: '',
                    partNumber: '',
                    leadTime: 0,
                },
            };
            setTools([...tools, newTool]);
        } else if (modalMode === 'edit') {
            setTools(tools.map(t =>
                t.code === selectedTool.code
                    ? { ...selectedTool, ...formData }
                    : t
            ));
        }
        closeModal();
    };

    const handleDelete = (toolCode) => {
        if (confirm(`Are you sure you want to delete ${toolCode}?`)) {
            setTools(tools.filter(t => t.code !== toolCode));
        }
    };

    const handleDuplicate = (tool) => {
        const newTool = {
            ...tool,
            code: `${tool.code}-COPY`,
            name: `${tool.name} (Copy)`,
            quantity: {
                total: 1,
                available: 1,
                inUse: 0,
                damaged: 0,
            },
        };
        setTools([...tools, newTool]);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'bg-green-100 text-green-700';
            case 'In Use': return 'bg-blue-100 text-blue-700';
            case 'Maintenance': return 'bg-yellow-100 text-yellow-700';
            case 'Damaged': return 'bg-red-100 text-red-700';
            case 'Retired': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getConditionColor = (condition) => {
        switch (condition) {
            case 'Excellent': return 'text-green-600';
            case 'Good': return 'text-blue-600';
            case 'Fair': return 'text-yellow-600';
            case 'Poor': return 'text-orange-600';
            case 'Critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Cutting Tool': return <ToolCase size={20} className="text-blue-600" />;
            case 'Mold': return <Package size={20} className="text-purple-600" />;
            case 'Fixture': return <Settings size={20} className="text-green-600" />;
            default: return <Wrench size={20} className="text-gray-600" />;
        }
    };

    const calculateUtilization = (tool) => {
        if (tool.quantity.total === 0) return 0;
        return Math.round((tool.quantity.inUse / tool.quantity.total) * 100);
    };

    const isMaintenanceDue = (tool) => {
        if (!tool.maintenance?.nextMaintenance) return false;
        const nextDate = new Date(tool.maintenance.nextMaintenance);
        const today = new Date();
        const daysUntil = Math.floor((nextDate - today) / (1000 * 60 * 60 * 24));
        return daysUntil <= 7;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <PageHeader
                title={
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Tools & Molds Master Data</h1>
                                <p className="text-sm text-gray-500 mt-1">Manage tools, molds, fixtures and equipment</p>
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
                                    New Tool/Mold
                                </button>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-5 gap-4 mt-4">
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <div className="text-xs text-blue-600 font-medium mb-1">Total Items</div>
                                <div className="text-2xl font-bold text-blue-900">{stats.totalTools}</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <div className="text-xs text-green-600 font-medium mb-1">Available</div>
                                <div className="text-2xl font-bold text-green-900">{stats.available}</div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                <div className="text-xs text-purple-600 font-medium mb-1">In Use</div>
                                <div className="text-2xl font-bold text-purple-900">{stats.inUse}</div>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <div className="text-xs text-yellow-600 font-medium mb-1">Maintenance</div>
                                <div className="text-2xl font-bold text-yellow-900">{stats.maintenance}</div>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                                <div className="text-xs text-indigo-600 font-medium mb-1">Total Value</div>
                                <div className="text-xl font-bold text-indigo-900">{formatCurrency(stats.totalValue)}</div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-4 mt-4">
                            <div className="flex-1 relative">
                                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search tools & molds..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Types</option>
                                {TOOL_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                {STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                }
            />

            {/* Tools Grid */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTools.map(tool => {
                        const maintenanceDue = isMaintenanceDue(tool);
                        const utilization = calculateUtilization(tool);

                        return (
                            <div key={tool.code} className="bg-white rounded-lg shadow-sm border-2 border-gray-200 hover:shadow-md transition-shadow">
                                <div className="p-5">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3 flex-1">
                                            {getTypeIcon(tool.type)}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">{tool.name}</h3>
                                                <span className="text-xs text-gray-500">{tool.code}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => openModal('view', tool)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                                title="View"
                                            >
                                                <Eye size={14} className="text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => openModal('edit', tool)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                                title="Edit"
                                            >
                                                <Edit size={14} className="text-blue-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDuplicate(tool)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                                title="Duplicate"
                                            >
                                                <Copy size={14} className="text-green-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tool.code)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} className="text-red-600" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(tool.status)}`}>
                                            {tool.status}
                                        </span>
                                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                                            {tool.category}
                                        </span>
                                        {maintenanceDue && (
                                            <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700 flex items-center gap-1">
                                                <AlertTriangle size={12} />
                                                PM Due
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-2 mb-3 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin size={14} />
                                            <span className="truncate">{tool.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Activity size={14} className="text-gray-600" />
                                            <span className={`font-medium ${getConditionColor(tool.condition)}`}>
                                                {tool.condition}
                                            </span>
                                        </div>
                                        {tool.compatibleMachines && tool.compatibleMachines.length > 0 && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Settings size={14} />
                                                <span className="text-xs">{tool.compatibleMachines.join(', ')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quantity */}
                                    <div className="mb-3 pb-3 border-b border-gray-200">
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <span className="text-gray-600">Quantity</span>
                                            <span className="font-medium text-gray-900">
                                                {tool.quantity.available}/{tool.quantity.total}
                                            </span>
                                        </div>
                                        <div className="flex gap-3 text-xs">
                                            <span className="text-gray-600">In Use: <span className="font-medium text-blue-600">{tool.quantity.inUse}</span></span>
                                            {tool.quantity.damaged > 0 && (
                                                <span className="text-gray-600">Damaged: <span className="font-medium text-red-600">{tool.quantity.damaged}</span></span>
                                            )}
                                        </div>
                                        {utilization > 0 && (
                                            <div className="mt-2">
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className="bg-blue-600 h-1.5 rounded-full"
                                                        style={{ width: `${utilization}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 mt-1">Utilization: {utilization}%</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        {tool.maintenance?.nextMaintenance && (
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                <span>PM: {new Date(tool.maintenance.nextMaintenance).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        {tool.maintenance?.setupTimeExtra && (
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} />
                                                <span>+{tool.maintenance.setupTimeExtra}m setup</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredTools.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
                        <ToolCase size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tools or molds found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your filters or add a new record.</p>
                        <button
                            onClick={() => openModal('create')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                        >
                            <Plus size={18} />
                            Add New
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


export default ToolsMoldsMasterData;
