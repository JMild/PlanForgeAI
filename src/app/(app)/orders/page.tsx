"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Package,
  Calendar,
  User,
  Paperclip,
  X,
  Save,
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";

/* =======================
 * Types
 * ======================= */
type Status = "Unplanned" | "Planned" | "In Progress" | "Completed" | "Late";
type ViewMode = "view" | "edit" | null;

interface RoutingStep {
  seq: number;
  process: string;
  processName: string;
  setupMin: number;
  runMinPerUnit: number;
  machineGroup: string[];
}

interface ProductCatalogEntry {
  code: string;
  name: string;
  routing: RoutingStep[];
}

interface Customer {
  code: string;
  name: string;
}

interface OrderItem {
  itemNo: number;
  productCode: string;
  productName: string;
  qty: number;
  notes: string;
}

interface Order {
  orderNo: string;
  customer: string;
  customerCode: string;
  dueDate: string; // YYYY-MM-DD
  priority: 1 | 2 | 3;
  status: Status;
  createdDate: string; // YYYY-MM-DD
  items: OrderItem[];
  notes: string;
  attachments: string[];
}

interface OrderFormItem {
  itemNo: number;
  productCode: string;
  productName?: string;
  qty: number;
  notes: string;
}

interface OrderForm {
  orderNo: string;
  customerCode: string;
  dueDate: string;
  priority: 1 | 2 | 3;
  notes: string;
  items: OrderFormItem[];
}

/* =======================
 * Mock Data
 * ======================= */
const PRODUCT_CATALOG: ProductCatalogEntry[] = [
  {
    code: "WDGT-A",
    name: "Widget A",
    routing: [
      {
        seq: 1,
        process: "MACH",
        processName: "Machining",
        setupMin: 30,
        runMinPerUnit: 1.2,
        machineGroup: ["M001", "M002"],
      },
      {
        seq: 2,
        process: "DRILL",
        processName: "Drilling",
        setupMin: 20,
        runMinPerUnit: 0.6,
        machineGroup: ["M001", "M002"],
      },
      {
        seq: 3,
        process: "ASSY",
        processName: "Assembly",
        setupMin: 15,
        runMinPerUnit: 0.9,
        machineGroup: ["M003"],
      },
    ],
  },
  {
    code: "WDGT-B",
    name: "Widget B",
    routing: [
      {
        seq: 1,
        process: "PRESS",
        processName: "Pressing",
        setupMin: 25,
        runMinPerUnit: 1.6,
        machineGroup: ["M004"],
      },
      {
        seq: 2,
        process: "PAINT",
        processName: "Painting",
        setupMin: 30,
        runMinPerUnit: 1.4,
        machineGroup: ["M005"],
      },
      {
        seq: 3,
        process: "ASSY",
        processName: "Assembly",
        setupMin: 15,
        runMinPerUnit: 1.0,
        machineGroup: ["M003"],
      },
    ],
  },
  {
    code: "WDGT-C",
    name: "Widget C",
    routing: [
      {
        seq: 1,
        process: "MACH",
        processName: "Machining",
        setupMin: 30,
        runMinPerUnit: 1.3,
        machineGroup: ["M001", "M002"],
      },
      {
        seq: 2,
        process: "PAINT",
        processName: "Painting",
        setupMin: 30,
        runMinPerUnit: 0.8,
        machineGroup: ["M005"],
      },
      {
        seq: 3,
        process: "PACK",
        processName: "Packaging",
        setupMin: 10,
        runMinPerUnit: 0.5,
        machineGroup: ["M003"],
      },
    ],
  },
  {
    code: "WDGT-D",
    name: "Widget D",
    routing: [
      {
        seq: 1,
        process: "PRESS",
        processName: "Pressing",
        setupMin: 25,
        runMinPerUnit: 0.8,
        machineGroup: ["M004"],
      },
      {
        seq: 2,
        process: "DRILL",
        processName: "Drilling",
        setupMin: 20,
        runMinPerUnit: 0.6,
        machineGroup: ["M001", "M002"],
      },
      {
        seq: 3,
        process: "PAINT",
        processName: "Painting",
        setupMin: 30,
        runMinPerUnit: 0.7,
        machineGroup: ["M005"],
      },
      {
        seq: 4,
        process: "ASSY",
        processName: "Assembly",
        setupMin: 15,
        runMinPerUnit: 0.5,
        machineGroup: ["M003"],
      },
    ],
  },
];

