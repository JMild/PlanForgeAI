// lib/api.ts
import axios from "axios";

// =========== Dashboard ===============
export const getDashboard = async () => {
  // const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/setting/holiday`);
  // return res.data;

  return {
    kpis: {
      utilizationRate: 78,
      utilizationTrend: 5.2,
      onTimeDelivery: 92,
      onTimeTrend: -2.1,
      throughput: 1847,
      throughputTrend: 8.5,
      lateOrders: 3,
      lateTrend: -1,
    },
    orderStatus: {
      unplanned: 12,
      planned: 28,
      inProgress: 15,
      completed: 94,
      late: 3,
    },
    machineStatus: [
      { code: 'M001', name: 'CNC Machine 1', status: 'Running', utilization: 85, currentJob: 'ORD001-1', timeRemaining: 45 },
      { code: 'M002', name: 'CNC Machine 2', status: 'Running', utilization: 92, currentJob: 'ORD003-2', timeRemaining: 120 },
      { code: 'M003', name: 'Assembly Line 1', status: 'Idle', utilization: 45, currentJob: null, timeRemaining: 0 },
      { code: 'M004', name: 'Press Machine 1', status: 'Running', utilization: 78, currentJob: 'ORD002-1', timeRemaining: 90 },
      { code: 'M005', name: 'Paint Booth 1', status: 'Idle', utilization: 62, currentJob: null, timeRemaining: 0 },
      { code: 'M006', name: 'Drill Press 1', status: 'Down', utilization: 0, currentJob: null, timeRemaining: 0, downReason: 'Maintenance' },
      { code: 'M007', name: 'Welding Station 1', status: 'Running', utilization: 88, currentJob: 'ORD004-3', timeRemaining: 60 },
      { code: 'M008', name: 'Packaging Line 1', status: 'Idle', utilization: 55, currentJob: null, timeRemaining: 0 },
    ],
    utilizationTrend: [
      { date: '10/25', utilization: 72 },
      { date: '10/26', utilization: 75 },
      { date: '10/27', utilization: 71 },
      { date: '10/28', utilization: 78 },
      { date: '10/29', utilization: 76 },
      { date: '10/30', utilization: 80 },
      { date: '10/31', utilization: 78 },
    ],
    workCenterUtilization: [
      { name: 'Machining', utilization: 88 },
      { name: 'Assembly', utilization: 45 },
      { name: 'Pressing', utilization: 78 },
      { name: 'Finishing', utilization: 62 },
      { name: 'Welding', utilization: 88 },
      { name: 'Packaging', utilization: 55 },
    ],
    upcomingMaintenance: [
      { machine: 'M006', name: 'Drill Press 1', type: 'PM', scheduledDate: '2025-10-01', duration: 120, status: 'In Progress' },
      { machine: 'M002', name: 'CNC Machine 2', type: 'PM', scheduledDate: '2025-10-02', duration: 180, status: 'Scheduled' },
      { machine: 'M007', name: 'Welding Station 1', type: 'Inspection', scheduledDate: '2025-10-03', duration: 60, status: 'Scheduled' },
    ],
    criticalOrders: [
      { orderNo: 'ORD015', customer: 'ABC Corp', dueDate: '2025-10-01', status: 'In Progress', completion: 75, priority: 1 },
      { orderNo: 'ORD018', customer: 'XYZ Ltd', dueDate: '2025-10-02', status: 'Late', completion: 60, priority: 1 },
      { orderNo: 'ORD022', customer: 'Tech Inc', dueDate: '2025-10-02', status: 'In Progress', completion: 40, priority: 2 },
      { orderNo: 'ORD009', customer: 'Global Co', dueDate: '2025-10-02', status: 'Late', completion: 85, priority: 1 },
    ],
    recentAlerts: [
      { time: '09:45', type: 'warning', message: 'M006 Drill Press 1 - Maintenance started' },
      { time: '09:30', type: 'error', message: 'ORD018 is running behind schedule by 2 hours' },
      { time: '09:15', type: 'info', message: 'ORD015 Step 3 completed on M001' },
      { time: '08:50', type: 'warning', message: 'M003 Assembly Line 1 idle for 45 minutes' },
      { time: '08:30', type: 'error', message: 'ORD009 missed target completion time' },
    ],
  }
};

// =========== Master ===============
export const getProductMaster = async () => {
  // const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/master/product`);
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
};
export const getProductCategory = async () => {
  return ["Widgets", "Components", "Assemblies", "Raw Materials", "Finished Goods"]
};
export const getProductUnit = async () => {
  return ["pcs", "kg", "L", "M", "m²", "set"]
};

export const getProduct = async () => {
  return [
    {
      code: "P001",
      name: "Gear Assembly A",
      unit: "PCS",
      defaultRoutingId: "R001",
      defaultBomId: "BOM001",
      lotSize: 100,
      status: "Active",
      createdAt: "2025-01-15",
    },
    {
      code: "P002",
      name: "Motor Housing B",
      unit: "PCS",
      defaultRoutingId: "R002",
      defaultBomId: "BOM002",
      lotSize: 50,
      status: "Active",
      createdAt: "2025-01-20",
    },
    {
      code: "P003",
      name: "Control Panel C",
      unit: "PCS",
      defaultRoutingId: "R003",
      lotSize: 200,
      status: "Active",
      createdAt: "2025-02-01",
    },
  ]
};
export const getBOM = async () => {
  return [
    {
      id: "BOM001",
      productCode: "P001",
      version: "V1.0",
      effectiveDate: "2025-01-15",
      status: "Active",
      lines: [
        {
          id: "L1",
          materialCode: "M001",
          materialName: "Steel Plate 5mm",
          qtyPer: 2,
          unit: "PCS",
          scrapRate: 0.05,
          gateProcess: "Cutting",
        },
        {
          id: "L2",
          materialCode: "M002",
          materialName: "Bearing Type-A",
          qtyPer: 4,
          unit: "PCS",
          scrapRate: 0.02,
        },
        {
          id: "L3",
          materialCode: "M003",
          materialName: "Bolt M8x20",
          qtyPer: 8,
          unit: "PCS",
          scrapRate: 0.01,
        },
      ],
    },
    {
      id: "BOM002",
      productCode: "P002",
      version: "V1.0",
      effectiveDate: "2025-01-20",
      status: "Active",
      lines: [
        {
          id: "L4",
          materialCode: "M004",
          materialName: "Aluminum Block",
          qtyPer: 1,
          unit: "PCS",
          scrapRate: 0.03,
          gateProcess: "Machining",
        },
        {
          id: "L5",
          materialCode: "M005",
          materialName: "Gasket Seal",
          qtyPer: 2,
          unit: "PCS",
          scrapRate: 0.05,
        },
      ],
    },
  ]
};
export const getProcess = async () => {
  return [
    { code: 'MACH', name: 'Machining', category: 'Fabrication' },
    { code: 'DRILL', name: 'Drilling', category: 'Fabrication' },
    { code: 'PRESS', name: 'Pressing', category: 'Forming' },
    { code: 'PAINT', name: 'Painting', category: 'Finishing' },
    { code: 'ASSY', name: 'Assembly', category: 'Assembly' },
    { code: 'PACK', name: 'Packaging', category: 'Finishing' },
    { code: 'WELD', name: 'Welding', category: 'Fabrication' },
    { code: 'INSP', name: 'Inspection', category: 'Quality' },
  ]
};
export const getWorkCenterRoutings = async () => {
  return [
    { code: 'WC-MACH', name: 'Machining Center', machines: ['M001', 'M002'] },
    { code: 'WC-PRESS', name: 'Press Area', machines: ['M004'] },
    { code: 'WC-PAINT', name: 'Paint Booth', machines: ['M005'] },
    { code: 'WC-ASSY', name: 'Assembly Line', machines: ['M003'] },
  ]
};
export const getRouting = async () => {
  return [
    {
      id: 'RT001', productCode: 'WDGT-A', productName: 'Widget A', version: '1.0', status: 'Active', effectiveDate: '2025-10-02', description: 'Standard routing for Widget A',
      steps: [
        { seq: 10, processCode: 'MACH', processName: 'Machining', workCenterCode: 'WC-MACH', machineList: ['M001', 'M002'], setupMin: 30, runMinPerUnit: 1.2, batchSize: 50, changeoverFamily: 'METAL-A', queueTimeMin: 0, moveTimeMin: 5, notes: 'Use carbide tooling' },
        { seq: 20, processCode: 'DRILL', processName: 'Drilling', workCenterCode: 'WC-MACH', machineList: ['M001', 'M002'], setupMin: 20, runMinPerUnit: 0.6, batchSize: 50, changeoverFamily: 'METAL-A', queueTimeMin: 30, moveTimeMin: 5, notes: '4 holes per unit' },
        { seq: 30, processCode: 'ASSY', processName: 'Assembly', workCenterCode: 'WC-ASSY', machineList: ['M003'], setupMin: 15, runMinPerUnit: 0.9, batchSize: 100, changeoverFamily: null, queueTimeMin: 60, moveTimeMin: 10, notes: 'Include fasteners' },
      ]
    },
    {
      id: 'RT002', productCode: 'WDGT-B', productName: 'Widget B', version: '1.0', status: 'Active', effectiveDate: '2025-10-02', description: 'Standard routing for Widget B',
      steps: [
        { seq: 10, processCode: 'PRESS', processName: 'Pressing', workCenterCode: 'WC-PRESS', machineList: ['M004'], setupMin: 25, runMinPerUnit: 1.6, batchSize: 20, changeoverFamily: 'PRESS-STD', queueTimeMin: 0, moveTimeMin: 5, notes: 'Use die #12' },
        { seq: 20, processCode: 'PAINT', processName: 'Painting', workCenterCode: 'WC-PAINT', machineList: ['M005'], setupMin: 30, runMinPerUnit: 1.4, batchSize: 30, changeoverFamily: 'PAINT-BLUE', queueTimeMin: 120, moveTimeMin: 10, notes: 'Dry time 2 hours' },
        { seq: 30, processCode: 'ASSY', processName: 'Assembly', workCenterCode: 'WC-ASSY', machineList: ['M003'], setupMin: 15, runMinPerUnit: 1.0, batchSize: 100, changeoverFamily: null, queueTimeMin: 0, moveTimeMin: 5, notes: '' },
      ]
    },
    {
      id: 'RT003', productCode: 'WDGT-C', productName: 'Widget C', version: '1.0', status: 'Active', effectiveDate: '2025-10-02', description: 'Standard routing for Widget C',
      steps: [
        { seq: 10, processCode: 'MACH', processName: 'Machining', workCenterCode: 'WC-MACH', machineList: ['M001', 'M002'], setupMin: 30, runMinPerUnit: 1.3, batchSize: 50, changeoverFamily: 'METAL-A', queueTimeMin: 0, moveTimeMin: 5, notes: '' },
        { seq: 20, processCode: 'PAINT', processName: 'Painting', workCenterCode: 'WC-PAINT', machineList: ['M005'], setupMin: 30, runMinPerUnit: 0.8, batchSize: 40, changeoverFamily: 'PAINT-RED', queueTimeMin: 120, moveTimeMin: 10, notes: '' },
        { seq: 30, processCode: 'PACK', processName: 'Packaging', workCenterCode: 'WC-ASSY', machineList: ['M003'], setupMin: 10, runMinPerUnit: 0.5, batchSize: 200, changeoverFamily: null, queueTimeMin: 0, moveTimeMin: 5, notes: 'Use protective wrapping' },
      ]
    },
  ]
};

export const getMachines = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/master/machines`);
  return res.data;
};
export const getDropdownMachineStatus = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/enum_values/machine-status`);
  return res.data;
};

export const getWorkCenter = async () => {
  return [
    {
      code: 'WC001',
      name: 'CNC Machining Line 1',
      department: 'Manufacturing',
      type: 'Production',
      capacity: 120,
      capacityUnit: 'units/hr',
      status: 'Active',
      location: 'Building A - Floor 1',
      supervisor: 'John Smith',
      shiftPattern: '3-Shift',
      machineCount: 5,
      utilizationTarget: 85,
      notes: 'High precision machining center',
      createdAt: '2025-01-10'
    },
    {
      code: 'WC002',
      name: 'Assembly Line A',
      department: 'Assembly',
      type: 'Assembly',
      capacity: 200,
      capacityUnit: 'units/hr',
      status: 'Active',
      location: 'Building B - Floor 2',
      supervisor: 'Sarah Johnson',
      shiftPattern: '2-Shift',
      machineCount: 8,
      utilizationTarget: 90,
      notes: 'Main assembly line for gear products',
      createdAt: '2025-01-12'
    },
    {
      code: 'WC003',
      name: 'Quality Control Station',
      department: 'Quality',
      type: 'Quality',
      capacity: 80,
      capacityUnit: 'units/hr',
      status: 'Active',
      location: 'Building B - Floor 1',
      supervisor: 'Mike Chen',
      shiftPattern: '2-Shift',
      machineCount: 3,
      utilizationTarget: 75,
      createdAt: '2025-01-15'
    },
    {
      code: 'WC004',
      name: 'Welding Line 1',
      department: 'Manufacturing',
      type: 'Production',
      capacity: 60,
      capacityUnit: 'units/hr',
      status: 'Active',
      location: 'Building A - Floor 2',
      supervisor: 'David Lee',
      shiftPattern: '3-Shift',
      machineCount: 6,
      utilizationTarget: 80,
      notes: 'Robotic welding station',
      createdAt: '2025-01-18'
    },
    {
      code: 'WC005',
      name: 'Packaging Line',
      department: 'Packaging',
      type: 'Packaging',
      capacity: 300,
      capacityUnit: 'units/hr',
      status: 'Maintenance',
      location: 'Building C - Floor 1',
      supervisor: 'Lisa Wong',
      shiftPattern: '2-Shift',
      machineCount: 4,
      utilizationTarget: 85,
      notes: 'Automated packaging system',
      createdAt: '2025-01-20'
    },
    {
      code: 'WC006',
      name: 'Paint & Coating',
      department: 'Finishing',
      type: 'Production',
      capacity: 100,
      capacityUnit: 'units/hr',
      status: 'Active',
      location: 'Building A - Floor 3',
      supervisor: 'Tom Brown',
      shiftPattern: '2-Shift',
      machineCount: 2,
      utilizationTarget: 70,
      createdAt: '2025-01-22'
    }
  ]
};

export const getCalendar = async () => {
  return [
    {
      id: 'CAL-001',
      name: 'Standard 5-Day Week',
      description: 'Monday to Friday, single day shift',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      shifts: [
        {
          id: 'S1',
          name: 'Day Shift',
          startTime: '08:00',
          endTime: '17:00',
          breaks: [
            { name: 'Morning Break', startTime: '10:00', endTime: '10:15' },
            { name: 'Lunch', startTime: '12:00', endTime: '13:00' },
            { name: 'Afternoon Break', startTime: '15:00', endTime: '15:15' },
          ]
        }
      ],
      holidays: [
        { date: '2025-01-01', name: 'New Year' },
        { date: '2025-12-25', name: 'Christmas' },
      ],
      status: 'Active'
    },
    {
      id: 'CAL-002',
      name: 'Two Shift Operation',
      description: '7 days a week, two shifts',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      shifts: [
        {
          id: 'S1',
          name: 'Day Shift',
          startTime: '06:00',
          endTime: '14:00',
          breaks: [
            { name: 'Break', startTime: '10:00', endTime: '10:15' },
            { name: 'Lunch', startTime: '12:00', endTime: '12:30' },
          ]
        },
        {
          id: 'S2',
          name: 'Night Shift',
          startTime: '14:00',
          endTime: '22:00',
          breaks: [
            { name: 'Break', startTime: '18:00', endTime: '18:15' },
            { name: 'Dinner', startTime: '20:00', endTime: '20:30' },
          ]
        }
      ],
      holidays: [
        { date: '2025-01-01', name: 'New Year' },
      ],
      status: 'Active'
    },
    {
      id: 'CAL-003',
      name: '24/7 Continuous',
      description: 'Round the clock operation, three shifts',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      shifts: [
        { id: 'S1', name: 'Morning Shift', startTime: '06:00', endTime: '14:00', breaks: [{ name: 'Break', startTime: '09:00', endTime: '09:15' }, { name: 'Lunch', startTime: '11:30', endTime: '12:00' },] },
        { id: 'S2', name: 'Afternoon Shift', startTime: '14:00', endTime: '22:00', breaks: [{ name: 'Break', startTime: '17:00', endTime: '17:15' }, { name: 'Dinner', startTime: '19:30', endTime: '20:00' },] },
        { id: 'S3', name: 'Night Shift', startTime: '22:00', endTime: '06:00', breaks: [{ name: 'Break', startTime: '01:00', endTime: '01:15' }, { name: 'Midnight Meal', startTime: '03:30', endTime: '04:00' },] }
      ],
      holidays: [],
      status: 'Active'
    },
  ];
};

export const getAllDropdownMaterial = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/enum_values/all-material`);
  return res.data;
};



export const getPersonnel = async () => {
  // const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/master/personnel`);
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
};

export const getCustomer = async () => {
  // const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/users`);
  // return res.data;
  return [
    {
      code: "CUST-001",
      name: "Alpha Motors Co., Ltd.",
      shortName: "Alpha Motors",
      type: "OEM",
      industry: "Automotive",
      status: "Active",
      rating: 4,
      contact: {
        contactPerson: "Somchai Prasert",
        title: "Procurement Manager",
        email: "somchai@alphamotors.co.th",
        phone: "+66-2-123-4567",
        mobile: "+66-81-234-5678",
      },
      address: {
        street: "99 Moo 3, Bangna-Trad Rd.",
        city: "Bangkok",
        state: "Bangkok",
        country: "Thailand",
        postalCode: "10260",
      },
      financial: {
        paymentTerms: "Net 30",
        currency: "THB",
        creditLimit: 5000000,
        taxId: "0105551234567",
      },
      stats: {
        totalOrders: 128,
        activeOrders: 6,
        totalRevenue: 42500000,
        avgOrderValue: 332000,
        onTimeDelivery: 96,
        lastOrderDate: "2025-09-08",
      },
      preferences: {
        preferredShipping: "Ground",
        discountPercent: 2.5,
        specialInstructions: "Deliver weekday mornings only.",
      },
      notes: ""
    },
    {
      code: "CUST-002",
      name: "Beta Electronics Pte.",
      shortName: "Beta Elec",
      type: "Distributor",
      industry: "Electronics",
      status: "On Hold",
      rating: 3,
      contact: {
        contactPerson: "Aisha Tan",
        title: "Buyer",
        email: "aisha.tan@betaelec.sg",
        phone: "+65-6123-4567",
        mobile: "+65-8123-4567",
      },
      address: {
        street: "10 Science Park Dr.",
        city: "Singapore",
        state: "Singapore",
        country: "Singapore",
        postalCode: "118224",
      },
      financial: {
        paymentTerms: "Net 45",
        currency: "USD",
        creditLimit: 200000,
        taxId: "SG12345678X",
      },
      stats: {
        totalOrders: 47,
        activeOrders: 1,
        totalRevenue: 1240000,
        avgOrderValue: 26000,
        onTimeDelivery: 89,
        lastOrderDate: "2025-08-30",
      },
      preferences: { preferredShipping: "Air", discountPercent: 0 },
      notes: ""
    },
  ];
};

export const getSupplier = async () => {
  // const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/users`);
  // return res.data;
  return [
    { code: 'SUP001', name: 'ABC Metals Inc' },
    { code: 'SUP002', name: 'XYZ Components Ltd' },
    { code: 'SUP003', name: 'Global Parts Co' },
    { code: 'SUP004', name: 'Premium Materials' },
    { code: 'SUP005', name: 'Local Supplier A' },
  ];
};

export const getMaterial = async () => {
  // const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/users`);
  // return res.data;
  return [
    {
      code: 'MAT-001', name: 'Steel Sheet 2mm', description: 'Cold rolled steel sheet, 2mm thickness', category: 'Raw Material', unit: 'KG', standardCost: 45.50, leadTimeDays: 7, minStock: 500, maxStock: 2000, reorderPoint: 800, supplierCode: 'SUP001', storageLocation: 'WH-A-01', batchTracking: true, status: 'Active', notes: 'Store in dry area'
    },
    {
      code: 'MAT-002', name: 'Bearing 608ZZ', description: '608ZZ Deep groove ball bearing', category: 'Component', unit: 'PCS', standardCost: 2.80, leadTimeDays: 14, minStock: 100, maxStock: 500, reorderPoint: 200, supplierCode: 'SUP002', storageLocation: 'WH-B-12', batchTracking: false, status: 'Active', notes: ''
    },
    {
      code: 'MAT-003', name: 'Aluminum Rod 10mm', description: 'Aluminum 6061-T6 round rod, 10mm diameter', category: 'Raw Material', unit: 'M', standardCost: 12.30, leadTimeDays: 10, minStock: 200, maxStock: 1000, reorderPoint: 400, supplierCode: 'SUP001', storageLocation: 'WH-A-05', batchTracking: true, status: 'Active', notes: ''
    },
    {
      code: 'MAT-004', name: 'Paint - Blue RAL5015', description: 'Industrial paint, blue color RAL5015', category: 'Consumable', unit: 'L', standardCost: 28.00, leadTimeDays: 5, minStock: 50, maxStock: 200, reorderPoint: 100, supplierCode: 'SUP004', storageLocation: 'WH-C-08', batchTracking: true, status: 'Active', notes: 'Flammable - store in designated area'
    },
    {
      code: 'MAT-005', name: 'Cardboard Box 30x30x30', description: 'Corrugated cardboard shipping box', category: 'Packaging', unit: 'PCS', standardCost: 1.50, leadTimeDays: 3, minStock: 200, maxStock: 1000, reorderPoint: 400, supplierCode: 'SUP005', storageLocation: 'WH-D-01', batchTracking: false, status: 'Active', notes: ''
    },
    {
      code: 'MAT-006', name: 'Hydraulic Oil ISO 46', description: 'Hydraulic oil ISO VG 46', category: 'Consumable', unit: 'L', standardCost: 8.50, leadTimeDays: 7, minStock: 100, maxStock: 500, reorderPoint: 200, supplierCode: 'SUP004', storageLocation: 'WH-C-12', batchTracking: true, status: 'Active', notes: 'Check expiry date'
    },
  ];
};

export const getInventory = async () => {
  // const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/users`);
  // return res.data;
  return [
    {
      materialCode: 'M001',
      materialName: 'Steel Plate 5mm',
      category: 'Raw Material',
      unit: 'KG',
      onHand: 5420,
      reserved: 1200,
      available: 4220,
      minStock: 2000,
      maxStock: 8000,
      reorderPoint: 3000,
      location: 'A-01-01',
      warehouse: 'Main Warehouse',
      lotNumber: 'LOT-2025-001',
      unitCost: 45.50,
      totalValue: 246610,
      lastUpdated: '2025-10-02T08:30:00',
      supplier: 'Steel Corp Ltd',
      leadTimeDays: 7
    },
    {
      materialCode: 'M002',
      materialName: 'Bearing Type-A',
      category: 'Component',
      unit: 'PCS',
      onHand: 850,
      reserved: 320,
      available: 530,
      minStock: 500,
      maxStock: 2000,
      reorderPoint: 600,
      location: 'B-02-05',
      warehouse: 'Main Warehouse',
      lotNumber: 'LOT-2025-045',
      unitCost: 125.00,
      totalValue: 106250,
      lastUpdated: '2025-10-02T09:15:00',
      supplier: 'Bearing Solutions Inc',
      leadTimeDays: 14
    },
    {
      materialCode: 'M003',
      materialName: 'Bolt M8x20',
      category: 'Component',
      unit: 'PCS',
      onHand: 15600,
      reserved: 2400,
      available: 13200,
      minStock: 5000,
      maxStock: 20000,
      reorderPoint: 8000,
      location: 'C-01-08',
      warehouse: 'Main Warehouse',
      unitCost: 2.50,
      totalValue: 39000,
      lastUpdated: '2025-10-01T16:45:00',
      supplier: 'Fasteners Co',
      leadTimeDays: 5
    },
    {
      materialCode: 'M004',
      materialName: 'Aluminum Block',
      category: 'Raw Material',
      unit: 'PCS',
      onHand: 340,
      reserved: 150,
      available: 190,
      minStock: 200,
      maxStock: 800,
      reorderPoint: 300,
      location: 'A-03-02',
      warehouse: 'Main Warehouse',
      lotNumber: 'LOT-2025-012',
      unitCost: 180.00,
      totalValue: 61200,
      lastUpdated: '2025-10-02T07:20:00',
      supplier: 'Aluminum Industries',
      leadTimeDays: 10
    },
    {
      materialCode: 'M005',
      materialName: 'Gasket Seal',
      category: 'Component',
      unit: 'PCS',
      onHand: 2850,
      reserved: 580,
      available: 2270,
      minStock: 1000,
      maxStock: 5000,
      reorderPoint: 1500,
      location: 'B-04-12',
      warehouse: 'Main Warehouse',
      unitCost: 8.75,
      totalValue: 24937.50,
      lastUpdated: '2025-10-02T10:00:00',
      supplier: 'Seals & Gaskets Ltd',
      leadTimeDays: 7
    },
    {
      materialCode: 'P001',
      materialName: 'Gear Assembly A',
      category: 'Finished Goods',
      unit: 'PCS',
      onHand: 450,
      reserved: 180,
      available: 270,
      minStock: 100,
      maxStock: 800,
      reorderPoint: 150,
      location: 'FG-01-05',
      warehouse: 'Finished Goods Warehouse',
      lotNumber: 'FG-2025-089',
      unitCost: 450.00,
      totalValue: 202500,
      lastUpdated: '2025-10-02T11:30:00',
      leadTimeDays: 0
    },
    {
      materialCode: 'C001',
      materialName: 'Cutting Oil',
      category: 'Consumable',
      unit: 'L',
      onHand: 680,
      reserved: 0,
      available: 680,
      minStock: 300,
      maxStock: 1000,
      reorderPoint: 400,
      location: 'CONS-01',
      warehouse: 'Consumables Store',
      unitCost: 12.50,
      totalValue: 8500,
      lastUpdated: '2025-10-01T14:20:00',
      supplier: 'Lubricants Supply Co',
      leadTimeDays: 3
    },
    {
      materialCode: 'M006',
      materialName: 'Hydraulic Valve',
      category: 'Component',
      unit: 'PCS',
      onHand: 45,
      reserved: 12,
      available: 33,
      minStock: 50,
      maxStock: 150,
      reorderPoint: 60,
      location: 'B-05-03',
      warehouse: 'Main Warehouse',
      lotNumber: 'LOT-2025-078',
      unitCost: 320.00,
      totalValue: 14400,
      lastUpdated: '2025-10-02T08:45:00',
      supplier: 'Hydraulic Systems Inc',
      leadTimeDays: 21
    },
  ];
};

// =========== User ===============

export const getUsers = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/users`);
  return res.data;
};


// =========== Setting ===============

import type { OTRules, SetupRule, Constraints, MaintWin } from "@/src/types";

// const mockShifts: Shift[] = [
//   { code: "A", start: "08:00", end: "17:00", lines: ["Assembly", "Packing"] },
//   { code: "B", start: "20:00", end: "05:00", lines: ["Assembly"] },
// ];

// const mockBreaks: BreakRow[] = [
//   { shift_code: "A", start: "12:00", end: "13:00" },
//   { shift_code: "B", start: "00:00", end: "00:30" },
// ];

const mockOTRules: OTRules = {
  daily_cap_hours: 2,
  allow_weekend_ot: true,
  default_setup_min: 10,
  default_buffer_min: 30,
};

const mockSetupMatrix: SetupRule[] = [
  { from: "P1", to: "P2", setup_min: 12 },
  { from: "P2", to: "P3", setup_min: 18 },
];

const mockConstraints: Constraints = {
  enforce_maintenance: true,
  enforce_material_ready: true,
  material_ready_offset_min: 0,
  freeze_window_min: 120,
};

const mockMaint: MaintWin[] = [
  { machine_id: "M2", start_dt: "2025-08-20T13:00", end_dt: "2025-08-20T15:00", type: "PM", note: "quarterly" },
  { machine_id: "M1", start_dt: "2025-08-22T09:00", end_dt: "2025-08-22T10:00", type: "Unplanned", note: "vibration" },
];

export const getHolidays = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/setting/holiday`);
  return res.data;
};
export const getShifts = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/setting/shift`);
  return res.data;
};
export const getBreaks = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/setting/break`);
  return res.data;
};

export const getOTRules = async () => mockOTRules;
export const getSetupMatrix = async () => mockSetupMatrix;
export const getConstraints = async () => mockConstraints;
export const getMaintenances = async () => mockMaint;


