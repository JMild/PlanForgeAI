"use client";

// import React, { useMemo, useState, useEffect } from "react";

// import PageHeader from "@/src/components/layout/PageHeader";
// import ImportButton from "@/src/components/shared/button/ImportButton";
// import ExportButton from "@/src/components/shared/button/ExportButton";
// import SearchInput from "@/src/components/shared/input/SearchInput";
// import Dropdown from "@/src/components/shared/input/Dropdown";
// import CommonTable from "@/src/components/shared/Table";
// import BomModal, { BomLine } from "@/src/app/(app)/master/components/BomModal";
// import { AddButton, DeleteButton, EditButton } from "@/src/components/shared/button/ActionButtons";

// /* ================= Page ================= */
// export default function BomPage() {
//   // ---- Mock data (ตัวอย่างเริ่มต้น) ----
//   const [bomLines, setBomLines] = useState<BomLine[]>([
//     { id: 1, fg_code: "ELEC-001", component_code: "RM-001", usage: 2, unit_code: "pcs" },
//     { id: 2, fg_code: "ELEC-001", component_code: "RM-002", usage: 6, unit_code: "pcs", substitute: "RM-002B" },
//     { id: 3, fg_code: "AUTO-002", component_code: "RM-010", usage: 1.5, unit_code: "kg", scrap_pct: 2 },
//   ]);

//   // สมมุติรายการ FG/หน่วย (จริง ๆ ควรดึงจาก Product/Unit master)
//   const fgOptions = useMemo(
//     () => Array.from(new Set(bomLines.map((b) => b.fg_code))).sort(),
//     [bomLines]
//   );
//   const unitOptions = ["pcs", "kg", "m"];

//   // ---- UI States ----
//   const [query, setQuery] = useState("");
//   const [fgFilter, setFgFilter] = useState<string>("");
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   // เปลี่ยน filter/ค้นหา → กลับหน้า 1
//   useEffect(() => setPage(1), [query, fgFilter]);

//   // ---- Filtered + Sorted ----
//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return bomLines
//       .filter((b) => (!fgFilter || b.fg_code === fgFilter))
//       .filter((b) => {
//         const txt = [
//           b.fg_code,
//           b.component_code,
//           b.unit_code ?? "",
//           String(b.usage ?? ""),
//           b.substitute ?? "",
//           b.remarks ?? "",
//         ]
//           .join(" ")
//           .toLowerCase();
//         return !q || txt.includes(q);
//       })
//       .sort(
//         (a, b) =>
//           a.fg_code.localeCompare(b.fg_code) ||
//           (a.component_code || "").localeCompare(b.component_code || "")
//       );
//   }, [bomLines, query, fgFilter]);

//   // ---- Paging ----
//   const total = filtered.length;
//   const paged = useMemo(
//     () => filtered.slice((page - 1) * pageSize, page * pageSize),
//     [filtered, page, pageSize]
//   );

//   // ---- Modal state ----
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editId, setEditId] = useState<number | null>(null);

//   const openNew = () => {
//     setEditId(null);
//     setModalOpen(true);
//   };
//   const openEdit = (id: number) => {
//     setEditId(id);
//     setModalOpen(true);
//   };

//   // ---- CRUD Handlers ----
//   const handleSave = (payload: BomLine) => {
//     if (payload.id) {
//       // update
//       setBomLines((prev) =>
//         prev.map((b) => (b.id === payload.id ? { ...b, ...payload } : b))
//       );
//     } else {
//       // create
//       const nextId = (Math.max(0, ...bomLines.map((x) => x.id || 0)) || 0) + 1;
//       setBomLines((prev) => [...prev, { ...payload, id: nextId }]);
//     }
//     setModalOpen(false);
//     setEditId(null);
//   };

//   const handleDelete = (id: number) => {
//     if (!confirm("ลบ BOM line นี้?")) return;
//     setBomLines((prev) => prev.filter((b) => b.id !== id));
//   };

