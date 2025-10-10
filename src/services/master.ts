import axiosClient from "../utils/axiosClient";

// ===== Master ====
export async function getUnit() {
  const res = await axiosClient.get("/enum_values/unit");
  return res.data;
}
export async function getProductMaster() {
  // const res = await axiosClient.get("/master/product");
  // return res.data;
  return [
    {
      code: "WDGT-A",
      name: "Widget A",
      description: "Standard widget with basic features",
      category: "Widgets",
      unit: "pcs",
      lotSize: 50,
      leadTime: 180,
      standardCost: 150,
      status: "Active",
      routing: [
        { seq: 1, process: "MACH", processName: "Machining", setupMin: 30, runMinPerUnit: 1.2, machineGroup: "Machining" },
        { seq: 2, process: "DRILL", processName: "Drilling", setupMin: 20, runMinPerUnit: 0.6, machineGroup: "Machining" },
        { seq: 3, process: "ASSY", processName: "Assembly", setupMin: 15, runMinPerUnit: 0.9, machineGroup: "Assembly" },
      ],
      bom: [
        { material: "MAT-001", description: "Steel Plate", qtyPer: 1, unit: "kg", scrapRate: 5 },
        { material: "MAT-002", description: "Bolt M8", qtyPer: 4, unit: "pcs", scrapRate: 2 },
        { material: "MAT-003", description: "Paint Blue", qtyPer: 0.2, unit: "L", scrapRate: 10 },
      ],
    },
    {
      code: "WDGT-B",
      name: "Widget B",
      description: "Premium widget with advanced features",
      category: "Widgets",
      unit: "pcs",
      lotSize: 25,
      leadTime: 220,
      standardCost: 280,
      status: "Active",
      routing: [
        { seq: 1, process: "PRESS", processName: "Pressing", setupMin: 25, runMinPerUnit: 1.6, machineGroup: "Pressing" },
        { seq: 2, process: "PAINT", processName: "Painting", setupMin: 30, runMinPerUnit: 1.4, machineGroup: "Finishing" },
        { seq: 3, process: "ASSY", processName: "Assembly", setupMin: 15, runMinPerUnit: 1.0, machineGroup: "Assembly" },
      ],
      bom: [
        { material: "MAT-004", description: "Aluminum Sheet", qtyPer: 1.5, unit: "kg", scrapRate: 8 },
        { material: "MAT-002", description: "Bolt M8", qtyPer: 6, unit: "pcs", scrapRate: 2 },
        { material: "MAT-005", description: "Paint Red", qtyPer: 0.3, unit: "L", scrapRate: 10 },
        { material: "MAT-006", description: "Electronics Module", qtyPer: 1, unit: "pcs", scrapRate: 1 },
      ],
    },
    {
      code: "WDGT-C",
      name: "Widget C",
      description: "Economy widget for cost-sensitive markets",
      category: "Widgets",
      unit: "pcs",
      lotSize: 100,
      leadTime: 165,
      standardCost: 95,
      status: "Active",
      routing: [
        { seq: 1, process: "MACH", processName: "Machining", setupMin: 30, runMinPerUnit: 1.3, machineGroup: "Machining" },
        { seq: 2, process: "PAINT", processName: "Painting", setupMin: 30, runMinPerUnit: 0.8, machineGroup: "Finishing" },
        { seq: 3, process: "PACK", processName: "Packaging", setupMin: 10, runMinPerUnit: 0.5, machineGroup: "Assembly" },
      ],
      bom: [
        { material: "MAT-007", description: "Plastic Sheet", qtyPer: 0.8, unit: "kg", scrapRate: 3 },
        { material: "MAT-002", description: "Bolt M8", qtyPer: 2, unit: "pcs", scrapRate: 2 },
        { material: "MAT-003", description: "Paint Blue", qtyPer: 0.1, unit: "L", scrapRate: 10 },
      ],
    },
    {
      code: "WDGT-D",
      name: "Widget D",
      description: "Industrial-grade widget for heavy duty",
      category: "Widgets",
      unit: "pcs",
      lotSize: 10,
      leadTime: 285,
      standardCost: 420,
      status: "Active",
      routing: [
        { seq: 1, process: "PRESS", processName: "Pressing", setupMin: 25, runMinPerUnit: 0.8, machineGroup: "Pressing" },
        { seq: 2, process: "DRILL", processName: "Drilling", setupMin: 20, runMinPerUnit: 0.6, machineGroup: "Machining" },
        { seq: 3, process: "PAINT", processName: "Painting", setupMin: 30, runMinPerUnit: 0.7, machineGroup: "Finishing" },
        { seq: 4, process: "ASSY", processName: "Assembly", setupMin: 15, runMinPerUnit: 0.5, machineGroup: "Assembly" },
      ],
      bom: [
        { material: "MAT-008", description: "Stainless Steel Plate", qtyPer: 2, unit: "kg", scrapRate: 5 },
        { material: "MAT-009", description: "Bolt M12", qtyPer: 8, unit: "pcs", scrapRate: 2 },
        { material: "MAT-010", description: "Industrial Paint", qtyPer: 0.4, unit: "L", scrapRate: 8 },
        { material: "MAT-011", description: "Rubber Gasket", qtyPer: 2, unit: "pcs", scrapRate: 5 },
      ],
    },
  ];
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
export async function getWorkCenters() {
  const res = await axiosClient.get("/master/work_centers");
  return res.data;
}
export async function getBOM() {
  const res = await axiosClient.get("/master/bom");
  return res.data;
}

export async function getRoutings() {
  const res = await axiosClient.get("/master/routings");
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
