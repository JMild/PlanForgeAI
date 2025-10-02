"use client";

import React, { useState, ChangeEvent, FC } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, Download, Upload, Package,
  Save, X, ChevronDown, ChevronRight, Box, AlertCircle, Clock,
  TrendingUp, DollarSign,
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// --- CONSTANTS & TYPE DEFINITIONS ---

const MATERIAL_CATEGORIES = [
  'Raw Material', 'Component', 'Subassembly', 'Packaging', 'Consumable', 'Tool'
] as const;
const UNITS = ['PCS', 'KG', 'M', 'L', 'SET', 'BOX', 'ROLL'] as const;
const STATUSES = ['Active', 'Inactive', 'Discontinued'] as const;

type MaterialCategory = typeof MATERIAL_CATEGORIES[number];
type Unit = typeof UNITS[number];
type Status = typeof STATUSES[number];

type Supplier = {
  code: string;
  name: string;
};

type Material = {
  code: string;
  name: string;
  description: string;
  category: MaterialCategory;
  unit: Unit;
  standardCost: number;
  leadTimeDays: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  supplierCode: string;
  supplierName: string;
  storageLocation: string;
  batchTracking: boolean;
  status: Status;
  notes: string;
};

type StockStatusInfo = {
  status: 'Low' | 'Medium' | 'Good';
  color: string;
  stock: number;
};

// --- SAMPLE DATA ---

const SUPPLIERS: Supplier[] = [
  { code: 'SUP001', name: 'ABC Metals Inc' },
  { code: 'SUP002', name: 'XYZ Components Ltd' },
  { code: 'SUP003', name: 'Global Parts Co' },
  { code: 'SUP004', name: 'Premium Materials' },
  { code: 'SUP005', name: 'Local Supplier A' },
];

const INITIAL_MATERIALS: Material[] = [
  {
    code: 'MAT-001', name: 'Steel Sheet 2mm', description: 'Cold rolled steel sheet, 2mm thickness', category: 'Raw Material', unit: 'KG', standardCost: 45.50, leadTimeDays: 7, minStock: 500, maxStock: 2000, reorderPoint: 800, supplierCode: 'SUP001', supplierName: 'ABC Metals Inc', storageLocation: 'WH-A-01', batchTracking: true, status: 'Active', notes: 'Store in dry area'
  },
  {
    code: 'MAT-002', name: 'Bearing 608ZZ', description: '608ZZ Deep groove ball bearing', category: 'Component', unit: 'PCS', standardCost: 2.80, leadTimeDays: 14, minStock: 100, maxStock: 500, reorderPoint: 200, supplierCode: 'SUP002', supplierName: 'XYZ Components Ltd', storageLocation: 'WH-B-12', batchTracking: false, status: 'Active', notes: ''
  },
  {
    code: 'MAT-003', name: 'Aluminum Rod 10mm', description: 'Aluminum 6061-T6 round rod, 10mm diameter', category: 'Raw Material', unit: 'M', standardCost: 12.30, leadTimeDays: 10, minStock: 200, maxStock: 1000, reorderPoint: 400, supplierCode: 'SUP001', supplierName: 'ABC Metals Inc', storageLocation: 'WH-A-05', batchTracking: true, status: 'Active', notes: ''
  },
  {
    code: 'MAT-004', name: 'Paint - Blue RAL5015', description: 'Industrial paint, blue color RAL5015', category: 'Consumable', unit: 'L', standardCost: 28.00, leadTimeDays: 5, minStock: 50, maxStock: 200, reorderPoint: 100, supplierCode: 'SUP004', supplierName: 'Premium Materials', storageLocation: 'WH-C-08', batchTracking: true, status: 'Active', notes: 'Flammable - store in designated area'
  },
  {
    code: 'MAT-005', name: 'Cardboard Box 30x30x30', description: 'Corrugated cardboard shipping box', category: 'Packaging', unit: 'PCS', standardCost: 1.50, leadTimeDays: 3, minStock: 200, maxStock: 1000, reorderPoint: 400, supplierCode: 'SUP005', supplierName: 'Local Supplier A', storageLocation: 'WH-D-01', batchTracking: false, status: 'Active', notes: ''
  },
  {
    code: 'MAT-006', name: 'Hydraulic Oil ISO 46', description: 'Hydraulic oil ISO VG 46', category: 'Consumable', unit: 'L', standardCost: 8.50, leadTimeDays: 7, minStock: 100, maxStock: 500, reorderPoint: 200, supplierCode: 'SUP004', supplierName: 'Premium Materials', storageLocation: 'WH-C-12', batchTracking: true, status: 'Active', notes: 'Check expiry date'
  },
];