//   // ---- Columns ----
//   const columns = [
//     {
//       key: "action",
//       header: "Action",
//       headerClassName: "text-right",
//       className: "text-right",
//       render: (b: BomLine) => (
//         <div className="flex gap-2">
//           <EditButton onClick={() => openEdit(b.id ?? 0)} />
//           <DeleteButton onClick={() => b.id != null && handleDelete(b.id)} />
//         </div>
//       ),
//     },
//     { key: "fg_code", header: "FG", render: (b: BomLine) => <b>{b.fg_code}</b> },
//     { key: "component_code", header: "Component" },
//     { key: "usage", header: "Usage", render: (b: BomLine) => b.usage ?? "-" },
//     { key: "unit_code", header: "Unit", render: (b: BomLine) => b.unit_code || "-" },
//     { key: "substitute", header: "Substitute", render: (b: BomLine) => b.substitute || "-" },
//     {
//       key: "scrap_pct",
//       header: "Scrap %",
//       render: (b: BomLine) => (typeof b.scrap_pct === "number" ? `${b.scrap_pct}%` : "-"),
//     },
//     { key: "remarks", header: "Remarks", render: (b: BomLine) => b.remarks || "-" },
//   ] as const;

//   return (
//     <>
//       <PageHeader
//         title="Bill of Materials (BOM)"
//         actions={
//           <>
//             <ImportButton
//               onFilesSelected={(files) => {
//                 // TODO: parse CSV/Excel > push to setBomLines
//                 console.log("BOM import:", files[0]?.name);
//               }}
//             />
//             <ExportButton filename="bom.json" data={{ bomLines }} />
//           </>
//         }
//       />

//       <div className="max-w-6xl mx-auto px-6 py-6">      
//         {/* Table */}
//         <CommonTable<BomLine>
//           title={
//             <div className="mb-3 flex flex-wrap items-center gap-2 w-full">
//               <SearchInput
//                 value={query}
//                 onChange={setQuery}
//                 placeholder={
//                   fgFilter
//                     ? `ค้นหาใน FG ${fgFilter} (component/usage/unit/substitute/remarks)`
//                     : "ค้นหา fg/component/usage/unit/substitute/remarks"
//                 }
//               />
//               <Dropdown
//                 value={fgFilter}
//                 onChange={(v) => setFgFilter(String(v))}
//                 options={[{ label: "All FG", value: "" }, ...fgOptions.map((f) => ({ label: f, value: f }))]}
//                 selectClassName="h-10"
//               />
//               <div className="ml-auto">
//                 <AddButton label="New BOM Line" onClick={openNew}/>   
//               </div>
//             </div>
//           }
//           columns={columns as any}
//           data={paged}
//           pagination={{
//             total,
//             page,
//             pageSize,
//             onPageChange: setPage,
//             onPageSizeChange: setPageSize,
//             pageSizes: [10, 20, 50],
//           }}
//         />
//       </div>

//       {/* Modal */}
//       <BomModal
//         isOpen={modalOpen}
//         onClose={() => {
//           setModalOpen(false);
//           setEditId(null);
//         }}
//         bom={(editId ? bomLines.find((b) => b.id === editId) : undefined) || undefined}
//         onSave={handleSave}
//         fgOptions={fgOptions}
//         unitOptions={unitOptions}
//         // theme="auto" | "dark" | "light"  // ถ้าต้องการบังคับธีม
//       />
//     </>
//   );
// }



import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Save, X, Upload, Download, ChevronDown, ChevronRight, Package, Layers } from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// Types
type Product = {
  code: string;
  name: string;
  unit: string;
  defaultRoutingId?: string;
  defaultBomId?: string;
  lotSize?: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
};

type BOMLine = {
  id: string;
  materialCode: string;
  materialName: string;
  qtyPer: number;
  unit: string;
  scrapRate: number;
  gateProcess?: string;
};

type BOM = {
  id: string;
  productCode: string;
  version: string;
  effectiveDate: string;
  status: 'Active' | 'Draft' | 'Obsolete';
  lines: BOMLine[];
};