const CUSTOMERS: Customer[] = [
  { code: "CUST001", name: "ABC Corp" },
  { code: "CUST002", name: "XYZ Ltd" },
  { code: "CUST003", name: "Tech Inc" },
  { code: "CUST004", name: "Global Co" },
  { code: "CUST005", name: "Industrial Partners" },
];

const INITIAL_ORDERS: Order[] = [
  {
    orderNo: "ORD001",
    customer: "ABC Corp",
    customerCode: "CUST001",
    dueDate: "2025-10-03",
    priority: 1,
    status: "Planned",
    createdDate: "2025-09-25",
    items: [
      {
        itemNo: 1,
        productCode: "WDGT-A",
        productName: "Widget A",
        qty: 100,
        notes: "",
      },
      {
        itemNo: 2,
        productCode: "WDGT-B",
        productName: "Widget B",
        qty: 50,
        notes: "",
      },
    ],
    notes: "Rush order - expedite if possible",
    attachments: ["PO_ABC_001.pdf"],
  },
  {
    orderNo: "ORD002",
    customer: "XYZ Ltd",
    customerCode: "CUST002",
    dueDate: "2025-10-02",
    priority: 2,
    status: "In Progress",
    createdDate: "2025-09-24",
    items: [
      {
        itemNo: 1,
        productCode: "WDGT-C",
        productName: "Widget C",
        qty: 75,
        notes: "",
      },
    ],
    notes: "",
    attachments: [],
  },
  {
    orderNo: "ORD003",
    customer: "Tech Inc",
    customerCode: "CUST003",
    dueDate: "2025-10-04",
    priority: 1,
    status: "Unplanned",
    createdDate: "2025-09-26",
    items: [
      {
        itemNo: 1,
        productCode: "WDGT-D",
        productName: "Widget D",
        qty: 200,
        notes: "Special finish required",
      },
      {
        itemNo: 2,
        productCode: "WDGT-A",
        productName: "Widget A",
        qty: 150,
        notes: "",
      },
      {
        itemNo: 3,
        productCode: "WDGT-B",
        productName: "Widget B",
        qty: 80,
        notes: "",
      },
    ],
    notes: "Customer will provide materials",
    attachments: ["Spec_Sheet_Tech.pdf", "Drawing_V2.dwg"],
  },
];

/* =======================
 * Component
 * ======================= */
const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterPriority, setFilterPriority] = useState<"all" | "1" | "2" | "3">(
    "all"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {}
  );

  const [formData, setFormData] = useState<OrderForm>({
    orderNo: "",
    customerCode: "",
    dueDate: "",
    priority: 2,
    notes: "",
    items: [{ itemNo: 1, productCode: "", qty: 0, notes: "" }],
  });

  const getStatusColor = (status: Status): string => {
    const colors: Record<Status, string> = {
      Planned: "bg-blue-100 text-blue-700",
      "In Progress": "bg-green-100 text-green-700",
      Completed: "bg-gray-100 text-gray-700",
      Late: "bg-red-100 text-red-700",
      Unplanned: "bg-yellow-100 text-yellow-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (priority: 1 | 2 | 3): string => {
    const colors: Record<1 | 2 | 3, string> = {
      1: "bg-red-100 text-red-700",
      2: "bg-yellow-100 text-yellow-700",
      3: "bg-green-100 text-green-700",
    };
    return colors[priority] || "bg-gray-100 text-gray-700";
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" ||
      order.priority === (parseInt(filterPriority, 10) as 1 | 2 | 3);
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openCreateModal = () => {
    setFormData({
      orderNo: `ORD${String(orders.length + 1).padStart(3, "0")}`,
      customerCode: "",
      dueDate: "",
      priority: 2,
      notes: "",
      items: [{ itemNo: 1, productCode: "", qty: 0, notes: "" }],
    });
    setEditingOrder(null);
    setViewMode("edit");
    setIsModalOpen(true);
  };

  const openEditModal = (order: Order) => {
    setFormData({
      orderNo: order.orderNo,
      customerCode: order.customerCode,
      dueDate: order.dueDate,
      priority: order.priority,
      notes: order.notes,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      items: order.items.map(({ productName, ...rest }) => ({ ...rest })),
    });
    setEditingOrder(order);
    setViewMode("edit");
    setIsModalOpen(true);
  };

  const openViewModal = (order: Order) => {
    setEditingOrder(order);
    setViewMode("view");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
    setViewMode(null);
  };

  const handleSaveOrder = () => {
    if (
      !formData.customerCode ||
      !formData.dueDate ||
      formData.items.some((i) => !i.productCode || i.qty <= 0)
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const customer = CUSTOMERS.find((c) => c.code === formData.customerCode);

    const newOrder: Order = {
      orderNo: formData.orderNo,
      customer: customer?.name || "",
      customerCode: formData.customerCode,
      dueDate: formData.dueDate,
      priority: formData.priority,
      status: editingOrder?.status || "Unplanned",
      createdDate:
        editingOrder?.createdDate || new Date().toISOString().split("T")[0],
      items: formData.items.map((item) => {
        const product = PRODUCT_CATALOG.find((p) => p.code === item.productCode);
        return {
          ...item,
          productName: product?.name || "",
        };
      }),
      notes: formData.notes,
      attachments: editingOrder?.attachments || [],
    };

    if (editingOrder) {
      setOrders((prev) =>
        prev.map((o) => (o.orderNo === editingOrder.orderNo ? newOrder : o))
      );
    } else {
      setOrders((prev) => [...prev, newOrder]);
    }
    closeModal();
  };

  const handleDeleteOrder = (orderNo: string) => {
    if (confirm(`Are you sure you want to delete order ${orderNo}?`)) {
      setOrders((prev) => prev.filter((o) => o.orderNo !== orderNo));
    }
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { itemNo: prev.items.length + 1, productCode: "", qty: 0, notes: "" },
      ],
    }));
  };

  const removeItem = (itemNo: number) => {
    setFormData((prev) => {
      if (prev.items.length === 1) {
        alert("Order must have at least one item");
        return prev;
      }
      const kept = prev.items
        .filter((i) => i.itemNo !== itemNo)
        .map((item, idx) => ({ ...item, itemNo: idx + 1 }));
      return { ...prev, items: kept };
    });
  };

  const updateItem = (
    itemNo: number,
    field: keyof OrderFormItem,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.itemNo === itemNo ? { ...item, [field]: value as never } : item
      ),
    }));
  };

  const toggleOrderExpand = (orderNo: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderNo]: !prev[orderNo],
    }));
  };

  const calculateTotalProcessTime = (productCode: string, qty: number) => {
    const product = PRODUCT_CATALOG.find((p) => p.code === productCode);
    if (!product) return 0;
    return product.routing.reduce(
      (total, step) => total + step.setupMin + step.runMinPerUnit * qty,
      0
    );
  };

  const handleExportCSV = () => {
    const headers = [
      "Order No",
      "Customer",
      "Due Date",
      "Priority",
      "Status",
      "Items",
      "Total Qty",
    ];
    const rows = orders.map((order) => [
      order.orderNo,
      order.customer,
      order.dueDate,
      order.priority,
      order.status,
      order.items.length,
      order.items.reduce((sum, item) => sum + item.qty, 0),
    ]);

    const csv =
      [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => {
              const s = String(cell);
              // simple CSV escaping
              return s.includes(",") || s.includes('"') || s.includes("\n")
                ? `"${s.replace(/"/g, '""')}"`
                : s;
            })
            .join(",")
        )
        .join("\n") + "\n";

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Create and manage production orders
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Upload size={18} />
                  Import CSV
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download size={18} />
                  Export
                </button>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={18} />
                  New Order
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
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as Status | "all")
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Unplanned">Unplanned</option>
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Late">Late</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) =>
                  setFilterPriority(e.target.value as "all" | "1" | "2" | "3")
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="1">Priority 1</option>
                <option value="2">Priority 2</option>
                <option value="3">Priority 3</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Orders List */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first order to get started
              </p>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Order
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const isExpanded = !!expandedOrders[order.orderNo];

                return (
                  <div
                    key={order.orderNo}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <button
                            onClick={() => toggleOrderExpand(order.orderNo)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown size={20} />
                            ) : (
                              <ChevronRight size={20} />
                            )}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {order.orderNo}
                              </h3>
                              <span
                                className={`text-xs px-2 py-1 rounded ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                                  order.priority
                                )}`}
                              >
                                Priority {order.priority}
                              </span>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <User size={14} />
                                <span>{order.customer}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>
                                  Due:{" "}
                                  {new Date(order.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Package size={14} />
                                <span>
                                  {order.items.length} item
                                  {order.items.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              {order.attachments.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Paperclip size={14} />
                                  <span>
                                    {order.attachments.length} file
                                    {order.attachments.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openViewModal(order)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="View Details"
                          >
                            <Eye size={18} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => openEditModal(order)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="Edit Order"
                          >
                            <Edit size={18} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.orderNo)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="Delete Order"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 ml-12 space-y-2">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Order Items:
                          </h4>
                          {order.items.map((item) => {
                            const product = PRODUCT_CATALOG.find(
                              (p) => p.code === item.productCode
                            );
                            const totalTime = calculateTotalProcessTime(
                              item.productCode,
                              item.qty
                            );

                            return (
                              <div
                                key={item.itemNo}
                                className="border border-gray-200 rounded-lg p-3 bg-white"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm font-medium text-gray-900">
                                        Item {item.itemNo}: {item.productName}
                                      </span>
                                      <span className="text-sm text-gray-600">
                                        ({item.productCode})
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <div>
                                        Quantity:{" "}
                                        <span className="font-medium">
                                          {item.qty} units
                                        </span>
                                      </div>
                                      <div>
                                        Est. Process Time:{" "}
                                        <span className="font-medium">
                                          {Math.round(totalTime)} minutes
                                        </span>
                                      </div>
                                      {item.notes && (
                                        <div className="text-xs text-blue-600 mt-1">
                                          Note: {item.notes}
                                        </div>
                                      )}
                                    </div>
                                    {product && (
                                      <div className="mt-2 pt-2 border-t border-gray-100">
                                        <div className="text-xs text-gray-500 mb-1">
                                          Routing Steps:
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {product.routing.map((step, idx) => (
                                            <React.Fragment key={step.seq}>
                                              <div className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                                {step.processName}
                                              </div>
                                              {idx <
                                                product.routing.length - 1 && (
                                                <span className="text-gray-400">
                                                  →
                                                </span>
                                              )}
                                            </React.Fragment>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {order.notes && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <FileText
                                  size={16}
                                  className="text-yellow-600 mt-0.5"
                                />
                                <div>
                                  <div className="text-xs font-medium text-yellow-900 mb-1">
                                    Order Notes:
                                  </div>
                                  <div className="text-xs text-yellow-800">
                                    {order.notes}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {order.attachments.length > 0 && (
                            <div className="mt-3">
                              <div className="text-xs font-medium text-gray-700 mb-2">
                                Attachments:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {order.attachments.map((file, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                                  >
                                    <Paperclip size={12} />
                                    <span>{file}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {viewMode === "view"
                  ? "Order Details"
                  : editingOrder
                  ? "Edit Order"
                  : "Create New Order"}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {viewMode === "view" && editingOrder ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Order Number
                      </label>
                      <p className="mt-1 text-lg font-semibold">
                        {editingOrder.orderNo}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <p className="mt-1">
                        <span
                          className={`text-sm px-3 py-1 rounded ${getStatusColor(
                            editingOrder.status
                          )}`}
                        >
                          {editingOrder.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Customer
                      </label>
                      <p className="mt-1 text-gray-900">{editingOrder.customer}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <p className="mt-1">
                        <span
                          className={`text-sm px-3 py-1 rounded ${getPriorityColor(
                            editingOrder.priority
                          )}`}
                        >
                          Priority {editingOrder.priority}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Created Date
                      </label>
                      <p className="mt-1 text-gray-900">
                        {new Date(editingOrder.createdDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Due Date
                      </label>
                      <p className="mt-1 text-gray-900">
                        {new Date(editingOrder.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">
                      Order Items
                    </label>
                    <div className="space-y-3">
                      {editingOrder.items.map((item) => {
                        const product = PRODUCT_CATALOG.find(
                          (p) => p.code === item.productCode
                        );
                        return (
                          <div
                            key={item.itemNo}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">
                                Item {item.itemNo}: {item.productName}
                              </span>
                              <span className="text-sm text-gray-600">
                                {item.productCode}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              Quantity: {item.qty} units
                            </p>
                            {item.notes && (
                              <p className="text-sm text-blue-600 mt-1">
                                Note: {item.notes}
                              </p>
                            )}
                            {product && (
                              <div className="mt-2 pt-2 border-t">
                                <div className="text-xs text-gray-500 mb-1">
                                  Routing:
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  {product.routing.map((step) => (
                                    <span
                                      key={step.seq}
                                      className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded"
                                    >
                                      {step.processName}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {editingOrder.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Order Notes
                      </label>
                      <p className="mt-1 text-gray-900 p-3 bg-gray-50 rounded">
                        {editingOrder.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Order Number
                      </label>
                      <input
                        type="text"
                        value={formData.orderNo}
                        onChange={(e) =>
                          setFormData({ ...formData, orderNo: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!!editingOrder}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Customer *
                      </label>
                      <select
                        value={formData.customerCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerCode: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Customer</option>
                        {CUSTOMERS.map((customer) => (
                          <option key={customer.code} value={customer.code}>
                            {customer.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) =>
                          setFormData({ ...formData, dueDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Priority *
                      </label>
                      <select
                        value={String(formData.priority)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priority: parseInt(e.target.value, 10) as 1 | 2 | 3,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1">Priority 1 (High)</option>
                        <option value="2">Priority 2 (Medium)</option>
                        <option value="3">Priority 3 (Low)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Order Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add any special instructions or notes..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Order Items *
                      </label>
                      <button
                        type="button"
                        onClick={addItem}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add Item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.items.map((item) => {
                        const product = PRODUCT_CATALOG.find(
                          (p) => p.code === item.productCode
                        );
                        const est =
                          item.productCode && item.qty > 0
                            ? Math.round(
                                calculateTotalProcessTime(
                                  item.productCode,
                                  item.qty
                                )
                              )
                            : 0;

                        return (
                          <div
                            key={item.itemNo}
                            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1 grid grid-cols-3 gap-3">
                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-1">
                                    Product *
                                  </label>
                                  <select
                                    value={item.productCode}
                                    onChange={(e) =>
                                      updateItem(
                                        item.itemNo,
                                        "productCode",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  >
                                    <option value="">Select Product</option>
                                    {PRODUCT_CATALOG.map((prod) => (
                                      <option key={prod.code} value={prod.code}>
                                        {prod.name} ({prod.code})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-1">
                                    Quantity *
                                  </label>
                                  <input
                                    type="number"
                                    value={item.qty}
                                    onChange={(e) =>
                                      updateItem(
                                        item.itemNo,
                                        "qty",
                                        parseInt(e.target.value, 10) || 0
                                      )
                                    }
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min={1}
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-1">
                                    Notes
                                  </label>
                                  <input
                                    type="text"
                                    value={item.notes}
                                    onChange={(e) =>
                                      updateItem(item.itemNo, "notes", e.target.value)
                                    }
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Optional notes"
                                  />
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeItem(item.itemNo)}
                                className="mt-5 p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="Remove item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {product && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">
                                  Routing Steps:
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {product.routing.map((step, idx) => (
                                    <React.Fragment key={step.seq}>
                                      <div className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                        {step.processName}
                                      </div>
                                      {idx < product.routing.length - 1 && (
                                        <span className="text-gray-400">→</span>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  Est. Time: {est} min
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {viewMode === "view" ? (
                <button
                  onClick={() => setViewMode("edit")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit size={18} />
                  Edit Order
                </button>
              ) : (
                <button
                  onClick={handleSaveOrder}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
