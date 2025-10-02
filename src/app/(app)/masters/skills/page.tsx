"use client";

import React, { useState, ChangeEvent, FC } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, Download, Upload, Users,
  Save, X, Star, Award, AlertCircle, CheckCircle, Target,
  LayoutGrid, Table
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// --- TYPE DEFINITIONS ---

type SkillType = "process" | "machine";

type Skill = {
  type: SkillType;
  code: string;
  name: string;
  level: number;
  certified: boolean;
  certDate: string | null;
  expiryDate: string | null;
};

type EmployeeSkill = {
  id: string;
  empCode: string;
  empName: string;
  dept: string;
  skills: Skill[];
};

type Personnel = {
  code: string;
  name: string;
  dept: string;
};

type Process = {
  code: string;
  name: string;
  category: string;
};

type Machine = {
  code: string;
  name: string;
};

type SkillLevel = {
  value: number;
  label: string;
  description: string;
  color: string;
};

type SkillsFormData = {
  id: string;
  empCode: string;
  skills: Skill[];
};

type ModalMode = 'edit' | 'view' | null;
type ViewMode = 'list' | 'matrix';

// --- SAMPLE DATA & CONSTANTS ---

const PERSONNEL: Personnel[] = [
  { code: 'EMP001', name: 'John Smith', dept: 'Machining' },
  { code: 'EMP002', name: 'Sarah Johnson', dept: 'Machining' },
  { code: 'EMP003', name: 'Mike Chen', dept: 'Assembly' },
  { code: 'EMP004', name: 'Lisa Brown', dept: 'Painting' },
  { code: 'EMP005', name: 'David Wilson', dept: 'Assembly' },
  { code: 'EMP006', name: 'Emma Davis', dept: 'Machining' },
  { code: 'EMP007', name: 'Tom Anderson', dept: 'Pressing' },
  { code: 'EMP008', name: 'Maria Garcia', dept: 'Inspection' },
];

const PROCESSES: Process[] = [
  { code: 'MACH', name: 'CNC Machining', category: 'Fabrication' },
  { code: 'DRILL', name: 'Drilling', category: 'Fabrication' },
  { code: 'PRESS', name: 'Press Operation', category: 'Forming' },
  { code: 'PAINT', name: 'Painting', category: 'Finishing' },
  { code: 'ASSY', name: 'Assembly', category: 'Assembly' },
  { code: 'WELD', name: 'Welding', category: 'Fabrication' },
  { code: 'INSP', name: 'Quality Inspection', category: 'Quality' },
  { code: 'PACK', name: 'Packaging', category: 'Finishing' },
];

const MACHINES: Machine[] = [
  { code: 'M001', name: 'CNC Mill 1' },
  { code: 'M002', name: 'CNC Mill 2' },
  { code: 'M003', name: 'Assembly Line A' },
  { code: 'M004', name: 'Press 1' },
  { code: 'M005', name: 'Paint Booth' },
];

const SKILL_LEVELS: SkillLevel[] = [
  { value: 1, label: 'Trainee', description: 'Learning basics, requires supervision', color: 'bg-red-100 text-red-700' },
  { value: 2, label: 'Beginner', description: 'Can perform with guidance', color: 'bg-orange-100 text-orange-700' },
  { value: 3, label: 'Competent', description: 'Can work independently', color: 'bg-yellow-100 text-yellow-700' },
  { value: 4, label: 'Proficient', description: 'High skill, can train others', color: 'bg-green-100 text-green-700' },
  { value: 5, label: 'Expert', description: 'Master level, can teach and innovate', color: 'bg-blue-100 text-blue-700' },
];

const INITIAL_SKILLS: EmployeeSkill[] = [
  { id: 'SK001', empCode: 'EMP001', empName: 'John Smith', dept: 'Machining', skills: [ { type: 'process', code: 'MACH', name: 'CNC Machining', level: 5, certified: true, certDate: '2024-01-15', expiryDate: '2026-01-15' }, { type: 'process', code: 'DRILL', name: 'Drilling', level: 4, certified: true, certDate: '2024-02-20', expiryDate: '2026-02-20' }, { type: 'machine', code: 'M001', name: 'CNC Mill 1', level: 5, certified: true, certDate: '2024-01-15', expiryDate: null }, { type: 'machine', code: 'M002', name: 'CNC Mill 2', level: 4, certified: true, certDate: '2024-03-10', expiryDate: null }, ] },
  { id: 'SK002', empCode: 'EMP002', empName: 'Sarah Johnson', dept: 'Machining', skills: [ { type: 'process', code: 'MACH', name: 'CNC Machining', level: 3, certified: true, certDate: '2024-05-10', expiryDate: '2026-05-10' }, { type: 'process', code: 'DRILL', name: 'Drilling', level: 3, certified: false, certDate: null, expiryDate: null }, { type: 'machine', code: 'M001', name: 'CNC Mill 1', level: 3, certified: true, certDate: '2024-05-10', expiryDate: null }, ] },
  { id: 'SK003', empCode: 'EMP003', empName: 'Mike Chen', dept: 'Assembly', skills: [ { type: 'process', code: 'ASSY', name: 'Assembly', level: 5, certified: true, certDate: '2023-08-15', expiryDate: '2025-08-15' }, { type: 'process', code: 'PACK', name: 'Packaging', level: 4, certified: true, certDate: '2023-09-20', expiryDate: '2025-09-20' }, { type: 'process', code: 'INSP', name: 'Quality Inspection', level: 3, certified: true, certDate: '2024-01-10', expiryDate: '2026-01-10' }, { type: 'machine', code: 'M003', name: 'Assembly Line A', level: 5, certified: true, certDate: '2023-08-15', expiryDate: null }, ] },
  { id: 'SK004', empCode: 'EMP004', empName: 'Lisa Brown', dept: 'Painting', skills: [ { type: 'process', code: 'PAINT', name: 'Painting', level: 4, certified: true, certDate: '2024-03-01', expiryDate: '2026-03-01' }, { type: 'machine', code: 'M005', name: 'Paint Booth', level: 4, certified: true, certDate: '2024-03-01', expiryDate: null }, ] },
  { id: 'SK005', empCode: 'EMP007', empName: 'Tom Anderson', dept: 'Pressing', skills: [ { type: 'process', code: 'PRESS', name: 'Press Operation', level: 5, certified: true, certDate: '2023-06-15', expiryDate: '2025-06-15' }, { type: 'machine', code: 'M004', name: 'Press 1', level: 5, certified: true, certDate: '2023-06-15', expiryDate: null }, ] },
];

// ---------- Helpers moved to module scope (fix deps warning) ----------
const isCertDateInvalid = (dateStr: string | null): boolean => {
  if (!dateStr) return true;
  return isNaN(new Date(dateStr).getTime());
};

const isCertExpiring = (expiryDate: string | null): boolean => {
  if (!expiryDate || isCertDateInvalid(expiryDate)) return false;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 90;
};

const isCertExpired = (expiryDate: string | null): boolean => {
  if (!expiryDate || isCertDateInvalid(expiryDate)) return false;
  return new Date(expiryDate) < new Date();
};

const getLevelInfo = (level: number): SkillLevel => {
  return (
    SKILL_LEVELS.find((sl) => sl.value === level) || {
      value: 0,
      label: 'Unknown',
      description: '',
      color: 'bg-gray-100 text-gray-700',
    }
  );
};
// ---------------------------------------------------------------------