// Sample Data
const initialProducts: Product[] = [
  { code: 'P001', name: 'Gear Assembly A', unit: 'PCS', defaultRoutingId: 'R001', defaultBomId: 'BOM001', lotSize: 100, status: 'Active', createdAt: '2025-01-15' },
  { code: 'P002', name: 'Motor Housing B', unit: 'PCS', defaultRoutingId: 'R002', defaultBomId: 'BOM002', lotSize: 50, status: 'Active', createdAt: '2025-01-20' },
  { code: 'P003', name: 'Control Panel C', unit: 'PCS', defaultRoutingId: 'R003', lotSize: 200, status: 'Active', createdAt: '2025-02-01' },
];

const initialBOMs: BOM[] = [
  {
    id: 'BOM001',
    productCode: 'P001',
    version: 'V1.0',
    effectiveDate: '2025-01-15',
    status: 'Active',
    lines: [
      { id: 'L1', materialCode: 'M001', materialName: 'Steel Plate 5mm', qtyPer: 2, unit: 'PCS', scrapRate: 0.05, gateProcess: 'Cutting' },
      { id: 'L2', materialCode: 'M002', materialName: 'Bearing Type-A', qtyPer: 4, unit: 'PCS', scrapRate: 0.02 },
      { id: 'L3', materialCode: 'M003', materialName: 'Bolt M8x20', qtyPer: 8, unit: 'PCS', scrapRate: 0.01 },
    ]
  },
  {
    id: 'BOM002',
    productCode: 'P002',
    version: 'V1.0',
    effectiveDate: '2025-01-20',
    status: 'Active',
    lines: [
      { id: 'L4', materialCode: 'M004', materialName: 'Aluminum Block', qtyPer: 1, unit: 'PCS', scrapRate: 0.03, gateProcess: 'Machining' },
      { id: 'L5', materialCode: 'M005', materialName: 'Gasket Seal', qtyPer: 2, unit: 'PCS', scrapRate: 0.05 },
    ]
  },
];

