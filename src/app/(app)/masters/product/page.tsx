"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Package,
  GitBranch,
  Save,
  Layers,
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import Modal from "@/src/components/shared/Modal";
import toast from "react-hot-toast";
import { ERROR_MESSAGES } from "@/src/config/messages";
import {
  getBOMById,
  getProcesses,
  getProduct,
  getProductCategory,
  getRoutingsById,
  getUnit,
} from "@/src/services/master";
import { DataTable } from "@/src/components/shared/table/Table";

/* ===================== Types ===================== */
type ModalMode = "edit" | "view" | "create" | null;
type ActiveTab = "basic" | "routing" | "bom";
const TABS = ["basic", "routing", "bom"] as const;

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
  unit: string;
  scrapRate: number;
};

type Product = {
  product_code: string;
  product_name: string;
  description: string;
  uom_code: string;          // ✅ ใช้ *_code ตามข้อมูลจริง
  lot_size: number;
  status: ProductStatus;
  bom_id: string | null;
  routing_id: string | null;
  count_step_routing: number;
  category_code: string;     // ✅ ใช้ *_code ตามข้อมูลจริง
  routing?: RoutingStep[];
  bom?: BomItem[];
};

type Category = {
  code: string;
  label: string;
};

type Unit = {
  code: string;
  label: string;
};

type Process = {
  process_code: string;
  process_name: string;
  description: string;
  setup_time_min: number
  run_time_per_unit: number
  machine_list: ["M001","M002"]
};

/* ===================== Utils ===================== */
const statusBadge = (status: ProductStatus) => {
  switch (status) {
    case "Active":
      return "status-success";
    case "Inactive":
      return "status-inactive";
    case "Discontinued":
      return "status-error";
    default:
      return "status-inactive";
  }
};

const calculateTotalProcessTime = (routing: RoutingStep[] = [], qty = 1): number =>
  routing.reduce((total, step) => total + step.setupMin + step.runMinPerUnit * qty, 0);

