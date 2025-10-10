// mockData.ts
type Status = 'Active' | 'Inactive' | 'Suspended' | 'Pending';
type Department = string;

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // e.g., 'all' or granular perms
};

type User = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: Department;
  roleId: Role['id'];
  roleName: string;
  status: Status;
  lastLogin: string | null;   // ISO string or null
  createdDate: string;        // YYYY-MM-DD
  notes: string;
};

export const mockDepartments: string[] = [
  'Production',
  'Quality Control',
  'Maintenance',
  'Logistics',
  'HR',
];

export const mockRoles: Role[] = [
  { id: 'ROLE001', name: 'Administrator', description: 'Full system access', permissions: ['all'] },
  { id: 'ROLE002', name: 'Planner', description: 'Create and manage production plans', permissions: ['view_orders', 'create_plan', 'edit_plan', 'view_reports', 'view_machines', 'view_materials'] },
  { id: 'ROLE003', name: 'Supervisor', description: 'Monitor and approve production', permissions: ['view_orders', 'view_plan', 'approve_plan', 'view_production', 'view_reports'] },
  { id: 'ROLE004', name: 'Operator', description: 'Execute production tasks', permissions: ['view_production', 'update_production', 'view_orders'] },
  { id: 'ROLE005', name: 'Maintenance', description: 'Manage equipment maintenance', permissions: ['view_machines', 'edit_maintenance', 'view_downtime'] },
  { id: 'ROLE006', name: 'Viewer', description: 'Read-only access to reports', permissions: ['view_reports', 'view_orders', 'view_plan'] },
];

export const mockUsers: User[] = [
  {
    id: 'USR001',
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '0812345678',
    department: 'Production',
    roleId: 'ROLE001',
    roleName: 'Administrator',
    status: 'Active',
    lastLogin: '2025-10-01T10:00:00Z',
    createdDate: '2025-01-01',
    notes: 'System admin',
  },
  {
    id: 'USR002',
    username: 'planner01',
    email: 'planner@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '0823456789',
    department: 'Production',
    roleId: 'ROLE002',
    roleName: 'Planner',
    status: 'Active',
    lastLogin: '2025-09-28T09:00:00Z',
    createdDate: '2025-03-15',
    notes: '',
  },
  {
    id: 'USR003',
    username: 'operatorA',
    email: 'operatorA@example.com',
    firstName: 'Ali',
    lastName: 'Khan',
    phone: '0834567890',
    department: 'Maintenance',
    roleId: 'ROLE004',
    roleName: 'Operator',
    status: 'Inactive',
    lastLogin: null,
    createdDate: '2025-05-10',
    notes: 'Temporary account',
  },
];
