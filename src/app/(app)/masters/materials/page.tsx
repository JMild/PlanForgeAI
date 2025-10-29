"use client";

import React, { useEffect, useMemo, useState, ChangeEvent, FC } from "react";
import { Plus, Search, Edit, Trash2, Eye, Download, Upload, Save } from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import Modal from "@/src/components/shared/Modal";
import toast from "react-hot-toast";
import { ERROR_MESSAGES } from "@/src/config/messages";
import { ExpandableDataTable } from "@/src/components/shared/table/ExpandableDataTable";
import { getAllDropdownMaterial } from "@/src/services/config";
import { getMaterial } from "@/src/services/master";

/* ========= Types from dropdowns ========= */
type Supplier = { supplier_code: string; supplier_name: string };
type UnitOption = { id: number; code: string; label: string };
type CategoryOption = { id: number; code: string; label: string };
type StatusOption = {
  id: number;
  code: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
  label: "Active" | "Inactive" | "Discontinued";
};

/* ========= API material (ดิบ) ========= */
type ApiMaterial = {
  material_code: string;
  material_name: string;
  description?: string;
  category_code: string; // อาจเป็น id (string-number) จาก backend
  uom_code: string; // อาจเป็น id (string-number) จาก backend
  lead_time_days?: number;
  min_stock?: number;
  max_stock?: number;
  reorder_point?: number;
  supplier_code?: string;
  storage_location?: string;
  batch_tracking?: 0 | 1;
  status: "Active" | "Inactive" | "Discontinued";
  notes?: string;
};

/* ========= Internal model ========= */
type MaterialStatus = "Active" | "Inactive" | "Discontinued";
type Material = {
  material_code: string;
  material_name: string;
  description: string;
  category_code: string; // เก็บเป็น code เช่น "RAW"
  uom_code: string; // เก็บเป็น code เช่น "PCS"
  leadTimeDays: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  supplierCode: string; // ใช้ supplier_code
  supplierName?: string; // ชื่อไว้โชว์
  storageLocation: string;
  batchTracking: boolean;
  status: MaterialStatus;
  notes: string;
};

