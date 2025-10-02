"use client";
import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Save, X, Upload, Download, Package, AlertTriangle, TrendingUp, TrendingDown, MapPin, BarChart3, LayoutGrid, Table, Settings } from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// Types
type InventoryItem = {
  materialCode: string;
  materialName: string;
  category: 'Raw Material' | 'Component' | 'WIP' | 'Finished Goods' | 'Consumable';
  unit: string;
  onHand: number;
  reserved: number;
  available: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  location: string;
  warehouse: string;
  lotNumber?: string;
  expiryDate?: string;
  unitCost: number;
  totalValue: number;
  lastUpdated: string;
  supplier?: string;
  leadTimeDays: number;
};

// type StockMovement = {
//   id: string;
//   materialCode: string;
//   type: 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER';
//   quantity: number;
//   fromLocation?: string;
//   toLocation?: string;
//   reference: string;
//   timestamp: string;
//   user: string;
// };

// Sample Data
const initialInventory: InventoryItem[] = [
  {
    materialCode: 'M001',
    materialName: 'Steel Plate 5mm',
    category: 'Raw Material',
    unit: 'KG',
    onHand: 5420,
    reserved: 1200,
    available: 4220,
    minStock: 2000,
    maxStock: 8000,
    reorderPoint: 3000,
    location: 'A-01-01',
    warehouse: 'Main Warehouse',
    lotNumber: 'LOT-2025-001',
    unitCost: 45.50,
    totalValue: 246610,
    lastUpdated: '2025-10-02T08:30:00',
    supplier: 'Steel Corp Ltd',
    leadTimeDays: 7
  },
  {
    materialCode: 'M002',
    materialName: 'Bearing Type-A',
    category: 'Component',
    unit: 'PCS',
    onHand: 850,
    reserved: 320,
    available: 530,
    minStock: 500,
    maxStock: 2000,
    reorderPoint: 600,
    location: 'B-02-05',
    warehouse: 'Main Warehouse',
    lotNumber: 'LOT-2025-045',
    unitCost: 125.00,
    totalValue: 106250,
    lastUpdated: '2025-10-02T09:15:00',
    supplier: 'Bearing Solutions Inc',
    leadTimeDays: 14
  },
  {
    materialCode: 'M003',
    materialName: 'Bolt M8x20',
    category: 'Component',
    unit: 'PCS',
    onHand: 15600,
    reserved: 2400,
    available: 13200,
    minStock: 5000,
    maxStock: 20000,
    reorderPoint: 8000,
    location: 'C-01-08',
    warehouse: 'Main Warehouse',
    unitCost: 2.50,
    totalValue: 39000,
    lastUpdated: '2025-10-01T16:45:00',
    supplier: 'Fasteners Co',
    leadTimeDays: 5
  },
  {
    materialCode: 'M004',
    materialName: 'Aluminum Block',
    category: 'Raw Material',
    unit: 'PCS',
    onHand: 340,
    reserved: 150,
    available: 190,
    minStock: 200,
    maxStock: 800,
    reorderPoint: 300,
    location: 'A-03-02',
    warehouse: 'Main Warehouse',
    lotNumber: 'LOT-2025-012',
    unitCost: 180.00,
    totalValue: 61200,
    lastUpdated: '2025-10-02T07:20:00',
    supplier: 'Aluminum Industries',
    leadTimeDays: 10
  },
  {
    materialCode: 'M005',
    materialName: 'Gasket Seal',
    category: 'Component',
    unit: 'PCS',
    onHand: 2850,
    reserved: 580,
    available: 2270,
    minStock: 1000,
    maxStock: 5000,
    reorderPoint: 1500,
    location: 'B-04-12',
    warehouse: 'Main Warehouse',
    unitCost: 8.75,
    totalValue: 24937.50,
    lastUpdated: '2025-10-02T10:00:00',
    supplier: 'Seals & Gaskets Ltd',
    leadTimeDays: 7
  },
  {
    materialCode: 'P001',
    materialName: 'Gear Assembly A',
    category: 'Finished Goods',
    unit: 'PCS',
    onHand: 450,
    reserved: 180,
    available: 270,
    minStock: 100,
    maxStock: 800,
    reorderPoint: 150,
    location: 'FG-01-05',
    warehouse: 'Finished Goods Warehouse',
    lotNumber: 'FG-2025-089',
    unitCost: 450.00,
    totalValue: 202500,
    lastUpdated: '2025-10-02T11:30:00',
    leadTimeDays: 0
  },
  {
    materialCode: 'C001',
    materialName: 'Cutting Oil',
    category: 'Consumable',
    unit: 'L',
    onHand: 680,
    reserved: 0,
    available: 680,
    minStock: 300,
    maxStock: 1000,
    reorderPoint: 400,
    location: 'CONS-01',
    warehouse: 'Consumables Store',
    unitCost: 12.50,
    totalValue: 8500,
    lastUpdated: '2025-10-01T14:20:00',
    supplier: 'Lubricants Supply Co',
    leadTimeDays: 3
  },
  {
    materialCode: 'M006',
    materialName: 'Hydraulic Valve',
    category: 'Component',
    unit: 'PCS',
    onHand: 45,
    reserved: 12,
    available: 33,
    minStock: 50,
    maxStock: 150,
    reorderPoint: 60,
    location: 'B-05-03',
    warehouse: 'Main Warehouse',
    lotNumber: 'LOT-2025-078',
    unitCost: 320.00,
    totalValue: 14400,
    lastUpdated: '2025-10-02T08:45:00',
    supplier: 'Hydraulic Systems Inc',
    leadTimeDays: 21
  },
];

