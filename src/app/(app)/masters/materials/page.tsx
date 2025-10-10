"use client";

import React, { useState, ChangeEvent, FC, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Save,
  ChevronDown,
  ChevronRight,
  Box,
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import Modal from "@/src/components/shared/Modal";
import { getAllDropdownMaterial } from "@/src/services/config";
import { getMaterial } from "@/src/lib/api";
import toast from "react-hot-toast";
import { ERROR_MESSAGES } from "@/src/config/messages";
import Loading from "@/src/components/Loading";
import EmptyState from "@/src/components/shared/EmptyState";

/* =========================
 * Types
 * ========================= */

type MaterialStatus = "Active" | "Inactive" | "Discontinued";

type MaterialCategory =
  | "Raw Material"
  | "Component"
  | "Subassembly"
  | "Packaging"
  | "Consumable"
  | "Tool";

type Supplier = {
  code: string;
  name: string;
};

type UnitOption = {
  code: string; // e.g., "PCS"
  label: string; // e.g., "Pieces"
};

type CategoryOption = {
  code: string; // e.g., "Raw Material"
  label: string;
};

type StatusOption = {
  code: MaterialStatus;
  label: string;
};

type Material = {
  code: string;
  name: string;
  description: string;
  category: MaterialCategory; // store category as its code string
  unitCode: string; // store unit as code string
  standardCost: number;
  leadTimeDays: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  supplierCode: string;
  supplierName: string;
  storageLocation: string;
  batchTracking: boolean;
  status: MaterialStatus;
  notes: string;
};

type StockStatusInfo = {
  status: "Low" | "Medium" | "Good";
  color: string;
  stock: number;
};

type DropdownPayload = {
  SUPPLIERS: Supplier[];
  MATERIAL_CATEGORY: CategoryOption[];
  UNIT: UnitOption[];
  MATERIAL_STATUS: StatusOption[];
};

/* =========================
 * Component
 * ========================= */

const MaterialsMasterData: FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [statuses, setStatuses] = useState<StatusOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<MaterialCategory | "all">("all");
  const [filterStatus, setFilterStatus] = useState<MaterialStatus | "all">("all");
  const [expandedMaterials, setExpandedMaterials] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [viewMode, setViewMode] = useState<"view" | "edit" | null>(null);

  const initialFormData: Omit<Material, "supplierName"> = {
    code: "",
    name: "",
    description: "",
    category: "Raw Material",
    unitCode: "PCS",
    standardCost: 0,
    leadTimeDays: 0,
    minStock: 0,
    maxStock: 0,
    reorderPoint: 0,
    supplierCode: "",
    storageLocation: "",
    batchTracking: false,
    status: "Active",
    notes: "",
  };
  const [formData, setFormData] = useState<Omit<Material, "supplierName">>(initialFormData);

  /* =========================
   * Lookups (code -> label)
   * ========================= */
  const unitLabelByCode = useMemo(
    () =>
      units.reduce<Record<string, string>>((acc, u) => {
        acc[u.code] = u.label;
        return acc;
      }, {}),
    [units]
  );

  const categoryLabelByCode = useMemo(
    () =>
      categories.reduce<Record<string, string>>((acc, c) => {
        acc[c.code] = c.label;
        return acc;
      }, {}),
    [categories]
  );

  const supplierNameByCode = useMemo(
    () =>
      suppliers.reduce<Record<string, string>>((acc, s) => {
        acc[s.code] = s.name;
        return acc;
      }, {}),
    [suppliers]
  );

  /* =========================
   * Fetch data
   * ========================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const dropdowns = (await getAllDropdownMaterial()) as unknown as DropdownPayload;
        const resMaterial = (await getMaterial()) as unknown as Material[];

        setMaterials(resMaterial || []);
        setSuppliers(dropdowns?.SUPPLIERS || []);
        setCategories(dropdowns?.MATERIAL_CATEGORY || []);
        setUnits(dropdowns?.UNIT || []);
        setStatuses(dropdowns?.MATERIAL_STATUS || []);
      } catch (error) {
        console.error("Fetch data failed:", error);
        toast.error(ERROR_MESSAGES.fetchFailed || "Failed to fetch materials.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* =========================
   * UI helpers
   * ========================= */
  const getStatusColor = (status: MaterialStatus): string => {
    const colors: Record<MaterialStatus, string> = {
      Active: "status-success",
      Inactive: "status-inactive",
      Discontinued: "status-error",
    };
    return colors[status] || "status-inactive";
  };

  const getCategoryColor = (categoryCode: MaterialCategory): string | undefined => {
    // Map by label to color, but lookup label by code first
    const label = categoryLabelByCode[categoryCode] || categoryCode;
    const colorsByLabel: Record<string, string> = {
      "Raw Material": "status-info",
      Component: "status-purple",
      Subassembly: "status-indigo",
      Packaging: "status-warning",
      Consumable: "status-yellow",
      Tool: "status-inactive",
    };
    return colorsByLabel[label] || "status-info";
  };

  const filteredMaterials = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    return materials.filter((m) => {
      const matchesSearch =
        !searchLower ||
        m.code.toLowerCase().includes(searchLower) ||
        m.name.toLowerCase().includes(searchLower) ||
        (m.description || "").toLowerCase().includes(searchLower);

      const matchesCategory = filterCategory === "all" || m.category === filterCategory;
      const matchesStatus = filterStatus === "all" || m.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [materials, searchTerm, filterCategory, filterStatus]);

  const toggleMaterialExpand = (code: string) => {
    setExpandedMaterials((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const openCreateModal = () => {
    setFormData((prev) => ({
      ...initialFormData,
      code: `MAT-${String(materials.length + 1).padStart(3, "0")}`,
      supplierCode: suppliers.length > 0 ? suppliers[0].code : "",
      unitCode: units.length > 0 ? units[0].code : "PCS",
      category: (categories[0]?.code as MaterialCategory) || "Raw Material",
      status: (statuses[0]?.code as MaterialStatus) || "Active",
    }));
    setEditingMaterial(null);
    setViewMode("edit");
    setIsModalOpen(true);
  };

  const openEditModal = (material: Material) => {
    const { supplierName: _omit, ...rest } = material;
    setFormData({ ...rest });
    setEditingMaterial(material);
    setViewMode("edit");
    setIsModalOpen(true);
  };

  const openViewModal = (material: Material) => {
    setEditingMaterial(material);
    setViewMode("view");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
    setViewMode(null);
  };

  /* =========================
   * Save/Delete
   * ========================= */
  const handleSaveMaterial = () => {
    // basic validation
    if (!formData.code || !formData.name || !formData.category) {
      toast.error("Please fill in required fields: Code, Name, and Category.");
      return;
    }
    const numericInvalid =
      formData.standardCost < 0 ||
      formData.leadTimeDays < 0 ||
      formData.minStock < 0 ||
      formData.maxStock < 0 ||
      formData.reorderPoint < 0;
    if (numericInvalid) {
      toast.error("Numeric values cannot be negative.");
      return;
    }
    if (formData.minStock > formData.maxStock) {
      toast.error("Min Stock cannot be greater than Max Stock.");
      return;
    }

    const supplierName = supplierNameByCode[formData.supplierCode] || "";

    const newMaterial: Material = {
      ...formData,
      supplierName,
    };

    setMaterials((prev) => {
      if (editingMaterial) {
        return prev.map((m) => (m.code === editingMaterial.code ? newMaterial : m));
      }
      // prevent duplicate code
      if (prev.some((m) => m.code === newMaterial.code)) {
        toast.error(`Material code "${newMaterial.code}" already exists.`);
        return prev;
      }
      return [...prev, newMaterial];
    });

    toast.success("Material saved.");
    closeModal();
  };

  const handleDeleteMaterial = (code: string) => {
    if (window.confirm(`Are you sure you want to delete material ${code}?`)) {
      setMaterials((prev) => prev.filter((m) => m.code !== code));
      toast.success("Material deleted.");
    }
  };

  const handleFormChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
      return;
    }
    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : parseFloat(value),
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  /* =========================
   * Demo: Stock Status
   * ========================= */
  const calculateStockStatus = (material: Material): StockStatusInfo => {
    // demo only
    const currentStock = Math.floor(Math.random() * (material.maxStock + 1));
    if (currentStock <= material.reorderPoint)
      return { status: "Low", color: "text-red-600", stock: currentStock };
    if (currentStock < material.minStock)
      return { status: "Medium", color: "text-yellow-600", stock: currentStock };
    return { status: "Good", color: "text-green-600", stock: currentStock };
  };

  /* =========================
   * Render
   * ========================= */
  return (
    <div className="text-white">
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Materials Master Data</h1>
              <p className="text-sm text-white/60 mt-1">
                Manage raw materials, components, and supplies
              </p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-3">
            <button className="btn btn-outline">
              <Upload size={18} /> Import
            </button>
            <button className="btn btn-outline">
              <Download size={18} /> Export
            </button>
            <button onClick={openCreateModal} className="btn btn-primary">
              <Plus size={18} /> New Material
            </button>
          </div>
        }
        tabs={
          <div className="flex gap-4 my-0.5 mx-0.5">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
              />
              <input
                type="text"
                placeholder="Search materials by code, name..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="glass-input w-full !pl-10 pr-4"
              />
            </div>

            {/* Category filter by code */}
            <select
              value={filterCategory}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setFilterCategory((e.target.value as MaterialCategory) || "all")
              }
              className="glass-input"
            >
              <option value="all" className="select option">
                All Categories
              </option>
              {categories.map((cat) => (
                <option key={cat.code} value={cat.code} className="select option">
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Status filter by code */}
            <select
              value={filterStatus}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setFilterStatus((e.target.value as MaterialStatus) || "all")
              }
              className="glass-input"
            >
              <option value="all" className="select option">
                All Status
              </option>
              {statuses.map((s) => (
                <option key={s.code} value={s.code} className="select option">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
          {loading ? (
            <Loading text="Loading materials..." />
          ) : filteredMaterials.length === 0 ? (
            <EmptyState
              icon={<Box size={48} className="mx-auto text-white/50 mb-4" />}
              title="No materials found"
              message="Create your first material to get started"
              buttonLabel="Create Material"
              onButtonClick={openCreateModal}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    {["", "Code", "Name", "Category", "Unit", "Cost", "Stock", "Status", "Actions"].map(
                      (h) => (
                        <th key={h} className="px-6 py-3 text-left text-sm uppercase font-semibold text-white/80">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredMaterials.map((m) => {
                    const expanded = expandedMaterials[m.code];
                    const stockStatus = calculateStockStatus(m);
                    return (
                      <React.Fragment key={m.code}>
                        <tr className="hover:bg-white/5">
                          <td className="px-6 py-3 align-top">
                            <button onClick={() => toggleMaterialExpand(m.code)} className="p-1 hover:bg-white/10 rounded">
                              {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                          </td>
                          <td className="px-6 py-3 align-top font-medium">{m.code}</td>
                          <td className="px-6 py-3 align-top">{m.name}</td>
                          <td className="px-6 py-3 align-top">
                            <span className={`chip ${getCategoryColor(m.category)}`}>
                              {categoryLabelByCode[m.category] ?? m.category}
                            </span>
                          </td>
                          <td className="px-6 py-3 align-top text-sm">{unitLabelByCode[m.unitCode] ?? m.unitCode}</td>
                          <td className="px-6 py-3 align-top text-sm">${m.standardCost.toFixed(2)}</td>
                          <td className={`px-6 py-3 align-top text-sm ${stockStatus.color}`}>
                            {stockStatus.stock} ({stockStatus.status})
                          </td>
                          <td className="px-6 py-3 align-top">
                            <span className={`chip ${getStatusColor(m.status)}`}>{m.status}</span>
                          </td>
                          <td className="px-6 py-3 align-top">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openViewModal(m)} className="p-1 hover:bg-white/10 rounded">
                                <Eye size={16} className="text-white/70" />
                              </button>
                              <button onClick={() => openEditModal(m)} className="p-1 hover:bg-white/10 rounded">
                                <Edit size={16} className="text-cyan-300" />
                              </button>
                              <button onClick={() => handleDeleteMaterial(m.code)} className="p-1 hover:bg-white/10 rounded">
                                <Trash2 size={16} className="text-rose-300" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded row */}
                        {expanded && (
                          <tr className="bg-white/[0.03]">
                            <td colSpan={9} className="px-6 pb-6">
                              <div className="grid grid-cols-3 gap-6 mt-2">
                                <div className="border border-white/10 rounded-lg p-4 bg-white/5 text-sm">
                                  <h4 className="font-semibold mb-1">Description</h4>
                                  <p>{m.description || "N/A"}</p>
                                </div>
                                <div className="border border-white/10 rounded-lg p-4 bg-white/5 text-sm">
                                  <h4 className="font-semibold mb-1">Supplier</h4>
                                  <p>{m.supplierName || supplierNameByCode[m.supplierCode] || "-"} ({m.supplierCode || "-"})</p>
                                  <p>Location: {m.storageLocation || "-"}</p>
                                </div>
                                <div className="border border-white/10 rounded-lg p-4 bg-white/5 text-sm">
                                  <h4 className="font-semibold mb-1">Stock Levels</h4>
                                  <p>Min: {m.minStock} / Max: {m.maxStock}</p>
                                  <p>Reorder: {m.reorderPoint}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="xl"
        title={
          <span className="text-xl font-semibold">
            {viewMode === "view" ? "Material Details" : editingMaterial ? "Edit Material" : "Create New Material"}
          </span>
        }
        footer={
          viewMode !== "view"
            ? (
              <>
                <button onClick={closeModal} className="btn btn-outline">Cancel</button>
                <button onClick={handleSaveMaterial} className="btn btn-primary">
                  <Save size={18} />
                  Save Changes
                </button>
              </>
            )
            : undefined
        }
      >
        {viewMode === "view" && editingMaterial ? (
          <div className="space-y-6 text-white">
            <div className="grid grid-cols-3 gap-6">
              <p>
                <label className="text-sm text-white/60">Code</label>
                <span className="block mt-1 text-lg font-semibold">{editingMaterial.code}</span>
              </p>
              <p>
                <label className="text-sm text-white/60">Name</label>
                <span className="block mt-1">{editingMaterial.name}</span>
              </p>
              <p>
                <label className="text-sm text-white/60">Category</label>
                <span className={`block mt-1 text-xs font-medium px-2 py-1 rounded-full w-fit border ${getCategoryColor(editingMaterial.category)}`}>
                  {categoryLabelByCode[editingMaterial.category] ?? editingMaterial.category}
                </span>
              </p>
            </div>

            <p>
              <label className="text-sm text-white/60">Description</label>
              <span className="block mt-1">{editingMaterial.description || "-"}</span>
            </p>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-4 border border-white/10 rounded-lg bg-white/5">
              <h3 className="col-span-2 text-md font-semibold mb-2">Details</h3>
              <p>
                <label className="text-sm text-white/60">Unit</label>
                <span className="block mt-1">{unitLabelByCode[editingMaterial.unitCode] ?? editingMaterial.unitCode}</span>
              </p>
              <p>
                <label className="text-sm text-white/60">Standard Cost</label>
                <span className="block mt-1">${editingMaterial.standardCost.toFixed(2)}</span>
              </p>
              <p>
                <label className="text-sm text-white/60">Lead Time</label>
                <span className="block mt-1">{editingMaterial.leadTimeDays} days</span>
              </p>
              <p>
                <label className="text-sm text-white/60">Supplier</label>
                <span className="block mt-1">{editingMaterial.supplierName || supplierNameByCode[editingMaterial.supplierCode] || "-"}</span>
              </p>
              <p>
                <label className="text-sm text-white/60">Min/Max Stock</label>
                <span className="block mt-1">
                  {editingMaterial.minStock} / {editingMaterial.maxStock} {unitLabelByCode[editingMaterial.unitCode] ?? editingMaterial.unitCode}
                </span>
              </p>
              <p>
                <label className="text-sm text-white/60">Reorder Point</label>
                <span className="block mt-1">
                  {editingMaterial.reorderPoint} {unitLabelByCode[editingMaterial.unitCode] ?? editingMaterial.unitCode}
                </span>
              </p>
            </div>

            {editingMaterial.notes && (
              <p className="p-3 bg-amber-500/10 border border-amber-400/20 rounded-lg">
                <label className="text-sm font-semibold text-amber-200">Notes</label>
                <span className="block mt-1 text-amber-100/90">{editingMaterial.notes}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6 text-white">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">Material Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleFormChange}
                    readOnly={!!editingMaterial}
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="glass-input w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-white/80 block mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={2}
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="glass-input w-full"
                  >
                    {categories.map((c) => (
                      <option key={c.code} value={c.code} className="select option">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">Unit of Measure *</label>
                  <select
                    name="unitCode"
                    value={formData.unitCode}
                    onChange={handleFormChange}
                    className="glass-input w-full"
                  >
                    {units.map((u) => (
                      <option key={u.code} value={u.code} className="select option">
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">Standard Cost *</label>
                  <input
                    type="number"
                    name="standardCost"
                    value={formData.standardCost}
                    onChange={handleFormChange}
                    min={0}
                    step="0.01"
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="glass-input w-full"
                  >
                    {statuses.map((s) => (
                      <option key={s.code} value={s.code} className="select option">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Stock & Supplier</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">Min Stock Level</label>
                  <input
                    type="number"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleFormChange}
                    min={0}
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">Max Stock Level</label>
                  <input
                    type="number"
                    name="maxStock"
                    value={formData.maxStock}
                    onChange={handleFormChange}
                    min={0}
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">Reorder Point</label>
                  <input
                    type="number"
                    name="reorderPoint"
                    value={formData.reorderPoint}
                    onChange={handleFormChange}
                    min={0}
                    className="glass-input w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-white/80 block mb-2">Supplier *</label>
                  <select
                    name="supplierCode"
                    value={formData.supplierCode}
                    onChange={handleFormChange}
                    className="glass-input w-full"
                  >
                    {suppliers.length === 0 && (
                      <option value="" className="select option">
                        No suppliers
                      </option>
                    )}
                    {suppliers.map((s) => (
                      <option key={s.code} value={s.code} className="select option">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">Lead Time (days)</label>
                  <input
                    type="number"
                    name="leadTimeDays"
                    value={formData.leadTimeDays}
                    onChange={handleFormChange}
                    min={0}
                    className="glass-input w-full"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-sm font-medium text-white/80 block mb-2">Storage Location</label>
                  <input
                    type="text"
                    name="storageLocation"
                    value={formData.storageLocation}
                    onChange={handleFormChange}
                    className="glass-input w-full"
                  />
                </div>
                <div className="col-span-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="batchTracking"
                      checked={formData.batchTracking}
                      onChange={handleFormChange}
                      className="h-4 w-4 rounded border-white/30 bg-white/10"
                    />
                    <span className="text-sm font-medium text-white/80">Enable Batch Tracking</span>
                  </label>
                </div>
                <div className="col-span-3">
                  <label className="text-sm font-medium text-white/80 block mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows={2}
                    className="glass-input w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MaterialsMasterData;