/* ===================== Component ===================== */
const ProductMasterData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category[]>([]);
  const [unit, setUnit] = useState<Unit[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | ProductStatus>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("basic");

  // ✅ formData ควรเป็น object (ไม่ใช่ array)
  const [formData, setFormData] = useState<Product>({
    product_code: "",
    product_name: "",
    description: "",
    category_code: "",
    uom_code: "",
    lot_size: 1,
    status: "Active",
    routing_id: null,
    bom_id: null,
    count_step_routing: 0,
    routing: [],
    bom: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resProduct = await getProduct();         // → มี category_code, uom_code
        const resCategory = await getProductCategory();// → [{code,label}]
        const resUnit = await getUnit();               // → [{code,label}]
        setProducts(resProduct);
        setCategory(resCategory);
        setUnit(resUnit);
        // console.log('resProduct', resProduct)
        // console.log('resCategory', resCategory)
        // console.log('resUnit', resUnit)
      } catch (error) {
        console.error("Fetch data failed:", error);
        toast.error(ERROR_MESSAGES.fetchFailed);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ---------- Filtering ---------- */
  const filteredProducts = products.filter((product) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      product.product_code.toLowerCase().includes(q) ||
      product.product_name.toLowerCase().includes(q);
    const matchesCategory = filterCategory === "all" || product.category_code === filterCategory; // ✅ ใช้ *_code
    const matchesStatus = filterStatus === "all" || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  /* ---------- Modal controls ---------- */
  const openModal = (mode: Exclude<ModalMode, null>, product: Product | null = null) => {
    setModalMode(mode);
    setSelectedProduct(product);
    setActiveTab("basic");

    if (mode === "create") {
      const nextCode = `PRD-${(products.length + 1).toString().padStart(3, "0")}`;
      setFormData({
        product_code: nextCode,
        product_name: "",
        description: "",
        category_code: category[0]?.code ?? "",  
        uom_code: unit[0]?.code ?? "",
        lot_size: 1,
        status: "Active",
        routing_id: null,
        bom_id: null,
        count_step_routing: 0,
        routing: [],
        bom: [],
      });
      setIsModalOpen(true);
    } else if (product) {
      loadProductDetails(product); 
    }
  };

  const loadProductDetails = async (product: Product) => {
    try {
      const routingRaw = product.routing_id ? await getRoutingsById(product.routing_id) : [];
      const routing: RoutingStep[] = routingRaw.map((step: any, index: number) => ({
        seq: step.step_sequence ?? index + 1,
        process: step.process_code,
        processName: step.process_name,
        setupMin: step.setup_time_min,
        runMinPerUnit: step.run_time_per_unit,
        machineGroup: step.changeover_family,
      }));

      const bomRaw = product.bom_id ? await getBOMById(product.bom_id) : [];
      const bom: BomItem[] = bomRaw.map((item: any) => ({
        material: item.material_code,
        description: item.description ?? "",
        qtyPer: item.quantity_per,
        unit: item.unit ?? "",
        scrapRate: item.scrap_rate ?? 0,
      }));

      setFormData({
        ...product,
        routing,
        bom,
      });

      const resProcesses = await getProcesses();
      setProcesses(resProcesses);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to load details:", error);
      toast.error("ไม่สามารถโหลดรายละเอียดสินค้าได้");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode(null);
    setSelectedProduct(null);
  };

  /* ---------- CRUD ---------- */
  const handleSave = () => {
    if (!formData.product_code || !formData.product_name) {
      toast.error("Please fill in required fields: Product Code and Name");
      return;
    }

    if (modalMode === "create") {
      setProducts((prev) => [...prev, formData]);
    } else if (modalMode === "edit" && selectedProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.product_code === selectedProduct.product_code ? formData : p))
      );
    }
    closeModal();
  };

  const handleDelete = (productCode: string) => {
    if (confirm(`Are you sure you want to delete product ${productCode}?`)) {
      setProducts((prev) => prev.filter((p) => p.product_code !== productCode));
    }
  };

  /* ---------- Routing ops ---------- */
  const addRoutingStep = () => {
    setFormData((prev) => ({
      ...prev,
      routing: [
        ...(prev.routing ?? []),
        {
          seq: (prev.routing?.length ?? 0) + 1,
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
      const newRouting = [...(prev.routing ?? [])];
      newRouting[index] = { ...newRouting[index], [field]: value } as RoutingStep;
      return { ...prev, routing: newRouting };
    });
  };

  const removeRoutingStep = (index: number) => {
    setFormData((prev) => {
      const newRouting = (prev.routing ?? [])
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, seq: i + 1 }));
      return { ...prev, routing: newRouting };
    });
  };

  /* ---------- BOM ops ---------- */
  const addBOMLine = () => {
    setFormData((prev) => ({
      ...prev,
      bom: [
        ...(prev.bom ?? []), // ✅ แก้จาก prev.bom_id → prev.bom
        { material: "", description: "", qtyPer: 0, unit: "PCS", scrapRate: 0 },
      ],
    }));
  };

  const updateBOMLine = <K extends keyof BomItem>(
    index: number,
    field: K,
    value: BomItem[K]
  ) => {
    setFormData((prev) => {
      const newBOM = [...(prev.bom ?? [])];
      newBOM[index] = { ...newBOM[index], [field]: value } as BomItem;
      return { ...prev, bom: newBOM };
    });
  };

  const removeBOMLine = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      bom: (prev.bom ?? []).filter((_, i) => i !== index),
    }));
  };

  const productColumns = [
    {
      key: "code",
      label: "Code",
      render: (product: Product) => (
        <div className="flex items-center">
          <Package size={16} className="text-white/50 mr-2" />
          <span className="text-sm font-medium">{product.product_code}</span>
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (product: Product) => (
        <>
          <div className="text-sm">{product.product_name}</div>
          {product.description && (
            <div className="text-xs text-white/60">{product.description}</div>
          )}
        </>
      ),
    },
    {
      key: "category",
      label: "Category",
      align: "left",
      render: (product: Product) => (
        <div className="text-sm">
          {category.find((cat) => cat.code === product.category_code)?.label || "Unknown"}
        </div>
      ),
    },
    {
      key: "lotSize",
      label: "Lot / Unit",
      render: (product: Product) => (
        <span className="text-sm">
          {product.lot_size}{" "}
          {unit.find((u) => u.code === product.uom_code)?.label || product.uom_code}
        </span>
      ),
    },
    {
      key: "routing",
      label: "Routing",
      render: (product: Product) => (
        <div className="flex items-center gap-1">
          <GitBranch size={14} className="text-sky-300" />
          <span className="text-sm text-sky-300">
            {product.count_step_routing || 0} steps
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (product: Product) => (
        <span className={`inline-flex chip ${statusBadge(product.status)}`}>
          {product.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (product: Product) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => openModal("view", product)}
            className="p-1 hover:bg-white/10 rounded"
            title="View"
          >
            <Eye size={16} className="text-white/70" />
          </button>
          <button
            onClick={() => openModal("edit", product)}
            className="p-1 hover:bg-white/10 rounded"
            title="Edit"
          >
            <Edit size={16} className="text-sky-300" />
          </button>
          <button
            onClick={() => handleDelete(product.product_code)}
            className="p-1 hover:bg-white/10 rounded"
            title="Delete"
          >
            <Trash2 size={16} className="text-rose-300" />
          </button>
        </div>
      ),
    },
  ] as const;

  return (
    <div className="text-white">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Product Master</h1>
              <p className="text-sm text-white/60 mt-1">
                Manage products, routing, and bill of materials
              </p>
            </div>
          </div>
        }
        tabs={
          <div className="flex gap-4 mt-0.5 mb-1 mx-0.5">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input w-full !pl-10 pr-4"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as string)}
              className="glass-input w-44"
            >
              <option value="all" className="select option">
                All Categories
              </option>
              {category.map((cat) => (
                <option key={cat.code} value={cat.code} className="select option">
                  {cat.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as ProductStatus | "all")
              }
              className="glass-input"
            >
              <option value="all" className="select option">
                All Status
              </option>
              <option value="Active" className="select option">
                Active
              </option>
              <option value="Inactive" className="select option">
                Inactive
              </option>
              <option value="Discontinued" className="select option">
                Discontinued
              </option>
            </select>
          </div>
        }
        actions={
          <div className="flex gap-3">
            <button className="btn btn-outline">
              <Upload size={18} />
              Import
            </button>
            <button className="btn btn-outline">
              <Download size={18} />
              Export
            </button>
            <button onClick={() => openModal("create")} className="btn btn-primary">
              <Plus size={18} />
              New Product
            </button>
          </div>
        }
      />

      {/* Product List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <DataTable
          columns={productColumns}
          data={filteredProducts}
          rowKey={(p) => p.product_code}
          isLoading={loading}
        />
      </div>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="2xl"
        title={
          <div className="flex items-center justify-between w-full">
            <h2 className="text-xl font-semibold">
              {modalMode === "view" && "Product Details"}
              {modalMode === "edit" && "Edit Product"}
              {modalMode === "create" && "Create New Product"}
            </h2>
          </div>
        }
        footer={
          modalMode == "view" ? (
            <div className="flex items-center justify-end gap-3 w-full">
              <button onClick={closeModal} className="btn btn-outline">
                Close
              </button>
              <button onClick={() => setModalMode("edit")} className="btn btn-primary">
                <Edit size={18} />
                Edit Product
              </button>
            </div>
          ) : (
            <>
              <button onClick={closeModal} className="btn btn-outline">
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary">
                <Save size={18} />
                {modalMode === "create" ? "Create Product" : "Save Changes"}
              </button>
            </>
          )
        }
      >
        {/* Tabs */}
        <div className="border-b border-white/10 flex gap-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-sky-500 text-sky-300"
                  : "border-transparent text-white/70 hover:text-white"
              }`}
            >
              {tab === "basic" && (
                <span className="flex items-center gap-2">
                  <Package size={16} /> Basic Info
                </span>
              )}
              {tab === "routing" && (
                <span className="flex items-center gap-2">
                  <GitBranch size={16} /> Routing ({formData.count_step_routing} steps)
                </span>
              )}
              {tab === "bom" && (
                <span className="flex items-center gap-2">
                  <Layers size={16} /> BOM ({formData.bom?.length ?? 0} items)
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* ===== Basic Info Tab ===== */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Product Code *
                  </label>
                  <input
                    type="text"
                    value={formData.product_code}
                    onChange={(e) =>
                      setFormData({ ...formData, product_code: e.target.value })
                    }
                    disabled={modalMode === "view" || modalMode === "edit"}
                    className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.product_name}
                    onChange={(e) =>
                      setFormData({ ...formData, product_name: e.target.value })
                    }
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    disabled={modalMode === "view"}
                    rows={2}
                    className="w-full glass-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category_code: e.target.value as string,
                      })
                    }
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                  >
                    {category.map((cat) => (
                      <option key={cat.code} value={cat.code} className="select option">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Unit
                  </label>
                  <select
                    value={formData.uom_code}
                    onChange={(e) =>
                      setFormData({ ...formData, uom_code: e.target.value as string })
                    }
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                  >
                    {unit.map((u) => (
                      <option key={u.code} value={u.code} className="select option">
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Lot Size
                  </label>
                  <input
                    type="number"
                    value={formData.lot_size}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lot_size: Math.max(1, parseInt(e.target.value) || 0),
                      })
                    }
                    disabled={modalMode === "view"}
                    min={1}
                    className="w-full glass-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as ProductStatus,
                      })
                    }
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                  >
                    <option value="Active" className="select option">
                      Active
                    </option>
                    <option value="Inactive" className="select option">
                      Inactive
                    </option>
                    <option value="Discontinued" className="select option">
                      Discontinued
                    </option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ===== Routing Tab ===== */}
          {activeTab === "routing" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white text-lg font-semibold">Process Routing</h3>
                  <p className="text-sm text-white/70">
                    Define the sequence of manufacturing steps
                  </p>
                </div>
                {modalMode !== "view" && (
                  <button onClick={addRoutingStep} className="btn btn-primary">
                    <Plus size={16} />
                    Add Step
                  </button>
                )}
              </div>

              {(formData.routing?.length ?? 0) === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-lg border-2 border-dashed border-white/15">
                  <GitBranch size={48} className="mx-auto text-white/40 mb-3" />
                  <p className="text-white/70">No routing steps defined</p>
                  {modalMode !== "view" && (
                    <button
                      onClick={addRoutingStep}
                      className="mt-3 text-sky-300 hover:text-sky-200 text-sm font-medium"
                    >
                      Add first routing step
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.routing?.map((step, index) => (
                    <div
                      key={index}
                      className="border border-white/10 rounded-lg p-4 bg-white/5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky-500/20 text-sky-200 flex items-center justify-center font-semibold">
                          {step.seq}
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-white/80 mb-1">
                              Process Code
                            </label>
                            <input
                              type="text"
                              value={step.process}
                              onChange={(e) =>
                                updateRoutingStep(index, "process", e.target.value)
                              }
                              disabled={modalMode === "view"}
                              placeholder="e.g., MACH"
                              className="w-full glass-input"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-white/80 mb-1">
                              Process Name
                            </label>
                            <input
                              type="text"
                              value={step.processName}
                              onChange={(e) =>
                                updateRoutingStep(index, "processName", e.target.value)
                              }
                              disabled={modalMode === "view"}
                              placeholder="e.g., Machining"
                              className="w-full glass-input"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-white/80 mb-1">
                              Setup Time (min)
                            </label>
                            <input
                              type="number"
                              value={step.setupMin}
                              onChange={(e) =>
                                updateRoutingStep(
                                  index,
                                  "setupMin",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              disabled={modalMode === "view"}
                              min={0}
                              className="w-full glass-input"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-white/80 mb-1">
                              Run Time per Unit (min)
                            </label>
                            <input
                              type="number"
                              value={step.runMinPerUnit}
                              onChange={(e) =>
                                updateRoutingStep(
                                  index,
                                  "runMinPerUnit",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              disabled={modalMode === "view"}
                              min={0}
                              step={0.1}
                              className="w-full glass-input"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-white/80 mb-1">
                              Machine Group
                            </label>
                            <input
                              type="text"
                              value={step.machineGroup}
                              onChange={(e) =>
                                updateRoutingStep(index, "machineGroup", e.target.value)
                              }
                              disabled={modalMode === "view"}
                              placeholder="e.g., Machining, Assembly"
                              className="w-full glass-input"
                            />
                          </div>
                        </div>

                        {modalMode !== "view" && (
                          <button
                            onClick={() => removeRoutingStep(index)}
                            className="flex-shrink-0 p-2 hover:bg-rose-500/10 rounded text-rose-300"
                            title="Remove Step"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(formData.routing?.length ?? 0) > 0 && (
                <div className="mt-4 p-4 bg-sky-500/10 border border-sky-400/20 rounded-lg">
                  <div className="text-sm text-sky-200">
                    <strong>Total Process Time:</strong>{" "}
                    {calculateTotalProcessTime(formData.routing, 1)} min/unit
                    {formData.lot_size > 1 && (
                      <span className="ml-2">
                        (
                        {calculateTotalProcessTime(
                          formData.routing,
                          formData.lot_size
                        )}{" "}
                        min for lot of {formData.lot_size})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== BOM Tab ===== */}
          {activeTab === "bom" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white text-lg font-semibold">
                    Bill of Materials (BOM)
                  </h3>
                  <p className="text-sm text-white/70">
                    Define required materials and quantities
                  </p>
                </div>
                {modalMode !== "view" && (
                  <button onClick={addBOMLine} className="btn btn-primary">
                    <Plus size={16} />
                    Add Material
                  </button>
                )}
              </div>

              {(formData.bom?.length ?? 0) === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-lg border-2 border-dashed border-white/15">
                  <Layers size={48} className="mx-auto text-white/40 mb-3" />
                  <p className="text-white/70">No BOM items defined</p>
                  {modalMode !== "view" && (
                    <button
                      onClick={addBOMLine}
                      className="mt-3 text-sky-300 hover:text-sky-200 text-sm font-medium"
                    >
                      Add first BOM item
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-white/70">
                          Material Code
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-white/70">
                          Description
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-white/70">
                          Qty per Unit
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-white/70">
                          Unit
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-white/70">
                          Scrap %
                        </th>
                        {modalMode !== "view" && (
                          <th className="px-4 py-2 text-center text-xs font-medium text-white/70">
                            Action
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {formData.bom?.map((item, index) => (
                        <tr key={index} className="hover:bg-white/5">
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.material}
                              onChange={(e) =>
                                updateBOMLine(index, "material", e.target.value)
                              }
                              disabled={modalMode === "view"}
                              placeholder="MAT-001"
                              className="w-full px-2 py-1 text-sm rounded border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:bg-white/10"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) =>
                                updateBOMLine(index, "description", e.target.value)
                              }
                              disabled={modalMode === "view"}
                              placeholder="Material description"
                              className="w-full px-2 py-1 text-sm rounded border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:bg-white/10"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.qtyPer}
                              onChange={(e) =>
                                updateBOMLine(
                                  index,
                                  "qtyPer",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              disabled={modalMode === "view"}
                              min={0}
                              step={0.01}
                              className="w-24 px-2 py-1 text-sm rounded border border-white/20 bg-white/5 text-right text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:bg-white/10"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={item.unit}
                              onChange={(e) =>
                                updateBOMLine(index, "unit", e.target.value as string)
                              }
                              disabled={modalMode === "view"}
                              className="w-20 px-2 py-1 text-sm rounded border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:bg-white/10"
                            >
                              {unit.map((u) => (
                                <option
                                  key={u.code}
                                  value={u.code}
                                  className="select option"
                                >
                                  {u.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.scrapRate}
                              onChange={(e) =>
                                updateBOMLine(
                                  index,
                                  "scrapRate",
                                  Math.min(
                                    100,
                                    Math.max(0, parseFloat(e.target.value) || 0)
                                  )
                                )
                              }
                              disabled={modalMode === "view"}
                              min={0}
                              max={100}
                              step={0.1}
                              className="w-20 px-2 py-1 text-sm rounded border border-white/20 bg-white/5 text-right text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:bg-white/10"
                            />
                          </td>
                          {modalMode !== "view" && (
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => removeBOMLine(index)}
                                className="p-1 hover:bg-rose-500/10 rounded text-rose-300"
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

              {(formData.bom?.length ?? 0) > 0 && (
                <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-400/20 rounded-lg">
                  <div className="text-sm text-emerald-200">
                    <strong>Total BOM Items:</strong>{" "}
                    {formData.bom?.length ?? 0} materials required
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ProductMasterData;