// const sampleMovements: StockMovement[] = [
//   {
//     id: 'MOV001',
//     materialCode: 'M001',
//     type: 'IN',
//     quantity: 1000,
//     toLocation: 'A-01-01',
//     reference: 'PO-2025-123',
//     timestamp: '2025-10-02T08:30:00',
//     user: 'John Smith'
//   },
//   {
//     id: 'MOV002',
//     materialCode: 'M002',
//     type: 'OUT',
//     quantity: 120,
//     fromLocation: 'B-02-05',
//     reference: 'WO-2025-456',
//     timestamp: '2025-10-02T09:15:00',
//     user: 'Sarah Johnson'
//   },
//   {
//     id: 'MOV003',
//     materialCode: 'P001',
//     type: 'IN',
//     quantity: 50,
//     toLocation: 'FG-01-05',
//     reference: 'PROD-2025-789',
//     timestamp: '2025-10-02T11:30:00',
//     user: 'Mike Chen'
//   },
// ];

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  // const [movements] = useState<StockMovement[]>(sampleMovements);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterWarehouse, setFilterWarehouse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'ok' | 'high'>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  // const [showMovements, setShowMovements] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Form State
  const [itemForm, setItemForm] = useState<Partial<InventoryItem>>({
    materialCode: '',
    materialName: '',
    category: 'Raw Material',
    unit: 'PCS',
    onHand: 0,
    reserved: 0,
    available: 0,
    minStock: 0,
    maxStock: 0,
    reorderPoint: 0,
    location: '',
    warehouse: 'Main Warehouse',
    unitCost: 0,
    totalValue: 0,
    leadTimeDays: 7,
  });

  // Get unique values for filters
  const warehouses = useMemo(() => {
    const wh = new Set(inventory.map(i => i.warehouse));
    return Array.from(wh).sort();
  }, [inventory]);

  // Calculate available and total value
  const calculateDerived = (item: Partial<InventoryItem>) => {
    const available = (item.onHand || 0) - (item.reserved || 0);
    const totalValue = (item.onHand || 0) * (item.unitCost || 0);
    return { available, totalValue };
  };

  // Filter inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch =
        item.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.materialName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesWarehouse = filterWarehouse === 'all' || item.warehouse === filterWarehouse;

      let matchesStatus = true;
      if (filterStatus === 'low') {
        matchesStatus = item.available <= item.reorderPoint;
      } else if (filterStatus === 'ok') {
        matchesStatus = item.available > item.reorderPoint && item.available <= item.maxStock;
      } else if (filterStatus === 'high') {
        matchesStatus = item.available > item.maxStock;
      }

      return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus;
    });
  }, [inventory, searchTerm, filterCategory, filterWarehouse, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStock = inventory.filter(item => item.available <= item.reorderPoint).length;
    const outOfStock = inventory.filter(item => item.available <= 0).length;
    const totalItems = inventory.length;
    return { totalValue, lowStock, outOfStock, totalItems };
  }, [inventory]);

  // Handlers
  const handleAdd = () => {
    setItemForm({
      materialCode: '',
      materialName: '',
      category: 'Raw Material',
      unit: 'PCS',
      onHand: 0,
      reserved: 0,
      available: 0,
      minStock: 0,
      maxStock: 0,
      reorderPoint: 0,
      location: '',
      warehouse: 'Main Warehouse',
      unitCost: 0,
      totalValue: 0,
      leadTimeDays: 7,
    });
    setSelectedItem(null);
    setIsEditing(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setItemForm(item);
    setSelectedItem(item);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!itemForm.materialCode || !itemForm.materialName) {
      alert('Material code and name are required');
      return;
    }

    const derived = calculateDerived(itemForm);
    const itemData = {
      ...itemForm,
      available: derived.available,
      totalValue: derived.totalValue,
      lastUpdated: new Date().toISOString(),
    } as InventoryItem;

    if (selectedItem) {
      setInventory(inventory.map(item =>
        item.materialCode === selectedItem.materialCode ? itemData : item
      ));
    } else {
      setInventory([...inventory, itemData]);
    }
    setIsEditing(false);
    setSelectedItem(null);
  };

  const handleDelete = (code: string) => {
    if (confirm(`Delete inventory item ${code}?`)) {
      setInventory(inventory.filter(item => item.materialCode !== code));
    }
  };

  const handleFormChange = (field: keyof InventoryItem, value: unknown) => {
    const updated = { ...itemForm, [field]: value };
    const derived = calculateDerived(updated);
    setItemForm({
      ...updated,
      available: derived.available,
      totalValue: derived.totalValue,
    });
  };

  const getStockStatus = (
    item: InventoryItem
  ): { status: string; color: string; icon: React.ReactNode } => {
    if (item.available <= 0) {
      return {
        status: "Out of Stock",
        color: "text-red-600 bg-red-100",
        icon: <AlertTriangle className="w-4 h-4" />,
      };
    } else if (item.available <= item.reorderPoint) {
      return {
        status: "Low Stock",
        color: "text-orange-600 bg-orange-100",
        icon: <TrendingDown className="w-4 h-4" />,
      };
    } else if (item.available > item.maxStock) {
      return {
        status: "Overstock",
        color: "text-purple-600 bg-purple-100",
        icon: <TrendingUp className="w-4 h-4" />,
      };
    } else {
      return {
        status: "Normal",
        color: "text-green-600 bg-green-100",
        icon: <Package className="w-4 h-4" />,
      };
    }
  };

  const exportToCSV = () => {
    const csv = 'Material Code,Name,Category,Unit,On Hand,Reserved,Available,Min,Max,Reorder,Location,Warehouse,Unit Cost,Total Value\n' +
      inventory.map(item =>
        `${item.materialCode},${item.materialName},${item.category},${item.unit},${item.onHand},${item.reserved},${item.available},${item.minStock},${item.maxStock},${item.reorderPoint},${item.location},${item.warehouse},${item.unitCost},${item.totalValue}`
      ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
                  Inventory / On-hand Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">Master Data Management (MAS014)</p>
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
                  Add Item
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Total Items</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{stats.totalItems}</div>
                  </div>
                  <Package className="w-10 h-10 text-gray-300" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Total Value</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">
                      ${stats.totalValue.toLocaleString()}
                    </div>
                  </div>
                  <BarChart3 className="w-10 h-10 text-blue-200" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Low Stock Items</div>
                    <div className="text-2xl font-bold text-orange-600 mt-1">{stats.lowStock}</div>
                  </div>
                  <TrendingDown className="w-10 h-10 text-orange-200" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Out of Stock</div>
                    <div className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStock}</div>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-red-200" />
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Raw Material">Raw Material</option>
                <option value="Component">Component</option>
                <option value="WIP">WIP</option>
                <option value="Finished Goods">Finished Goods</option>
                <option value="Consumable">Consumable</option>
              </select>
              <select
                value={filterWarehouse}
                onChange={(e) => setFilterWarehouse(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Warehouses</option>
                {warehouses.map(wh => (
                  <option key={wh} value={wh}>{wh}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'low' | 'ok' | 'high')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="low">Low Stock</option>
                <option value="ok">Normal</option>
                <option value="high">Overstock</option>
              </select>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 ${viewMode === 'cards' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
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
        }
      />

      {/* Main Content */}
      <div className="p-6">
        {!isEditing ? (
          <>
            {/* Cards View */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item);
                  const stockPercentage = (item.available / item.maxStock) * 100;

                  return (
                    <div key={item.materialCode} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{item.materialCode}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${stockStatus.color}`}>
                                {stockStatus.icon}
                                {stockStatus.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 font-medium">{item.materialName}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.materialCode)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Category</span>
                          <span className="font-medium text-gray-900">{item.category}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center py-2 bg-gray-50 rounded">
                          <div>
                            <div className="text-xs text-gray-500">On Hand</div>
                            <div className="text-lg font-bold text-gray-900">{item.onHand}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Reserved</div>
                            <div className="text-lg font-bold text-orange-600">{item.reserved}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Available</div>
                            <div className="text-lg font-bold text-green-600">{item.available}</div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1 text-xs">
                            <span className="text-gray-500">Stock Level</span>
                            <span className="text-gray-700 font-medium">
                              {item.available} / {item.maxStock} {item.unit}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${stockPercentage <= (item.reorderPoint / item.maxStock * 100) ? 'bg-red-500' :
                                stockPercentage <= 50 ? 'bg-orange-500' :
                                  stockPercentage <= 80 ? 'bg-green-500' :
                                    'bg-purple-500'
                                }`}
                              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                            <span>Min: {item.minStock}</span>
                            <span>Reorder: {item.reorderPoint}</span>
                            <span>Max: {item.maxStock}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-200 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Location
                            </span>
                            <span className="font-medium text-gray-900">{item.location}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Warehouse</span>
                            <span className="font-medium text-gray-900">{item.warehouse}</span>
                          </div>
                          {item.lotNumber && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Lot Number</span>
                              <span className="font-medium text-gray-900">{item.lotNumber}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Total Value</span>
                            <span className="text-lg font-bold text-blue-600">
                              ${item.totalValue.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">Unit Cost: ${item.unitCost}</span>
                            <span className="text-xs text-gray-500">Lead Time: {item.leadTimeDays}d</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">On Hand</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reserved</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Available</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredInventory.map((item) => {
                        const stockStatus = getStockStatus(item);
                        return (
                          <tr key={item.materialCode} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.materialCode}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.materialName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium">
                              {item.onHand} {item.unit}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-orange-600 font-medium">
                              {item.reserved} {item.unit}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                              {item.available} {item.unit}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.location}</td>
                            <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">
                              ${item.totalValue.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${stockStatus.color}`}>
                                {stockStatus.icon}
                                {stockStatus.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:text-blue-800 mr-3"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.materialCode)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredInventory.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No inventory items found
                  </div>
                )}
              </div>
            )}

            {filteredInventory.length === 0 && viewMode === 'cards' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12 text-gray-500">
                No inventory items found
              </div>
            )}
          </>
        ) : (
          <>
            {/* Edit Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedItem ? 'Edit' : 'Add'} Inventory Item
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
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Material Code *
                      </label>
                      <input
                        type="text"
                        value={itemForm.materialCode}
                        onChange={(e) => handleFormChange('materialCode', e.target.value)}
                        disabled={!!selectedItem}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Material Name *
                      </label>
                      <input
                        type="text"
                        value={itemForm.materialName}
                        onChange={(e) => handleFormChange('materialName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={itemForm.category}
                        onChange={(e) => handleFormChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Raw Material">Raw Material</option>
                        <option value="Component">Component</option>
                        <option value="WIP">WIP</option>
                        <option value="Finished Goods">Finished Goods</option>
                        <option value="Consumable">Consumable</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit *
                      </label>
                      <select
                        value={itemForm.unit}
                        onChange={(e) => handleFormChange('unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="PCS">PCS</option>
                        <option value="KG">KG</option>
                        <option value="L">L</option>
                        <option value="M">M</option>
                        <option value="SET">SET</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Cost ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={itemForm.unitCost}
                        onChange={(e) => handleFormChange('unitCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Stock Levels */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Stock Levels
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        On Hand Quantity
                      </label>
                      <input
                        type="number"
                        value={itemForm.onHand}
                        onChange={(e) => handleFormChange('onHand', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reserved Quantity
                      </label>
                      <input
                        type="number"
                        value={itemForm.reserved}
                        onChange={(e) => handleFormChange('reserved', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Stock Level
                      </label>
                      <input
                        type="number"
                        value={itemForm.minStock}
                        onChange={(e) => handleFormChange('minStock', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reorder Point
                      </label>
                      <input
                        type="number"
                        value={itemForm.reorderPoint}
                        onChange={(e) => handleFormChange('reorderPoint', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Stock Level
                      </label>
                      <input
                        type="number"
                        value={itemForm.maxStock}
                        onChange={(e) => handleFormChange('maxStock', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700 font-medium">Available Quantity:</span>
                      <span className="text-blue-900 font-bold text-lg">
                        {itemForm.available} {itemForm.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-blue-700 font-medium">Total Value:</span>
                      <span className="text-blue-900 font-bold text-lg">
                        ${(itemForm.totalValue || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Warehouse
                      </label>
                      <select
                        value={itemForm.warehouse}
                        onChange={(e) => handleFormChange('warehouse', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Main Warehouse">Main Warehouse</option>
                        <option value="Finished Goods Warehouse">Finished Goods Warehouse</option>
                        <option value="Consumables Store">Consumables Store</option>
                        <option value="Raw Material Store">Raw Material Store</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location / Bin
                      </label>
                      <input
                        type="text"
                        value={itemForm.location}
                        onChange={(e) => handleFormChange('location', e.target.value)}
                        placeholder="e.g., A-01-01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lot Number
                      </label>
                      <input
                        type="text"
                        value={itemForm.lotNumber || ''}
                        onChange={(e) => handleFormChange('lotNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={itemForm.expiryDate || ''}
                        onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lead Time (Days)
                      </label>
                      <input
                        type="number"
                        value={itemForm.leadTimeDays}
                        onChange={(e) => handleFormChange('leadTimeDays', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={itemForm.supplier || ''}
                      onChange={(e) => handleFormChange('supplier', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Item
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Low Stock Alert Panel */}
      {!isEditing && stats.lowStock > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-orange-900">Low Stock Alert</h3>
                <p className="text-sm text-orange-700 mt-1">
                  {stats.lowStock} item(s) are at or below their reorder point. Consider placing orders soon.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setFilterStatus('low')}
                    className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                  >
                    View Low Stock Items
                  </button>
                  <button className="px-3 py-1 bg-white text-orange-700 text-sm rounded border border-orange-300 hover:bg-orange-50">
                    Generate Purchase Orders
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;