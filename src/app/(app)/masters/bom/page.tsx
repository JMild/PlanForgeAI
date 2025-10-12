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
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import Modal from "@/src/components/shared/Modal";
import { getBOM, getProduct } from "@/src/lib/api";
import toast from "react-hot-toast";
import { ERROR_MESSAGES } from "@/src/config/messages";
import { ExpandableDataTable } from "@/src/components/shared/table/ExpandableDataTable";

/* ================= Types ================= */
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
  scrapRate: number; // 0..1
  gateProcess?: string;
};

type BOMStatus = "Active" | "Draft" | "Obsolete";

type BOM = {
  id: string;
  productCode: string;
  effectiveDate: string; // YYYY-MM-DD
  status: BOMStatus;
  lines: BOMLine[];
};

/* ================ Component ================ */
const BOMPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters/Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | BOMStatus>("all");
  const [filterProduct, setFilterProduct] = useState<"all" | string>("all");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
        console.error("Fetch data failed:", error);
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
      const matchesProduct =
        filterProduct === "all" || b.productCode === filterProduct;
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
        status: (bomForm.status as BOMStatus) || "Draft",
        lines: bomForm.lines || [],
      };
      setBoms((prev) => [...prev, newBOM]);
    }

    closeModal();
  };

  const handleDeleteBOM = (id: string) => {
    if (confirm(`Delete BOM ${id}?`)) {
      setBoms((prev) => prev.filter((b) => b.id !== id));
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

  /* ========= Columns & Expanded row ========= */
  const bomColumns = [
    {
      key: "bom",
      label: "BOM",
      render: (bom: BOM) => (
        <div>
          <div className="font-medium">{bom.id}</div>
          {/* <div className="text-xs text-white/60">
            {bom.status} • {bom.lines.length} items
          </div> */}
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
      align: "center",
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
      align: "center" as const,
      render: (bom: BOM) => (
        <div className="flex items-center justify-center gap-2">
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

  const renderBOMExpanded = (bom: BOM) => (
    <div className="rounded-lg border border-white/10 overflow-hidden mt-2">
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            {[
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
              <td className="px-4 py-3 text-sm">{line.materialName}</td>
              <td className="px-4 py-3 text-sm text-white/80">{line.qtyPer}</td>
              <td className="px-4 py-3 text-sm text-white/80">{line.unit}</td>
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
  );

  /* ================ Render ================ */
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
                onChange={(e) => setFilterProduct(e.target.value as "all" | string)}
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
                onChange={(e) => setFilterStatus(e.target.value as "all" | BOMStatus)}
                className="glass-input w-32"
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <ExpandableDataTable<BOM>
          columns={bomColumns}
          data={filteredBOMs}
          rowKey={(b) => b.id}
          renderExpandedRow={renderBOMExpanded}
          isLoading={loading}
        />
      </div>

      {/* ===== Modal (Create/Edit) ===== */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="2xl"
        title={
          <span className="text-xl font-semibold">
            {isEditing ? "Edit BOM" : "Create BOM"}
          </span>
        }
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
            {/* Product Code */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Product Code *
              </label>
              <select
                value={bomForm.productCode}
                onChange={(e) =>
                  setBomForm({ ...bomForm, productCode: e.target.value })
                }
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

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Status
              </label>
              <select
                value={bomForm.status}
                onChange={(e) =>
                  setBomForm({
                    ...bomForm,
                    status: e.target.value as BOMStatus,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              >
                <option value="Draft" className="select option">
                  Draft
                </option>
                <option value="Active" className="select option">
                  Active
                </option>
                <option value="Obsolete" className="select option">
                  Obsolete
                </option>
              </select>
            </div>
          </div>

          {/* BOM Lines */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-white/80">
                BOM Components
              </label>
              <button
                onClick={handleAddBOMLine}
                className="px-3 py-1 text-sm rounded btn-primary flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Line
              </button>
            </div>

            <div className="rounded-lg border border-white/10 overflow-hidden">
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
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-xs font-medium uppercase text-white/60"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {(bomForm.lines || []).map((line) => (
                    <tr key={line.id}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={line.materialCode}
                          onChange={(e) =>
                            handleUpdateBOMLine(line.id, "materialCode", e.target.value)
                          }
                          className="w-full px-2 py-1 rounded border border-white/20 bg-white/5 text-white text-sm focus:ring-2 focus:ring-sky-500/40 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={line.materialName}
                          onChange={(e) =>
                            handleUpdateBOMLine(line.id, "materialName", e.target.value)
                          }
                          className="w-full px-2 py-1 rounded border border-white/20 bg-white/5 text-white text-sm focus:ring-2 focus:ring-sky-500/40 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={line.qtyPer}
                          onChange={(e) =>
                            handleUpdateBOMLine(
                              line.id,
                              "qtyPer",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24 px-2 py-1 rounded border border-white/20 bg-white/5 text-white text-sm text-right focus:ring-2 focus:ring-sky-500/40 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={line.unit}
                          onChange={(e) =>
                            handleUpdateBOMLine(line.id, "unit", e.target.value)
                          }
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
                            handleUpdateBOMLine(
                              line.id,
                              "scrapRate",
                              (parseFloat(e.target.value) || 0) / 100
                            )
                          }
                          className="w-24 px-2 py-1 rounded border border-white/20 bg-white/5 text-white text-sm text-right focus:ring-2 focus:ring-sky-500/40 focus:border-transparent"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={line.gateProcess || ""}
                          onChange={(e) =>
                            handleUpdateBOMLine(line.id, "gateProcess", e.target.value)
                          }
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