const App = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [boms, setBoms] = useState<BOM[]>(initialBOMs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedBOMs, setExpandedBOMs] = useState<Set<string>>(new Set(['BOM001']));

  // BOM Form State
  const [bomForm, setBomForm] = useState<Partial<BOM>>({
    productCode: '',
    version: 'V1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    status: 'Draft',
    lines: [],
  });

  // Filter BOMs
  const filteredBOMs = useMemo(() => {
    return boms.filter(b =>
      b.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [boms, searchTerm]);

  // BOM handlers
  const handleAddBOM = () => {
    setBomForm({
      productCode: '',
      version: 'V1.0',
      effectiveDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      lines: [],
    });
    setSelectedBOM(null);
    setIsEditing(true);
  };

  const handleEditBOM = (bom: BOM) => {
    setBomForm(bom);
    setSelectedBOM(bom);
    setIsEditing(true);
  };

  const handleSaveBOM = () => {
    if (!bomForm.productCode || !bomForm.version) {
      alert('Product code and version are required');
      return;
    }

    const bomData = bomForm as BOM;
    if (selectedBOM) {
      setBoms(boms.map(b => b.id === selectedBOM.id ? bomData : b));
    } else {
      const newBOM: BOM = {
        ...bomData,
        id: `BOM${String(boms.length + 1).padStart(3, '0')}`,
      };
      setBoms([...boms, newBOM]);
    }
    setIsEditing(false);
    setSelectedBOM(null);
  };

  const handleDeleteBOM = (id: string) => {
    if (confirm(`Delete BOM ${id}?`)) {
      setBoms(boms.filter(b => b.id !== id));
    }
  };

  const handleAddBOMLine = () => {
    const newLine: BOMLine = {
      id: `L${Date.now()}`,
      materialCode: '',
      materialName: '',
      qtyPer: 1,
      unit: 'PCS',
      scrapRate: 0,
    };
    setBomForm({
      ...bomForm,
      lines: [...(bomForm.lines || []), newLine],
    });
  };

  const handleUpdateBOMLine = (lineId: string, field: keyof BOMLine, value: any) => {
    setBomForm({
      ...bomForm,
      lines: (bomForm.lines || []).map(line =>
        line.id === lineId ? { ...line, [field]: value } : line
      ),
    });
  };

  const handleDeleteBOMLine = (lineId: string) => {
    setBomForm({
      ...bomForm,
      lines: (bomForm.lines || []).filter(line => line.id !== lineId),
    });
  };

  const toggleBOMExpand = (id: string) => {
    const newExpanded = new Set(expandedBOMs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedBOMs(newExpanded);
  };

  const exportToCSV = () => {
    const csv = 'BOM ID,Product,Version,Date,Status,Lines\n' + boms.map(b => `${b.id},${b.productCode},${b.version},${b.effectiveDate},${b.status},${b.lines.length}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bom_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader title={
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Master Data Management</h1>
              <p className="text-sm text-gray-500 mt-1">Product Master & Bill of Materials (MAS001, MAS002)</p>
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
                // onClick={() => openModal('create')}
                onClick={handleAddBOM}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={18} />
                Add BOMt
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mt-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      } />


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {!isEditing ? (
          <>
            {/* BOM List */}
            <div className="space-y-4">
              {filteredBOMs.map((bom) => (
                <div key={bom.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleBOMExpand(bom.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {expandedBOMs.has(bom.id) ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{bom.id}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${bom.status === 'Active' ? 'bg-green-100 text-green-800' :
                            bom.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {bom.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Product: <span className="font-medium text-gray-700">{bom.productCode}</span>
                          {' • '}
                          Version: <span className="font-medium text-gray-700">{bom.version}</span>
                          {' • '}
                          Effective: <span className="font-medium text-gray-700">{bom.effectiveDate}</span>
                          {' • '}
                          {bom.lines.length} components
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditBOM(bom)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBOM(bom.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {expandedBOMs.has(bom.id) && (
                    <div className="p-4">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material Code</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty/Unit</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Scrap %</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gate Process</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {bom.lines.map((line) => (
                            <tr key={line.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{line.materialCode}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{line.materialName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{line.qtyPer}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{line.unit}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{(line.scrapRate * 100).toFixed(1)}%</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{line.gateProcess || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
              {filteredBOMs.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12 text-gray-500">
                  No BOMs found
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Edit Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedBOM ? 'Edit' : 'Add'} BOM
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* BOM Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Code *</label>
                    <select
                      value={bomForm.productCode}
                      onChange={(e) => setBomForm({ ...bomForm, productCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Product</option>
                      {products.map(p => (
                        <option key={p.code} value={p.code}>{p.code} - {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version *</label>
                    <input
                      type="text"
                      value={bomForm.version}
                      onChange={(e) => setBomForm({ ...bomForm, version: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                    <input
                      type="date"
                      value={bomForm.effectiveDate}
                      onChange={(e) => setBomForm({ ...bomForm, effectiveDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={bomForm.status}
                      onChange={(e) => setBomForm({ ...bomForm, status: e.target.value as 'Active' | 'Draft' | 'Obsolete' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Active">Active</option>
                      <option value="Obsolete">Obsolete</option>
                    </select>
                  </div>
                </div>

                {/* BOM Lines */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">BOM Components</label>
                    <button
                      onClick={handleAddBOMLine}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Line
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material Code</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty/Unit</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Scrap %</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gate Process</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(bomForm.lines || []).map((line) => (
                          <tr key={line.id}>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={line.materialCode}
                                onChange={(e) => handleUpdateBOMLine(line.id, 'materialCode', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={line.materialName}
                                onChange={(e) => handleUpdateBOMLine(line.id, 'materialName', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                step="0.01"
                                value={line.qtyPer}
                                onChange={(e) => handleUpdateBOMLine(line.id, 'qtyPer', parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={line.unit}
                                onChange={(e) => handleUpdateBOMLine(line.id, 'unit', e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="PCS">PCS</option>
                                <option value="KG">KG</option>
                                <option value="L">L</option>
                                <option value="M">M</option>
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                step="0.01"
                                value={line.scrapRate * 100}
                                onChange={(e) => handleUpdateBOMLine(line.id, 'scrapRate', (parseFloat(e.target.value) || 0) / 100)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={line.gateProcess || ''}
                                onChange={(e) => handleUpdateBOMLine(line.id, 'gateProcess', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => handleDeleteBOMLine(line.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!bomForm.lines || bomForm.lines.length === 0) && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No components added. Click "Add Line" to add materials.
                      </div>
                    )}
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
                  onClick={handleSaveBOM}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save BOM
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;