const MaterialsMasterData: FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [statuses, setStatuses] = useState<StatusOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<MaterialStatus | "all">("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [viewMode, setViewMode] = useState<"view" | "edit" | null>(null);

  const [formData, setFormData] = useState<Material>({
    material_code: "",
    material_name: "",
    description: "",
    category_code: "",
    uom_code: "",
    leadTimeDays: 0,
    minStock: 0,
    maxStock: 0,
    reorderPoint: 0,
    supplierCode: "",
    supplierName: "",
    storageLocation: "",
    batchTracking: false,
    status: "Active",
    notes: "",
  });

  /* ===== memo maps ===== */
  const supplierByCode = useMemo(() => {
    const m = new Map<string, Supplier>();
    suppliers.forEach((s) => m.set(s.supplier_code, s));
    return m;
  }, [suppliers]);

  const unitLabelByCode = useMemo(
    () => Object.fromEntries(units.map((u) => [u.code, u.label])),
    [units]
  );
  const categoryLabelByCode = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.code, c.label])),
    [categories]
  );

  /* ===== fetch + normalize (ทำครั้งเดียวให้จบ ป้องกัน race) ===== */
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);

        const dropdowns = await getAllDropdownMaterial();
        // map ให้แน่ใจว่ามีฟิลด์ที่ต้องใช้
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SUPPLIERS: Supplier[] = (dropdowns?.SUPPLIERS || []).map((s: any) => ({
          supplier_code: s.supplier_code ?? "",
          supplier_name: s.supplier_name ?? "",
        }));
        const MATERIAL_CATEGORY: CategoryOption[] = dropdowns?.MATERIAL_CATEGORY || [];
        const UNIT: UnitOption[] = dropdowns?.UNIT || [];
        const MATERIAL_STATUS: StatusOption[] = dropdowns?.MATERIAL_STATUS || [];

        setSuppliers(SUPPLIERS);
        setCategories(MATERIAL_CATEGORY);
        setUnits(UNIT);
        setStatuses(MATERIAL_STATUS);

        // สร้าง map ชั่วคราวจาก dropdowns เพื่อ normalize materials ดิบ
        const catIdMap = new Map<number, CategoryOption>(
          MATERIAL_CATEGORY.map((c) => [c.id, c])
        );
        const unitIdMap = new Map<number, UnitOption>(UNIT.map((u) => [u.id, u]));
        const supplierCodeMap = new Map<string, Supplier>(
          SUPPLIERS.map((s) => [s.supplier_code, s])
        );

        const apiMaterials: ApiMaterial[] = await getMaterial();

        const normalized: Material[] = apiMaterials.map((row) => {
          const cat = catIdMap.get(Number(row.category_code));
          const uom = unitIdMap.get(Number(row.uom_code));
          const sup = row.supplier_code ? supplierCodeMap.get(row.supplier_code) : undefined;

          return {
            material_code: row.material_code,
            material_name: row.material_name,
            description: row.description ?? "",
            category_code: cat?.code ?? String(row.category_code),
            uom_code: uom?.code ?? String(row.uom_code),
            leadTimeDays: Number(row.lead_time_days ?? 0),
            minStock: Number(row.min_stock ?? 0),
            maxStock: Number(row.max_stock ?? 0),
            reorderPoint: Number(row.reorder_point ?? 0),
            supplierCode: row.supplier_code ?? "",
            supplierName: sup?.supplier_name,
            storageLocation: row.storage_location ?? "",
            batchTracking: (row.batch_tracking ?? 0) === 1,
            status: row.status,
            notes: row.notes ?? "",
          };
        });

        setMaterials(normalized);
      } catch (e) {
        console.error(e);
        toast.error(ERROR_MESSAGES.fetchFailed || "Failed to fetch materials.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  /* ===== helpers ===== */
  const getStatusColor = (status: MaterialStatus) =>
    status === "Active"
      ? "status-success"
      : status === "Inactive"
      ? "status-inactive"
      : "status-error";

  const calculateStockStatus = (m: Material) => {
    const current = Math.floor(Math.random() * ((m.maxStock || 0) + 1));
    if (current <= (m.reorderPoint || 0))
      return { stock: current, color: "text-red-500" };
    if (current < (m.minStock || 0))
      return { stock: current, color: "text-amber-500" };
    return { stock: current, color: "text-emerald-500" };
  };

  /* ===== filters ===== */
  const filteredMaterials = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return materials.filter((m) => {
      const matchQ =
        !q ||
        m.material_code.toLowerCase().includes(q) ||
        m.material_name.toLowerCase().includes(q) ||
        (m.description || "").toLowerCase().includes(q);
      const matchCat = filterCategory === "all" || m.category_code === filterCategory;
      const matchStatus = filterStatus === "all" || m.status === filterStatus;
      return matchQ && matchCat && matchStatus;
    });
  }, [materials, searchTerm, filterCategory, filterStatus]);

  /* ===== modal controls ===== */
  const openCreateModal = () => {
    const nextCode = `MAT-${String(materials.length + 1).padStart(3, "0")}`;
    setFormData({
      material_code: nextCode,
      material_name: "",
      description: "",
      category_code: categories[0]?.code ?? "",
      uom_code: units[0]?.code ?? "",
      leadTimeDays: 0,
      minStock: 0,
      maxStock: 0,
      reorderPoint: 0,
      supplierCode: suppliers[0]?.supplier_code ?? "",
      supplierName: suppliers[0]?.supplier_name ?? "",
      storageLocation: "",
      batchTracking: false,
      status: "Active",
      notes: "",
    });
    setEditingMaterial(null);
    setViewMode("edit");
    setIsModalOpen(true);
  };

  const openEditModal = (m: Material) => {
    setFormData({ ...m });
    setEditingMaterial(m);
    setViewMode("edit");
    setIsModalOpen(true);
  };

  const openViewModal = (m: Material) => {
    setEditingMaterial(m);
    setViewMode("view");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
    setViewMode(null);
  };

  /* ===== save/delete ===== */
  const handleSaveMaterial = () => {
    if (
      !formData.material_code ||
      !formData.material_name ||
      !formData.category_code ||
      !formData.uom_code
    ) {
      toast.error("Please fill in required fields (Code, Name, Category, Unit).");
      return;
    }
    if (
      formData.minStock < 0 ||
      formData.maxStock < 0 ||
      formData.reorderPoint < 0 ||
      formData.leadTimeDays < 0
    ) {
      toast.error("Numeric values cannot be negative.");
      return;
    }
    if (formData.minStock > formData.maxStock) {
      toast.error("Min Stock cannot be greater than Max Stock.");
      return;
    }

    // เติมชื่อ supplier ให้ตรงกับ code
    const sup = formData.supplierCode
      ? supplierByCode.get(formData.supplierCode)
      : undefined;
    const payload: Material = { ...formData, supplierName: sup?.supplier_name };

    setMaterials((prev) => {
      if (editingMaterial) {
        return prev.map((m) =>
          m.material_code === editingMaterial.material_code ? payload : m
        );
      }
      if (prev.some((m) => m.material_code === payload.material_code)) {
        toast.error(`Material code "${payload.material_code}" already exists.`);
        return prev;
      }
      return [...prev, payload];
    });

    toast.success("Material saved.");
    closeModal();
  };

  const handleDeleteMaterial = (code: string) => {
    if (confirm(`Delete material ${code}?`)) {
      setMaterials((prev) => prev.filter((m) => m.material_code !== code));
      toast.success("Material deleted.");
    }
  };

  /* ===== form change ===== */
  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { name, value, type, checked } = e.target as any;
    if (type === "checkbox") {
      setFormData((p) => ({ ...p, [name]: checked }));
    } else if (type === "number") {
      setFormData((p) => ({ ...p, [name]: value === "" ? 0 : Number(value) }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input w-full !pl-10 pr-4"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="glass-input w-44"
            >
              <option value="all" className="select option">
                All Categories
              </option>
              {categories.map((c) => (
                <option key={c.code} value={c.code} className="select option">
                  {c.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as MaterialStatus | "all")
              }
              className="glass-input w-32"
            >
              <option value="all" className="select option">
                All Status
              </option>
              {statuses.map((s) => (
                <option key={s.code} value={s.label} className="select option">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="px-4 py-6">
        <ExpandableDataTable
          columns={[
            {
              key: "material_name",
              label: "Name",
              render: (m: Material) => (
                <div className="text-sm flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span>{m.material_name}</span>
                  </div>
                  {m.description && (
                    <div className="text-white/70">{m.description}</div>
                  )}
                </div>
              ),
            },
            {
              key: "category",
              label: "Category",
              render: (m: Material) =>
                categoryLabelByCode[m.category_code] ?? m.category_code,
            },
            {
              key: "uom_code",
              label: "Unit",
              render: (m: Material) =>
                unitLabelByCode[m.uom_code] ?? m.uom_code,
            },
            {
              key: "stock",
              label: "Stock",
              render: (m: Material) => {
                const s = calculateStockStatus(m);
                return (
                  <span className={s.color}>
                    {s.stock}
                  </span>
                );
              },
            },
            {
              key: "status",
              label: "Status",
              align: "center",
              render: (m: Material) => (
                <span className={`chip items-center justify-center ${getStatusColor(m.status)}`}>
                  {m.status}
                </span>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              align: "center",
              render: (m: Material) => (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => openViewModal(m)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <Eye size={16} className="text-white/70" />
                  </button>
                  <button
                    onClick={() => openEditModal(m)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <Edit size={16} className="text-cyan-300" />
                  </button>
                  <button
                    onClick={() => handleDeleteMaterial(m.material_code)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <Trash2 size={16} className="text-rose-300" />
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredMaterials}
          rowKey={(m) => m.material_code}
          renderExpandedRow={(m: Material) => (
            <div className="grid grid-cols-2 gap-6">
              <div className="border border-white/10 rounded-lg p-4 bg-white/5 text-sm">
                <h4 className="font-semibold mb-1">Supplier</h4>
                <p>
                  {m.supplierName ??
                    supplierByCode.get(m.supplierCode)?.supplier_name ??
                    "-"}
                </p>
                <p>Location: {m.storageLocation || "-"}</p>
              </div>
              <div className="border border-white/10 rounded-lg p-4 bg-white/5 text-sm">
                <h4 className="font-semibold mb-1">Stock Levels</h4>
                <p>
                  Min: {m.minStock} / Max: {m.maxStock}
                </p>
                <p>Reorder: {m.reorderPoint}</p>
              </div>
            </div>
          )}
          isLoading={loading}
        />
      </div>

      {/* ===== Modal ===== */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="xl"
        title={
          <span className="text-xl font-semibold">
            {viewMode === "view"
              ? "Material Details"
              : editingMaterial
              ? "Edit Material"
              : "Create New Material"}
          </span>
        }
        footer={
          viewMode === "view" ? (
            <div className="flex items-center justify-end gap-3 w-full">
              <button onClick={closeModal} className="btn btn-outline">
                Close
              </button>
              <button onClick={() => setViewMode("edit")} className="btn btn-primary">
                <Edit size={18} /> Edit Material
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 w-full">
              <button onClick={closeModal} className="btn btn-outline">
                Cancel
              </button>
              <button onClick={handleSaveMaterial} className="btn btn-primary">
                <Save size={18} /> Save Changes
              </button>
            </div>
          )
        }
      >
        {viewMode === "view" && editingMaterial ? (
          <div className="space-y-6 text-white">
            <div className="grid grid-cols-3 gap-6">
              <p>
                <label className="text-sm text-white/60">Name</label>
                <span className="block mt-1">{editingMaterial.material_name}</span>
              </p>
              <p>
                <label className="text-sm text-white/60">Category</label>
                <span className="block mt-1">
                  {categoryLabelByCode[editingMaterial.category_code] ??
                    editingMaterial.category_code}
                </span>
              </p>
            </div>

            <p>
              <label className="text-sm text-white/60">Description</label>
              <span className="block mt-1">
                {editingMaterial.description || "-"}
              </span>
            </p>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-4 border border-white/10 rounded-lg bg-white/5">
              <h3 className="col-span-2 text-md font-semibold mb-2">Details</h3>
              <p>
                <label className="text-sm text-white/60">Unit</label>
                <span className="block mt-1">
                  {unitLabelByCode[editingMaterial.uom_code] ??
                    editingMaterial.uom_code}
                </span>
              </p>
              <p>
                <label className="text-sm text-white/60">Lead Time</label>
                <span className="block mt-1">
                  {editingMaterial.leadTimeDays} days
                </span>
              </p>
              <p>
                <label className="text-sm text-white/60">Supplier</label>
                <span className="block mt-1">
                  {editingMaterial.supplierName ??
                    supplierByCode.get(editingMaterial.supplierCode)
                      ?.supplier_name ??
                    "-"}
                </span>
              </p>
              <p>
                <label className="text-sm text-white/60">Min/Max Stock</label>
                <span className="block mt-1">
                  {editingMaterial.minStock} / {editingMaterial.maxStock}{" "}
                  {unitLabelByCode[editingMaterial.uom_code] ??
                    editingMaterial.uom_code}
                </span>
              </p>
              <p>
                <label className="text-sm text-white/60">Reorder Point</label>
                <span className="block mt-1">
                  {editingMaterial.reorderPoint}{" "}
                  {unitLabelByCode[editingMaterial.uom_code] ??
                    editingMaterial.uom_code}
                </span>
              </p>
            </div>

            {editingMaterial.notes && (
              <p className="p-3 bg-amber-500/10 border border-amber-400/20 rounded-lg">
                <label className="text-sm font-semibold text-amber-200">
                  Notes
                </label>
                <span className="block mt-1 text-amber-100/90">
                  {editingMaterial.notes}
                </span>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6 text-white">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="material_name"
                    value={formData.material_name}
                    onChange={handleFormChange}
                    className="glass-input w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={2}
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Category *
                  </label>
                  <select
                    name="category_code"
                    value={formData.category_code}
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
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Unit *
                  </label>
                  <select
                    name="uom_code"
                    value={formData.uom_code}
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
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="glass-input w-full"
                  >
                    {statuses.map((s) => (
                      <option key={s.code} value={s.label} className="select option">
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
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Min Stock
                  </label>
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
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Max Stock
                  </label>
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
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Reorder Point
                  </label>
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
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Supplier *
                  </label>
                  <select
                    name="supplierCode"
                    value={formData.supplierCode}
                    onChange={handleFormChange}
                    className="glass-input w-full"
                  >
                    <option value="" className="select option">
                      -- Select supplier --
                    </option>
                    {suppliers.map((s) => (
                      <option
                        key={s.supplier_code}
                        value={s.supplier_code}
                        className="select option"
                      >
                        {s.supplier_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Lead Time (days)
                  </label>
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
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Storage Location
                  </label>
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
                    <span className="text-sm font-medium text-white/80">
                      Enable Batch Tracking
                    </span>
                  </label>
                </div>

                <div className="col-span-3">
                  <label className="text-sm font-medium text-white/80 block mb-2">
                    Notes
                  </label>
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