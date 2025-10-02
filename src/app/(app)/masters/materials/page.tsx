"use client";
import React, { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, Download, Upload, Package,
  Save, X, ChevronDown, ChevronRight, Box, AlertCircle, Clock,
  TrendingUp, DollarSign, Truck, Factory
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// Sample material categories
const MATERIAL_CATEGORIES = [
  'Raw Material',
  'Component',
  'Subassembly',
  'Packaging',
  'Consumable',
  'Tool',
];

// Sample units of measure
const UNITS = ['PCS', 'KG', 'M', 'L', 'SET', 'BOX', 'ROLL'];

// Sample suppliers
const SUPPLIERS = [
  { code: 'SUP001', name: 'ABC Metals Inc' },
  { code: 'SUP002', name: 'XYZ Components Ltd' },
  { code: 'SUP003', name: 'Global Parts Co' },
  { code: 'SUP004', name: 'Premium Materials' },
  { code: 'SUP005', name: 'Local Supplier A' },
];

// Initial materials data
const INITIAL_MATERIALS = [
  {
    code: 'MAT-001',
    name: 'Steel Sheet 2mm',
    description: 'Cold rolled steel sheet, 2mm thickness',
    category: 'Raw Material',
    unit: 'KG',
    standardCost: 45.50,
    leadTimeDays: 7,
    minStock: 500,
    maxStock: 2000,
    reorderPoint: 800,
    supplierCode: 'SUP001',
    supplierName: 'ABC Metals Inc',
    storageLocation: 'WH-A-01',
    batchTracking: true,
    status: 'Active',
    notes: 'Store in dry area'
  },
  {
    code: 'MAT-002',
    name: 'Bearing 608ZZ',
    description: '608ZZ Deep groove ball bearing',
    category: 'Component',
    unit: 'PCS',
    standardCost: 2.80,
    leadTimeDays: 14,
    minStock: 100,
    maxStock: 500,
    reorderPoint: 200,
    supplierCode: 'SUP002',
    supplierName: 'XYZ Components Ltd',
    storageLocation: 'WH-B-12',
    batchTracking: false,
    status: 'Active',
    notes: ''
  },
  {
    code: 'MAT-003',
    name: 'Aluminum Rod 10mm',
    description: 'Aluminum 6061-T6 round rod, 10mm diameter',
    category: 'Raw Material',
    unit: 'M',
    standardCost: 12.30,
    leadTimeDays: 10,
    minStock: 200,
    maxStock: 1000,
    reorderPoint: 400,
    supplierCode: 'SUP001',
    supplierName: 'ABC Metals Inc',
    storageLocation: 'WH-A-05',
    batchTracking: true,
    status: 'Active',
    notes: ''
  },
  {
    code: 'MAT-004',
    name: 'Paint - Blue RAL5015',
    description: 'Industrial paint, blue color RAL5015',
    category: 'Consumable',
    unit: 'L',
    standardCost: 28.00,
    leadTimeDays: 5,
    minStock: 50,
    maxStock: 200,
    reorderPoint: 100,
    supplierCode: 'SUP004',
    supplierName: 'Premium Materials',
    storageLocation: 'WH-C-08',
    batchTracking: true,
    status: 'Active',
    notes: 'Flammable - store in designated area'
  },
  {
    code: 'MAT-005',
    name: 'Cardboard Box 30x30x30',
    description: 'Corrugated cardboard shipping box',
    category: 'Packaging',
    unit: 'PCS',
    standardCost: 1.50,
    leadTimeDays: 3,
    minStock: 200,
    maxStock: 1000,
    reorderPoint: 400,
    supplierCode: 'SUP005',
    supplierName: 'Local Supplier A',
    storageLocation: 'WH-D-01',
    batchTracking: false,
    status: 'Active',
    notes: ''
  },
  {
    code: 'MAT-006',
    name: 'Hydraulic Oil ISO 46',
    description: 'Hydraulic oil ISO VG 46',
    category: 'Consumable',
    unit: 'L',
    standardCost: 8.50,
    leadTimeDays: 7,
    minStock: 100,
    maxStock: 500,
    reorderPoint: 200,
    supplierCode: 'SUP004',
    supplierName: 'Premium Materials',
    storageLocation: 'WH-C-12',
    batchTracking: true,
    status: 'Active',
    notes: 'Check expiry date'
  },
];

const MaterialsMasterData = () => {
  const [materials, setMaterials] = useState(INITIAL_MATERIALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedMaterials, setExpandedMaterials] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [viewMode, setViewMode] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: 'Raw Material',
    unit: 'PCS',
    standardCost: 0,
    leadTimeDays: 0,
    minStock: 0,
    maxStock: 0,
    reorderPoint: 0,
    supplierCode: '',
    storageLocation: '',
    batchTracking: false,
    status: 'Active',
    notes: ''
  });

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-700',
      'Inactive': 'bg-gray-100 text-gray-700',
      'Discontinued': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Raw Material': 'bg-blue-100 text-blue-700',
      'Component': 'bg-purple-100 text-purple-700',
      'Subassembly': 'bg-indigo-100 text-indigo-700',
      'Packaging': 'bg-orange-100 text-orange-700',
      'Consumable': 'bg-yellow-100 text-yellow-700',
      'Tool': 'bg-gray-100 text-gray-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || material.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || material.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const toggleMaterialExpand = (code) => {
    setExpandedMaterials(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const openCreateModal = () => {
    setFormData({
      code: `MAT-${String(materials.length + 1).padStart(3, '0')}`,
      name: '',
      description: '',
      category: 'Raw Material',
      unit: 'PCS',
      standardCost: 0,
      leadTimeDays: 0,
      minStock: 0,
      maxStock: 0,
      reorderPoint: 0,
      supplierCode: '',
      storageLocation: '',
      batchTracking: false,
      status: 'Active',
      notes: ''
    });
    setEditingMaterial(null);
    setViewMode('edit');
    setIsModalOpen(true);
  };

  const openEditModal = (material) => {
    setFormData({ ...material });
    setEditingMaterial(material);
    setViewMode('edit');
    setIsModalOpen(true);
  };

  const openViewModal = (material) => {
    setEditingMaterial(material);
    setViewMode('view');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
    setViewMode(null);
  };

  const handleSaveMaterial = () => {
    if (!formData.code || !formData.name || !formData.category) {
      alert('Please fill in required fields: Code, Name, and Category');
      return;
    }

    if (formData.standardCost < 0 || formData.leadTimeDays < 0) {
      alert('Cost and lead time cannot be negative');
      return;
    }

    const supplier = SUPPLIERS.find(s => s.code === formData.supplierCode);

    const newMaterial = {
      ...formData,
      supplierName: supplier?.name || ''
    };

    if (editingMaterial) {
      setMaterials(materials.map(m => m.code === editingMaterial.code ? newMaterial : m));
    } else {
      setMaterials([...materials, newMaterial]);
    }
    closeModal();
  };

  const handleDeleteMaterial = (code) => {
    if (confirm(`Are you sure you want to delete material ${code}?`)) {
      setMaterials(materials.filter(m => m.code !== code));
    }
  };

  const calculateStockStatus = (material) => {
    // Simulated current stock for demo
    const currentStock = Math.floor(Math.random() * (material.maxStock - material.minStock) + material.minStock);

    if (currentStock <= material.reorderPoint) return { status: 'Low', color: 'text-red-600', stock: currentStock };
    if (currentStock <= material.minStock * 1.2) return { status: 'Medium', color: 'text-yellow-600', stock: currentStock };
    return { status: 'Good', color: 'text-green-600', stock: currentStock };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Materials Master Data</h1>
                <p className="text-sm text-gray-500 mt-1">Manage raw materials, components, and supplies</p>
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
                  New Material
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search materials..."
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
                {MATERIAL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
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
                <option value="Discontinued">Discontinued</option>
              </select>
            </div>
          </div>
        } 
      />

      {/* Materials List */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-12">
              <Box size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
              <p className="text-gray-500 mb-4">Create your first material to get started</p>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Material
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMaterials.map(material => {
                const isExpanded = expandedMaterials[material.code];
                const stockStatus = calculateStockStatus(material);

                return (
                  <div key={material.code} className="hover:bg-gray-50 transition-colors">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <button
                            onClick={() => toggleMaterialExpand(material.code)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{material.name}</h3>
                              <span className="text-sm text-gray-500">({material.code})</span>
                              <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(material.category)}`}>
                                {material.category}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(material.status)}`}>
                                {material.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Package size={14} />
                                <span>{material.unit}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign size={14} />
                                <span>${material.standardCost.toFixed(2)}/{material.unit}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>Lead time: {material.leadTimeDays} days</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp size={14} />
                                <span className={stockStatus.color}>Stock: {stockStatus.status}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openViewModal(material)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="View Details"
                          >
                            <Eye size={18} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => openEditModal(material)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="Edit Material"
                          >
                            <Edit size={18} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(material.code)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="Delete Material"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 ml-12 grid grid-cols-3 gap-6">
                          <div className="border border-gray-200 rounded-lg p-4 bg-white">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-500">Description:</span>
                                <div className="text-gray-900">{material.description}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Storage Location:</span>
                                <div className="text-gray-900">{material.storageLocation}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Batch Tracking:</span>
                                <div className="text-gray-900">{material.batchTracking ? 'Yes' : 'No'}</div>
                              </div>
                            </div>
                          </div>

                          <div className="border border-gray-200 rounded-lg p-4 bg-white">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Stock Levels</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-500">Min Stock:</span>
                                <div className="text-gray-900">{material.minStock} {material.unit}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Max Stock:</span>
                                <div className="text-gray-900">{material.maxStock} {material.unit}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Reorder Point:</span>
                                <div className="text-gray-900">{material.reorderPoint} {material.unit}</div>
                              </div>
                              <div className="pt-2 border-t">
                                <span className="text-gray-500">Current Stock (Demo):</span>
                                <div className={`font-semibold ${stockStatus.color}`}>
                                  {stockStatus.stock} {material.unit} - {stockStatus.status}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border border-gray-200 rounded-lg p-4 bg-white">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Supplier Information</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-500">Supplier:</span>
                                <div className="text-gray-900">{material.supplierName}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Supplier Code:</span>
                                <div className="text-gray-900">{material.supplierCode}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Lead Time:</span>
                                <div className="text-gray-900">{material.leadTimeDays} days</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Standard Cost:</span>
                                <div className="text-gray-900">${material.standardCost.toFixed(2)}</div>
                              </div>
                            </div>
                          </div>

                          {material.notes && (
                            <div className="col-span-3 border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                              <div className="flex items-start gap-2">
                                <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium text-yellow-900 mb-1">Notes</div>
                                  <div className="text-sm text-yellow-800">{material.notes}</div>
                                </div>
                              </div>
                            </div>
                          )}
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
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {viewMode === 'view' ? 'Material Details' : editingMaterial ? 'Edit Material' : 'Create New Material'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {viewMode === 'view' && editingMaterial ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Material Code</label>
                      <p className="mt-1 text-lg font-semibold">{editingMaterial.code}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-gray-900">{editingMaterial.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <p className="mt-1">
                        <span className={`text-sm px-3 py-1 rounded ${getCategoryColor(editingMaterial.category)}`}>
                          {editingMaterial.category}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Unit</label>
                      <p className="mt-1 text-gray-900">{editingMaterial.unit}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Standard Cost</label>
                      <p className="mt-1 text-gray-900">${editingMaterial.standardCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1">
                        <span className={`text-sm px-3 py-1 rounded ${getStatusColor(editingMaterial.status)}`}>
                          {editingMaterial.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-gray-900">{editingMaterial.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Stock Parameters</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min Stock:</span>
                          <span className="font-medium">{editingMaterial.minStock} {editingMaterial.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Stock:</span>
                          <span className="font-medium">{editingMaterial.maxStock} {editingMaterial.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reorder Point:</span>
                          <span className="font-medium">{editingMaterial.reorderPoint} {editingMaterial.unit}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Supplier Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Supplier:</span>
                          <span className="font-medium">{editingMaterial.supplierName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lead Time:</span>
                          <span className="font-medium">{editingMaterial.leadTimeDays} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Storage:</span>
                          <span className="font-medium">{editingMaterial.storageLocation}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {editingMaterial.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notes</label>
                      <p className="mt-1 text-gray-900 p-3 bg-gray-50 rounded">{editingMaterial.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Material Code *</label>
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly={!!editingMaterial}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Category *</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {MATERIAL_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Unit of Measure *</label>
                        <select
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {UNITS.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Standard Cost *</label>
                        <input
                          type="number"
                          value={formData.standardCost}
                          onChange={(e) => setFormData({ ...formData, standardCost: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Status *</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Discontinued">Discontinued</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Stock Management */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Management</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Min Stock Level</label>
                        <input
                          type="number"
                          value={formData.minStock}
                          onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Max Stock Level</label>
                        <input
                          type="number"
                          value={formData.maxStock}
                          onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Reorder Point</label>
                        <input
                          type="number"
                          value={formData.reorderPoint}
                          onChange={(e) => setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Storage Location</label>
                        <input
                          type="text"
                          value={formData.storageLocation}
                          onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., WH-A-01"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 mt-8">
                          <input
                            type="checkbox"
                            checked={formData.batchTracking}
                            onChange={(e) => setFormData({ ...formData, batchTracking: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Enable Batch/Lot Tracking</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Primary Supplier</label>
                        <select
                          value={formData.supplierCode}
                          onChange={(e) => setFormData({ ...formData, supplierCode: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Supplier</option>
                          {SUPPLIERS.map(supplier => (
                            <option key={supplier.code} value={supplier.code}>
                              {supplier.name} ({supplier.code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Lead Time (Days)</label>
                        <input
                          type="number"
                          value={formData.leadTimeDays}
                          onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Storage requirements, handling instructions, etc."
                    />
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <div className="font-medium mb-1">Material Configuration Tips</div>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Set reorder point between min and max stock levels</li>
                          <li>Enable batch tracking for materials requiring traceability</li>
                          <li>Include storage location for efficient warehouse management</li>
                          <li>Add notes for special handling or safety requirements</li>
                        </ul>
                      </div>
                    </div>
                  </div>
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
                  Edit Material
                </button>
              ) : (
                <button
                  onClick={handleSaveMaterial}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Material
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsMasterData;