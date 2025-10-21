// src/mocks/customers.ts

export type CustomerStatus = "Active" | "Inactive" | "On Hold" | "Blacklisted";
export type CustomerType = "Distributor" | "OEM" | "Retail" | "Wholesaler";
export type Industry = "Automotive" | "Electronics" | "Aerospace" | "Medical" | "Food & Beverage";
export type PaymentTerm = "COD" | "Net 15" | "Net 30" | "Net 45" | "Net 60";
export type Currency = "USD" | "EUR" | "THB" | "JPY";
export type ShippingOption = "Ground" | "Air" | "Sea";

// ✅ “รายการ” ที่ตารางต้องใช้เท่านั้น (เบา ๆ)
export type CustomerListItem = {
  code: string;
  name: string;
  shortName?: string;
  status: CustomerStatus;
  type: CustomerType;
  contact: {
    contactPerson: string;
    email: string;
  };
  stats: {
    totalOrders: number;
    activeOrders: number;
  };
};

// ✅ “รายละเอียดเต็ม” ใช้ตอน view/edit
export type CustomerDetail = CustomerListItem & {
  industry: Industry;
  rating: number;
  contact: CustomerListItem["contact"] & { title?: string; phone?: string; mobile?: string };
  address: { street: string; city: string; state: string; country: string; postalCode: string };
  financial: { paymentTerms: PaymentTerm; currency: Currency; creditLimit: number; taxId: string };
  stats: CustomerListItem["stats"] & {
    totalRevenue: number;
    avgOrderValue: number;
    onTimeDelivery: number;
    lastOrderDate?: string;
  };
  notes?: string;
};

// ---------- Mock data ----------
const LIST: CustomerListItem[] = [
  {
    code: "CUST-001",
    name: "Acme Corporation",
    shortName: "Acme",
    status: "Active",
    type: "OEM",
    contact: { contactPerson: "John Doe", email: "john@acme.com" },
    stats: { totalOrders: 152, activeOrders: 3 },
  },
  {
    code: "CUST-002",
    name: "Global Retail Co.",
    shortName: "Global Retail",
    status: "On Hold",
    type: "Retail",
    contact: { contactPerson: "Jane Smith", email: "jane@globalretail.com" },
    stats: { totalOrders: 87, activeOrders: 0 },
  },
  {
    code: "CUST-003",
    name: "Skyline Distributors",
    shortName: "Skyline",
    status: "Inactive",
    type: "Distributor",
    contact: { contactPerson: "Mike Chan", email: "mike@skyline.co" },
    stats: { totalOrders: 240, activeOrders: 5 },
  },
];

const DETAILS: Record<string, CustomerDetail> = {
  "CUST-001": {
    ...LIST[0],
    industry: "Electronics",
    rating: 4,
    contact: { ...LIST[0].contact, title: "Procurement Manager", phone: "02-123-4567", mobile: "081-111-2222" },
    address: { street: "123 Business St", city: "Bangkok", state: "BK", country: "TH", postalCode: "10110" },
    financial: { paymentTerms: "Net 30", currency: "THB", creditLimit: 800000, taxId: "0105550123456" },
    stats: { ...LIST[0].stats, totalRevenue: 12500000, avgOrderValue: 82000, onTimeDelivery: 95, lastOrderDate: "2025-09-20" },
    notes: "Key account. Wants quarterly business reviews.",
  },
  "CUST-002": {
    ...LIST[1],
    industry: "Food & Beverage",
    rating: 3,
    contact: { ...LIST[1].contact, title: "Purchasing", phone: "02-555-8888" },
    address: { street: "88 Market Rd", city: "Chiang Mai", state: "CM", country: "TH", postalCode: "50000" },
    financial: { paymentTerms: "Net 15", currency: "THB", creditLimit: 200000, taxId: "0505550654321" },
    stats: { ...LIST[1].stats, totalRevenue: 2500000, avgOrderValue: 42000, onTimeDelivery: 90, lastOrderDate: "2025-08-02" },
  },
  "CUST-003": {
    ...LIST[2],
    industry: "Automotive",
    rating: 2,
    contact: { ...LIST[2].contact, title: "Owner", phone: "02-777-0000" },
    address: { street: "55 Warehouse Ave", city: "Rayong", state: "RY", country: "TH", postalCode: "21000" },
    financial: { paymentTerms: "COD", currency: "THB", creditLimit: 0, taxId: "0205550099999" },
    stats: { ...LIST[2].stats, totalRevenue: 3700000, avgOrderValue: 31000, onTimeDelivery: 83, lastOrderDate: "2025-06-10" },
    notes: "曾มีเคสคืนสินค้า กรุณาตรวจเข้ม.",
  },
};

// ---------- Mock APIs (หน่วงเวลาเล็กน้อยให้เหมือนเรียกจริง) ----------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockGetCustomerList(): Promise<CustomerListItem[]> {
  await sleep(250);
  return LIST;
}

export async function mockGetCustomerByCode(code: string): Promise<CustomerDetail | null> {
  await sleep(250);
  return DETAILS[code] ?? null;
}
