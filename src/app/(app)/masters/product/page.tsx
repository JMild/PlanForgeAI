"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Copy,
  Package,
  GitBranch,
  Clock,
  X,
  Save,
  Layers,
  ArrowRight,
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";

/* ===================== Types ===================== */
type ModalMode = "edit" | "view" | "create" | null;
type ActiveTab = "basic" | "routing" | "bom";

const TABS = ["basic", "routing", "bom"] as const;

const CATEGORIES = ["Widgets", "Components", "Assemblies", "Raw Materials", "Finished Goods"] as const;
type Category = typeof CATEGORIES[number];

const UNITS = ["pcs", "kg", "L", "M", "m²", "set"] as const;
type Unit = typeof UNITS[number];

type ProductStatus = "Active" | "Inactive" | "Discontinued";

type RoutingStep = {
  seq: number;
  process: string;
  processName: string;
  setupMin: number;
  runMinPerUnit: number;
  machineGroup: string;
};

type BomItem = {
  material: string;
  description: string;
  qtyPer: number;
  unit: Unit;
  scrapRate: number; // percent
};

type Product = {
  code: string;
  name: string;
  description: string;
  category: Category;
  unit: Unit;
  lotSize: number;
  leadTime: number; // minutes
  standardCost: number;
  status: ProductStatus;
  routing: RoutingStep[];
  bom: BomItem[];
};

/* ===================== Sample data ===================== */
const INITIAL_PRODUCTS: Product[] = [
  {
    code: "WDGT-A",
    name: "Widget A",
    description: "Standard widget with basic features",
    category: "Widgets",
    unit: "pcs",
    lotSize: 50,
    leadTime: 180,
    standardCost: 150,
    status: "Active",
    routing: [
      { seq: 1, process: "MACH", processName: "Machining", setupMin: 30, runMinPerUnit: 1.2, machineGroup: "Machining" },
      { seq: 2, process: "DRILL", processName: "Drilling", setupMin: 20, runMinPerUnit: 0.6, machineGroup: "Machining" },
      { seq: 3, process: "ASSY", processName: "Assembly", setupMin: 15, runMinPerUnit: 0.9, machineGroup: "Assembly" },
    ],
    bom: [
      { material: "MAT-001", description: "Steel Plate", qtyPer: 1, unit: "kg", scrapRate: 5 },
      { material: "MAT-002", description: "Bolt M8", qtyPer: 4, unit: "pcs", scrapRate: 2 },
      { material: "MAT-003", description: "Paint Blue", qtyPer: 0.2, unit: "L", scrapRate: 10 },
    ],
  },
  {
    code: "WDGT-B",
    name: "Widget B",
    description: "Premium widget with advanced features",
    category: "Widgets",
    unit: "pcs",
    lotSize: 25,
    leadTime: 220,
    standardCost: 280,
    status: "Active",
    routing: [
      { seq: 1, process: "PRESS", processName: "Pressing", setupMin: 25, runMinPerUnit: 1.6, machineGroup: "Pressing" },
      { seq: 2, process: "PAINT", processName: "Painting", setupMin: 30, runMinPerUnit: 1.4, machineGroup: "Finishing" },
      { seq: 3, process: "ASSY", processName: "Assembly", setupMin: 15, runMinPerUnit: 1.0, machineGroup: "Assembly" },
    ],
    bom: [
      { material: "MAT-004", description: "Aluminum Sheet", qtyPer: 1.5, unit: "kg", scrapRate: 8 },
      { material: "MAT-002", description: "Bolt M8", qtyPer: 6, unit: "pcs", scrapRate: 2 },
      { material: "MAT-005", description: "Paint Red", qtyPer: 0.3, unit: "L", scrapRate: 10 },
      { material: "MAT-006", description: "Electronics Module", qtyPer: 1, unit: "pcs", scrapRate: 1 },
    ],
  },
  {
    code: "WDGT-C",
    name: "Widget C",
    description: "Economy widget for cost-sensitive markets",
    category: "Widgets",
    unit: "pcs",
    lotSize: 100,
    leadTime: 165,
    standardCost: 95,
    status: "Active",
    routing: [
      { seq: 1, process: "MACH", processName: "Machining", setupMin: 30, runMinPerUnit: 1.3, machineGroup: "Machining" },
      { seq: 2, process: "PAINT", processName: "Painting", setupMin: 30, runMinPerUnit: 0.8, machineGroup: "Finishing" },
      { seq: 3, process: "PACK", processName: "Packaging", setupMin: 10, runMinPerUnit: 0.5, machineGroup: "Assembly" },
    ],
    bom: [
      { material: "MAT-007", description: "Plastic Sheet", qtyPer: 0.8, unit: "kg", scrapRate: 3 },
      { material: "MAT-002", description: "Bolt M8", qtyPer: 2, unit: "pcs", scrapRate: 2 },
      { material: "MAT-003", description: "Paint Blue", qtyPer: 0.1, unit: "L", scrapRate: 10 },
    ],
  },
  {
    code: "WDGT-D",
    name: "Widget D",
    description: "Industrial-grade widget for heavy duty",
    category: "Widgets",
    unit: "pcs",
    lotSize: 10,
    leadTime: 285,
    standardCost: 420,
    status: "Active",
    routing: [
      { seq: 1, process: "PRESS", processName: "Pressing", setupMin: 25, runMinPerUnit: 0.8, machineGroup: "Pressing" },
      { seq: 2, process: "DRILL", processName: "Drilling", setupMin: 20, runMinPerUnit: 0.6, machineGroup: "Machining" },
      { seq: 3, process: "PAINT", processName: "Painting", setupMin: 30, runMinPerUnit: 0.7, machineGroup: "Finishing" },
      { seq: 4, process: "ASSY", processName: "Assembly", setupMin: 15, runMinPerUnit: 0.5, machineGroup: "Assembly" },
    ],
    bom: [
      { material: "MAT-008", description: "Stainless Steel Plate", qtyPer: 2, unit: "kg", scrapRate: 5 },
      { material: "MAT-009", description: "Bolt M12", qtyPer: 8, unit: "pcs", scrapRate: 2 },
      { material: "MAT-010", description: "Industrial Paint", qtyPer: 0.4, unit: "L", scrapRate: 8 },
      { material: "MAT-011", description: "Rubber Gasket", qtyPer: 2, unit: "pcs", scrapRate: 5 },
    ],
  },
];

