"use client";

import React, { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, Download, Upload, Users,
  Save, X, Filter, Star, Award, TrendingUp, AlertCircle,
  CheckCircle, Target,
  LayoutGrid,
  Table
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// Sample personnel
const PERSONNEL = [
  { code: 'EMP001', name: 'John Smith', dept: 'Machining' },
  { code: 'EMP002', name: 'Sarah Johnson', dept: 'Machining' },
  { code: 'EMP003', name: 'Mike Chen', dept: 'Assembly' },
  { code: 'EMP004', name: 'Lisa Brown', dept: 'Painting' },
  { code: 'EMP005', name: 'David Wilson', dept: 'Assembly' },
  { code: 'EMP006', name: 'Emma Davis', dept: 'Machining' },
  { code: 'EMP007', name: 'Tom Anderson', dept: 'Pressing' },
  { code: 'EMP008', name: 'Maria Garcia', dept: 'Inspection' },
];

// Sample processes/skills
const PROCESSES = [
  { code: 'MACH', name: 'CNC Machining', category: 'Fabrication' },
  { code: 'DRILL', name: 'Drilling', category: 'Fabrication' },
  { code: 'PRESS', name: 'Press Operation', category: 'Forming' },
  { code: 'PAINT', name: 'Painting', category: 'Finishing' },
  { code: 'ASSY', name: 'Assembly', category: 'Assembly' },
  { code: 'WELD', name: 'Welding', category: 'Fabrication' },
  { code: 'INSP', name: 'Quality Inspection', category: 'Quality' },
  { code: 'PACK', name: 'Packaging', category: 'Finishing' },
];

// Sample machines
const MACHINES = [
  { code: 'M001', name: 'CNC Mill 1' },
  { code: 'M002', name: 'CNC Mill 2' },
  { code: 'M003', name: 'Assembly Line A' },
  { code: 'M004', name: 'Press 1' },
  { code: 'M005', name: 'Paint Booth' },
];

// Skill levels
const SKILL_LEVELS = [
  { value: 1, label: 'Trainee', description: 'Learning basics, requires supervision', color: 'bg-red-100 text-red-700' },
  { value: 2, label: 'Beginner', description: 'Can perform with guidance', color: 'bg-orange-100 text-orange-700' },
  { value: 3, label: 'Competent', description: 'Can work independently', color: 'bg-yellow-100 text-yellow-700' },
  { value: 4, label: 'Proficient', description: 'High skill, can train others', color: 'bg-green-100 text-green-700' },
  { value: 5, label: 'Expert', description: 'Master level, can teach and innovate', color: 'bg-blue-100 text-blue-700' },
];

// Initial skills matrix data
const INITIAL_SKILLS = [
  {
    id: 'SK001',
    empCode: 'EMP001',
    empName: 'John Smith',
    dept: 'Machining',
    skills: [
      { type: 'process', code: 'MACH', name: 'CNC Machining', level: 5, certified: true, certDate: '2024-01-15', expiryDate: '2026-01-15' },
      { type: 'process', code: 'DRILL', name: 'Drilling', level: 4, certified: true, certDate: '2024-02-20', expiryDate: '2026-02-20' },
      { type: 'machine', code: 'M001', name: 'CNC Mill 1', level: 5, certified: true, certDate: '2024-01-15', expiryDate: null },
      { type: 'machine', code: 'M002', name: 'CNC Mill 2', level: 4, certified: true, certDate: '2024-03-10', expiryDate: null },
    ]
  },
  {
    id: 'SK002',
    empCode: 'EMP002',
    empName: 'Sarah Johnson',
    dept: 'Machining',
    skills: [
      { type: 'process', code: 'MACH', name: 'CNC Machining', level: 3, certified: true, certDate: '2024-05-10', expiryDate: '2026-05-10' },
      { type: 'process', code: 'DRILL', name: 'Drilling', level: 3, certified: false, certDate: null, expiryDate: null },
      { type: 'machine', code: 'M001', name: 'CNC Mill 1', level: 3, certified: true, certDate: '2024-05-10', expiryDate: null },
    ]
  },
  {
    id: 'SK003',
    empCode: 'EMP003',
    empName: 'Mike Chen',
    dept: 'Assembly',
    skills: [
      { type: 'process', code: 'ASSY', name: 'Assembly', level: 5, certified: true, certDate: '2023-08-15', expiryDate: '2025-08-15' },
      { type: 'process', code: 'PACK', name: 'Packaging', level: 4, certified: true, certDate: '2023-09-20', expiryDate: '2025-09-20' },
      { type: 'process', code: 'INSP', name: 'Quality Inspection', level: 3, certified: true, certDate: '2024-01-10', expiryDate: '2026-01-10' },
      { type: 'machine', code: 'M003', name: 'Assembly Line A', level: 5, certified: true, certDate: '2023-08-15', expiryDate: null },
    ]
  },
  {
    id: 'SK004',
    empCode: 'EMP004',
    empName: 'Lisa Brown',
    dept: 'Painting',
    skills: [
      { type: 'process', code: 'PAINT', name: 'Painting', level: 4, certified: true, certDate: '2024-03-01', expiryDate: '2026-03-01' },
      { type: 'machine', code: 'M005', name: 'Paint Booth', level: 4, certified: true, certDate: '2024-03-01', expiryDate: null },
    ]
  },
  {
    id: 'SK005',
    empCode: 'EMP007',
    empName: 'Tom Anderson',
    dept: 'Pressing',
    skills: [
      { type: 'process', code: 'PRESS', name: 'Press Operation', level: 5, certified: true, certDate: '2023-06-15', expiryDate: '2025-06-15' },
      { type: 'machine', code: 'M004', name: 'Press 1', level: 5, certified: true, certDate: '2023-06-15', expiryDate: null },
    ]
  },
];

const SkillsMatrixMaster = () => {
  const [skills, setSkills] = useState(INITIAL_SKILLS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterSkillLevel, setFilterSkillLevel] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'matrix'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [modalMode, setModalMode] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    empCode: '',
    skills: []
  });

  const departments = [...new Set(PERSONNEL.map(p => p.dept))];

  const getLevelColor = (level) => {
    const skillLevel = SKILL_LEVELS.find(sl => sl.value === level);
    return skillLevel?.color || 'bg-gray-100 text-gray-700';
  };

  const getLevelLabel = (level) => {
    const skillLevel = SKILL_LEVELS.find(sl => sl.value === level);
    return skillLevel?.label || 'Unknown';
  };

  const isCertExpiring = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90 && daysUntilExpiry >= 0;
  };

  const isCertExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.empCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'all' || skill.dept === filterDept;
    const matchesLevel = filterSkillLevel === 'all' ||
      skill.skills.some(s => s.level === parseInt(filterSkillLevel));
    return matchesSearch && matchesDept && matchesLevel;
  });

  const openCreateModal = () => {
    setFormData({
      id: `SK${String(skills.length + 1).padStart(3, '0')}`,
      empCode: '',
      skills: []
    });
    setEditingSkill(null);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openEditModal = (skill) => {
    setFormData({
      id: skill.id,
      empCode: skill.empCode,
      skills: skill.skills.map(s => ({ ...s }))
    });
    setEditingSkill(skill);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openViewModal = (skill) => {
    setEditingSkill(skill);
    setModalMode('view');
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

    const newSkill = {
      id: formData.id,
      empCode: formData.empCode,
      empName: emp?.name || '',
      dept: emp?.dept || '',
      skills: formData.skills
    };

    if (editingSkill) {
      setSkills(skills.map(s => s.id === editingSkill.id ? newSkill : s));
    } else {
      setSkills([...skills, newSkill]);
    }
    closeModal();
  };

  const handleDeleteSkill = (id) => {
    if (confirm('Are you sure you want to delete this skill record?')) {
      setSkills(skills.filter(s => s.id !== id));
    }
  };

  const addSkillToEmployee = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, {
        type: 'process',
        code: '',
        name: '',
        level: 3,
        certified: false,
        certDate: null,
        expiryDate: null
      }]
    }));
  };

  const removeSkillFromEmployee = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== index)
    }));
  };

  const updateEmployeeSkill = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, idx) => {
        if (idx === index) {
          const updated = { ...skill, [field]: value };

          // Auto-populate name when code changes
          if (field === 'code') {
            if (skill.type === 'process') {
              const process = PROCESSES.find(p => p.code === value);
              updated.name = process?.name || '';
            } else if (skill.type === 'machine') {
              const machine = MACHINES.find(m => m.code === value);
              updated.name = machine?.name || '';
            }
          }

          return updated;
        }
        return skill;
      })
    }));
  };

  const getSkillStats = () => {
    const totalSkills = skills.reduce((sum, s) => sum + s.skills.length, 0);
    const certifiedSkills = skills.reduce((sum, s) =>
      sum + s.skills.filter(sk => sk.certified).length, 0
    );
    const expiringCerts = skills.reduce((sum, s) =>
      sum + s.skills.filter(sk => isCertExpiring(sk.expiryDate)).length, 0
    );
    const expertLevel = skills.reduce((sum, s) =>
      sum + s.skills.filter(sk => sk.level === 5).length, 0
    );

    return { totalSkills, certifiedSkills, expiringCerts, expertLevel };
  };

  const stats = getSkillStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Skills Matrix</h1>
                <p className="text-sm text-gray-500 mt-1">Manage employee competencies and certifications</p>
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
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Skills
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Skills</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSkills}</p>
                  </div>
                  <Target size={32} className="text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Certified</p>
                    <p className="text-2xl font-bold text-green-600">{stats.certifiedSkills}</p>
                  </div>
                  <Award size={32} className="text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Expiring Soon</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.expiringCerts}</p>
                  </div>
                  <AlertCircle size={32} className="text-orange-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Expert Level</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.expertLevel}</p>
                  </div>
                  <Star size={32} className="text-blue-600" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={filterSkillLevel}
                onChange={(e) => setFilterSkillLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Skill Levels</option>
                {SKILL_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>Level {level.value} - {level.label}</option>
                ))}
              </select>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredSkills.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
              <p className="text-gray-500 mb-4">Add employee skills to get started</p>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Skills
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="divide-y divide-gray-200">
              {filteredSkills.map(skill => (
                <div key={skill.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{skill.empName}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{skill.empCode}</span>
                            <span>•</span>
                            <span>{skill.dept}</span>
                            <span>•</span>
                            <span>{skill.skills.length} skill{skill.skills.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {skill.skills.map((s, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900">{s.name}</span>
                                  <span className="text-xs text-gray-500">({s.code})</span>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                                  {s.type === 'process' ? 'Process' : 'Machine'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {s.certified && (
                                  <CheckCircle size={16} className={
                                    isCertExpired(s.expiryDate) ? 'text-red-600' :
                                      isCertExpiring(s.expiryDate) ? 'text-orange-600' :
                                        'text-green-600'
                                  } />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded font-medium ${getLevelColor(s.level)}`}>
                                Level {s.level} - {getLevelLabel(s.level)}
                              </span>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={i < s.level ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                            {s.certified && s.expiryDate && (
                              <div className={`text-xs mt-2 ${isCertExpired(s.expiryDate) ? 'text-red-600' :
                                isCertExpiring(s.expiryDate) ? 'text-orange-600' :
                                  'text-gray-500'
                                }`}>
                                {isCertExpired(s.expiryDate) ? 'Cert Expired: ' :
                                  isCertExpiring(s.expiryDate) ? 'Cert Expiring: ' :
                                    'Cert Valid Until: '}
                                {new Date(s.expiryDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => openViewModal(skill)}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="View Details"
                      >
                        <Eye size={18} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => openEditModal(skill)}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Edit Skills"
                      >
                        <Edit size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50">
                      Employee
                    </th>
                    {PROCESSES.map(proc => (
                      <th key={proc.code} className="px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-[120px]">
                        <div>{proc.name}</div>
                        <div className="text-xs text-gray-500 font-normal">{proc.code}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSkills.map(skill => (
                    <tr key={skill.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 sticky left-0 bg-white">
                        <div>
                          <div className="font-medium text-gray-900">{skill.empName}</div>
                          <div className="text-sm text-gray-500">{skill.dept}</div>
                        </div>
                      </td>
                      {PROCESSES.map(proc => {
                        const empSkill = skill.skills.find(s => s.code === proc.code && s.type === 'process');
                        return (
                          <td key={proc.code} className="px-4 py-3 text-center">
                            {empSkill ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className={`text-xs px-2 py-1 rounded font-medium ${getLevelColor(empSkill.level)}`}>
                                  L{empSkill.level}
                                </span>
                                {empSkill.certified && (
                                  <CheckCircle size={14} className={
                                    isCertExpired(empSkill.expiryDate) ? 'text-red-600' :
                                      isCertExpiring(empSkill.expiryDate) ? 'text-orange-600' :
                                        'text-green-600'
                                  } />
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'view' ? 'Skills Details' : editingSkill ? 'Edit Skills' : 'Add Skills'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {modalMode === 'view' && editingSkill ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Employee</label>
                      <p className="mt-1 text-lg font-semibold">{editingSkill.empName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Department</label>
                      <p className="mt-1 text-gray-900">{editingSkill.dept}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Skills & Certifications</label>
                    <div className="space-y-3">
                      {editingSkill.skills.map((s, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{s.name}</h4>
                              <p className="text-sm text-gray-500">{s.code} - {s.type}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={i < s.level ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className={`px-2 py-1 rounded ${getLevelColor(s.level)}`}>
                                Level {s.level} - {getLevelLabel(s.level)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Certified:</span>
                              {s.certified ? (
                                <span className="text-green-600 flex items-center gap-1">
                                  <CheckCircle size={14} /> Yes
                                </span>
                              ) : (
                                <span className="text-gray-600">No</span>
                              )}
                            </div>
                            {s.certified && s.certDate && (
                              <div>
                                <span className="text-gray-500">Certified:</span>
                                <span className="ml-2">{new Date(s.certDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {s.certified && s.expiryDate && (
                              <div className={
                                isCertExpired(s.expiryDate) ? 'text-red-600' :
                                  isCertExpiring(s.expiryDate) ? 'text-orange-600' :
                                    'text-gray-600'
                              }>
                                <span className="text-gray-500">Expires:</span>
                                <span className="ml-2">{new Date(s.expiryDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Employee Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Employee *</label>
                    <select
                      value={formData.empCode}
                      onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                  {/* Skills List */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Skills & Competencies</h3>
                      <button
                        type="button"
                        onClick={addSkillToEmployee}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add Skill
                      </button>
                    </div>

                    {formData.skills.length > 0 ? (
                      <div className="space-y-4">
                        {formData.skills.map((skill, idx) => (
                          <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm flex-shrink-0">
                                {idx + 1}
                              </div>

                              <div className="flex-1 space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                  <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-1">
                                      Type *
                                    </label>
                                    <select
                                      value={skill.type}
                                      onChange={(e) => updateEmployeeSkill(idx, 'type', e.target.value)}
                                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="process">Process</option>
                                      <option value="machine">Machine</option>
                                    </select>
                                  </div>

                                  <div className="col-span-2">
                                    <label className="text-xs font-medium text-gray-700 block mb-1">
                                      {skill.type === 'process' ? 'Process' : 'Machine'} *
                                    </label>
                                    <select
                                      value={skill.code}
                                      onChange={(e) => updateEmployeeSkill(idx, 'code', e.target.value)}
                                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="">Select {skill.type}</option>
                                      {skill.type === 'process'
                                        ? PROCESSES.map(proc => (
                                          <option key={proc.code} value={proc.code}>
                                            {proc.name} ({proc.code})
                                          </option>
                                        ))
                                        : MACHINES.map(mach => (
                                          <option key={mach.code} value={mach.code}>
                                            {mach.name} ({mach.code})
                                          </option>
                                        ))
                                      }
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-2">
                                    Skill Level *
                                  </label>
                                  <div className="space-y-2">
                                    {SKILL_LEVELS.map(level => (
                                      <label
                                        key={level.value}
                                        className={`flex items-start gap-3 p-2 border-2 rounded-lg cursor-pointer transition-colors ${skill.level === level.value
                                          ? 'border-blue-500 bg-blue-50'
                                          : 'border-gray-200 hover:border-gray-300'
                                          }`}
                                      >
                                        <input
                                          type="radio"
                                          checked={skill.level === level.value}
                                          onChange={() => updateEmployeeSkill(idx, 'level', level.value)}
                                          className="mt-1"
                                        />
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm">
                                              Level {level.value} - {level.label}
                                            </span>
                                            <div className="flex items-center gap-0.5">
                                              {[...Array(5)].map((_, i) => (
                                                <Star
                                                  key={i}
                                                  size={12}
                                                  className={i < level.value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                          <p className="text-xs text-gray-600">{level.description}</p>
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                                  <div className="col-span-3">
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={skill.certified}
                                        onChange={(e) => updateEmployeeSkill(idx, 'certified', e.target.checked)}
                                        className="rounded"
                                      />
                                      <span className="text-sm font-medium text-gray-700">Certified</span>
                                    </label>
                                  </div>

                                  {skill.certified && (
                                    <>
                                      <div>
                                        <label className="text-xs font-medium text-gray-700 block mb-1">
                                          Certification Date
                                        </label>
                                        <input
                                          type="date"
                                          value={skill.certDate || ''}
                                          onChange={(e) => updateEmployeeSkill(idx, 'certDate', e.target.value)}
                                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>

                                      <div>
                                        <label className="text-xs font-medium text-gray-700 block mb-1">
                                          Expiry Date (Optional)
                                        </label>
                                        <input
                                          type="date"
                                          value={skill.expiryDate || ''}
                                          onChange={(e) => updateEmployeeSkill(idx, 'expiryDate', e.target.value || null)}
                                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeSkillFromEmployee(idx)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Remove Skill"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-sm text-gray-500 mb-3">No skills added yet</p>
                        <button
                          type="button"
                          onClick={addSkillToEmployee}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Add First Skill
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <div className="font-medium mb-1">Skills Matrix Guidelines</div>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Select appropriate skill level based on actual competency</li>
                          <li>Enable certification tracking for formal qualifications</li>
                          <li>Set expiry dates for time-sensitive certifications</li>
                          <li>Include both process skills and machine-specific capabilities</li>
                        </ul>
                      </div>
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
              {modalMode === 'view' ? (
                <button
                  onClick={() => setModalMode('edit')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit size={18} />
                  Edit Skills
                </button>
              ) : (
                <button
                  onClick={handleSaveSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Skills
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