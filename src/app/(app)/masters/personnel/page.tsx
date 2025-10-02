"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Save, X, Upload, Download, Users, Award, Calendar, Briefcase, Phone, Clock, UserCheck, AlertCircle, CheckCircle, LayoutGrid, Table } from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// Types
type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Temporary';

type Personnel = {
  empCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  employmentType: EmploymentType;
  status: 'Active' | 'On Leave' | 'Inactive';
  hireDate: string;
  calendarId: string;
  shiftPattern: string;
  workCenter?: string;
  supervisor?: string;
  skillTags: string[];
  hourlyRate?: number;
  certifications?: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: string;
  birthDate?: string;
  photo?: string;
  notes?: string;
  createdAt: string;
};

type Skill = {
  empCode: string;
  skillType: 'Process' | 'Machine' | 'Quality' | 'Safety' | 'Other';
  skillName: string;
  level: 1 | 2 | 3 | 4 | 5;
  certifiedDate?: string;
  expiryDate?: string;
  certifier?: string;
};

// Sample Data
const initialPersonnel: Personnel[] = [
  {
    empCode: 'EMP001',
    firstName: 'John',
    lastName: 'Smith',
    fullName: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+1-555-0101',
    department: 'Manufacturing',
    position: 'Senior Machine Operator',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2020-03-15',
    calendarId: 'CAL001',
    shiftPattern: '3-Shift Rotating',
    workCenter: 'WC001',
    supervisor: 'EMP005',
    skillTags: ['CNC Machining', 'Quality Control', 'Setup'],
    hourlyRate: 28.50,
    certifications: ['CNC Level 3', 'Safety Training', 'Forklift Certified'],
    emergencyContact: 'Jane Smith',
    emergencyPhone: '+1-555-0102',
    address: '123 Main St, Springfield',
    birthDate: '1985-06-15',
    createdAt: '2020-03-10'
  },
  {
    empCode: 'EMP002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1-555-0201',
    department: 'Assembly',
    position: 'Assembly Line Lead',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2019-07-01',
    calendarId: 'CAL001',
    shiftPattern: '2-Shift',
    workCenter: 'WC002',
    supervisor: 'EMP006',
    skillTags: ['Assembly', 'Team Leadership', 'Quality Inspection'],
    hourlyRate: 26.00,
    certifications: ['Assembly Certification', 'Team Lead Training', 'Quality Inspector'],
    emergencyContact: 'Michael Johnson',
    emergencyPhone: '+1-555-0202',
    address: '456 Oak Ave, Springfield',
    birthDate: '1988-11-22',
    createdAt: '2019-06-25'
  },
  {
    empCode: 'EMP003',
    firstName: 'Mike',
    lastName: 'Chen',
    fullName: 'Mike Chen',
    email: 'mike.chen@company.com',
    phone: '+1-555-0301',
    department: 'Maintenance',
    position: 'Maintenance Technician',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2021-01-10',
    calendarId: 'CAL002',
    shiftPattern: 'Day Shift',
    workCenter: 'Maintenance',
    supervisor: 'EMP007',
    skillTags: ['Mechanical Repair', 'Electrical', 'Preventive Maintenance'],
    hourlyRate: 32.00,
    certifications: ['Electrical Safety', 'Hydraulics', 'PLC Programming'],
    emergencyContact: 'Lisa Chen',
    emergencyPhone: '+1-555-0302',
    address: '789 Pine Rd, Springfield',
    birthDate: '1990-03-08',
    createdAt: '2021-01-05'
  },
  {
    empCode: 'EMP004',
    firstName: 'David',
    lastName: 'Lee',
    fullName: 'David Lee',
    email: 'david.lee@company.com',
    phone: '+1-555-0401',
    department: 'Manufacturing',
    position: 'Welding Specialist',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2018-05-20',
    calendarId: 'CAL001',
    shiftPattern: '3-Shift Rotating',
    workCenter: 'WC004',
    supervisor: 'EMP005',
    skillTags: ['Welding', 'Fabrication', 'Blueprint Reading'],
    hourlyRate: 30.00,
    certifications: ['AWS Certified Welder', 'TIG Welding', 'MIG Welding'],
    emergencyContact: 'Emily Lee',
    emergencyPhone: '+1-555-0402',
    address: '321 Elm St, Springfield',
    birthDate: '1982-09-14',
    createdAt: '2018-05-15'
  },
  {
    empCode: 'EMP005',
    firstName: 'Lisa',
    lastName: 'Wong',
    fullName: 'Lisa Wong',
    email: 'lisa.wong@company.com',
    phone: '+1-555-0501',
    department: 'Manufacturing',
    position: 'Production Supervisor',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2017-02-01',
    calendarId: 'CAL002',
    shiftPattern: 'Day Shift',
    skillTags: ['Production Planning', 'Team Management', 'Process Improvement'],
    hourlyRate: 38.00,
    certifications: ['Six Sigma Green Belt', 'Supervisor Training', 'Lean Manufacturing'],
    emergencyContact: 'Robert Wong',
    emergencyPhone: '+1-555-0502',
    address: '654 Maple Dr, Springfield',
    birthDate: '1984-12-03',
    createdAt: '2017-01-25'
  },
  {
    empCode: 'EMP006',
    firstName: 'Tom',
    lastName: 'Brown',
    fullName: 'Tom Brown',
    email: 'tom.brown@company.com',
    phone: '+1-555-0601',
    department: 'Quality',
    position: 'Quality Control Inspector',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: '2020-08-15',
    calendarId: 'CAL001',
    shiftPattern: '2-Shift',
    workCenter: 'WC003',
    supervisor: 'EMP008',
    skillTags: ['Quality Inspection', 'CMM Operation', 'Statistical Analysis'],
    hourlyRate: 27.50,
    certifications: ['ASQ CQI', 'CMM Level 2', 'ISO 9001 Auditor'],
    emergencyContact: 'Mary Brown',
    emergencyPhone: '+1-555-0602',
    address: '987 Cedar Ln, Springfield',
    birthDate: '1987-04-18',
    createdAt: '2020-08-10'
  },
  {
    empCode: 'EMP007',
    firstName: 'Rachel',
    lastName: 'Martinez',
    fullName: 'Rachel Martinez',
    email: 'rachel.martinez@company.com',
    phone: '+1-555-0701',
    department: 'Assembly',
    position: 'Assembly Operator',
    employmentType: 'Part-Time',
    status: 'Active',
    hireDate: '2022-06-01',
    calendarId: 'CAL003',
    shiftPattern: 'Part-Time Evening',
    workCenter: 'WC002',
    supervisor: 'EMP002',
    skillTags: ['Hand Assembly', 'Tool Operation'],
    hourlyRate: 18.00,
    certifications: ['Basic Safety Training'],
    emergencyContact: 'Carlos Martinez',
    emergencyPhone: '+1-555-0702',
    address: '147 Birch Ave, Springfield',
    birthDate: '1995-07-25',
    createdAt: '2022-05-28'
  },
  {
    empCode: 'EMP008',
    firstName: 'Kevin',
    lastName: 'Taylor',
    fullName: 'Kevin Taylor',
    email: 'kevin.taylor@company.com',
    phone: '+1-555-0801',
    department: 'Manufacturing',
    position: 'CNC Programmer',
    employmentType: 'Full-Time',
    status: 'On Leave',
    hireDate: '2019-11-12',
    calendarId: 'CAL002',
    shiftPattern: 'Day Shift',
    workCenter: 'WC001',
    supervisor: 'EMP005',
    skillTags: ['CNC Programming', 'CAD/CAM', 'Process Optimization'],
    hourlyRate: 35.00,
    certifications: ['Mastercam Certified', 'SolidWorks Professional'],
    emergencyContact: 'Jennifer Taylor',
    emergencyPhone: '+1-555-0802',
    address: '258 Spruce Ct, Springfield',
    birthDate: '1986-02-09',
    createdAt: '2019-11-08'
  },
];

const sampleSkills: Skill[] = [
  { empCode: 'EMP001', skillType: 'Machine', skillName: 'CNC Mill', level: 5, certifiedDate: '2020-06-15', certifier: 'Training Dept' },
  { empCode: 'EMP001', skillType: 'Machine', skillName: 'CNC Lathe', level: 4, certifiedDate: '2021-03-10', certifier: 'Training Dept' },
  { empCode: 'EMP001', skillType: 'Quality', skillName: 'CMM Inspection', level: 3, certifiedDate: '2022-01-20', certifier: 'Quality Dept' },
  { empCode: 'EMP002', skillType: 'Process', skillName: 'Final Assembly', level: 5, certifiedDate: '2019-09-01', certifier: 'Training Dept' },
  { empCode: 'EMP002', skillType: 'Quality', skillName: 'Visual Inspection', level: 4, certifiedDate: '2020-02-15', certifier: 'Quality Dept' },
  { empCode: 'EMP003', skillType: 'Machine', skillName: 'Hydraulic Systems', level: 4, certifiedDate: '2021-05-12', certifier: 'External Vendor' },
  { empCode: 'EMP003', skillType: 'Machine', skillName: 'Electrical Troubleshooting', level: 5, certifiedDate: '2021-08-20', certifier: 'External Vendor' },
  { empCode: 'EMP004', skillType: 'Process', skillName: 'TIG Welding', level: 5, certifiedDate: '2018-07-01', certifier: 'AWS' },
  { empCode: 'EMP004', skillType: 'Process', skillName: 'MIG Welding', level: 5, certifiedDate: '2018-07-01', certifier: 'AWS' },
];

const PersonnelPage = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>(initialPersonnel);
  const [skills] = useState<Skill[]>(sampleSkills);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const filterType = 'all';
  // const [filterType, setFilterType] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  // const [showSkills, setShowSkills] = useState(false);
  const statuses: Personnel['status'][] = ['Active', 'On Leave', 'Inactive'];

  // Form State
  const [personForm, setPersonForm] = useState<Partial<Personnel>>({
    empCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    employmentType: 'Full-Time',
    status: 'Active',
    hireDate: new Date().toISOString().split('T')[0],
    calendarId: 'CAL001',
    shiftPattern: '2-Shift',
    skillTags: [],
    hourlyRate: 20.00,
    certifications: [],
  });

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(personnel.map(p => p.department));
    return Array.from(depts).sort();
  }, [personnel]);

  // Filter personnel
  const filteredPersonnel = useMemo(() => {
    return personnel.filter(person => {
      const matchesSearch =
        person.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDept === 'all' || person.department === filterDept;
      const matchesStatus = filterStatus === 'all' || person.status === filterStatus;
      const matchesType = filterType === 'all' || person.employmentType === filterType;
      return matchesSearch && matchesDept && matchesStatus && matchesType;
    });
  }, [personnel, searchTerm, filterDept, filterStatus, filterType]);

  // Stats
  const stats = useMemo(() => {
    const activeCount = personnel.filter(p => p.status === 'Active').length;
    const onLeave = personnel.filter(p => p.status === 'On Leave').length;
    const avgTenure = personnel.reduce((sum, p) => {
      const years = (new Date().getTime() - new Date(p.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
      return sum + years;
    }, 0) / personnel.length;
    const departments = new Set(personnel.map(p => p.department)).size;
    return { activeCount, onLeave, avgTenure, departments };
  }, [personnel]);

  // Handlers
  const handleAdd = () => {
    setPersonForm({
      empCode: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      employmentType: 'Full-Time',
      status: 'Active',
      hireDate: new Date().toISOString().split('T')[0],
      calendarId: 'CAL001',
      shiftPattern: '2-Shift',
      skillTags: [],
      hourlyRate: 20.00,
      certifications: [],
    });
    setSelectedPerson(null);
    setIsEditing(true);
  };

  const handleEdit = (person: Personnel) => {
    setPersonForm(person);
    setSelectedPerson(person);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!personForm.empCode || !personForm.firstName || !personForm.lastName || !personForm.email) {
      alert('Employee code, name, and email are required');
      return;
    }

    const personData = {
      ...personForm,
      fullName: `${personForm.firstName} ${personForm.lastName}`,
    } as Personnel;

    if (selectedPerson) {
      setPersonnel(personnel.map(p => p.empCode === selectedPerson.empCode ? personData : p));
    } else {
      const newPerson: Personnel = {
        ...personData,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setPersonnel([...personnel, newPerson]);
    }
    setIsEditing(false);
    setSelectedPerson(null);
  };

  const handleDelete = (empCode: string) => {
    if (confirm(`Delete employee ${empCode}?`)) {
      setPersonnel(personnel.filter(p => p.empCode !== empCode));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="w-4 h-4" />;
      case 'On Leave': return <Clock className="w-4 h-4" />;
      case 'Inactive': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full-Time': return 'bg-blue-100 text-blue-800';
      case 'Part-Time': return 'bg-purple-100 text-purple-800';
      case 'Contract': return 'bg-orange-100 text-orange-800';
      case 'Temporary': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSkillsForEmployee = (empCode: string) => {
    return skills.filter(s => s.empCode === empCode);
  };

  const getYearsOfService = (hireDate: string): string => {
    const years = (new Date().getTime() - new Date(hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (years < 1) {
      const months = Math.floor(years * 12);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${years.toFixed(1)} years`;
  };

  const exportToCSV = () => {
    const csv = 'Code,Name,Email,Phone,Department,Position,Type,Status,Hire Date,Shift\n' +
      personnel.map(p =>
        `${p.empCode},${p.fullName},${p.email},${p.phone},${p.department},${p.position},${p.employmentType},${p.status},${p.hireDate},${p.shiftPattern}`
      ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personnel_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-7 h-7 text-blue-600" />
                  Personnel Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">Master Data Management (MAS007)</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />

                  Add Employee
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Total Employees</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{personnel.length}</div>
                  </div>
                  <Users className="w-10 h-10 text-gray-300" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Active</div>
                    <div className="text-2xl font-bold text-green-600 mt-1">{stats.activeCount}</div>
                  </div>
                  <UserCheck className="w-10 h-10 text-green-200" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Departments</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">{stats.departments}</div>
                  </div>
                  <Briefcase className="w-10 h-10 text-blue-200" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Avg Tenure</div>
                    <div className="text-2xl font-bold text-purple-600 mt-1">{stats.avgTenure.toFixed(1)}y</div>
                  </div>
                  <Calendar className="w-10 h-10 text-purple-200" />
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
              <select
                value={personForm.employmentType}
                onChange={(e) => {
                  const value = e.target.value as EmploymentType; // cast ให้ตรง type
                  setPersonForm({ ...personForm, employmentType: value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
              </select>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 ${viewMode === 'cards' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 border-l border-gray-300 ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                >
                  <Table size={18} />
                </button>
              </div>
            </div>
          </div>
        }
      />


      {/* Main Content */}
      <div className="p-6">
        {!isEditing ? (
          <>
            {/* Cards View */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPersonnel.map((person) => {
                  const empSkills = getSkillsForEmployee(person.empCode);

                  return (
                    <div key={person.empCode} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3 flex-1">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                              {person.firstName[0]}{person.lastName[0]}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">{person.fullName}</h3>
                              <p className="text-sm text-gray-600">{person.position}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(person.status)}`}>
                                  {getStatusIcon(person.status)}
                                  {person.status}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(person.employmentType)}`}>
                                  {person.employmentType}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(person)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(person.empCode)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span>{person.department}</span>
                        </div>

                        <div className="pt-3 border-t border-gray-200 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Employee ID</span>
                            <span className="font-medium text-gray-900">{person.empCode}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Work Center</span>
                            <span className="font-medium text-gray-900">{person.workCenter || '-'}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Shift Pattern</span>
                            <span className="font-medium text-gray-900">{person.shiftPattern}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Years of Service</span>
                            <span className="font-medium text-gray-900">{getYearsOfService(person.hireDate)}</span>
                          </div>
                          {person.hourlyRate && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Hourly Rate</span>
                              <span className="font-medium text-green-600">${person.hourlyRate}/hr</span>
                            </div>
                          )}
                        </div>

                        {person.skillTags.length > 0 && (
                          <div className="pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              Skills ({person.skillTags.length})
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {person.skillTags.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                              {person.skillTags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{person.skillTags.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {person.certifications && person.certifications.length > 0 && (
                          <div className="pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-500 mb-2">
                              Certifications ({person.certifications.length})
                            </div>
                            <div className="text-xs text-gray-700">
                              {person.certifications.slice(0, 2).join(', ')}
                              {person.certifications.length > 2 && ` +${person.certifications.length - 2} more`}
                            </div>
                          </div>
                        )}

                        {empSkills.length > 0 && (
                          <div className="pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-500 mb-2">Skill Levels</div>
                            <div className="space-y-1">
                              {empSkills.slice(0, 3).map((skill, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <span className="text-xs text-gray-700">{skill.skillName}</span>
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(level => (
                                      <div
                                        key={level}
                                        className={`w-2 h-2 rounded-full ${level <= skill.level ? 'bg-blue-500' : 'bg-gray-200'
                                          }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPersonnel.map((person) => (
                        <tr key={person.empCode} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {person.firstName[0]}{person.lastName[0]}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{person.fullName}</div>
                                <div className="text-xs text-gray-500">{person.empCode}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{person.email}</div>
                            <div className="text-xs text-gray-500">{person.phone}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{person.department}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{person.position}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(person.employmentType)}`}>
                              {person.employmentType}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(person.status)}`}>
                              {getStatusIcon(person.status)}
                              {person.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{person.shiftPattern}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <button
                              onClick={() => handleEdit(person)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(person.empCode)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredPersonnel.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No employees found
                  </div>
                )}
              </div>
            )}

            {filteredPersonnel.length === 0 && viewMode === 'cards' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12 text-gray-500">
                No employees found
              </div>
            )}
          </>
        ) : (
          <>
            {/* Edit Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedPerson ? 'Edit' : 'Add'} Employee
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee Code *
                      </label>
                      <input
                        type="text"
                        value={personForm.empCode}
                        onChange={(e) => setPersonForm({ ...personForm, empCode: e.target.value })}
                        disabled={!!selectedPerson}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={personForm.firstName}
                        onChange={(e) => setPersonForm({ ...personForm, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={personForm.lastName}
                        onChange={(e) => setPersonForm({ ...personForm, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={personForm.email}
                        onChange={(e) => setPersonForm({ ...personForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={personForm.phone}
                        onChange={(e) => setPersonForm({ ...personForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Birth Date
                    </label>
                    <input
                      type="date"
                      value={personForm.birthDate || ''}
                      onChange={(e) => setPersonForm({ ...personForm, birthDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Employment Details */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Employment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department *
                      </label>
                      <select
                        value={personForm.department}
                        onChange={(e) => setPersonForm({ ...personForm, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Department</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Assembly">Assembly</option>
                        <option value="Quality">Quality</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Packaging">Packaging</option>
                        <option value="Warehouse">Warehouse</option>
                        <option value="Engineering">Engineering</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position *
                      </label>
                      <input
                        type="text"
                        value={personForm.position}
                        onChange={(e) => setPersonForm({ ...personForm, position: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employment Type
                      </label>
                      <select
                        value={personForm.employmentType}
                        onChange={(e) => setPersonForm({ ...personForm, employmentType: e.target.value as EmploymentType })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Temporary">Temporary</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={personForm.status}
                        onChange={(e) =>
                          setPersonForm({
                            ...personForm,
                            status: e.target.value as Personnel['status'],
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hire Date
                      </label>
                      <input
                        type="date"
                        value={personForm.hireDate}
                        onChange={(e) => setPersonForm({ ...personForm, hireDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Work Schedule */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Work Schedule
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calendar ID
                      </label>
                      <select
                        value={personForm.calendarId}
                        onChange={(e) => setPersonForm({ ...personForm, calendarId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="CAL001">CAL001 - Standard</option>
                        <option value="CAL002">CAL002 - Day Shift</option>
                        <option value="CAL003">CAL003 - Part-Time</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shift Pattern
                      </label>
                      <select
                        value={personForm.shiftPattern}
                        onChange={(e) => setPersonForm({ ...personForm, shiftPattern: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Day Shift">Day Shift</option>
                        <option value="2-Shift">2-Shift</option>
                        <option value="3-Shift Rotating">3-Shift Rotating</option>
                        <option value="Part-Time Evening">Part-Time Evening</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Work Center
                      </label>
                      <input
                        type="text"
                        value={personForm.workCenter || ''}
                        onChange={(e) => setPersonForm({ ...personForm, workCenter: e.target.value })}
                        placeholder="e.g., WC001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Supervisor
                      </label>
                      <input
                        type="text"
                        value={personForm.supervisor || ''}
                        onChange={(e) => setPersonForm({ ...personForm, supervisor: e.target.value })}
                        placeholder="Employee code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hourly Rate ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={personForm.hourlyRate}
                        onChange={(e) => setPersonForm({ ...personForm, hourlyRate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Skills & Certifications */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Skills & Certifications
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skill Tags
                    </label>
                    <input
                      type="text"
                      value={(personForm.skillTags || []).join(', ')}
                      onChange={(e) => setPersonForm({
                        ...personForm,
                        skillTags: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      })}
                      placeholder="Enter comma-separated skills"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certifications
                    </label>
                    <input
                      type="text"
                      value={(personForm.certifications || []).join(', ')}
                      onChange={(e) => setPersonForm({
                        ...personForm,
                        certifications: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      })}
                      placeholder="Enter comma-separated certifications"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={personForm.emergencyContact || ''}
                        onChange={(e) => setPersonForm({ ...personForm, emergencyContact: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={personForm.emergencyPhone || ''}
                        onChange={(e) => setPersonForm({ ...personForm, emergencyPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Additional Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={personForm.address || ''}
                      onChange={(e) => setPersonForm({ ...personForm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={personForm.notes || ''}
                      onChange={(e) => setPersonForm({ ...personForm, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Employee
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PersonnelPage;