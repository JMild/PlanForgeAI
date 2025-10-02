"use client";

import React, { useState } from "react";
import {
  Plus, Search, Edit, Trash2, Eye, Download, Upload, Mail,
  Phone, MapPin, Building2, User, DollarSign, Calendar,
  TrendingUp, X, Save, Star, CreditCard, FileText,
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";

/* ========= Types ========= */
type ModalMode = "edit" | "view" | "create" | null;

type CustomerStatus = "Active" | "Inactive" | "On Hold" | "Blacklisted";
type CustomerType =
  | "Enterprise"
  | "SME"
  | "Startup"
  | "Government"
  | "Distributor";
type Industry =
  | "Automotive"
  | "Electronics"
  | "Technology"
  | "Manufacturing"
  | "Industrial"
  | "Consumer Goods"
  | "Healthcare";
type PaymentTerm = "COD" | "Net 15" | "Net 30" | "Net 45" | "Net 60" | "Net 90";
type Currency = "THB" | "USD" | "EUR" | "JPY" | "CNY";
type ShippingOption = "Economy" | "Standard" | "Express" | "Same Day";

type Contact = {
  contactPerson: string;
  title: string;
  email: string;
  phone: string;
  mobile: string;
};

type Address = {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

type Financial = {
  paymentTerms: PaymentTerm;
  creditLimit: number;
  currency: Currency;
  taxId: string;
};

type Stats = {
  totalOrders: number;
  activeOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  onTimeDelivery: number;
  lastOrderDate: string | null;
};

type Preferences = {
  preferredShipping: ShippingOption;
  specialInstructions: string;
  discountPercent: number;
};

type Customer = {
  code: string;
  name: string;
  shortName: string;
  type: CustomerType;
  industry: Industry;
  status: CustomerStatus;
  rating: number; // 1..5
  contact: Contact;
  address: Address;
  financial: Financial;
  stats: Stats;
  preferences: Preferences;
  createdDate: string; // YYYY-MM-DD
  notes: string;
};

// form ใช้ข้อมูลลูกค้าเกือบทั้งหมด ยกเว้น field ที่ระบบเติมเอง
type FormData = Omit<Customer, "stats" | "createdDate">;

/* ========= Constants ========= */
const CUSTOMER_TYPES = [
  "Enterprise",
  "SME",
  "Startup",
  "Government",
  "Distributor",
] as const satisfies Readonly<CustomerType[]>;
const INDUSTRIES = [
  "Automotive",
  "Electronics",
  "Technology",
  "Manufacturing",
  "Industrial",
  "Consumer Goods",
  "Healthcare",
] as const satisfies Readonly<Industry[]>;
const PAYMENT_TERMS = [
  "COD",
  "Net 15",
  "Net 30",
  "Net 45",
  "Net 60",
  "Net 90",
] as const satisfies Readonly<PaymentTerm[]>;
const CURRENCIES = ["THB", "USD", "EUR", "JPY", "CNY"] as const satisfies Readonly<Currency[]>;
const SHIPPING_OPTIONS = ["Economy", "Standard", "Express", "Same Day"] as const satisfies Readonly<ShippingOption[]>;

/* ========= Sample data ========= */
const INITIAL_CUSTOMERS: Customer[] = [
  {
    code: "CUST001",
    name: "ABC Corporation",
    shortName: "ABC Corp",
    type: "Enterprise",
    industry: "Automotive",
    status: "Active",
    rating: 5,
    contact: {
      contactPerson: "John Smith",
      title: "Procurement Manager",
      email: "john.smith@abccorp.com",
      phone: "+66 2 123 4567",
      mobile: "+66 81 234 5678",
    },
    address: {
      street: "123 Industrial Park Road",
      city: "Bangkok",
      state: "Bangkok",
      country: "Thailand",
      postalCode: "10110",
    },
    financial: {
      paymentTerms: "Net 30",
      creditLimit: 500000,
      currency: "THB",
      taxId: "0123456789012",
    },
    stats: {
      totalOrders: 145,
      activeOrders: 8,
      totalRevenue: 12500000,
      avgOrderValue: 86207,
      onTimeDelivery: 94,
      lastOrderDate: "2025-09-28",
    },
    preferences: {
      preferredShipping: "Express",
      specialInstructions: "Require packing list in Thai language",
      discountPercent: 5,
    },
    createdDate: "2023-01-15",
    notes: "Key account - high priority customer",
  },
  {
    code: "CUST002",
    name: "XYZ Limited",
    shortName: "XYZ Ltd",
    type: "SME",
    industry: "Electronics",
    status: "Active",
    rating: 4,
    contact: {
      contactPerson: "Sarah Johnson",
      title: "Supply Chain Manager",
      email: "sarah.j@xyzltd.com",
      phone: "+66 2 234 5678",
      mobile: "+66 82 345 6789",
    },
    address: {
      street: "456 Technology Boulevard",
      city: "Chonburi",
      state: "Chonburi",
      country: "Thailand",
      postalCode: "20000",
    },
    financial: {
      paymentTerms: "Net 45",
      creditLimit: 250000,
      currency: "THB",
      taxId: "0234567890123",
    },
    stats: {
      totalOrders: 87,
      activeOrders: 5,
      totalRevenue: 5800000,
      avgOrderValue: 66667,
      onTimeDelivery: 91,
      lastOrderDate: "2025-09-25",
    },
    preferences: {
      preferredShipping: "Standard",
      specialInstructions: "Delivery only on weekdays",
      discountPercent: 3,
    },
    createdDate: "2023-06-20",
    notes: "",
  },
  {
    code: "CUST003",
    name: "Tech Innovations Inc",
    shortName: "Tech Innovations",
    type: "Enterprise",
    industry: "Technology",
    status: "Active",
    rating: 5,
    contact: {
      contactPerson: "Michael Chen",
      title: "Operations Director",
      email: "m.chen@techinnovations.com",
      phone: "+66 2 345 6789",
      mobile: "+66 83 456 7890",
    },
    address: {
      street: "789 Innovation Drive",
      city: "Bangkok",
      state: "Bangkok",
      country: "Thailand",
      postalCode: "10120",
    },
    financial: {
      paymentTerms: "Net 30",
      creditLimit: 1000000,
      currency: "THB",
      taxId: "0345678901234",
    },
    stats: {
      totalOrders: 203,
      activeOrders: 12,
      totalRevenue: 18900000,
      avgOrderValue: 93103,
      onTimeDelivery: 96,
      lastOrderDate: "2025-09-30",
    },
    preferences: {
      preferredShipping: "Express",
      specialInstructions: "Quality inspection required before shipment",
      discountPercent: 7,
    },
    createdDate: "2022-09-10",
    notes: "Strategic partner - VIP treatment",
  },
  {
    code: "CUST004",
    name: "Global Manufacturing Co",
    shortName: "Global Mfg",
    type: "Enterprise",
    industry: "Manufacturing",
    status: "Active",
    rating: 4,
    contact: {
      contactPerson: "Emily Davis",
      title: "Purchasing Head",
      email: "e.davis@globalmfg.com",
      phone: "+66 2 456 7890",
      mobile: "+66 84 567 8901",
    },
    address: {
      street: "321 Manufacturing Street",
      city: "Rayong",
      state: "Rayong",
      country: "Thailand",
      postalCode: "21000",
    },
    financial: {
      paymentTerms: "Net 60",
      creditLimit: 750000,
      currency: "THB",
      taxId: "0456789012345",
    },
    stats: {
      totalOrders: 156,
      activeOrders: 6,
      totalRevenue: 9200000,
      avgOrderValue: 58974,
      onTimeDelivery: 89,
      lastOrderDate: "2025-09-27",
    },
    preferences: {
      preferredShipping: "Standard",
      specialInstructions: "COD preferred for small orders",
      discountPercent: 4,
    },
    createdDate: "2023-03-05",
    notes: "Price sensitive - negotiate carefully",
  },
  {
    code: "CUST005",
    name: "Industrial Partners Ltd",
    shortName: "Ind Partners",
    type: "SME",
    industry: "Industrial",
    status: "On Hold",
    rating: 3,
    contact: {
      contactPerson: "David Wilson",
      title: "Buyer",
      email: "d.wilson@indpartners.com",
      phone: "+66 2 567 8901",
      mobile: "+66 85 678 9012",
    },
    address: {
      street: "654 Business Park",
      city: "Samut Prakan",
      state: "Samut Prakan",
      country: "Thailand",
      postalCode: "10280",
    },
    financial: {
      paymentTerms: "Net 30",
      creditLimit: 150000,
      currency: "THB",
      taxId: "0567890123456",
    },
    stats: {
      totalOrders: 42,
      activeOrders: 0,
      totalRevenue: 2100000,
      avgOrderValue: 50000,
      onTimeDelivery: 85,
      lastOrderDate: "2025-07-15",
    },
    preferences: {
      preferredShipping: "Economy",
      specialInstructions: "",
      discountPercent: 2,
    },
    createdDate: "2024-01-20",
    notes: "Credit limit reached - payment pending",
  },
];

/* ========= Component ========= */
const CustomerMasterData: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<CustomerType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<CustomerStatus | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "contact" | "financial" | "stats" | "preferences">("basic");

  // Form state
  const [formData, setFormData] = useState<FormData>({
    code: "",
    name: "",
    shortName: "",
    type: "SME",
    industry: "Manufacturing",
    status: "Active",
    rating: 3,
    contact: { contactPerson: "", title: "", email: "", phone: "", mobile: "" },
    address: { street: "", city: "", state: "", country: "Thailand", postalCode: "" },
    financial: { paymentTerms: "Net 30", creditLimit: 0, currency: "THB", taxId: "" },
    preferences: { preferredShipping: "Standard", specialInstructions: "", discountPercent: 0 },
    notes: "",
  });

  const filteredCustomers = customers.filter((customer) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      customer.code.toLowerCase().includes(q) ||
      customer.name.toLowerCase().includes(q) ||
      customer.contact.contactPerson.toLowerCase().includes(q);
    const matchesType = filterType === "all" || customer.type === filterType;
    const matchesStatus = filterStatus === "all" || customer.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const openModal = (mode: ModalMode, customer: Customer | null = null) => {
    setModalMode(mode);
    setSelectedCustomer(customer);
    setActiveTab("basic");

    if (mode === "create") {
      setFormData({
        code: `CUST${String(customers.length + 1).padStart(3, "0")}`,
        name: "",
        shortName: "",
        type: "SME",
        industry: "Manufacturing",
        status: "Active",
        rating: 3,
        contact: { contactPerson: "", title: "", email: "", phone: "", mobile: "" },
        address: { street: "", city: "", state: "", country: "Thailand", postalCode: "" },
        financial: { paymentTerms: "Net 30", creditLimit: 0, currency: "THB", taxId: "" },
        preferences: { preferredShipping: "Standard", specialInstructions: "", discountPercent: 0 },
        notes: "",
      });
    } else if (customer) {
      setFormData({
        code: customer.code,
        name: customer.name,
        shortName: customer.shortName,
        type: customer.type,
        industry: customer.industry,
        status: customer.status,
        rating: customer.rating,
        contact: { ...customer.contact },
        address: { ...customer.address },
        financial: { ...customer.financial },
        preferences: { ...customer.preferences },
        notes: customer.notes,
      });
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode(null);
    setSelectedCustomer(null);
  };

  const handleSave = () => {
    if (modalMode === "create") {
      const newCustomer: Customer = {
        ...formData,
        stats: {
          totalOrders: 0,
          activeOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          onTimeDelivery: 100,
          lastOrderDate: null,
        },
        createdDate: new Date().toISOString().split("T")[0],
      };
      setCustomers((prev) => [...prev, newCustomer]);
    } else if (modalMode === "edit" && selectedCustomer) {
      setCustomers((prev) =>
        prev.map((c) => (c.code === selectedCustomer.code ? { ...selectedCustomer, ...formData } : c))
      );
    }
    closeModal();
  };

  const handleDelete = (customerCode: string) => {
    if (confirm(`Are you sure you want to delete customer ${customerCode}?`)) {
      setCustomers((prev) => prev.filter((c) => c.code !== customerCode));
    }
  };

  const getStatusColor = (status: CustomerStatus): string => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Inactive":
        return "bg-gray-100 text-gray-700";
      case "On Hold":
        return "bg-yellow-100 text-yellow-700";
      case "Blacklisted":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRatingStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={14} className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
    ));

  const formatCurrency = (amount: number, currency: Currency = "THB") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Master Data</h1>
                <p className="text-sm text-gray-500 mt-1">Manage customer information and relationships</p>
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
                  New Customer
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-5 gap-4 mt-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 font-medium mb-1">Total Customers</div>
                <div className="text-2xl font-bold text-blue-900">{customers.length}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-xs text-green-600 font-medium mb-1">Active</div>
                <div className="text-2xl font-bold text-green-900">
                  {customers.filter((c) => c.status === "Active").length}
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="text-xs text-purple-600 font-medium mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-purple-900">
                  {formatCurrency(customers.reduce((sum, c) => sum + (c.stats?.totalRevenue || 0), 0))}
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="text-xs text-orange-600 font-medium mb-1">Active Orders</div>
                <div className="text-2xl font-bold text-orange-900">
                  {customers.reduce((sum, c) => sum + (c.stats?.activeOrders || 0), 0)}
                </div>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                <div className="text-xs text-indigo-600 font-medium mb-1">Avg Order Value</div>
                <div className="text-2xl font-bold text-indigo-900">
                  {formatCurrency(
                    customers.reduce((sum, c) => sum + (c.stats?.avgOrderValue || 0), 0) / customers.length
                  )}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as CustomerType | "all")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {CUSTOMER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as CustomerStatus | "all")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Hold">On Hold</option>
                <option value="Blacklisted">Blacklisted</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Customer Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.code}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Building2 size={14} />
                        {customer.code}
                      </span>
                      <span>{customer.type}</span>
                      <span className="flex items-center gap-1">{getRatingStars(customer.rating)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal("view", customer)}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="View"
                    >
                      <Eye size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => openModal("edit", customer)}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit size={16} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.code)}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Contact Person</div>
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <User size={14} />
                      {customer.contact.contactPerson}
                    </div>
                    <div className="text-xs text-gray-600">{customer.contact.title}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Location</div>
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <MapPin size={14} />
                      {customer.address.city}, {customer.address.country}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Email</div>
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <Mail size={14} />
                      <a href={`mailto:${customer.contact.email}`} className="text-blue-600 hover:underline truncate">
                        {customer.contact.email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Phone</div>
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <Phone size={14} />
                      {customer.contact.phone}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{customer.stats.totalOrders}</div>
                    <div className="text-xs text-gray-600">Orders</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-green-600">{customer.stats.activeOrders}</div>
                    <div className="text-xs text-gray-600">Active</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-purple-600">{customer.stats.onTimeDelivery}%</div>
                    <div className="text-xs text-gray-600">On-Time</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(customer.stats.totalRevenue / 1000)}k
                    </div>
                    <div className="text-xs text-gray-600">Revenue</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    Last order:{" "}
                    {customer.stats.lastOrderDate
                      ? new Date(customer.stats.lastOrderDate).toLocaleDateString()
                      : "N/A"}
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard size={12} />
                    {customer.financial.paymentTerms}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === "view" && "Customer Details"}
                {modalMode === "edit" && "Edit Customer"}
                {modalMode === "create" && "Create New Customer"}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-gray-200 flex gap-4">
              {[
                { id: "basic", label: "Basic Info", icon: Building2 },
                { id: "contact", label: "Contact", icon: User },
                { id: "financial", label: "Financial", icon: DollarSign },
                { id: "stats", label: "Statistics", icon: TrendingUp },
                { id: "preferences", label: "Preferences", icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                      activeTab === (tab.id as typeof activeTab)
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Code *</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        disabled={modalMode === "view" || modalMode === "edit"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Short Name</label>
                      <input
                        type="text"
                        value={formData.shortName}
                        onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value as CustomerType })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        {CUSTOMER_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                      <select
                        value={formData.industry}
                        onChange={(e) =>
                          setFormData({ ...formData, industry: e.target.value as Industry })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        {INDUSTRIES.map((industry) => (
                          <option key={industry} value={industry}>
                            {industry}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value as CustomerStatus })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Blacklisted">Blacklisted</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => modalMode !== "view" && setFormData({ ...formData, rating: star })}
                            disabled={modalMode === "view"}
                            className={`${modalMode === "view" ? "cursor-default" : "cursor-pointer"}`}
                          >
                            <Star
                              size={24}
                              className={star <= formData.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                            />
                          </button>
                        ))}
                        <span className="text-sm text-gray-600 ml-2">{formData.rating}/5</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === "contact" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                        <input
                          type="text"
                          value={formData.contact.contactPerson}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact: { ...formData.contact, contactPerson: e.target.value },
                            })
                          }
                          disabled={modalMode === "view"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={formData.contact.title}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact: { ...formData.contact, title: e.target.value },
                            })
                          }
                          disabled={modalMode === "view"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={formData.contact.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact: { ...formData.contact, email: e.target.value },
                            })
                          }
                          disabled={modalMode === "view"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={formData.contact.phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact: { ...formData.contact, phone: e.target.value },
                            })
                          }
                          disabled={modalMode === "view"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                        <input
                          type="tel"
                          value={formData.contact.mobile}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact: { ...formData.contact, mobile: e.target.value },
                            })
                          }
                          disabled={modalMode === "view"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                        <input
                          type="text"
                          value={formData.address.street}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, street: e.target.value },
                            })
                          }
                          disabled={modalMode === "view"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, city: e.target.value },
                            })
                          }
                          disabled={modalMode === "view"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                        <input
                          type="text"
                          value={formData.address.state}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, state: e.target.value },
                            })
                          }
                          disabled={modalMode === "view"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input
                          type="text"
                          value={formData.address.country}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, country: e.target.value },
                            })
                          }
                          disabled={modalMode === "view"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                        <input
                          type="text"
                          value={formData.address.postalCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, postalCode: e.target.value },
                            })
                          }
                          disabled={modalMode === "view"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Tab */}
              {activeTab === "financial" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                      <select
                        value={formData.financial.paymentTerms}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            financial: {
                              ...formData.financial,
                              paymentTerms: e.target.value as PaymentTerm,
                            },
                          })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        {PAYMENT_TERMS.map((term) => (
                          <option key={term} value={term}>
                            {term}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        value={formData.financial.currency}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            financial: { ...formData.financial, currency: e.target.value as Currency },
                          })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        {CURRENCIES.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Credit Limit</label>
                      <input
                        type="number"
                        value={formData.financial.creditLimit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            financial: {
                              ...formData.financial,
                              creditLimit: Number(e.target.value) || 0,
                            },
                          })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                      <input
                        type="text"
                        value={formData.financial.taxId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            financial: { ...formData.financial, taxId: e.target.value },
                          })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === "stats" && selectedCustomer && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-600 font-medium mb-1">Total Orders</div>
                      <div className="text-3xl font-bold text-blue-900">{selectedCustomer.stats.totalOrders}</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm text-green-600 font-medium mb-1">Active Orders</div>
                      <div className="text-3xl font-bold text-green-900">{selectedCustomer.stats.activeOrders}</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-sm text-purple-600 font-medium mb-1">Total Revenue</div>
                      <div className="text-3xl font-bold text-purple-900">
                        {formatCurrency(
                          selectedCustomer.stats.totalRevenue,
                          selectedCustomer.financial.currency
                        )}
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-sm text-orange-600 font-medium mb-1">Avg Order Value</div>
                      <div className="text-3xl font-bold text-orange-900">
                        {formatCurrency(
                          selectedCustomer.stats.avgOrderValue,
                          selectedCustomer.financial.currency
                        )}
                      </div>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="text-sm text-indigo-600 font-medium mb-1">On-Time Delivery</div>
                      <div className="text-3xl font-bold text-indigo-900">
                        {selectedCustomer.stats.onTimeDelivery}%
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-600 font-medium mb-1">Last Order Date</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedCustomer.stats.lastOrderDate
                          ? new Date(selectedCustomer.stats.lastOrderDate).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Shipping</label>
                      <select
                        value={formData.preferences.preferredShipping}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferences: {
                              ...formData.preferences,
                              preferredShipping: e.target.value as ShippingOption,
                            },
                          })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        {SHIPPING_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                      <input
                        type="number"
                        value={formData.preferences.discountPercent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferences: {
                              ...formData.preferences,
                              discountPercent: Number(e.target.value) || 0,
                            },
                          })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        min={0}
                        max={100}
                        step={0.1}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Instructions
                      </label>
                      <textarea
                        value={formData.preferences.specialInstructions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, specialInstructions: e.target.value },
                          })
                        }
                        disabled={modalMode === "view"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        rows={4}
                        placeholder="Any special handling or delivery requirements..."
                      />
                    </div>
                  </div>
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
                  {modalMode === "create" ? "Create Customer" : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMasterData;
