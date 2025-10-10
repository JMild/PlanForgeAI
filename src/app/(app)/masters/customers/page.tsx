"use client";

import React, { useEffect, useMemo, useState } from "react";
import PageHeader from "@/src/components/layout/PageHeader";
import {
  Upload, Download, Plus, Search, Eye, Edit, Trash2, Star,
  Building2, User, MapPin, Mail, Phone, Calendar, CreditCard, ChevronRight, ChevronDown,
  DollarSign,
  TrendingUp,
  FileText,
} from "lucide-react";
import Modal from "@/src/components/shared/Modal";
import { ERROR_MESSAGES } from "@/src/config/messages";
import { getCustomer } from "@/src/lib/api";
import toast from "react-hot-toast";
import Loading from "@/src/components/Loading";
import EmptyState from "@/src/components/shared/EmptyState";

/** ---------- Types & Constants ---------- */
type CustomerStatus = "Active" | "Inactive" | "On Hold" | "Blacklisted";
type CustomerType = "Distributor" | "OEM" | "Retail" | "Wholesaler";
type Industry = "Automotive" | "Electronics" | "Aerospace" | "Medical" | "Food & Beverage";
type PaymentTerm = "COD" | "Net 15" | "Net 30" | "Net 45" | "Net 60";
type Currency = "USD" | "EUR" | "THB" | "JPY";
type ShippingOption = "Ground" | "Air" | "Sea";

const CUSTOMER_TYPES: CustomerType[] = ["Distributor", "OEM", "Retail", "Wholesaler"];
const INDUSTRIES: Industry[] = ["Automotive", "Electronics", "Aerospace", "Medical", "Food & Beverage"];
const PAYMENT_TERMS: PaymentTerm[] = ["COD", "Net 15", "Net 30", "Net 45", "Net 60"];
const CURRENCIES: Currency[] = ["USD", "EUR", "THB", "JPY"];
const SHIPPING_OPTIONS: ShippingOption[] = ["Ground", "Air", "Sea"];

type Customer = {
  notes: string;
  code: string;
  name: string;
  shortName?: string;
  type: CustomerType;
  industry: Industry;
  status: CustomerStatus;
  rating: number; // 1-5
  contact: { contactPerson: string; title: string; email: string; phone: string; mobile?: string };
  address: { street: string; city: string; state: string; country: string; postalCode: string };
  financial: { paymentTerms: PaymentTerm; currency: Currency; creditLimit: number; taxId: string };
  stats: {
    totalOrders: number; activeOrders: number; totalRevenue: number;
    avgOrderValue: number; onTimeDelivery: number; lastOrderDate?: string;
  };
  preferences: { preferredShipping: ShippingOption; discountPercent: number; specialInstructions?: string };
};

type ModalMode = "view" | "edit" | "create";
type TabKey = "basic" | "contact" | "financial" | "stats" | "preferences";

/** ---------- Small helpers ---------- */
const formatCurrency = (v: number, c: Currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(isFinite(v) ? v : 0);

const statusBadge = (s: CustomerStatus) =>
  s === "Active" ? "status-success" :
    s === "On Hold" ? "status-warning" :
      s === "Blacklisted" ? "status-error" : "status-inactive";

const Stars = ({ rating }: { rating: number }) => (
  <span className="flex">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={14} className={i <= rating ? "text-yellow-400 fill-yellow-400" : "text-white/30"} />
    ))}
  </span>
);

/** ---------- Component ---------- */
const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<CustomerType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<CustomerStatus | "all">("all");
  const [loading, setLoading] = useState<boolean>(true);

  // table expand
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("view");
  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // form
  const emptyForm: Customer = {
    code: "", name: "", shortName: "", type: "Distributor", industry: "Automotive",
    status: "Active", rating: 3,
    contact: { contactPerson: "", title: "", email: "", phone: "", mobile: "" },
    address: { street: "", city: "", state: "", country: "", postalCode: "" },
    financial: { paymentTerms: "Net 30", currency: "USD", creditLimit: 0, taxId: "" },
    stats: { totalOrders: 0, activeOrders: 0, totalRevenue: 0, avgOrderValue: 0, onTimeDelivery: 0 },
    preferences: { preferredShipping: "Ground", discountPercent: 0, specialInstructions: "" },
    notes: ""
  };
  const [formData, setFormData] = useState<Customer>(emptyForm);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = (await getCustomer()) as Customer[];
        setCustomers(res || []);

      } catch (error) {
        console.error('Fetch data failed:', error);
        toast.error(ERROR_MESSAGES.fetchFailed);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return customers.filter(c => {
      const matchQ = !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.contact.email.toLowerCase().includes(q) ||
        c.contact.contactPerson.toLowerCase().includes(q);
      const matchType = filterType === "all" || c.type === filterType;
      const matchStatus = filterStatus === "all" || c.status === filterStatus;
      return matchQ && matchType && matchStatus;
    });
  }, [customers, searchTerm, filterType, filterStatus]);

  // summary
  const totalRevenue = customers.reduce((s, c) => s + (c.stats?.totalRevenue || 0), 0);
  const activeOrders = customers.reduce((s, c) => s + (c.stats?.activeOrders || 0), 0);
  const avgAOV = customers.length
    ? customers.reduce((s, c) => s + (c.stats?.avgOrderValue || 0), 0) / customers.length
    : 0;

  /** CRUD modal */
  const openModal = (mode: ModalMode, customer?: Customer) => {
    setModalMode(mode);
    setActiveTab("basic");
    if (mode === "create") {
      setFormData({ ...emptyForm });
      setSelectedCustomer(null);
    } else if (customer) {
      setFormData(customer);
      setSelectedCustomer(customer);
    }
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setSelectedCustomer(null); };
  const handleSave = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      alert("Customer Code and Customer Name are required.");
      return;
    }
    if (modalMode === "create") {
      if (customers.some(c => c.code === formData.code)) {
        alert("Customer Code already exists."); return;
      }
      setCustomers(prev => [...prev, formData]);
    } else if (modalMode === "edit" && selectedCustomer) {
      setCustomers(prev => prev.map(c => c.code === selectedCustomer.code ? formData : c));
    }
    closeModal();
  };
  const handleDelete = (code: string) => {
    if (confirm(`Delete customer ${code}?`)) setCustomers(prev => prev.filter(c => c.code !== code));
  };

  const exportToCSV = () => {
    const headers = ["Code", "Name", "Type", "Industry", "Status", "Rating", "Contact", "Email", "Phone", "City", "Country", "PaymentTerms", "Currency", "CreditLimit", "TotalOrders", "ActiveOrders", "TotalRevenue", "AvgOrderValue", "OnTimeDelivery", "LastOrderDate"];
    const rows = filtered.map((c) => [
      c.code, c.name, c.type, c.industry, c.status, c.rating, c.contact.contactPerson, c.contact.email, c.contact.phone,
      c.address.city, c.address.country, c.financial.paymentTerms, c.financial.currency, c.financial.creditLimit,
      c.stats.totalOrders, c.stats.activeOrders, c.stats.totalRevenue, c.stats.avgOrderValue,
      `${c.stats.onTimeDelivery}%`, c.stats.lastOrderDate || ""
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `customers_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const currencyFor = customers[0]?.financial.currency || "USD";

  return (
    <div className="text-white">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Customer Master Data</h1>
              <p className="text-sm text-white/60 mt-1">Manage customer information and relationships</p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-3">
            <button onClick={() => alert("Import is not implemented in this demo.")} className="btn btn-outline">
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
          <>
            {/* Summary */}
            <div className="grid grid-cols-5 gap-4">
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <div className="text-xs text-white/70 mb-1">Total Customers</div>
                <div className="text-2xl font-bold text-sky-300">{customers.length}</div>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <div className="text-xs text-white/70 mb-1">Active</div>
                <div className="text-2xl font-bold text-emerald-300">{customers.filter(c => c.status === "Active").length}</div>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <div className="text-xs text-white/70 mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-violet-300">{formatCurrency(totalRevenue, currencyFor as Currency)}</div>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <div className="text-xs text-white/70 mb-1">Active Orders</div>
                <div className="text-2xl font-bold text-amber-300">{activeOrders}</div>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <div className="text-xs text-white/70 mb-1">Avg Order Value</div>
                <div className="text-2xl font-bold text-indigo-300">{formatCurrency(avgAOV, currencyFor as Currency)}</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4 mb-1 mx-0.5">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search customers..."
                  className="glass-input w-full !pl-10 pr-4"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType((e.target.value as CustomerType) || "all")}
                className="glass-input"
              >
                <option value="all" className="select option">All Types</option>
                {CUSTOMER_TYPES.map(t => <option key={t} value={t} className="select option">{t}</option>)}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus((e.target.value as CustomerStatus) || "all")}
                className="glass-input"
              >
                <option value="all" className="select option">All Status</option>
                <option value="Active" className="select option">Active</option>
                <option value="Inactive" className="select option">Inactive</option>
                <option value="On Hold" className="select option">On Hold</option>
                <option value="Blacklisted" className="select option">Blacklisted</option>
              </select>
            </div>
          </>
        }
      />

      {/* TABLE LIST */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5">
          {loading ? (
            <Loading text="Loading customers..." />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Building2 size={48} className="mx-auto text-white/40 mb-4" />}
              title="No customers found"
              message="Create your first customers to get started"
              buttonLabel="Create Customer"
              // onButtonClick={openCreateModal}
            />
          ) : (
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider"> </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Type / Industry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-white/70 uppercase tracking-wider">Orders</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((c) => {
                  const isOpen = !!expanded[c.code];
                  return (
                    <React.Fragment key={c.code}>
                      <tr className="hover:bg-white/5">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setExpanded((p) => ({ ...p, [c.code]: !p[c.code] }))}
                            className="p-1 rounded hover:bg-white/10"
                            aria-label={isOpen ? "Collapse" : "Expand"}
                          >
                            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-white/50" />
                            <span className="text-sm font-medium">{c.code}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="text-sm">{c.name}</div>
                          </div>
                          {c.shortName && <div className="text-xs text-white/60">{c.shortName}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{c.type}</div>
                          <div className="text-xs text-white/60">{c.industry}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm">
                            <User size={14} /> {c.contact.contactPerson}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-white/70">
                            <Mail size={12} />
                            <a href={`mailto:${c.contact.email}`} className="text-sky-300 hover:underline">
                              {c.contact.email}
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-sm font-medium">{c.stats.totalOrders}</div>
                          <div className="text-xs text-emerald-300">{c.stats.activeOrders} active</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="text-sm">
                            {formatCurrency(c.stats.totalRevenue, c.financial.currency)}
                          </div>
                          <div className="text-xs text-white/60">
                            avg {formatCurrency(c.stats.avgOrderValue, c.financial.currency)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`chip ${statusBadge(c.status)}`}>{c.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openModal("view", c)} className="p-1 hover:bg-white/10 rounded" title="View">
                              <Eye size={16} className="text-white/70" />
                            </button>
                            <button onClick={() => openModal("edit", c)} className="p-1 hover:bg-white/10 rounded" title="Edit">
                              <Edit size={16} className="text-sky-300" />
                            </button>
                            <button onClick={() => handleDelete(c.code)} className="p-1 hover:bg-white/10 rounded" title="Delete">
                              <Trash2 size={16} className="text-rose-300" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isOpen && (
                        <tr className="bg-white/5">
                          <td colSpan={11} className="px-6 pb-5">
                            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  <div className="text-white/60 text-xs mb-1">Address</div>
                                  <div>{c.address.street}</div>
                                  <div>{c.address.city}, {c.address.state} {c.address.postalCode}</div>
                                  <div>{c.address.country}</div>
                                </div>
                                <div>
                                  <div className="text-white/60 text-xs mb-1">Phones</div>
                                  <div className="flex items-center gap-1"><Phone size={12} /> {c.contact.phone}</div>
                                  {c.contact.mobile && <div className="flex items-center gap-1"><Phone size={12} /> {c.contact.mobile}</div>}
                                </div>
                                <div>
                                  <div className="text-white/60 text-xs mb-1">Financial</div>
                                  <div className="flex items-center gap-1"><CreditCard size={12} /> {c.financial.paymentTerms}</div>
                                  <div>Credit Limit: {formatCurrency(c.financial.creditLimit, c.financial.currency)}</div>
                                  <div>Tax ID: {c.financial.taxId}</div>
                                </div>
                                <div>
                                  <div className="text-white/60 text-xs mb-1">Other</div>
                                  <div className="flex items-center gap-1">
                                    <Calendar size={12} /> Last order:&nbsp;
                                    {c.stats.lastOrderDate ? new Date(c.stats.lastOrderDate).toLocaleDateString() : "N/A"}
                                  </div>
                                  {c.preferences.specialInstructions && (
                                    <div className="mt-1 text-white/80">Note: {c.preferences.specialInstructions}</div>
                                  )}
                                </div>
                              </div>
                              {c.notes && (
                                <div className="mt-3 text-xs text-white/70">
                                  <span className="font-medium text-white/80">Notes:</span> {c.notes}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="2xl"
        title={
          modalMode === "view"
            ? "Customer Details"
            : modalMode === "edit"
              ? "Edit Customer"
              : "Create New Customer"
        }
        footer={
          modalMode !== "view" ? (
            <>
              <button
                onClick={closeModal}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary">
                {modalMode === "create" ? "Create Customer" : "Save Changes"}
              </button>
            </>
          ) : null
        }
      >
        {/* Tabs */}
        <div className="border-b border-white/10 flex gap-4">
          {[
            { id: "basic", label: "Basic Info", icon: Building2 },
            { id: "contact", label: "Contact", icon: User },
            { id: "financial", label: "Financial", icon: DollarSign },
            { id: "stats", label: "Statistics", icon: TrendingUp },
            { id: "preferences", label: "Preferences", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const id = tab.id as TabKey;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === id
                  ? "border-sky-400/60 text-sky-300"
                  : "border-transparent text-white/70 hover:text-white"
                  }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="pt-6">
          {/* ===== Basic Tab ===== */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Customer Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    disabled={modalMode !== "create"}
                    className="w-full glass-input"
                  />
                </div>
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
                    {CUSTOMER_TYPES.map((type) => (
                      <option key={type} value={type} className="select option">
                        {type}
                      </option>
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
                      <option key={i} value={i} className="select option">
                        {i}
                      </option>
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
                    <option value="Active" className="select option">Active</option>
                    <option value="Inactive" className="select option">Inactive</option>
                    <option value="On Hold" className="select option">On Hold</option>
                    <option value="Blacklisted" className="select option">Blacklisted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => modalMode !== "view" && setFormData({ ...formData, rating: star })}
                        className={modalMode === "view" ? "cursor-default" : "cursor-pointer"}
                      >
                        <Star
                          size={24}
                          className={star <= formData.rating ? "text-yellow-400 fill-yellow-400" : "text-white/30"}
                        />
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

          {/* ===== Contact Tab ===== */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Contact Person</label>
                    <input
                      type="text"
                      value={formData.contact.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, contactPerson: e.target.value } })}
                      disabled={modalMode === "view"}
                      className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.contact.title}
                      onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, title: e.target.value } })}
                      disabled={modalMode === "view"}
                      className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
                      disabled={modalMode === "view"}
                      className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.contact.phone}
                      onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
                      disabled={modalMode === "view"}
                      className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Mobile</label>
                    <input
                      type="tel"
                      value={formData.contact.mobile || ""}
                      onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, mobile: e.target.value } })}
                      disabled={modalMode === "view"}
                      className="w-full glass-input"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-white/80 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                      disabled={modalMode === "view"}
                      className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                      disabled={modalMode === "view"}
                      className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">State/Province</label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                      disabled={modalMode === "view"}
                      className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.address.country}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                      disabled={modalMode === "view"}
                      className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={formData.address.postalCode}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, postalCode: e.target.value } })}
                      disabled={modalMode === "view"}
                      className="w-full glass-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== Financial Tab ===== */}
          {activeTab === "financial" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Payment Terms</label>
                  <select
                    value={formData.financial.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, paymentTerms: e.target.value as PaymentTerm } })}
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                  >
                    {PAYMENT_TERMS.map((term) => (
                      <option key={term} value={term} className="select option">
                        {term}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Currency</label>
                  <select
                    value={formData.financial.currency}
                    onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, currency: e.target.value as Currency } })}
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c} className="select option">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Credit Limit</label>
                  <input
                    type="number"
                    value={formData.financial.creditLimit}
                    onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, creditLimit: Number(e.target.value) || 0 } })}
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Tax ID</label>
                  <input
                    type="text"
                    value={formData.financial.taxId}
                    onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, taxId: e.target.value } })}
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===== Statistics Tab ===== */}
          {activeTab === "stats" && selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <div className="text-sm text-white/70 font-medium mb-1">Total Orders</div>
                  <div className="text-3xl font-bold text-sky-300">{selectedCustomer.stats.totalOrders}</div>
                </div>
                <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <div className="text-sm text-white/70 font-medium mb-1">Active Orders</div>
                  <div className="text-3xl font-bold text-emerald-300">{selectedCustomer.stats.activeOrders}</div>
                </div>
                <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <div className="text-sm text-white/70 font-medium mb-1">Total Revenue</div>
                  <div className="text-3xl font-bold text-violet-300">
                    {formatCurrency(selectedCustomer.stats.totalRevenue, selectedCustomer.financial.currency)}
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <div className="text-sm text-white/70 font-medium mb-1">Avg Order Value</div>
                  <div className="text-3xl font-bold text-amber-300">
                    {formatCurrency(selectedCustomer.stats.avgOrderValue, selectedCustomer.financial.currency)}
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <div className="text-sm text-white/70 font-medium mb-1">On-Time Delivery</div>
                  <div className="text-3xl font-bold text-indigo-300">
                    {selectedCustomer.stats.onTimeDelivery}%
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <div className="text-sm text-white/70 font-medium mb-1">Last Order Date</div>
                  <div className="text-2xl font-bold text-white">
                    {selectedCustomer.stats.lastOrderDate
                      ? new Date(selectedCustomer.stats.lastOrderDate).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== Preferences Tab ===== */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Preferred Shipping</label>
                  <select
                    value={formData.preferences.preferredShipping}
                    onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, preferredShipping: e.target.value as ShippingOption } })}
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                  >
                    {SHIPPING_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="select option">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    value={formData.preferences.discountPercent}
                    onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, discountPercent: Number(e.target.value) || 0 } })}
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                    min={0}
                    max={100}
                    step={0.1}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-white/80 mb-2">Special Instructions</label>
                  <textarea
                    value={formData.preferences.specialInstructions || ""}
                    onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, specialInstructions: e.target.value } })}
                    disabled={modalMode === "view"}
                    className="w-full glass-input"
                    rows={4}
                    placeholder="Any special handling or delivery requirements..."
                  />
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
