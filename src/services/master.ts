import axiosClient from "../utils/axiosClient";

// ===== Master ====
export async function getUnit() {
  const res = await axiosClient.get("/enum_values/unit");
  return res.data;
}
export async function getProductDropdown() {
  const res = await axiosClient.get("/master/product-dropdown");
  return res.data;
}
export async function getProduct() {  
  const res = await axiosClient.get("/master/products");
  return res.data;
}  
export async function getProductCategory() {
  const res = await axiosClient.get("/enum_values/product-category");
  return res.data;
}

export async function getMachines() {
  // const res = await axiosClient.get("/integrations?type=MES&endpoint=machines");
  const res = await axiosClient.get("/master/machines");
  return res.data;
}
export async function getDropdownMachineStatus() {
  // const res = await axiosClient.get("/integrations?type=MES&endpoint=machines");
  const res = await axiosClient.get("/enum_values/machine-status");
  return res.data;
}

export async function getProcesses() {
  const res = await axiosClient.get("/master/processes");
  return res.data;
}
export async function getProducts() {
  const res = await axiosClient.get("/master/products");
  return res.data;
}
export async function getCustomers() {
  const res = await axiosClient.get("/master/customers");
  return res.data;
}
export async function getCustomersDropdown() {
  const res = await axiosClient.get("/master/customers-dropdown");
  return res.data;
}
export async function getWorkCenters() {
  const res = await axiosClient.get("/master/work_centers");
  return res.data;
}
export async function getWorkCenterDropdown() {
  const res = await axiosClient.get("/master/work_centers-dropdown");
  return res.data;
}
export async function getBOM() {
  const res = await axiosClient.get("/master/bom");
  return res.data;
}
export async function getBOMById(bom_id: string) {
  const res = await axiosClient.get("/master/bom_id", {
    params: { bom_id },
  });
  return res.data;
}

export async function getMaterial() {
  const res = await axiosClient.get("/master/materials");
  return res.data;
}

export async function getRoutings() {
  const res = await axiosClient.get("/master/routings");
  return res.data;
}
export async function getRoutingsById(routing_id: string) {
  const res = await axiosClient.get("/master/routing_step", {
    params: { routing_id },
  });
  return res.data;
}

export async function getOrders() {
  const res = await axiosClient.get("/orders");
  return res.data;
}
export async function getOrderByItems() {
  const res = await axiosClient.get("/orders/items");
  return res.data;
}

export async function getPersonnel() {
  // const res = await axiosClient.get("/orders/items");
  // return res.data;
  return [
    {
      empCode: "EMP001",
      firstName: "John",
      lastName: "Smith",
      fullName: "John Smith",
      email: "john.smith@company.com",
      phone: "+1-555-0101",
      department: "Manufacturing",
      position: "Senior Machine Operator",
      employmentType: "Full-Time",
      status: "Active",
      hireDate: "2020-03-15",
      calendarId: "CAL001",
      shiftPattern: "3-Shift Rotating",
      workCenter: "WC001",
      supervisor: "EMP005",
      skillTags: ["CNC Machining", "Quality Control", "Setup"],
      hourlyRate: 28.5,
      certifications: ["CNC Level 3", "Safety Training", "Forklift Certified"],
      emergencyContact: "Jane Smith",
      emergencyPhone: "+1-555-0102",
      address: "123 Main St, Springfield",
      birthDate: "1985-06-15",
      createdAt: "2020-03-10",
      allowedProcesses: ["MACH", "INSP"],
      allowedMachines: ["M001", "M002"],
    },
    {
      empCode: "EMP002",
      firstName: "Sarah",
      lastName: "Johnson",
      fullName: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      phone: "+1-555-0201",
      department: "Assembly",
      position: "Assembly Line Lead",
      employmentType: "Full-Time",
      status: "Active",
      hireDate: "2019-07-01",
      calendarId: "CAL001",
      shiftPattern: "2-Shift",
      workCenter: "WC002",
      supervisor: "EMP006",
      skillTags: ["Assembly", "Team Leadership", "Quality Inspection"],
      hourlyRate: 26.0,
      certifications: [
        "Assembly Certification",
        "Team Lead Training",
        "Quality Inspector",
      ],
      emergencyContact: "Michael Johnson",
      emergencyPhone: "+1-555-0202",
      address: "456 Oak Ave, Springfield",
      birthDate: "1988-11-22",
      createdAt: "2019-06-25",
      allowedProcesses: ["ASSY", "PACK"],
      allowedMachines: ["M003"],
    },
  ];
}

// export async function getUserById(id: string) {
//   const res = await axiosClient.get(`/users/${id}`);
//   return res.data;
// }

// export async function createUser(data: any) {
//   const res = await axiosClient.post("/users", data);
//   return res.data;
// }

// export async function updateUser(id: string, data: any) {
//   const res = await axiosClient.put(`/users/${id}`, data);
//   return res.data;
// }

// export async function deleteUser(id: string) {
//   const res = await axiosClient.delete(`/users/${id}`);
//   return res.data;
// }