const MaterialsMasterData: FC = () => {
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<MaterialCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [expandedMaterials, setExpandedMaterials] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit' | null>(null);

  const initialFormData: Omit<Material, 'supplierName'> = {
    code: '', name: '', description: '', category: 'Raw Material', unit: 'PCS', standardCost: 0, leadTimeDays: 0, minStock: 0, maxStock: 0, reorderPoint: 0, supplierCode: '', storageLocation: '', batchTracking: false, status: 'Active', notes: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const getStatusColor = (status: Status): string => {
    const colors: Record<Status, string> = {
      'Active': 'bg-green-100 text-green-700',
      'Inactive': 'bg-gray-100 text-gray-700',
      'Discontinued': 'bg-red-100 text-red-700',
    };
    return colors[status];
  };

  const getCategoryColor = (category: MaterialCategory): string => {
    const colors: Record<MaterialCategory, string> = {
      'Raw Material': 'bg-blue-100 text-blue-700',
      'Component': 'bg-purple-100 text-purple-700',
      'Subassembly': 'bg-indigo-100 text-indigo-700',
      'Packaging': 'bg-orange-100 text-orange-700',
      'Consumable': 'bg-yellow-100 text-yellow-700',
      'Tool': 'bg-gray-100 text-gray-700',
    };
    return colors[category];
  };

  const filteredMaterials = materials.filter((material) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = material.code.toLowerCase().includes(searchLower) ||
      material.name.toLowerCase().includes(searchLower) ||
      material.description.toLowerCase().includes(searchLower);
    const matchesCategory = filterCategory === 'all' || material.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || material.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const toggleMaterialExpand = (code: string) => {
    setExpandedMaterials(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const openCreateModal = () => {
    setFormData({
      ...initialFormData,
      code: `MAT-${String(materials.length + 1).padStart(3, '0')}`,
      supplierCode: SUPPLIERS.length > 0 ? SUPPLIERS[0].code : '',
    });
    setEditingMaterial(null);
    setViewMode('edit');
    setIsModalOpen(true);
  };

  const openEditModal = (material: Material) => {
    setFormData({ ...material });
    setEditingMaterial(material);
    setViewMode('edit');
    setIsModalOpen(true);
  };

  const openViewModal = (material: Material) => {
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

    if (formData.standardCost < 0 || formData.leadTimeDays < 0 || formData.minStock < 0 || formData.maxStock < 0 || formData.reorderPoint < 0) {
      alert('Numeric values cannot be negative.');
      return;
    }
    
    if (formData.minStock > formData.maxStock) {
        alert('Min Stock cannot be greater than Max Stock.');
        return;
    }

    const supplier = SUPPLIERS.find(s => s.code === formData.supplierCode);
    const newMaterial: Material = {
      ...formData,
      supplierName: supplier?.name || 'N/A'
    };

    if (editingMaterial) {
      setMaterials(materials.map(m => m.code === editingMaterial.code ? newMaterial : m));
    } else {
      setMaterials([...materials, newMaterial]);
    }
    closeModal();
  };

  const handleDeleteMaterial = (code: string) => {
    if (window.confirm(`Are you sure you want to delete material ${code}?`)) {
      setMaterials(materials.filter(m => m.code !== code));
    }
  };

  const calculateStockStatus = (material: Material): StockStatusInfo => {
    // Simulated current stock for demo
    const currentStock = Math.floor(Math.random() * (material.maxStock + 1));

    if (currentStock <= material.reorderPoint) return { status: 'Low', color: 'text-red-600', stock: currentStock };
    if (currentStock < material.minStock) return { status: 'Medium', color: 'text-yellow-600', stock: currentStock };
    return { status: 'Good', color: 'text-green-600', stock: currentStock };
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;
    
    const isNumber = type === 'number';
    const numValue = isNumber ? parseFloat(value) || 0 : undefined;

    setFormData(prev => ({
        ...prev,
        [name]: isCheckbox ? checked : (isNumber ? numValue : value)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Materials Master Data</h1>
                <p className="text-sm text-gray-500 mt-1">Manage raw materials, components, and supplies</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"><Upload size={18} /> Import</button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"><Download size={18} /> Export</button>
                <button onClick={openCreateModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><Plus size={18} /> New Material</button>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search materials by code, name..." value={searchTerm} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <select value={filterCategory} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.target.value as MaterialCategory | 'all')} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Categories</option>
                {MATERIAL_CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
              <select value={filterStatus} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as Status | 'all')} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Status</option>
                {STATUSES.map(stat => (<option key={stat} value={stat}>{stat}</option>))}
              </select>
            </div>
          </div>
        }
      />

      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-12">
              <Box size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or create a new material.</p>
              <button onClick={openCreateModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Material</button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMaterials.map((material) => {
                const isExpanded = !!expandedMaterials[material.code];
                const stockStatus = calculateStockStatus(material);
                return (
                  <div key={material.code} className="hover:bg-gray-50 transition-colors">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <button onClick={() => toggleMaterialExpand(material.code)} className="p-1 hover:bg-gray-200 rounded-full">{isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}</button>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{material.name}</h3>
                            <span className="text-sm text-gray-500">({material.code})</span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(material.category)}`}>{material.category}</span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(material.status)}`}>{material.status}</span>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5"><Package size={14} /><span>{material.unit}</span></div>
                            <div className="flex items-center gap-1.5"><DollarSign size={14} /><span>${material.standardCost.toFixed(2)}/{material.unit}</span></div>
                            <div className="flex items-center gap-1.5"><Clock size={14} /><span>Lead time: {material.leadTimeDays} days</span></div>
                            <div className="flex items-center gap-1.5"><TrendingUp size={14} /><span className={stockStatus.color}>Stock: {stockStatus.status}</span></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openViewModal(material)} className="p-2 hover:bg-gray-200 rounded" title="View Details"><Eye size={18} className="text-gray-600" /></button>
                        <button onClick={() => openEditModal(material)} className="p-2 hover:bg-gray-200 rounded" title="Edit Material"><Edit size={18} className="text-blue-600" /></button>
                        <button onClick={() => handleDeleteMaterial(material.code)} className="p-2 hover:bg-gray-200 rounded" title="Delete Material"><Trash2 size={18} className="text-red-600" /></button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="pb-4 px-4 ml-12 grid grid-cols-3 gap-6">
                        <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-2 text-sm"><h4 className="font-semibold text-gray-700 mb-1">Description</h4><p>{material.description || 'N/A'}</p></div>
                        <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-2 text-sm"><h4 className="font-semibold text-gray-700 mb-1">Stock Levels</h4><div>Min: {material.minStock} / Max: {material.maxStock} / Reorder: {material.reorderPoint} {material.unit}</div><div className={`font-semibold ${stockStatus.color}`}>Current (Demo): {stockStatus.stock} {material.unit}</div></div>
                        <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-2 text-sm"><h4 className="font-semibold text-gray-700 mb-1">Supplier</h4><p>{material.supplierName} ({material.supplierCode})</p><p>Location: {material.storageLocation}</p></div>
                        {material.notes && (<div className="col-span-3 border border-yellow-200 rounded-lg p-4 bg-yellow-50 flex items-start gap-2"><AlertCircle size={16} className="text-yellow-600 mt-0.5" /><div className="text-sm"><div className="font-medium text-yellow-900">Notes</div><div className="text-yellow-800">{material.notes}</div></div></div>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between"><h2 className="text-xl font-semibold text-gray-900">{viewMode === 'view' ? 'Material Details' : editingMaterial ? 'Edit Material' : 'Create New Material'}</h2><button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button></div>
            <div className="flex-1 overflow-y-auto p-6">
              {viewMode === 'view' && editingMaterial ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-6"><p><label className="text-sm text-gray-500">Code</label><span className="block mt-1 text-lg font-semibold">{editingMaterial.code}</span></p><p><label className="text-sm text-gray-500">Name</label><span className="block mt-1">{editingMaterial.name}</span></p><p><label className="text-sm text-gray-500">Category</label><span className={`block mt-1 text-xs font-medium px-2 py-1 rounded-full w-fit ${getCategoryColor(editingMaterial.category)}`}>{editingMaterial.category}</span></p></div>
                    <p><label className="text-sm text-gray-500">Description</label><span className="block mt-1">{editingMaterial.description}</span></p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-4 border rounded-lg"><h3 className="col-span-2 text-md font-semibold mb-2">Details</h3><p><label className="text-sm text-gray-500">Unit</label><span className="block mt-1">{editingMaterial.unit}</span></p><p><label className="text-sm text-gray-500">Standard Cost</label><span className="block mt-1">${editingMaterial.standardCost.toFixed(2)}</span></p><p><label className="text-sm text-gray-500">Lead Time</label><span className="block mt-1">{editingMaterial.leadTimeDays} days</span></p><p><label className="text-sm text-gray-500">Supplier</label><span className="block mt-1">{editingMaterial.supplierName}</span></p><p><label className="text-sm text-gray-500">Min/Max Stock</label><span className="block mt-1">{editingMaterial.minStock} / {editingMaterial.maxStock} {editingMaterial.unit}</span></p><p><label className="text-sm text-gray-500">Reorder Point</label><span className="block mt-1">{editingMaterial.reorderPoint} {editingMaterial.unit}</span></p></div>
                    {editingMaterial.notes && <p className="p-3 bg-yellow-50 rounded-lg"><label className="text-sm font-semibold text-yellow-800">Notes</label><span className="block mt-1 text-yellow-700">{editingMaterial.notes}</span></p>}
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-sm font-medium text-gray-700 block mb-2">Material Code *</label><input type="text" name="code" value={formData.code} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100" readOnly={!!editingMaterial}/></div>
                      <div><label className="text-sm font-medium text-gray-700 block mb-2">Name *</label><input type="text" name="name" value={formData.name} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required /></div>
                      <div className="col-span-2"><label className="text-sm font-medium text-gray-700 block mb-2">Description</label><textarea name="description" value={formData.description} onChange={handleFormChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
                      <div><label className="text-sm font-medium text-gray-700 block mb-2">Category *</label><select name="category" value={formData.category} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">{MATERIAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                      <div><label className="text-sm font-medium text-gray-700 block mb-2">Unit of Measure *</label><select name="unit" value={formData.unit} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
                      <div><label className="text-sm font-medium text-gray-700 block mb-2">Standard Cost *</label><input type="number" name="standardCost" value={formData.standardCost} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="0" step="0.01" /></div>
                      <div><label className="text-sm font-medium text-gray-700 block mb-2">Status *</label><select name="status" value={formData.status} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock & Supplier</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div><label className="text-sm font-medium text-gray-700 block mb-2">Min Stock Level</label><input type="number" name="minStock" value={formData.minStock} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="0" /></div>
                      <div><label className="text-sm font-medium text-gray-700 block mb-2">Max Stock Level</label><input type="number" name="maxStock" value={formData.maxStock} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="0" /></div>
                      <div><label className="text-sm font-medium text-gray-700 block mb-2">Reorder Point</label><input type="number" name="reorderPoint" value={formData.reorderPoint} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="0" /></div>
                      <div className="col-span-2"><label className="text-sm font-medium text-gray-700 block mb-2">Supplier *</label><select name="supplierCode" value={formData.supplierCode} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">{SUPPLIERS.map(s=><option key={s.code} value={s.code}>{s.name}</option>)}</select></div>
                      <div><label className="text-sm font-medium text-gray-700 block mb-2">Lead Time (days)</label><input type="number" name="leadTimeDays" value={formData.leadTimeDays} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="0" /></div>
                      <div className="col-span-3"><label className="text-sm font-medium text-gray-700 block mb-2">Storage Location</label><input type="text" name="storageLocation" value={formData.storageLocation} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
                      <div className="col-span-3"><label className="flex items-center gap-2"><input type="checkbox" name="batchTracking" checked={formData.batchTracking} onChange={handleFormChange} className="h-4 w-4 rounded border-gray-300" /> <span className="text-sm font-medium text-gray-700">Enable Batch Tracking</span></label></div>
                      <div className="col-span-3"><label className="text-sm font-medium text-gray-700 block mb-2">Notes</label><textarea name="notes" value={formData.notes} onChange={handleFormChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {viewMode !== 'view' && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveMaterial} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><Save size={18} />Save Changes</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsMasterData;