"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Paperclip,
  Save,
  FileText,
} from "lucide-react";
import PageHeader from "@/src/components/layout/PageHeader";
import { getCustomers, getCustomersDropdown, getOrders } from "@/src/services/master";
import { ERROR_MESSAGES } from "@/src/config/messages";
import toast from "react-hot-toast";
import Modal from "@/src/components/shared/Modal";
import { ExpandableDataTable } from "@/src/components/shared/table/ExpandableDataTable";

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
  customer_code: string;
  customer_name: string;
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
 * Mock Data (demo)
 * ======================= */
const PRODUCT_CATALOG: ProductCatalogEntry[] = [
  {
    code: "WDGT-A",
    name: "Widget A",
    routing: [
      { seq: 1, process: "MACH", processName: "Machining", setupMin: 30, runMinPerUnit: 1.2, machineGroup: ["M001", "M002"] },
      { seq: 2, process: "DRILL", processName: "Drilling", setupMin: 20, runMinPerUnit: 0.6, machineGroup: ["M001", "M002"] },
      { seq: 3, process: "ASSY", processName: "Assembly", setupMin: 15, runMinPerUnit: 0.9, machineGroup: ["M003"] },
    ],
  },
  {
    code: "WDGT-B",
    name: "Widget B",
    routing: [
      { seq: 1, process: "PRESS", processName: "Pressing", setupMin: 25, runMinPerUnit: 1.6, machineGroup: ["M004"] },
      { seq: 2, process: "PAINT", processName: "Painting", setupMin: 30, runMinPerUnit: 1.4, machineGroup: ["M005"] },
      { seq: 3, process: "ASSY", processName: "Assembly", setupMin: 15, runMinPerUnit: 1.0, machineGroup: ["M003"] },
    ],
  },
  {
    code: "WDGT-C",
    name: "Widget C",
    routing: [
      { seq: 1, process: "MACH", processName: "Machining", setupMin: 30, runMinPerUnit: 1.3, machineGroup: ["M001", "M002"] },
      { seq: 2, process: "PAINT", processName: "Painting", setupMin: 30, runMinPerUnit: 0.8, machineGroup: ["M005"] },
      { seq: 3, process: "PACK", processName: "Packaging", setupMin: 10, runMinPerUnit: 0.5, machineGroup: ["M003"] },
    ],
  },
  {
    code: "WDGT-D",
    name: "Widget D",
    routing: [
      { seq: 1, process: "PRESS", processName: "Pressing", setupMin: 25, runMinPerUnit: 0.8, machineGroup: ["M004"] },
      { seq: 2, process: "DRILL", processName: "Drilling", setupMin: 20, runMinPerUnit: 0.6, machineGroup: ["M001", "M002"] },
      { seq: 3, process: "PAINT", processName: "Painting", setupMin: 30, runMinPerUnit: 0.7, machineGroup: ["M005"] },
      { seq: 4, process: "ASSY", processName: "Assembly", setupMin: 15, runMinPerUnit: 0.5, machineGroup: ["M003"] },
    ],
  },
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
      { itemNo: 1, productCode: "WDGT-A", productName: "Widget A", qty: 100, notes: "" },
      { itemNo: 2, productCode: "WDGT-B", productName: "Widget B", qty: 50, notes: "" },
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
    items: [{ itemNo: 1, productCode: "WDGT-C", productName: "Widget C", qty: 75, notes: "" }],
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
      { itemNo: 1, productCode: "WDGT-D", productName: "Widget D", qty: 200, notes: "Special finish required" },
      { itemNo: 2, productCode: "WDGT-A", productName: "Widget A", qty: 150, notes: "" },
      { itemNo: 3, productCode: "WDGT-B", productName: "Widget B", qty: 80, notes: "" },
    ],
    notes: "Customer will provide materials",
    attachments: ["Spec_Sheet_Tech.pdf", "Drawing_V2.dwg"],
  },
];

/* =======================
 * Component
 * ======================= */
const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterPriority, setFilterPriority] = useState<"all" | "1" | "2" | "3">("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(null);

  const [formData, setFormData] = useState<OrderForm>({
    orderNo: "",
    customerCode: "",
    dueDate: "",
    priority: 2,
    notes: "",
    items: [{ itemNo: 1, productCode: "", qty: 0, notes: "" }],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resOrderRaw = await getOrders();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedOrders: Order[] = resOrderRaw.map((order: any) => ({
          orderNo: order.order_no,
          customer: order.customer_name,
          customerCode: order.customer_code,
          dueDate: order.due_date.split(' ')[0], // ตัดเวลาออก
          priority: order.priority,
          status: order.status,
          createdDate: order.created_date.split(' ')[0],
          items: [],
          notes: order.notes || '',
          attachments: [],
        }));

        setOrders(transformedOrders);

        const resCustomers = await getCustomersDropdown();
        setCustomers(resCustomers);
      } catch (error) {
        console.error("Fetch data failed:", error);
        toast.error(ERROR_MESSAGES.fetchFailed);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: Status): string => {
    const colors: Record<Status, string> = {
      Planned: "status-info",
      "In Progress": "status-success",
      Completed: "status-inactive",
      Late: "status-error",
      Unplanned: "status-yellow",
    };
    return colors[status] || "status-inactive";
  };

  const getPriorityColor = (priority: 1 | 2 | 3): string => {
    const colors: Record<1 | 2 | 3, string> = {
      1: "status-error",
      2: "status-yellow",
      3: "status-success",
    };
    return colors[priority] || "status-inactive";
  };

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesSearch =
        !term ||
        o.orderNo.toLowerCase().includes(term) ||
        o.customer.toLowerCase().includes(term);
      const matchesStatus = filterStatus === "all" || o.status === filterStatus;
      const matchesPriority =
        filterPriority === "all" || o.priority === (parseInt(filterPriority, 10) as 1 | 2 | 3);
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [orders, searchTerm, filterStatus, filterPriority]);

  const calculateTotalProcessTime = (productCode: string, qty: number) => {
    const product = PRODUCT_CATALOG.find((p) => p.code === productCode);
    if (!product) return 0;
    return product.routing.reduce(
      (total, step) => total + step.setupMin + step.runMinPerUnit * qty,
      0
    );
  };

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
    if (!formData.customerCode || !formData.dueDate || formData.items.some((i) => !i.productCode || i.qty <= 0)) {
      toast.error("Please fill in all required fields");
      return;
    }

    const customer = customers.find((c) => c.customer_code === formData.customerCode);

    const newOrder: Order = {
      orderNo: formData.orderNo,
      customer: customer?.customer_name || "",
      customerCode: formData.customerCode,
      dueDate: formData.dueDate,
      priority: formData.priority,
      status: editingOrder?.status || "Unplanned",
      createdDate: editingOrder?.createdDate || new Date().toISOString().split("T")[0],
      items: formData.items.map((item) => {
        const product = PRODUCT_CATALOG.find((p) => p.code === item.productCode);
        return { ...item, productName: product?.name || "" };
      }),
      notes: formData.notes,
      attachments: editingOrder?.attachments || [],
    };

    setOrders((prev) => {
      if (editingOrder) return prev.map((o) => (o.orderNo === editingOrder.orderNo ? newOrder : o));
      // กัน code ซ้ำ
      if (prev.some((o) => o.orderNo === newOrder.orderNo)) {
        toast.error(`Order number "${newOrder.orderNo}" already exists.`);
        return prev;
      }
      return [...prev, newOrder];
    });

    toast.success("Order saved.");
    closeModal();
  };

  const handleDeleteOrder = (orderNo: string) => {
    if (confirm(`Delete order ${orderNo}?`)) {
      setOrders((prev) => prev.filter((o) => o.orderNo !== orderNo));
      toast.success("Order deleted.");
    }
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { itemNo: prev.items.length + 1, productCode: "", qty: 0, notes: "" }],
    }));
  };

  const removeItem = (itemNo: number) => {
    setFormData((prev) => {
      if (prev.items.length === 1) {
        toast.error("Order must have at least one item");
        return prev;
      }
      const kept = prev.items.filter((i) => i.itemNo !== itemNo).map((item, idx) => ({ ...item, itemNo: idx + 1 }));
      return { ...prev, items: kept };
    });
  };

  const updateItem = (itemNo: number, field: keyof OrderFormItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.itemNo === itemNo ? { ...item, [field]: value as never } : item)),
    }));
  };

  const handleExportCSV = () => {
    const headers = ["Order No", "Customer", "Due Date", "Priority", "Status", "Items", "Total Qty"];
    const rows = orders.map((o) => [
      o.orderNo,
      o.customer,
      o.dueDate,
      o.priority,
      o.status,
      o.items.length,
      o.items.reduce((sum, it) => sum + it.qty, 0),
    ]);
    const csv =
      [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => {
              const s = String(cell);
              return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
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

  // ===== Columns สำหรับ Orders =====
  type OrderRow = typeof filteredOrders[number];

  const orderColumns = [
    {
      key: "order",
      label: "Order",
      render: (o: OrderRow) => (
        <div>
          <div className="font-medium">{o.orderNo}</div>
          <div className="text-xs text-white/60">
            {o.createdDate}
            {o.attachments && o.attachments.length > 0 && (
              <> • {o.attachments.length} file{o.attachments.length === 1 ? "" : "s"}</>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (o: OrderRow) => (
        <div className="flex items-center gap-2 text-sm">
          <span>{o.customer}</span>
        </div>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (o: OrderRow) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-white/70" />
          <span>{new Date(o.dueDate).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (o: OrderRow) => (
        <span className={`chip ${getPriorityColor(o.priority)}`}>
          Priority {o.priority}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (o: OrderRow) => (
        <span className={`chip ${getStatusColor(o.status)}`}>{o.status}</span>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (o: OrderRow) => <span className="text-sm">{o.items?.length ?? 0}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (o: OrderRow) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => openViewModal(o)}
            className="p-1 hover:bg-white/10 rounded"
            title="View"
          >
            <Eye size={16} className="text-white/70" />
          </button>
          <button
            onClick={() => openEditModal(o)}
            className="p-1 hover:bg-white/10 rounded"
            title="Edit"
          >
            <Edit size={16} className="text-cyan-300" />
          </button>
          <button
            onClick={() => handleDeleteOrder(o.orderNo)}
            className="p-1 hover:bg-white/10 rounded"
            title="Delete"
          >
            <Trash2 size={16} className="text-rose-300" />
          </button>
        </div>
      ),
    },
  ] as const;

  // ===== Expanded Row (รายการ Items + Notes/Attachments) =====
  const renderOrderExpanded = (order: OrderRow) => (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            {["Item No", "Product Code", "Product Name", "Qty", "Est. Time (min)", "Notes"].map((h) => (
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
          {order.items.map((it) => {
            const est = Math.round(calculateTotalProcessTime(it.productCode, it.qty));
            return (
              <tr key={it.itemNo} className="hover:bg-white/5">
                <td className="px-4 py-3 text-sm font-medium">{it.itemNo}</td>
                <td className="px-4 py-3 text-sm">{it.productCode}</td>
                <td className="px-4 py-3 text-sm">{it.productName}</td>
                <td className="px-4 py-3 text-sm text-white/80">{it.qty}</td>
                <td className="px-4 py-3 text-sm text-white/80">{est}</td>
                <td className="px-4 py-3 text-sm text-white/80">{it.notes || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Notes & Attachments */}
      {(order.notes || order.attachments.length > 0) && (
        <div className="p-4 bg-white/5 border-t border-white/10">
          {order.notes && (
            <div className="mt-1 p-3 bg-amber-500/10 border border-amber-400/30 rounded-lg">
              <div className="flex items-start gap-2">
                <FileText size={16} className="text-amber-300 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-amber-200 mb-1">Order Notes:</div>
                  <div className="text-xs text-amber-200/90">{order.notes}</div>
                </div>
              </div>
            </div>
          )}
          {order.attachments.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-medium text-white/80 mb-2">Attachments:</div>
              <div className="flex flex-wrap gap-2">
                {order.attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-2 py-1 bg-white/10 border border-white/15 rounded text-xs"
                  >
                    <Paperclip size={12} />
                    <span className="text-white/80">{file}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="text-white">
      {/* Header (คงสไตล์เดียวกับ BOM) */}
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Order Management</h1>
              <p className="text-sm text-white/60 mt-1">Create and manage production orders</p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-3">
            <button className="btn btn-outline">
              <Upload size={18} />
              Import CSV
            </button>
            <button onClick={handleExportCSV} className="btn btn-outline">
              <Download size={18} />
              Export
            </button>
            <button onClick={openCreateModal} className="btn btn-primary">
              <Plus size={18} />
              New Order
            </button>
          </div>
        }
        tabs={
          <div className="flex gap-4 mt-0.5 mb-1 mx-0.5">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="Search Order No / Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Status | "all")}
              className="glass-input w-36"
            >
              <option className="select option" value="all">All Status</option>
              <option className="select option" value="Unplanned">Unplanned</option>
              <option className="select option" value="Planned">Planned</option>
              <option className="select option" value="In Progress">In Progress</option>
              <option className="select option" value="Completed">Completed</option>
              <option className="select option" value="Late">Late</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as "all" | "1" | "2" | "3")}
              className="glass-input w-36"
            >
              <option className="select option" value="all">All Priority</option>
              <option className="select option" value="1">Priority 1</option>
              <option className="select option" value="2">Priority 2</option>
              <option className="select option" value="3">Priority 3</option>
            </select>
          </div>
        }
      />

      {/* ===== Table style (ตามไฟล์ตัวอย่าง) ===== */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ExpandableDataTable
          columns={orderColumns}
          data={filteredOrders}
          rowKey={(o) => o.orderNo}
          renderExpandedRow={renderOrderExpanded}
          isLoading={loading}
        />
      </div>

      {/* Modal (view/edit) — คงเดิมจากของคุณ */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title={
          viewMode === "view"
            ? "Order Details"
            : editingOrder
              ? "Edit Order"
              : "Create New Order"
        }
        size="2xl"
        footer={
          viewMode === "view" ? (
            <button
              onClick={() => setViewMode("edit")}
              className="btn btn-primary"
            >
              <Edit size={18} />
              Edit Order
            </button>
          ) : (
            <>
              <button
                onClick={closeModal}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOrder}
                className="btn btn-primary"
              >
                <Save size={18} />
                Save Changes
              </button>
            </>
          )
        }
      >
        {viewMode === "view" && editingOrder ? (
          /* ----- VIEW ----- */
          <div className="space-y-6 text-white">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-white/80">Order Number</label>
                <p className="mt-1 text-lg font-semibold">{editingOrder.orderNo}</p>
              </div>
              <div>
                <label className="text-sm text-white/80">Status</label>
                <p className="mt-1">
                  <span className={`text-sm px-3 py-1 rounded ${getStatusColor(editingOrder.status)}`}>
                    {editingOrder.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-white/80">Customer</label>
                <p className="mt-1">{editingOrder.customer}</p>
              </div>
              <div>
                <label className="text-sm text-white/80">Priority</label>
                <p className="mt-1">
                  <span className={`text-sm px-3 py-1 rounded ${getPriorityColor(editingOrder.priority)}`}>
                    Priority {editingOrder.priority}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-white/80">Created Date</label>
                <p className="mt-1">{new Date(editingOrder.createdDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm text-white/80">Due Date</label>
                <p className="mt-1">{new Date(editingOrder.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <label className="text-sm text-white/80 mb-3 block">Order Items</label>
              <div className="space-y-3">
                {editingOrder.items.map((item) => (
                  <div key={item.itemNo} className="border border-white/10 rounded-lg p-4 bg-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">
                        Item {item.itemNo}: {item.productName}
                      </span>
                      <span className="text-sm text-white/60">{item.productCode}</span>
                    </div>
                    <p className="text-sm text-white/80">Quantity: {item.qty} units</p>
                    {item.notes && <p className="text-sm text-cyan-300 mt-1">Note: {item.notes}</p>}
                  </div>
                ))}
              </div>
            </div>

            {editingOrder.notes && (
              <div>
                <label className="text-sm text-white/80">Order Notes</label>
                <p className="mt-1 p-3 bg-white/5 border border-white/10 rounded">{editingOrder.notes}</p>
              </div>
            )}
          </div>
        ) : (
          /* ----- EDIT/CREATE ----- */
          <div className="space-y-6 text-white">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-white/80 block mb-2">Order Number</label>
                <input
                  type="text"
                  value={formData.orderNo}
                  onChange={(e) => setFormData({ ...formData, orderNo: e.target.value })}
                  className="w-full glass-input"
                  readOnly={!!editingOrder}
                />
              </div>
              <div>
                <label className="text-sm text-white/80 block mb-2">Customer *</label>
                <select
                  value={formData.customerCode}
                  onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })}
                  className="w-full glass-input"
                  required
                >
                  <option className="select option" value="">
                    Select Customer
                  </option>
                  {customers.map((c) => (
                    <option key={c.customer_code} value={c.customer_code} className="select option">
                      {c.customer_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-white/80 block mb-2">Due Date *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full glass-input"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-white/80 block mb-2">Priority *</label>
                <select
                  value={String(formData.priority)}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value, 10) as 1 | 2 | 3 })}
                  className="w-full glass-input"
                >
                  <option className="select option" value="1">Priority 1 (High)</option>
                  <option className="select option" value="2">Priority 2 (Medium)</option>
                  <option className="select option" value="3">Priority 3 (Low)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-white/80 block mb-2">Order Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full glass-input"
                placeholder="Add any special instructions or notes..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-white/80">Order Items *</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1 rounded bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-500 text-white text-sm inline-flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item) => {
                  const est =
                    item.productCode && item.qty > 0
                      ? Math.round(calculateTotalProcessTime(item.productCode, item.qty))
                      : 0;

                  return (
                    <div key={item.itemNo} className="border border-white/10 rounded-lg p-4 bg-white/5">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-white/80 block mb-1">Product *</label>
                            <select
                              value={item.productCode}
                              onChange={(e) => updateItem(item.itemNo, "productCode", e.target.value)}
                              className="w-full glass-input"
                              required
                            >
                              <option className="select option" value="">
                                Select Product
                              </option>
                              {PRODUCT_CATALOG.map((prod) => (
                                <option key={prod.code} value={prod.code} className="select option">
                                  {prod.name} ({prod.code})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-xs text-white/80 block mb-1">Quantity *</label>
                            <input
                              type="number"
                              value={item.qty}
                              onChange={(e) => updateItem(item.itemNo, "qty", parseInt(e.target.value, 10) || 0)}
                              className="w-full glass-input"
                              min={1}
                              required
                            />
                          </div>

                          <div>
                            <label className="text-xs text-white/80 block mb-1">Notes</label>
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) => updateItem(item.itemNo, "notes", e.target.value)}
                              className="w-full glass-input"
                              placeholder="Optional notes"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.itemNo)}
                          className="mt-5 p-1.5 text-rose-400 hover:bg-rose-500/10 rounded"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/70">
                        Est. Time: {est} min
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default OrderManagement;
