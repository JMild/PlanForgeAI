"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  Upload,
  Download,
  ChevronDown,
  ChevronRight,
  Cpu,
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import Modal from "@/src/components/shared/Modal";
import { getBOM, getProduct } from "@/src/lib/api";
import Loading from "@/src/components/Loading";
import EmptyState from "@/src/components/shared/EmptyState";
import toast from "react-hot-toast";
import { ERROR_MESSAGES } from "@/src/config/messages";

// ===== Types =====
type Product = {
  code: string;
  name: string;
  unit: string;
  defaultRoutingId?: string;
  defaultBomId?: string;
  lotSize?: number;
  status: "Active" | "Inactive";
  createdAt: string;
};

type BOMLine = {
  id: string;
  materialCode: string;
  materialName: string;
  qtyPer: number;
  unit: string;
  scrapRate: number;   // 0..1
  gateProcess?: string;
};

type BOM = {
  id: string;
  productCode: string;
  effectiveDate: string; // YYYY-MM-DD
  status: "Active" | "Draft" | "Obsolete";
  lines: BOMLine[];
};

const BOMPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters/Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | BOM["status"]>("all");
  const [filterProduct, setFilterProduct] = useState<"all" | string>("all");

  // Expand rows
  const [expandedBOMs, setExpandedBOMs] = useState<Set<string>>(new Set());

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resProducts = (await getProduct()) as Product[];
        const resBoms = (await getBOM()) as BOM[];
        setProducts(resProducts);
        setBoms(resBoms);
      } catch (error) {
        console.error('Fetch data failed:', error);
        toast.error(ERROR_MESSAGES.fetchFailed);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const productMap = useMemo(
    () =>
      products.reduce<Record<string, Product>>((acc, p) => {
        acc[p.code] = p;
        return acc;
      }, {}),
    [products]
  );

  // ===== BOM Form State for Modal =====
  const [bomForm, setBomForm] = useState<Partial<BOM>>({
    productCode: "",
    effectiveDate: new Date().toISOString().split("T")[0],
    status: "Draft",
    lines: [],
  });

  // ===== Filtered list =====
  const filteredBOMs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return boms.filter((b) => {
      const matchesSearch =
        !term ||
        b.id.toLowerCase().includes(term) ||
        b.productCode.toLowerCase().includes(term) ||
        (productMap[b.productCode]?.name?.toLowerCase() ?? "").includes(term);
      const matchesStatus = filterStatus === "all" || b.status === filterStatus;
      const matchesProduct = filterProduct === "all" || b.productCode === filterProduct;
      return matchesSearch && matchesStatus && matchesProduct;
    });
  }, [boms, searchTerm, filterStatus, filterProduct, productMap]);

  // ===== Modal helpers =====
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedBOM(null);
    setBomForm({
      productCode: "",
      effectiveDate: new Date().toISOString().split("T")[0],
      status: "Draft",
      lines: [],
    });
  };

  // ===== Handlers =====
  const handleAddBOM = () => {
    setBomForm({
      productCode: "",
      effectiveDate: new Date().toISOString().split("T")[0],
      status: "Draft",
      lines: [],
    });
    setSelectedBOM(null);
    setIsEditing(false);
    openModal();
  };

  const handleEditBOM = (bom: BOM) => {
    setBomForm(bom);
    setSelectedBOM(bom);
    setIsEditing(true);
    openModal();
  };

  const handleSaveBOM = () => {
    if (!bomForm.productCode) {
      alert("Product code is required");
      return;
    }

    if (selectedBOM) {
      const updated = bomForm as BOM;
      setBoms((prev) => prev.map((b) => (b.id === selectedBOM.id ? updated : b)));
    } else {
      const nextId = `BOM${String(boms.length + 1).padStart(3, "0")}`;
      const newBOM: BOM = {
        id: nextId,
        productCode: bomForm.productCode!,
        effectiveDate: bomForm.effectiveDate!,
        status: (bomForm.status as BOM["status"]) || "Draft",
        lines: bomForm.lines || [],
      };
      setBoms((prev) => [...prev, newBOM]);
    }

    closeModal();
  };

  const handleDeleteBOM = (id: string) => {
    if (confirm(`Delete BOM ${id}?`)) {
      setBoms((prev) => prev.filter((b) => b.id !== id));
      setExpandedBOMs((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleAddBOMLine = () => {
    const newLine: BOMLine = {
      id: `L${Date.now()}`,
      materialCode: "",
      materialName: "",
      qtyPer: 1,
      unit: "PCS",
      scrapRate: 0,
    };
    setBomForm((prev) => ({
      ...prev,
      lines: [...(prev.lines || []), newLine],
    }));
  };

  const handleUpdateBOMLine = <K extends keyof BOMLine>(
    lineId: string,
    field: K,
    value: BOMLine[K]
  ) => {
    setBomForm((prev) => ({
      ...prev,
      lines: (prev.lines || []).map((line) =>
        line.id === lineId ? { ...line, [field]: value } : line
      ),
    }));
  };

  const handleDeleteBOMLine = (lineId: string) => {
    setBomForm((prev) => ({
      ...prev,
      lines: (prev.lines || []).filter((line) => line.id !== lineId),
    }));
  };

  const toggleBOMExpand = (id: string) => {
    setExpandedBOMs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Export CSV
  const exportToCSV = () => {
    const rows = [
      ["BOM ID", "ProductCode", "ProductName", "EffectiveDate", "Status", "Lines"],
      ...boms.map((b) => [
        b.id,
        b.productCode,
        productMap[b.productCode]?.name ?? "",
        b.effectiveDate,
        b.status,
        String(b.lines.length),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bom_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    alert("Import is not implemented in this demo.");
  };

  const bomColumns = [
    {
      key: "expand",
      label: "",
      render: (bom: BOM) => (
        <button
          onClick={() => toggleBOMExpand(bom.id)}
          className="p-1 hover:bg-white/10 rounded"
          aria-label={expandedBOMs.has(bom.id) ? "Collapse" : "Expand"}
        >
          {expandedBOMs.has(bom.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
      ),
    },
    {
      key: "bom",
      label: "BOM",
      render: (bom: BOM) => (
        <div>
          <div className="font-medium">{bom.id}</div>
          <div className="text-xs text-white/60">
            {bom.status} • {bom.lines.length} items
          </div>
        </div>
      ),
    },
    {
      key: "product",
      label: "Product",
      render: (bom: BOM) => {
        const product = productMap[bom.productCode];
        return (
          <div className="text-sm">
            <span className="font-medium">{bom.productCode}</span>
            {product?.name && <span className="text-white/60"> — {product.name}</span>}
          </div>
        );
      },
    },
    {
      key: "components",
      label: "Components",
      render: (bom: BOM) => <span className="text-sm">{bom.lines.length}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (bom: BOM) => {
        const statusClass =
          bom.status === "Active"
            ? "status-success"
            : bom.status === "Draft"
              ? "status-warning"
              : "status-inactive";
        return <span className={`chip ${statusClass}`}>{bom.status}</span>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (bom: BOM) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleEditBOM(bom)}
            className="p-1 hover:bg-white/10 rounded"
            title="Edit BOM"
          >
            <Edit size={16} className="text-cyan-300" />
          </button>
          <button
            onClick={() => handleDeleteBOM(bom.id)}
            className="p-1 hover:bg-white/10 rounded"
            title="Delete BOM"
          >
            <Trash2 size={16} className="text-rose-300" />
          </button>
        </div>
      ),
    },
  ] as const;

  // ===== Render =====
  return (
    <div className="text-white">
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Bill of Materials (BOM) Master</h1>
              <p className="text-sm text-white/60 mt-1">
                Manage Product Structure & Component Hierarchy
              </p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-3">
            <button onClick={handleImport} className="btn btn-outline">
              <Upload size={18} />
              Import
            </button>
            <button onClick={exportToCSV} className="btn btn-outline">
              <Download size={18} />
              Export
            </button>
            <button onClick={handleAddBOM} className="btn btn-primary">
              <Plus size={18} />
              Add BOM
            </button>
          </div>
        }
        tabs={
          <>
            {/* Stats Cards (matching User page style) */}
            {/* <div className="grid grid-cols-4 gap-4">
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Total BOMs</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Cpu size={32} className="text-white/70" />
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Active</p>
                    <p className="text-2xl font-bold text-emerald-300">{stats.active}</p>
                  </div>
                  <span className="text-emerald-300 font-bold text-xl">A</span>
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Draft</p>
                    <p className="text-2xl font-bold text-amber-300">{stats.draft}</p>
                  </div>
                  <span className="text-amber-300 font-bold text-xl">D</span>
                </div>
              </div>
              <div className="glass-card glass-card-default-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Obsolete</p>
                    <p className="text-2xl font-bold text-white/70">{stats.obsolete}</p>
                  </div>
                  <span className="text-white/70 font-bold text-xl">O</span>
                </div>
              </div>
            </div> */}

            {/* Filters */}
            <div className="flex gap-4 mt-0.5 mb-1 mx-0.5">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                />
                <input
                  type="text"
                  placeholder="Search BOM (ID / Product)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                />
              </div>

              <select
                value={filterProduct}
                onChange={(e) =>
                  setFilterProduct(e.target.value as "all" | string)
                }
                className="glass-input"
              >
                <option className="select option" value="all">
                  All Products
                </option>
                {products.map((p) => (
                  <option className="select option" key={p.code} value={p.code}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as "all" | BOM["status"])
                }
                className="glass-input"
              >
                {["all", "Active", "Draft", "Obsolete"].map((v) => (
                  <option key={v} value={v} className="select option">
                    {v === "all" ? "All Status" : v}
                  </option>
                ))}
              </select>
            </div>
          </>
        }
      />

      {/* ===== Table (User-like style) ===== */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <Loading text="Loading BOM..." />
        ) : filteredBOMs.length === 0 ? (
          <EmptyState
            icon={<Cpu size={48} className="mx-auto text-white/50 mb-4" />}
            title="No BOM found"
            message="Create your first BOM to get started"
            buttonLabel="Create BOM"
            onButtonClick={handleAddBOM}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  {["", "BOM", "Product", "Components", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-sm uppercase font-semibold text-white/80"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredBOMs.map((bom) => {
                  const statusClass =
                    bom.status === "Active"
                      ? "status-success"
                      : bom.status === "Draft"
                        ? "status-warning"
                        : "status-inactive";

                  const expanded = expandedBOMs.has(bom.id);
                  const product = productMap[bom.productCode];

                  return (
                    <React.Fragment key={bom.id}>
                      <tr className="hover:bg-white/5">
                        {/* Expand */}
                        <td className="px-6 py-3 align-top">
                          <button
                            onClick={() => toggleBOMExpand(bom.id)}
                            className="p-1 hover:bg-white/10 rounded"
                            aria-label={expanded ? "Collapse" : "Expand"}
                          >
                            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </button>
                        </td>

                        {/* BOM */}
                        <td className="px-6 py-3 align-top">
                          <div className="font-medium">{bom.id}</div>
                          <div className="text-xs text-white/60">
                            {bom.status} • {bom.lines.length} items
                          </div>
                        </td>

                        {/* Product */}
                        <td className="px-6 py-3 align-top">
                          <div className="text-sm">
                            <span className="font-medium">{bom.productCode}</span>
                            {product?.name && (
                              <span className="text-white/60"> — {product.name}</span>
                            )}
                          </div>
                        </td>

                        {/* Components */}
                        <td className="px-6 py-3 align-top text-sm">{bom.lines.length}</td>

                        {/* Status */}
                        <td className="px-6 py-3 align-top">
                          <span className={`chip ${statusClass}`}>{bom.status}</span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-3 align-top">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditBOM(bom)}
                              className="p-1 hover:bg-white/10 rounded"
                              title="Edit BOM"
                            >
                              <Edit size={16} className="text-cyan-300" />
                            </button>
                            <button
                              onClick={() => handleDeleteBOM(bom.id)}
                              className="p-1 hover:bg-white/10 rounded"
                              title="Delete BOM"
                            >
                              <Trash2 size={16} className="text-rose-300" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded row: BOM lines */}
                      {expanded && (
                        <tr className="bg-white/[0.03]">
                          <td colSpan={8} className="px-6 pb-6">
                            <div className="rounded-lg border border-white/10 overflow-hidden mt-2">
                              <table className="w-full">
                                <thead className="bg-white/5">
                                  <tr>
                                    {[
                                      "Material Code",
                                      "Material Name",
                                      "Qty/Unit",
                                      "Unit",
                                      "Scrap %",
                                      "Gate Process",
                                    ].map((h) => (
                                      <th
                                        key={h}
                                        className="px-4 py-2 text-left text-xs font-medium uppercase text-white/60"
                                      >
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                  {bom.lines.map((line) => (
                                    <tr key={line.id} className="hover:bg-white/5">
                                      <td className="px-4 py-3 text-sm font-medium">
                                        {line.materialCode}
                                      </td>
                                      <td className="px-4 py-3 text-sm">
                                        {line.materialName}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-white/80">
                                        {line.qtyPer}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-white/80">
                                        {line.unit}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-white/80">
                                        {(line.scrapRate * 100).toFixed(1)}%
                                      </td>
                                      <td className="px-4 py-3 text-sm text-white/80">
                                        {line.gateProcess || "-"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
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

      {/* ===== Modal (Create/Edit) ===== */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="2xl"
        title={<span className="text-xl font-semibold">{isEditing ? "Edit BOM" : "Create BOM"}</span>}
        footer={
          <>
            <button
              onClick={closeModal}
              className="px-4 py-2 text-white/80 border border-white/20 rounded-lg hover:bg-white/10"
            >
              Cancel
            </button>
            <button onClick={handleSaveBOM} className="btn btn-primary">
              <Save className="w-4 h-4" />
              Save BOM
            </button>
          </>
        }
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* BOM Form */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Product Code *
              </label>
              <select
                value={bomForm.productCode}
                onChange={(e) => setBomForm({ ...bomForm, productCode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              >
                <option value="" className="select option">
                  Select Product
                </option>
                {products.map((p) => (
                  <option key={p.code} value={p.code} className="select option">
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Effective Date</label>
              <input
                type="date"
                value={bomForm.effectiveDate}
                onChange={(e) => setBomForm({ ...bomForm, effectiveDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Status</label>
              <select
                value={bomForm.status}
                onChange={(e) =>
                  setBomForm({ ...bomForm, status: e.target.value as "Active" | "Draft" | "Obsolete" })
                }
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              >
                <option value="Draft" className="select option">Draft</option>
                <option value="Active" className="select option">Active</option>
                <option value="Obsolete" className="select option">Obsolete</option>
              </select>
            </div>
          </div>

          {/* BOM Lines */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-white/80">BOM Components</label>
              <button
                onClick={handleAddBOMLine}
                className="px-3 py-1 bg-sky-500 text-white text-sm rounded hover:bg-sky-600 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Line
              </button>
            </div>

            <div className="rounded-lg border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    {["Material Code", "Material Name", "Qty/Unit", "Unit", "Scrap %", "Gate Process", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-xs font-medium uppercase text-white/60"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {(bomForm.lines || []).map((line) => (
                    <tr key={line.id}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={line.materialCode}
                          onChange={(e) => handleUpdateBOMLine(line.id, "materialCode", e.target.value)}
                          className="w-full px-2 py-1 rounded border border-white/20 bg-white/5 text-white text-sm focus:ring-2 focus:ring-sky-500/40 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={line.materialName}
                          onChange={(e) => handleUpdateBOMLine(line.id, "materialName", e.target.value)}
                          className="w-full px-2 py-1 rounded border border-white/20 bg-white/5 text-white text-sm focus:ring-2 focus:ring-sky-500/40 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={line.qtyPer}
                          onChange={(e) =>
                            handleUpdateBOMLine(line.id, "qtyPer", parseFloat(e.target.value) || 0)
                          }
                          className="w-24 px-2 py-1 rounded border border-white/20 bg-white/5 text-white text-sm text-right focus:ring-2 focus:ring-sky-500/40 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={line.unit}
                          onChange={(e) => handleUpdateBOMLine(line.id, "unit", e.target.value)}
                          className="w-24 px-2 py-1 rounded border border-white/20 bg-white/5 text-white text-sm focus:ring-2 focus:ring-sky-500/40 focus:border-transparent"
                        >
                          {["PCS", "KG", "L", "M"].map((u) => (
                            <option key={u} value={u} className="select option">
                              {u}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={line.scrapRate * 100}
                          onChange={(e) =>
                            handleUpdateBOMLine(line.id, "scrapRate", (parseFloat(e.target.value) || 0) / 100)
                          }
                          className="w-24 px-2 py-1 rounded border border-white/20 bg-white/5 text-white text-sm text-right focus:ring-2 focus:ring-sky-500/40 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={line.gateProcess || ""}
                          onChange={(e) => handleUpdateBOMLine(line.id, "gateProcess", e.target.value)}
                          className="w-full px-2 py-1 rounded border border-white/20 bg-white/5 text-white text-sm focus:ring-2 focus:ring-sky-500/40 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => handleDeleteBOMLine(line.id)}
                          className="text-rose-300 hover:text-rose-200"
                          title="Remove line"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(!bomForm.lines || bomForm.lines.length === 0) && (
                <div className="text-center py-8 text-white/60 text-sm">
                  No components added. Click &quot;Add Line&quot; to add materials.
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BOMPage;
