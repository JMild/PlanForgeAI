"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Save, Upload, Download, Package, AlertTriangle, TrendingUp, TrendingDown, MapPin, BarChart3, LayoutGrid, Table, Settings } from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';
import Modal from '@/src/components/shared/Modal';
import toast from 'react-hot-toast';
import { ERROR_MESSAGES } from '@/src/config/messages';
import { getInventory } from '@/src/lib/api';

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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = (await getInventory()) as InventoryItem[];
        setInventory(res);
      } catch (error) {
        console.error('Fetch data failed:', error);
        toast.error(ERROR_MESSAGES.fetchFailed);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


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
        color: "status-error",
        icon: <AlertTriangle className="w-4 h-4" />,
      };
    } else if (item.available <= item.reorderPoint) {
      return {
        status: "Low Stock",
        color: "status-warning",
        icon: <TrendingDown className="w-4 h-4" />,
      };
    } else if (item.available > item.maxStock) {
      return {
        status: "Overstock",
        color: "status-purple",
        icon: <TrendingUp className="w-4 h-4" />,
      };
    } else {
      return {
        status: "Normal",
        color: "status-success",
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
    <div>
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Inventory / On-hand Management
              </h1>
              <p className="text-sm text-white/60 mt-1">Master Data Management (MAS014)</p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-2">
            <button className="btn btn-outline">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={exportToCSV}
              className="btn btn-outline"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleAdd}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Add Item
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
                    <div className="text-sm text-white/60">Total Items</div>
                    <div className="text-2xl font-bold text-white mt-1">{stats.totalItems}</div>
                  </div>
                  <Package className="w-10 h-10 text-white/30" />
                </div>
              </div>

              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/60">Total Value</div>
                    <div className="text-2xl font-bold text-sky-300 mt-1">
                      ${stats.totalValue.toLocaleString()}
                    </div>
                  </div>
                  <BarChart3 className="w-10 h-10 text-sky-300/40" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-white/10 bg-white/5">
                <div>
                  <div className="text-sm text-white/60">Low Stock Items</div>
                  <div className="text-2xl font-bold text-amber-300 mt-1">{stats.lowStock}</div>
                </div>
                <TrendingDown className="w-10 h-10 text-amber-300/40" />
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/60">Out of Stock</div>
                    <div className="text-2xl font-bold text-rose-300 mt-1">{stats.outOfStock}</div>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-rose-300/40" />
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 mt-4 mb-1 mx-0.5">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                  />
                </div>
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="glass-input"
              >
                <option value="all" className="select option">All Categories</option>
                <option value="Raw Material" className="select option">Raw Material</option>
                <option value="Component" className="select option">Component</option>
                <option value="WIP" className="select option">WIP</option>
                <option value="Finished Goods" className="select option">Finished Goods</option>
                <option value="Consumable" className="select option">Consumable</option>
              </select>

              <select
                value={filterWarehouse}
                onChange={(e) => setFilterWarehouse(e.target.value)}
                className="glass-input"
              >
                <option value="all" className="select option">All Warehouses</option>
                {warehouses.map(wh => (
                  <option key={wh} value={wh} className="select option">{wh}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'low' | 'ok' | 'high')}
                className="glass-input"
              >
                <option value="all" className="select option">All Status</option>
                <option value="low" className="select option">Low Stock</option>
                <option value="ok" className="select option">Normal</option>
                <option value="high" className="select option">Overstock</option>
              </select>

              <div className="flex border border-white/20 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 ${viewMode === 'cards'
                    ? 'bg-sky-500/15 text-sky-300'
                    : 'bg-white/5 text-white/70 hover:text-white'
                    }`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 border-l border-white/20 ${viewMode === 'table'
                    ? 'bg-sky-500/15 text-sky-300'
                    : 'bg-white/5 text-white/70 hover:text-white'
                    }`}
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
        {/* Cards View */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((item) => {
              const stockStatus = getStockStatus(item);
              const stockPercentage = (item.available / item.maxStock) * 100;

              return (
                <div key={item.materialCode} className="glass-card">
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">{item.materialCode}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 border ${stockStatus.color}`}>
                            {stockStatus.icon}
                            {stockStatus.status}
                          </span>
                        </div>
                        <p className="text-sm text-white/80 font-medium">{item.materialName}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-sky-300 hover:bg-white/10 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.materialCode)}
                          className="p-2 text-rose-300 hover:bg-white/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Category</span>
                      <span className="font-medium text-white">{item.category}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center py-2 bg-white/5 rounded border border-white/10">
                      <div>
                        <div className="text-xs text-white/60">On Hand</div>
                        <div className="text-lg font-bold text-white">{item.onHand}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60">Reserved</div>
                        <div className="text-lg font-bold text-amber-300">{item.reserved}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60">Available</div>
                        <div className="text-lg font-bold text-emerald-300">{item.available}</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1 text-xs">
                        <span className="text-white/60">Stock Level</span>
                        <span className="text-white/80 font-medium">
                          {item.available} / {item.maxStock} {item.unit}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${stockPercentage <= (item.reorderPoint / item.maxStock * 100)
                            ? 'bg-rose-400'
                            : stockPercentage <= 50
                              ? 'bg-amber-400'
                              : stockPercentage <= 80
                                ? 'bg-emerald-400'
                                : 'bg-violet-400'
                            }`}
                          style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-white/60">
                        <span>Min: {item.minStock}</span>
                        <span>Reorder: {item.reorderPoint}</span>
                        <span>Max: {item.maxStock}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Location
                        </span>
                        <span className="font-medium text-white">{item.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Warehouse</span>
                        <span className="font-medium text-white">{item.warehouse}</span>
                      </div>
                      {item.lotNumber && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Lot Number</span>
                          <span className="font-medium text-white">{item.lotNumber}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">Total Value</span>
                        <span className="text-lg font-bold text-sky-300">
                          ${item.totalValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-white/60">Unit Cost: ${item.unitCost}</span>
                        <span className="text-xs text-white/60">Lead Time: {item.leadTimeDays}d</span>
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
          <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    {[
                      'Code', 'Name', 'Category', 'On Hand', 'Reserved', 'Available', 'Location', 'Value', 'Status', 'Actions'
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-xs font-medium uppercase text-white/60 ${[3, 4, 5, 7, 9].includes(i) ? 'text-right' : 'text-left'
                          }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredInventory.map((item) => {
                    const stockStatus = getStockStatus(item);
                    return (
                      <tr key={item.materialCode} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-sm font-medium text-white">{item.materialCode}</td>
                        <td className="px-4 py-3 text-sm text-white">{item.materialName}</td>
                        <td className="px-4 py-3 text-sm text-white/80">{item.category}</td>
                        <td className="px-4 py-3 text-sm text-right text-white font-medium">
                          {item.onHand} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-amber-300 font-medium">
                          {item.reserved} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-emerald-300 font-medium">
                          {item.available} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-sm text-white/80">{item.location}</td>
                        <td className="px-4 py-3 text-sm text-right text-sky-300 font-medium">
                          ${item.totalValue.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`chip flex items-center gap-1 w-fit border ${stockStatus.color}`}>
                            {stockStatus.icon}
                            {stockStatus.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-sky-300 hover:text-sky-200 mr-3"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.materialCode)}
                            className="text-rose-300 hover:text-rose-200"
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
              <div className="text-center py-12 text-white/60">
                No inventory items found
              </div>
            )}
          </div>
        )}

        {filteredInventory.length === 0 && viewMode === 'cards' && (
          <div className="rounded-lg border border-white/10 bg-white/5 text-center py-12 text-white/60">
            No inventory items found
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        size="2xl"
        title={`${selectedItem ? "Edit" : "Add"} Inventory Item`}
        footer={
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-white/80 border border-white/20 rounded-lg hover:bg-white/10"
            >
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              <Save className="w-4 h-4" />
              Save Item
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Material Code *
                </label>
                <input
                  type="text"
                  value={itemForm.materialCode}
                  onChange={(e) => handleFormChange("materialCode", e.target.value)}
                  disabled={!!selectedItem}
                  className="glass-input w-full disabled:bg-white/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Material Name *
                </label>
                <input
                  type="text"
                  value={itemForm.materialName}
                  onChange={(e) => handleFormChange("materialName", e.target.value)}
                  className="glass-input w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Category *
                </label>
                <select
                  value={itemForm.category}
                  onChange={(e) => handleFormChange("category", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50"
                >
                  {["Raw Material", "Component", "WIP", "Finished Goods", "Consumable"].map(
                    (opt) => (
                      <option key={opt} value={opt} className="select option">
                        {opt}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Unit *
                </label>
                <select
                  value={itemForm.unit}
                  onChange={(e) => handleFormChange("unit", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50"
                >
                  {["PCS", "KG", "L", "M", "SET"].map((u) => (
                    <option key={u} value={u} className="select option">
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Unit Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={itemForm.unitCost}
                  onChange={(e) =>
                    handleFormChange("unitCost", parseFloat(e.target.value) || 0)
                  }
                  className="glass-input w-full"
                />
              </div>
            </div>
          </div>

          {/* Stock Levels */}
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Stock Levels
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  On Hand Quantity
                </label>
                <input
                  type="number"
                  value={itemForm.onHand}
                  onChange={(e) =>
                    handleFormChange("onHand", parseFloat(e.target.value) || 0)
                  }
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Reserved Quantity
                </label>
                <input
                  type="number"
                  value={itemForm.reserved}
                  onChange={(e) =>
                    handleFormChange("reserved", parseFloat(e.target.value) || 0)
                  }
                  className="glass-input w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Min Stock Level
                </label>
                <input
                  type="number"
                  value={itemForm.minStock}
                  onChange={(e) =>
                    handleFormChange("minStock", parseFloat(e.target.value) || 0)
                  }
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Reorder Point
                </label>
                <input
                  type="number"
                  value={itemForm.reorderPoint}
                  onChange={(e) =>
                    handleFormChange("reorderPoint", parseFloat(e.target.value) || 0)
                  }
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Max Stock Level
                </label>
                <input
                  type="number"
                  value={itemForm.maxStock}
                  onChange={(e) =>
                    handleFormChange("maxStock", parseFloat(e.target.value) || 0)
                  }
                  className="glass-input w-full"
                />
              </div>
            </div>

            <div className="mt-3 p-3 rounded-lg border border-sky-400/20 bg-sky-500/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-sky-300 font-medium">Available Quantity:</span>
                <span className="text-white font-bold text-lg">
                  {itemForm.available} {itemForm.unit}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-sky-300 font-medium">Total Value:</span>
                <span className="text-sky-200 font-bold text-lg">
                  ${(itemForm.totalValue || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Warehouse
                </label>
                <select
                  value={itemForm.warehouse}
                  onChange={(e) => handleFormChange("warehouse", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50"
                >
                  {[
                    "Main Warehouse",
                    "Finished Goods Warehouse",
                    "Consumables Store",
                    "Raw Material Store",
                  ].map((w) => (
                    <option key={w} value={w} className="select option">
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Location / Bin
                </label>
                <input
                  type="text"
                  value={itemForm.location}
                  onChange={(e) => handleFormChange("location", e.target.value)}
                  placeholder="e.g., A-01-01"
                  className="glass-input w-full"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Additional Information
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Lot Number
                </label>
                <input
                  type="text"
                  value={itemForm.lotNumber || ""}
                  onChange={(e) => handleFormChange("lotNumber", e.target.value)}
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={itemForm.expiryDate || ""}
                  onChange={(e) => handleFormChange("expiryDate", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Lead Time (Days)
                </label>
                <input
                  type="number"
                  value={itemForm.leadTimeDays}
                  onChange={(e) =>
                    handleFormChange("leadTimeDays", parseInt(e.target.value) || 0)
                  }
                  className="glass-input w-full"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-white/80 mb-1">
                Supplier
              </label>
              <input
                type="text"
                value={itemForm.supplier || ""}
                onChange={(e) => handleFormChange("supplier", e.target.value)}
                className="glass-input w-full"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Low Stock Alert Panel */}
      {!isEditing && stats.lowStock > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="rounded-lg border border-amber-400/20 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-300 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-200">Low Stock Alert</h3>
                <p className="text-sm text-amber-200/80 mt-1">
                  {stats.lowStock} item(s) are at or below their reorder point. Consider placing orders soon.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setFilterStatus('low')}
                    className="px-3 py-1 bg-amber-500 text-white text-sm rounded hover:bg-amber-600"
                  >
                    View Low Stock Items
                  </button>
                  <button className="px-3 py-1 bg-white/10 text-amber-200 text-sm rounded border border-amber-400/20 hover:bg-white/15">
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