const SkillsMatrixMaster: FC = () => {
  const [skills, setSkills] = useState<EmployeeSkill[]>(INITIAL_SKILLS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterSkillLevel, setFilterSkillLevel] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<EmployeeSkill | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  const initialFormData: SkillsFormData = { id: '', empCode: '', skills: [] };
  const [formData, setFormData] = useState<SkillsFormData>(initialFormData);

  const departments = [...new Set(PERSONNEL.map(p => p.dept))];

  const filteredSkills = skills.filter(skill => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      skill.empName.toLowerCase().includes(searchLower) ||
      skill.empCode.toLowerCase().includes(searchLower);
    const matchesDept = filterDept === 'all' || skill.dept === filterDept;
    const matchesLevel =
      filterSkillLevel === 'all' ||
      skill.skills.some(s => s.level === parseInt(filterSkillLevel));
    return matchesSearch && matchesDept && matchesLevel;
  });

  const openModal = (mode: ModalMode, skill: EmployeeSkill | null) => {
    setModalMode(mode);
    setEditingSkill(skill);

    if (mode === 'edit' && skill) {
      setFormData({
        id: skill.id,
        empCode: skill.empCode,
        skills: JSON.parse(JSON.stringify(skill.skills)), // deep copy
      });
    } else {
      setFormData({
        id: `SK${String(skills.length + 1).padStart(3, '0')}`,
        empCode: '',
        skills: [],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSkill(null);
    setModalMode(null);
  };

  const handleSaveSkill = () => {
    if (!formData.empCode) {
      alert('Please select an employee');
      return;
    }
    const emp = PERSONNEL.find(p => p.code === formData.empCode);
    if (!emp) {
      alert('Invalid employee selected.');
      return;
    }

    const newSkillRecord: EmployeeSkill = {
      id: formData.id,
      empCode: emp.code,
      empName: emp.name,
      dept: emp.dept,
      skills: formData.skills,
    };

    if (editingSkill) {
      setSkills(skills.map(s => (s.id === editingSkill.id ? newSkillRecord : s)));
    } else {
      setSkills([...skills, newSkillRecord]);
    }
    closeModal();
  };

  const handleDeleteSkill = (id: string) => {
    if (window.confirm('Are you sure you want to delete this skill record?')) {
      setSkills(skills.filter(s => s.id !== id));
    }
  };

  const addSkillToEmployee = () => {
    setFormData(prev => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          type: 'process',
          code: '',
          name: '',
          level: 3,
          certified: false,
          certDate: null,
          expiryDate: null,
        },
      ],
    }));
  };

  const removeSkillFromEmployee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== index),
    }));
  };

  // ---------- type-safe update (no any) ----------
  const updateEmployeeSkill = <K extends keyof Skill>(
    index: number,
    field: K,
    value: Skill[K]
  ) => {
    setFormData(prev => {
      const newSkills = [...prev.skills];
      const skillToUpdate: Skill = { ...newSkills[index] };

      // update in a type-safe way
      skillToUpdate[field] = value;

      // auto-populate name when code/type changes
      if (field === 'code' || field === 'type') {
        if (skillToUpdate.type === 'process') {
          const process = PROCESSES.find(p => p.code === skillToUpdate.code);
          skillToUpdate.name = process?.name ?? '';
        } else if (skillToUpdate.type === 'machine') {
          const machine = MACHINES.find(m => m.code === skillToUpdate.code);
          skillToUpdate.name = machine?.name ?? '';
        }
      }

      // reset dates if not certified
      if (field === 'certified' && value === false) {
        skillToUpdate.certDate = null;
        skillToUpdate.expiryDate = null;
      }

      newSkills[index] = skillToUpdate;
      return { ...prev, skills: newSkills };
    });
  };
  // ------------------------------------------------

  const stats = React.useMemo(() => {
    let totalSkills = 0,
      certifiedSkills = 0,
      expiringCerts = 0,
      expertLevel = 0;

    for (const record of skills) {
      totalSkills += record.skills.length;
      for (const s of record.skills) {
        if (s.certified) certifiedSkills++;
        if (isCertExpiring(s.expiryDate)) expiringCerts++;
        if (s.level === 5) expertLevel++;
      }
    }
    return { totalSkills, certifiedSkills, expiringCerts, expertLevel };
  }, [skills]); // helpers moved to module scope -> no missing deps

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Skills Matrix</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage employee competencies and certifications
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Upload size={18} /> Import
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Download size={18} /> Export
                </button>
                <button
                  onClick={() => openModal('edit', null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={18} /> Add Skills
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Skills</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSkills}</p>
                </div>
                <Target size={32} className="text-blue-500" />
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Certified</p>
                  <p className="text-2xl font-bold text-green-600">{stats.certifiedSkills}</p>
                </div>
                <Award size={32} className="text-green-500" />
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Expiring Soon</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.expiringCerts}</p>
                </div>
                <AlertCircle size={32} className="text-orange-500" />
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Expert Level</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.expertLevel}</p>
                </div>
                <Star size={32} className="text-indigo-500" />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterDept}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFilterDept(e.target.value)
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <select
                value={filterSkillLevel}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFilterSkillLevel(e.target.value)
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Skill Levels</option>
                {SKILL_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    Level {level.value} - {level.label}
                  </option>
                ))}
              </select>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${
                    viewMode === 'list'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-white text-gray-600'
                  }`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`px-3 py-2 border-l border-gray-300 ${
                    viewMode === 'matrix'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-white text-gray-600'
                  }`}
                >
                  <Table size={18} />
                </button>
              </div>
            </div>
          </div>
        }
      />

      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredSkills.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters.</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="divide-y divide-gray-200">
              {filteredSkills.map(record => {
                const avgLevel =
                  record.skills.length > 0
                    ? (record.skills.reduce((acc, s) => acc + s.level, 0) /
                        record.skills.length
                      ).toFixed(1)
                    : 'N/A';
                return (
                  <div key={record.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users size={24} className="text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {record.empName}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{record.empCode}</span>
                              <span>•</span>
                              <span>{record.dept}</span>
                              <span>•</span>
                              <span>{record.skills.length} skills</span>
                              <span>•</span>
                              <span>Avg. Lvl: {avgLevel}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {record.skills.map((s, idx) => {
                            const levelInfo = getLevelInfo(s.level);
                            const expired = isCertExpired(s.expiryDate);
                            const expiring = isCertExpiring(s.expiryDate);
                            return (
                              <div
                                key={idx}
                                className="border border-gray-200 rounded-lg p-3 bg-white"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium text-gray-900">
                                        {s.name}
                                      </span>
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                                        {s.type}
                                      </span>
                                    </div>
                                  </div>
                                  {s.certified && (
                                    <CheckCircle
                                      size={16}
                                      className={
                                        expired
                                          ? 'text-red-500'
                                          : expiring
                                          ? 'text-orange-500'
                                          : 'text-green-500'
                                      }
                                    />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium ${levelInfo.color}`}
                                  >
                                    Level {s.level} - {levelInfo.label}
                                  </span>
                                </div>
                                {s.certified && s.expiryDate && (
                                  <div
                                    className={`text-xs mt-2 ${
                                      expired
                                        ? 'text-red-600'
                                        : expiring
                                        ? 'text-orange-600'
                                        : 'text-gray-500'
                                    }`}
                                  >
                                    {expired
                                      ? 'Expired: '
                                      : expiring
                                      ? 'Expiring: '
                                      : 'Valid Until: '}
                                    {new Date(s.expiryDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => openModal('view', record)}
                          className="p-2 hover:bg-gray-200 rounded-full"
                          title="View Details"
                        >
                          <Eye size={18} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => openModal('edit', record)}
                          className="p-2 hover:bg-gray-200 rounded-full"
                          title="Edit Skills"
                        >
                          <Edit size={18} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(record.id)}
                          className="p-2 hover:bg-gray-200 rounded-full"
                          title="Delete"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Matrix View
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10 w-48">
                      Employee
                    </th>
                    {PROCESSES.map(proc => (
                      <th
                        key={proc.code}
                        className="px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-[120px]"
                      >
                        <div>{proc.name}</div>
                        <div className="text-xs text-gray-500 font-normal">
                          {proc.code}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSkills.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 sticky left-0 bg-white hover:bg-gray-50 z-10 w-48">
                        <div className="font-medium text-gray-900">
                          {record.empName}
                        </div>
                        <div className="text-sm text-gray-500">{record.dept}</div>
                      </td>
                      {PROCESSES.map(proc => {
                        const empSkill = record.skills.find(
                          s => s.code === proc.code && s.type === 'process'
                        );
                        return (
                          <td key={proc.code} className="px-4 py-3 text-center align-middle">
                            {empSkill ? (
                              <div className="flex flex-col items-center gap-1">
                                <span
                                  className={`w-12 text-xs px-2 py-1 rounded-full font-medium ${
                                    getLevelInfo(empSkill.level).color
                                  }`}
                                >
                                  L{empSkill.level}
                                </span>
                                {empSkill.certified && (
                                  <CheckCircle
                                    size={14}
                                    className={
                                      isCertExpired(empSkill.expiryDate)
                                        ? 'text-red-500'
                                        : isCertExpiring(empSkill.expiryDate)
                                        ? 'text-orange-500'
                                        : 'text-green-500'
                                    }
                                  />
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'view'
                  ? 'Skills Details'
                  : editingSkill
                  ? `Edit Skills for ${editingSkill.empName}`
                  : 'Add New Skills Record'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {modalMode === 'view' && editingSkill ? (
                <div className="space-y-6">
                  <p>
                    <label className="text-sm text-gray-500">Employee</label>
                    <span className="block mt-1 text-lg font-semibold">
                      {editingSkill.empName} ({editingSkill.dept})
                    </span>
                  </p>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Skills & Certifications
                    </label>
                    {editingSkill.skills.map((s, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-4 grid grid-cols-3 gap-4 items-center"
                      >
                        <div>
                          <h4 className="font-semibold text-gray-900">{s.name}</h4>
                          <p className="text-sm text-gray-500">{s.type}</p>
                        </div>
                        <div>
                          <span
                            className={`text-sm px-3 py-1 rounded-full ${getLevelInfo(s.level).color}`}
                          >
                            {getLevelInfo(s.level).label}
                          </span>
                        </div>
                        <div className="text-sm">
                          {s.certified ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle size={16} className="text-green-600" /> Certified
                            </div>
                          ) : (
                            <div className="text-gray-500">Not Certified</div>
                          )}
                          {s.expiryDate && (
                            <div
                              className={`${
                                isCertExpired(s.expiryDate)
                                  ? 'text-red-600'
                                  : isCertExpiring(s.expiryDate)
                                  ? 'text-orange-600'
                                  : ''
                              }`}
                            >
                              Expires: {new Date(s.expiryDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Edit and Create Mode
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Employee *
                    </label>
                    <select
                      value={formData.empCode}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setFormData({ ...formData, empCode: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={!!editingSkill}
                      required
                    >
                      <option value="">Select Employee</option>
                      {PERSONNEL.map(emp => (
                        <option key={emp.code} value={emp.code}>
                          {emp.name} ({emp.code}) - {emp.dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Skills List</h3>
                      <button
                        type="button"
                        onClick={addSkillToEmployee}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Plus size={16} /> Add Skill
                      </button>
                    </div>
                    {formData.skills.length > 0 ? (
                      <div className="space-y-4">
                        {formData.skills.map((skill, idx) => (
                          <div
                            key={idx}
                            className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 relative"
                          >
                            <button
                              type="button"
                              onClick={() => removeSkillFromEmployee(idx)}
                              className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded-full"
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="text-xs font-medium text-gray-600 block mb-1">
                                  Type
                                </label>
                                <select
                                  value={skill.type}
                                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                    updateEmployeeSkill(idx, 'type', e.target.value as SkillType)
                                  }
                                  className="w-full text-sm p-2 border border-gray-300 rounded-md"
                                >
                                  <option value="process">Process</option>
                                  <option value="machine">Machine</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600 block mb-1">
                                  Skill/Machine
                                </label>
                                <select
                                  value={skill.code}
                                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                    updateEmployeeSkill(idx, 'code', e.target.value)
                                  }
                                  className="w-full text-sm p-2 border border-gray-300 rounded-md"
                                >
                                  <option value="">Select...</option>
                                  {(skill.type === 'process' ? PROCESSES : MACHINES).map(item => (
                                    <option key={item.code} value={item.code}>
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600 block mb-1">
                                  Level
                                </label>
                                <select
                                  value={skill.level}
                                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                    updateEmployeeSkill(idx, 'level', parseInt(e.target.value) || 0)
                                  }
                                  className="w-full text-sm p-2 border border-gray-300 rounded-md"
                                >
                                  {SKILL_LEVELS.map(lvl => (
                                    <option key={lvl.value} value={lvl.value}>
                                      {lvl.value} - {lvl.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-center">
                              <div className="flex items-center gap-2 pt-4">
                                <input
                                  type="checkbox"
                                  checked={skill.certified}
                                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    updateEmployeeSkill(idx, 'certified', e.target.checked)
                                  }
                                  className="h-4 w-4 rounded border-gray-300"
                                  id={`cert-${idx}`}
                                />
                                <label htmlFor={`cert-${idx}`} className="text-sm font-medium">
                                  Certified
                                </label>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600 block mb-1">
                                  Certification Date
                                </label>
                                <input
                                  type="date"
                                  value={skill.certDate || ''}
                                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    updateEmployeeSkill(idx, 'certDate', e.target.value || null)
                                  }
                                  disabled={!skill.certified}
                                  className="w-full text-sm p-2 border border-gray-300 rounded-md disabled:bg-gray-200"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600 block mb-1">
                                  Expiry Date
                                </label>
                                <input
                                  type="date"
                                  value={skill.expiryDate || ''}
                                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    updateEmployeeSkill(idx, 'expiryDate', e.target.value || null)
                                  }
                                  disabled={!skill.certified}
                                  className="w-full text-sm p-2 border border-gray-300 rounded-md disabled:bg-gray-200"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-100 rounded-lg">
                        <p className="text-gray-500">No skills added for this employee yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {modalMode !== 'view' && (
                <button
                  onClick={handleSaveSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsMatrixMaster;