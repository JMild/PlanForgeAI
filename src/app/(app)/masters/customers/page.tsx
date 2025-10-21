"use client";

import React, { useEffect, useMemo, useState } from "react";
import PageHeader from "@/src/components/layout/PageHeader";
import { Upload, Download, Plus, Search, Eye, Edit, Trash2, Building2, User, Mail, DollarSign, TrendingUp, Save, Star } from "lucide-react";
import Modal from "@/src/components/shared/Modal";
import toast from "react-hot-toast";
import { ERROR_MESSAGES } from "@/src/config/messages";

import {
  mockGetCustomerList,
  mockGetCustomerByCode,
  type CustomerListItem,
  type CustomerDetail,
  type CustomerStatus,
  type CustomerType,
  type Industry,
  type PaymentTerm,
  type Currency,
} from "@/src/mocks/customers";
import { DataTable } from "@/src/components/shared/table/Table";

/* --------- helpers --------- */
const formatCurrency = (v: number, c: Currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(isFinite(v) ? v : 0);

const statusBadge = (s: CustomerStatus) =>
  s === "Active" ? "status-success" :
    s === "On Hold" ? "status-warning" :
      s === "Blacklisted" ? "status-error" : "status-inactive";

/* --------- constants for form --------- */
const CUSTOMER_TYPES: CustomerType[] = ["Distributor", "OEM", "Retail", "Wholesaler"];
const INDUSTRIES: Industry[] = ["Automotive", "Electronics", "Aerospace", "Medical", "Food & Beverage"];

/* --------- UI state types --------- */
type ModalMode = "view" | "edit" | "create";
type TabKey = "basic" | "contact" | "financial" | "stats";

/* ============================================
   Component
============================================ */
const CustomersPage: React.FC = () => {
  // ✅ ตารางใช้แค่รายการ
  const [list, setList] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ cache รายละเอียด แผนที่ code -> detail
  const [detailCache, setDetailCache] = useState<Record<string, CustomerDetail | null>>({});

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<CustomerType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<CustomerStatus | "all">("all");

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("view");
  const [activeTab, setActiveTab] = useState<TabKey>("basic");

  // ✅ เก็บ “ลูกค้าที่เลือก” เป็น detail (ไม่ใช่ list item) เพื่อแสดงใน modal
  const [selected, setSelected] = useState<CustomerDetail | null>(null);

  // form data = detail เต็ม
  const emptyDetail: CustomerDetail = {
    code: "",
    name: "",
    shortName: "",
    status: "Active",
    type: "Distributor",
    industry: "Automotive",
    rating: 3,
    contact: { contactPerson: "", email: "", title: "", phone: "", mobile: "" },
    address: { street: "", city: "", state: "", country: "", postalCode: "" },
    financial: { paymentTerms: "Net 30", currency: "USD", creditLimit: 0, taxId: "" },
    stats: { totalOrders: 0, activeOrders: 0, totalRevenue: 0, avgOrderValue: 0, onTimeDelivery: 0 },
    notes: "",
  };
  const [formData, setFormData] = useState<CustomerDetail>(emptyDetail);

  /* ---------- load lightweight list ---------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const rows = await mockGetCustomerList();
        setList(rows);
      } catch (e) {
        console.error(e);
        toast.error(ERROR_MESSAGES.fetchFailed || "Failed to fetch customers.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- filters run on list only ---------- */
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return list.filter((c) => {
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.contact.email.toLowerCase().includes(q) ||
        c.contact.contactPerson.toLowerCase().includes(q);
      const matchType = filterType === "all" || c.type === filterType;
      const matchStatus = filterStatus === "all" || c.status === filterStatus;
      return matchQ && matchType && matchStatus;
    });
  }, [list, searchTerm, filterType, filterStatus]);

  /* ---------- lazy load detail ---------- */
  const ensureDetail = async (code: string): Promise<CustomerDetail | null> => {
    if (detailCache[code] !== undefined) return detailCache[code];
    const detail = await mockGetCustomerByCode(code);
    setDetailCache((prev) => ({ ...prev, [code]: detail }));
    return detail;
  };

  const openModal = async (mode: ModalMode, row?: CustomerListItem | CustomerDetail) => {
    setModalMode(mode);
    setActiveTab("basic");

    if (mode === "create") {
      const nextCode = `CUST-${String(list.length + 1).padStart(3, "0")}`;
      const blank = { ...emptyDetail, code: nextCode };
      setFormData(blank);
      setSelected(blank);
      setIsModalOpen(true);
      return;
    }

    const code = row?.code;
    if (!code) return;

    // ถ้ายังไม่มี detail → ดึงตอนนี้ (และ cache)
    const detail = "industry" in row ? (row as CustomerDetail) : await ensureDetail(code);
    if (!detail) {
      toast.error("Customer not found.");
      return;
    }
    setSelected(detail);
    setFormData(detail);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  /* ---------- save/delete (mock-only) ---------- */
  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Customer Name is required.");
      return;
    }

    if (modalMode === "create") {
      // ใส่ลง list แบบเบา ๆ
      const newListItem: CustomerListItem = {
        code: formData.code,
        name: formData.name,
        shortName: formData.shortName,
        status: formData.status,
        type: formData.type,
        contact: { contactPerson: formData.contact.contactPerson || "", email: formData.contact.email || "" },
        stats: { totalOrders: formData.stats.totalOrders || 0, activeOrders: formData.stats.activeOrders || 0 },
      };
      setList((prev) => [...prev, newListItem]);
      setDetailCache((prev) => ({ ...prev, [formData.code]: formData }));
    } else if (modalMode === "edit" && selected) {
      // อัปเดตทั้ง detail cache และ list (ส่วนที่แสดง)
      setDetailCache((prev) => ({ ...prev, [selected.code]: formData }));
      setList((prev) =>
        prev.map((it) =>
          it.code === selected.code
            ? {
              ...it,
              name: formData.name,
              shortName: formData.shortName,
              status: formData.status,
              type: formData.type,
              contact: { contactPerson: formData.contact.contactPerson || "", email: formData.contact.email || "" },
              stats: {
                totalOrders: formData.stats.totalOrders || 0,
                activeOrders: formData.stats.activeOrders || 0,
              },
            }
            : it
        )
      );
    }

    toast.success("Saved.");
    closeModal();
  };

  const handleDelete = (code: string) => {
    if (confirm(`Delete customer ${code}?`)) {
      setList((prev) => prev.filter((c) => c.code !== code));
      setDetailCache((prev) => {
        const { [code]: _drop, ...rest } = prev;
        return rest;
      });
      toast.success("Deleted.");
    }
  };

  const exportToCSV = () => {
    const headers = ["Code", "Name", "Type", "Status", "Contact", "Email", "TotalOrders", "ActiveOrders"];
    const rows = filtered.map((c) => [
      c.code,
      c.name,
      c.type,
      c.status,
      c.contact.contactPerson,
      c.contact.email,
      c.stats.totalOrders,
      c.stats.activeOrders,
    ]);
    const csv =
      [headers, ...rows]
        .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
        .join("\n") + "\n";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="text-white">
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Customer Master Data</h1>
              <p className="text-sm text-white/60 mt-1">Lightweight list + Lazy detail</p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-3">
            <button onClick={() => toast("Import (mock)")} className="btn btn-outline">
              <Upload size={18} /> Import
            </button>
            <button onClick={exportToCSV} className="btn btn-outline">
              <Download size={18} /> Export
            </button>
            <button onClick={() => openModal("create")} className="btn btn-primary">
              <Plus size={18} /> New Customer
            </button>
          </div>
        }
        tabs={
          <div className="flex gap-4 mt-0.5 mb-1 mx-0.5">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers..."
                className="glass-input w-full !pl-10 pr-4"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType((e.target.value as CustomerType) || "all")}
              className="glass-input w-36"
            >
              <option value="all" className="select option">All Types</option>
              {CUSTOMER_TYPES.map((t) => <option key={t} value={t} className="select option">{t}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus((e.target.value as CustomerStatus) || "all")}
              className="glass-input w-36"
            >
              <option value="all" className="select option">All Status</option>
              <option value="Active" className="select option">Active</option>
              <option value="Inactive" className="select option">Inactive</option>
              <option value="On Hold" className="select option">On Hold</option>
              <option value="Blacklisted" className="select option">Blacklisted</option>
            </select>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <DataTable
          columns={[
            {
              key: "name",
              label: "Customer",
              render: (c) => (
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  {c.shortName && (<div className="text-xs text-white/60">{c.shortName}</div>)}
                </div>

              ),
            },
            {
              key: "contact",
              label: "Contact",
              render: (c) => (
                <div>
                  <div className="flex items-center gap-1"><User size={12} /> {c.contact.contactPerson}</div>
                  <div className="flex items-center gap-1"><Mail size={12} /> {c.contact.email}</div>
                </div>
              ),
            },
            {
              key: "orders",
              label: "Orders",
              align: "center",
              render: (c) => (
                <div className="flex flex-col items-center">
                  <div className="text-xs text-white/70 mb-1">
                    {`${c.stats.activeOrders} / ${c.stats.totalOrders}`}
                  </div>
                </div>
              ),
            },
            {
              key: "status",
              label: "Status",
              align: "center",
              render: (c) => (
                <span
                  className={`inline-flex items-center justify-center px-2 py-[2px] rounded-full text-xs font-medium ${statusBadge(
                    c.status
                  )}`}
                >
                  {c.status}
                </span>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              align: "center",
              render: (c) => (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => openModal("view", c)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    title="View"
                  >
                    <Eye size={16} className="text-white/70 hover:text-white" />
                  </button>
                  <button
                    onClick={() => openModal("edit", c)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} className="text-sky-300 hover:text-sky-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.code)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-rose-300 hover:text-rose-400" />
                  </button>
                </div>
              ),
            },
          ]}
          data={filtered}
          rowKey={(c) => c.code}
          isLoading={loading}
        />
      </div>

      {/* MODAL (โหลด detail แบบ lazy) */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="2xl"
        title={modalMode === "view" ? "Customer Details" : modalMode === "edit" ? "Edit Customer" : "Create New Customer"}
        footer={
          modalMode === "view" ? (
            <div className="flex items-center justify-end gap-3 w-full">
              <button onClick={closeModal} className="btn btn-outline">Close</button>
              <button onClick={() => setModalMode("edit")} className="btn btn-primary">
                <Edit size={18} /> Edit Customer
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 w-full">
              <button onClick={closeModal} className="btn btn-outline">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary">
                <Save size={18} /> {modalMode === "create" ? "Create Customer" : "Save Changes"}
              </button>
            </div>
          )
        }
      >
        {/* tabs */}
        <div className="border-b border-white/10 flex gap-4">
          {[
            { id: "basic", label: "Basic Info", icon: Building2 },
            { id: "contact", label: "Contact", icon: User },
            { id: "financial", label: "Financial", icon: DollarSign },
            { id: "stats", label: "Statistics", icon: TrendingUp },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabKey)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === id ? "border-sky-400/60 text-sky-300" : "border-transparent text-white/70 hover:text-white"
                }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* ถ้าเป็น create จะมี formData อยู่แล้ว; ถ้า view/edit ต้องมี selected (detail) */}
        <div className="pt-6">
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Short Name</label>
                  <input
                    type="text"
                    value={formData.shortName || ""}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Customer Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CustomerType })}
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                  >
                    {CUSTOMER_TYPES.map((t) => (
                      <option key={t} value={t} className="select option">{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value as Industry })}
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                  >
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i} className="select option">{i}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => modalMode !== "view" && setFormData({ ...formData, rating: star })}
                        className={modalMode === "view" ? "cursor-default" : "cursor-pointer"}
                      >
                        <Star size={24} className={star <= formData.rating ? "text-yellow-400 fill-yellow-400" : "text-white/30"} />
                      </button>
                    ))}
                    <span className="text-sm text-white/70 ml-2">{formData.rating}/5</span>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-white/80 mb-2">Notes</label>
                  <textarea
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, contactPerson: e.target.value } })}
                    disabled={modalMode === "view"} className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.contact.title || ""}
                    onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, title: e.target.value } })}
                    disabled={modalMode === "view"} className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
                    disabled={modalMode === "view"} className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.contact.phone || ""}
                    onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
                    disabled={modalMode === "view"} className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Mobile</label>
                  <input
                    type="tel"
                    value={formData.contact.mobile || ""}
                    onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, mobile: e.target.value } })}
                    disabled={modalMode === "view"} className="w-full glass-input"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-white/80 mb-2">Street</label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                      disabled={modalMode === "view"} className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                      disabled={modalMode === "view"} className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">State/Province</label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                      disabled={modalMode === "view"} className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.address.country}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                      disabled={modalMode === "view"} className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={formData.address.postalCode}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, postalCode: e.target.value } })}
                      disabled={modalMode === "view"} className="w-full glass-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "financial" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Payment Terms</label>
                  <select
                    value={formData.financial.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, paymentTerms: e.target.value as PaymentTerm } })}
                    disabled={modalMode === "view"} className="w-full glass-input"
                  >
                    {["COD", "Net 15", "Net 30", "Net 45", "Net 60"].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Currency</label>
                  <select
                    value={formData.financial.currency}
                    onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, currency: e.target.value as Currency } })}
                    disabled={modalMode === "view"} className="w-full glass-input"
                  >
                    {["USD", "EUR", "THB", "JPY"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Credit Limit</label>
                  <input
                    type="number"
                    value={formData.financial.creditLimit}
                    onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, creditLimit: Number(e.target.value) || 0 } })}
                    disabled={modalMode === "view"} className="w-full glass-input" min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Tax ID</label>
                  <input
                    type="text"
                    value={formData.financial.taxId}
                    onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, taxId: e.target.value } })}
                    disabled={modalMode === "view"} className="w-full glass-input"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "stats" && selected && (
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="text-sm text-white/70 mb-1">Total Orders</div>
                <div className="text-2xl font-medium text-sky-300">{selected.stats.totalOrders}</div>
              </div>
              <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="text-sm text-white/70 mb-1">Active Orders</div>
                <div className="text-2xl font-medium text-emerald-300">{selected.stats.activeOrders}</div>
              </div>
              <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="text-sm text-white/70 mb-1">Total Revenue</div>
                <div className="text-2xl font-medium text-violet-300">
                  {formatCurrency(selected.stats.totalRevenue || 0, selected.financial.currency)}
                </div>
              </div>
              <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="text-sm text-white/70 mb-1">Avg Order Value</div>
                <div className="text-2xl font-medium text-amber-300">
                  {formatCurrency(selected.stats.avgOrderValue || 0, selected.financial.currency)}
                </div>
              </div>
              <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="text-sm text-white/70 mb-1">On-Time Delivery</div>
                <div className="text-2xl font-medium text-indigo-300">{selected.stats.onTimeDelivery || 0}%</div>
              </div>
              <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="text-sm text-white/70 mb-1">Last Order Date</div>
                <div className="text-2xl font-medium text-white">
                  {selected.stats.lastOrderDate ? new Date(selected.stats.lastOrderDate).toLocaleDateString() : "N/A"}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CustomersPage;