/* ===================== Utils ===================== */
const statusBadge = (s: ProductStatus) =>
  s === "Active"
    ? "bg-green-100 text-green-700"
    : s === "Inactive"
    ? "bg-yellow-100 text-yellow-700"
    : "bg-gray-100 text-gray-700";

const calculateTotalProcessTime = (routing: RoutingStep[], qty = 1): number =>
  routing.reduce((total, step) => total + step.setupMin + step.runMinPerUnit * qty, 0);

/* ===================== Component ===================== */
const ProductMasterData = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<"all" | Category>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | ProductStatus>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("basic");

  // Form state (same shape as Product)
  const [formData, setFormData] = useState<Product>({
    code: "",
    name: "",
    description: "",
    category: "Widgets",
    unit: "pcs",
    lotSize: 1,
    leadTime: 0,
    standardCost: 0,
    status: "Active",
    routing: [] as RoutingStep[],
    bom: [] as BomItem[],
  });

  /* ---------- Filtering ---------- */
  const filteredProducts = products.filter((product) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      product.code.toLowerCase().includes(q) || product.name.toLowerCase().includes(q);
    const matchesCategory = filterCategory === "all" || product.category === filterCategory;
    const matchesStatus = filterStatus === "all" || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  /* ---------- Modal controls ---------- */
  const openModal = (mode: Exclude<ModalMode, null>, product: Product | null = null) => {
    setModalMode(mode);
    setSelectedProduct(product);
    setActiveTab("basic");

    if (mode === "create") {
      const nextCode = `WDGT-${String.fromCharCode(65 + products.length)}`;
      setFormData({
        code: nextCode,
        name: "",
        description: "",
        category: "Widgets",
        unit: "pcs",
        lotSize: 1,
        leadTime: 0,
        standardCost: 0,
        status: "Active",
        routing: [],
        bom: [],
      });
    } else if (product) {
      // clone to avoid accidental mutation
      setFormData({
        ...product,
        routing: product.routing.map((r) => ({ ...r })),
        bom: product.bom.map((b) => ({ ...b })),
      });
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode(null);
    setSelectedProduct(null);
  };

  /* ---------- CRUD ---------- */
  const handleSave = () => {
    if (!formData.code || !formData.name) {
      alert("Please fill in required fields: Product Code and Name");
      return;
    }

    if (modalMode === "create") {
      setProducts((prev) => [...prev, formData]);
    } else if (modalMode === "edit" && selectedProduct) {
      setProducts((prev) => prev.map((p) => (p.code === selectedProduct.code ? formData : p)));
    }
    closeModal();
  };

  const handleDelete = (productCode: string) => {
    if (confirm(`Are you sure you want to delete product ${productCode}?`)) {
      setProducts((prev) => prev.filter((p) => p.code !== productCode));
    }
  };

  const handleDuplicate = (product: Product) => {
    const newProduct: Product = {
      ...product,
      code: `${product.code}-COPY`,
      name: `${product.name} (Copy)`,
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  /* ---------- Routing ops ---------- */
  const addRoutingStep = () => {
    setFormData((prev) => ({
      ...prev,
      routing: [
        ...prev.routing,
        {
          seq: prev.routing.length + 1,
          process: "",
          processName: "",
          setupMin: 0,
          runMinPerUnit: 0,
          machineGroup: "",
        },
      ],
    }));
  };

  const updateRoutingStep = <K extends keyof RoutingStep>(
    index: number,
    field: K,
    value: RoutingStep[K]
  ) => {
    setFormData((prev) => {
      const newRouting = [...prev.routing];
      newRouting[index] = { ...newRouting[index], [field]: value } as RoutingStep;
      return { ...prev, routing: newRouting };
    });
  };

  const removeRoutingStep = (index: number) => {
    setFormData((prev) => {
      const newRouting = prev.routing
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, seq: i + 1 }));
      return { ...prev, routing: newRouting };
    });
  };

  /* ---------- BOM ops ---------- */
  const addBOMLine = () => {
    setFormData((prev) => ({
      ...prev,
      bom: [...prev.bom, { material: "", description: "", qtyPer: 0, unit: "pcs", scrapRate: 0 }],
    }));
  };

  const updateBOMLine = <K extends keyof BomItem>(index: number, field: K, value: BomItem[K]) => {
    setFormData((prev) => {
      const newBOM = [...prev.bom];
      newBOM[index] = { ...newBOM[index], [field]: value } as BomItem;
      return { ...prev, bom: newBOM };
    });
  };

  const removeBOMLine = (index: number) => {
    setFormData((prev) => ({ ...prev, bom: prev.bom.filter((_, i) => i !== index) }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Master Data</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage products, routing, and bill of materials
                </p>
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
                  onClick={() => openModal("create")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={18} />
                  New Product
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as Category | "all")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ProductStatus | "all")}
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

      {/* Product List */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lot Size
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Time
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Routing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.code} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Package size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{product.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray-900">
                        {product.lotSize} {product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900">{product.leadTime} min</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray-900">${product.standardCost}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <GitBranch size={14} className="text-blue-500" />
                        <span className="text-sm text-blue-600">{product.routing.length} steps</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex text-xs px-2 py-1 rounded ${statusBadge(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal("view", product)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="View"
                        >
                          <Eye size={16} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => openModal("edit", product)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Edit"
                        >
                          <Edit size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(product)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Duplicate"
                        >
                          <Copy size={16} className="text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.code)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === "view" && "Product Details"}
                {modalMode === "edit" && "Edit Product"}
                {modalMode === "create" && "Create New Product"}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-gray-200 flex gap-4">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab === "basic" && (
                    <span className="flex items-center gap-2">
                      <Package size={16} /> Basic Info
                    </span>
                  )}
                  {tab === "routing" && (
                    <span className="flex items-center gap-2">
                      <GitBranch size={16} /> Routing ({formData.routing.length} steps)
                    </span>
                  )}
                  {tab === "bom" && (
                    <span className="flex items-center gap-2">
                      <Layers size={16} /> BOM ({formData.bom.length} items)
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Code *</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        disabled={modalMode === "view" || modalMode === "edit"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value as Unit })}
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        {UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lot Size</label>
                      <input
                        type="number"
                        value={formData.lotSize}
                        onChange={(e) =>
                          setFormData({ ...formData, lotSize: Math.max(1, parseInt(e.target.value) || 0) })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        min={1}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lead Time (minutes)</label>
                      <input
                        type="number"
                        value={formData.leadTime}
                        onChange={(e) =>
                          setFormData({ ...formData, leadTime: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        min={0}
                      />
                      {formData.routing.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Routing time: {calculateTotalProcessTime(formData.routing, formData.lotSize)} min for lot size
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Standard Cost ($)</label>
                      <input
                        type="number"
                        value={formData.standardCost}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            standardCost: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value as ProductStatus })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Discontinued">Discontinued</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Routing Tab */}
              {activeTab === "routing" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Process Routing</h3>
                      <p className="text-sm text-gray-600">Define the sequence of manufacturing steps</p>
                    </div>
                    {modalMode !== "view" && (
                      <button
                        onClick={addRoutingStep}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Add Step
                      </button>
                    )}
                  </div>

                  {formData.routing.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <GitBranch size={48} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600">No routing steps defined</p>
                      {modalMode !== "view" && (
                        <button
                          onClick={addRoutingStep}
                          className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Add first routing step
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.routing.map((step, index) => (
                        <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                              {step.seq}
                            </div>

                            <div className="flex-1 grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Process Code</label>
                                <input
                                  type="text"
                                  value={step.process}
                                  onChange={(e) => updateRoutingStep(index, "process", e.target.value)}
                                  disabled={modalMode === "view"}
                                  placeholder="e.g., MACH"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Process Name</label>
                                <input
                                  type="text"
                                  value={step.processName}
                                  onChange={(e) => updateRoutingStep(index, "processName", e.target.value)}
                                  disabled={modalMode === "view"}
                                  placeholder="e.g., Machining"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Setup Time (min)</label>
                                <input
                                  type="number"
                                  value={step.setupMin}
                                  onChange={(e) =>
                                    updateRoutingStep(index, "setupMin", parseFloat(e.target.value) || 0)
                                  }
                                  disabled={modalMode === "view"}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                  min={0}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Run Time per Unit (min)
                                </label>
                                <input
                                  type="number"
                                  value={step.runMinPerUnit}
                                  onChange={(e) =>
                                    updateRoutingStep(index, "runMinPerUnit", parseFloat(e.target.value) || 0)
                                  }
                                  disabled={modalMode === "view"}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                  min={0}
                                  step={0.1}
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Machine Group</label>
                                <input
                                  type="text"
                                  value={step.machineGroup}
                                  onChange={(e) => updateRoutingStep(index, "machineGroup", e.target.value)}
                                  disabled={modalMode === "view"}
                                  placeholder="e.g., Machining, Assembly"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                              </div>
                            </div>

                            {modalMode !== "view" && (
                              <button
                                onClick={() => removeRoutingStep(index)}
                                className="flex-shrink-0 p-2 hover:bg-red-100 rounded text-red-600"
                                title="Remove Step"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          {index < formData.routing.length - 1 && (
                            <div className="flex justify-center mt-3">
                              <ArrowRight size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.routing.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-900">
                        <strong>Total Process Time:</strong> {calculateTotalProcessTime(formData.routing, 1)} min/unit
                        {formData.lotSize > 1 && (
                          <span className="ml-2">
                            ({calculateTotalProcessTime(formData.routing, formData.lotSize)} min for lot of{" "}
                            {formData.lotSize})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* BOM Tab */}
              {activeTab === "bom" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Bill of Materials (BOM)</h3>
                      <p className="text-sm text-gray-600">Define required materials and quantities</p>
                    </div>
                    {modalMode !== "view" && (
                      <button
                        onClick={addBOMLine}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Add Material
                      </button>
                    )}
                  </div>

                  {formData.bom.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Layers size={48} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600">No BOM items defined</p>
                      {modalMode !== "view" && (
                        <button
                          onClick={addBOMLine}
                          className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Add first BOM item
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Material Code</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Description</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Qty per Unit</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Unit</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Scrap %</th>
                            {modalMode !== "view" && (
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Action</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {formData.bom.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={item.material}
                                  onChange={(e) => updateBOMLine(index, "material", e.target.value)}
                                  disabled={modalMode === "view"}
                                  placeholder="MAT-001"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => updateBOMLine(index, "description", e.target.value)}
                                  disabled={modalMode === "view"}
                                  placeholder="Material description"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={item.qtyPer}
                                  onChange={(e) => updateBOMLine(index, "qtyPer", parseFloat(e.target.value) || 0)}
                                  disabled={modalMode === "view"}
                                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                  min={0}
                                  step={0.01}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  value={item.unit}
                                  onChange={(e) => updateBOMLine(index, "unit", e.target.value as Unit)}
                                  disabled={modalMode === "view"}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                >
                                  {UNITS.map((unit) => (
                                    <option key={unit} value={unit}>
                                      {unit}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={item.scrapRate}
                                  onChange={(e) =>
                                    updateBOMLine(index, "scrapRate", Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))
                                  }
                                  disabled={modalMode === "view"}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                  min={0}
                                  max={100}
                                  step={0.1}
                                />
                              </td>
                              {modalMode !== "view" && (
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() => removeBOMLine(index)}
                                    className="p-1 hover:bg-red-100 rounded text-red-600"
                                    title="Remove"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {formData.bom.length > 0 && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-green-900">
                        <strong>Total BOM Items:</strong> {formData.bom.length} materials required
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {modalMode !== "view" && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  {modalMode === "create" ? "Create Product" : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMasterData;
