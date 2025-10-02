"use client";

import React, { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, Download, Upload, Calendar,
  Save, X, ChevronDown, ChevronRight, Clock, Sun, Moon, Coffee,
  AlertCircle, Copy, Check
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// Days of week
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Initial calendars data
const INITIAL_CALENDARS = [
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
      {
        id: 'S1',
        name: 'Morning Shift',
        startTime: '06:00',
        endTime: '14:00',
        breaks: [
          { name: 'Break', startTime: '09:00', endTime: '09:15' },
          { name: 'Lunch', startTime: '11:30', endTime: '12:00' },
        ]
      },
      {
        id: 'S2',
        name: 'Afternoon Shift',
        startTime: '14:00',
        endTime: '22:00',
        breaks: [
          { name: 'Break', startTime: '17:00', endTime: '17:15' },
          { name: 'Dinner', startTime: '19:30', endTime: '20:00' },
        ]
      },
      {
        id: 'S3',
        name: 'Night Shift',
        startTime: '22:00',
        endTime: '06:00',
        breaks: [
          { name: 'Break', startTime: '01:00', endTime: '01:15' },
          { name: 'Midnight Meal', startTime: '03:30', endTime: '04:00' },
        ]
      }
    ],
    holidays: [],
    status: 'Active'
  },
];

const ShiftsCalendarsMaster = () => {
  const [calendars, setCalendars] = useState(INITIAL_CALENDARS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedCalendars, setExpandedCalendars] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState(null);
  const [viewMode, setViewMode] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    workingDays: [],
    shifts: [],
    holidays: [],
    status: 'Active'
  });

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-700',
      'Inactive': 'bg-gray-100 text-gray-700',
      'Draft': 'bg-yellow-100 text-yellow-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getShiftIcon = (shiftName) => {
    const name = shiftName.toLowerCase();
    if (name.includes('morning') || name.includes('day')) return <Sun size={16} className="text-yellow-600" />;
    if (name.includes('night')) return <Moon size={16} className="text-indigo-600" />;
    return <Clock size={16} className="text-blue-600" />;
  };

  const calculateShiftDuration = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let durationMin = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    if (durationMin < 0) durationMin += 24 * 60; // Handle overnight shifts

    const hours = Math.floor(durationMin / 60);
    const mins = durationMin % 60;
    return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
  };

  const calculateWorkingHours = (shifts, breaks) => {
    let totalMin = 0;
    shifts.forEach(shift => {
      const [startHour, startMin] = shift.startTime.split(':').map(Number);
      const [endHour, endMin] = shift.endTime.split(':').map(Number);
      let shiftMin = (endHour * 60 + endMin) - (startHour * 60 + startMin);
      if (shiftMin < 0) shiftMin += 24 * 60;

      // Subtract breaks
      shift.breaks.forEach(br => {
        const [bStartHour, bStartMin] = br.startTime.split(':').map(Number);
        const [bEndHour, bEndMin] = br.endTime.split(':').map(Number);
        const breakMin = (bEndHour * 60 + bEndMin) - (bStartHour * 60 + bStartMin);
        shiftMin -= breakMin;
      });

      totalMin += shiftMin;
    });

    return (totalMin / 60).toFixed(1);
  };

  const filteredCalendars = calendars.filter(calendar => {
    const matchesSearch = calendar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calendar.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calendar.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || calendar.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleCalendarExpand = (id) => {
    setExpandedCalendars(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openCreateModal = () => {
    setFormData({
      id: `CAL-${String(calendars.length + 1).padStart(3, '0')}`,
      name: '',
      description: '',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      shifts: [{
        id: 'S1',
        name: 'Day Shift',
        startTime: '08:00',
        endTime: '17:00',
        breaks: [
          { name: 'Lunch', startTime: '12:00', endTime: '13:00' }
        ]
      }],
      holidays: [],
      status: 'Active'
    });
    setEditingCalendar(null);
    setViewMode('edit');
    setIsModalOpen(true);
  };

  const openEditModal = (calendar) => {
    setFormData({
      id: calendar.id,
      name: calendar.name,
      description: calendar.description,
      workingDays: [...calendar.workingDays],
      shifts: calendar.shifts.map(shift => ({
        ...shift,
        breaks: shift.breaks.map(br => ({ ...br }))
      })),
      holidays: calendar.holidays.map(h => ({ ...h })),
      status: calendar.status
    });
    setEditingCalendar(calendar);
    setViewMode('edit');
    setIsModalOpen(true);
  };

  const openViewModal = (calendar) => {
    setEditingCalendar(calendar);
    setViewMode('view');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCalendar(null);
    setViewMode(null);
  };

  const handleSaveCalendar = () => {
    if (!formData.name || formData.workingDays.length === 0 || formData.shifts.length === 0) {
      alert('Please fill in name, select working days, and add at least one shift');
      return;
    }

    const newCalendar = { ...formData };

    if (editingCalendar) {
      setCalendars(calendars.map(c => c.id === editingCalendar.id ? newCalendar : c));
    } else {
      setCalendars([...calendars, newCalendar]);
    }
    closeModal();
  };

  const handleDeleteCalendar = (id) => {
    if (confirm(`Are you sure you want to delete calendar ${id}?`)) {
      setCalendars(calendars.filter(c => c.id !== id));
    }
  };

  const handleCopyCalendar = (calendar) => {
    const newId = `CAL-${String(calendars.length + 1).padStart(3, '0')}`;
    const copiedCalendar = {
      ...calendar,
      id: newId,
      name: `${calendar.name} (Copy)`,
      status: 'Draft'
    };
    setCalendars([...calendars, copiedCalendar]);
  };

  const toggleWorkingDay = (day) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const addShift = () => {
    const newShiftId = `S${formData.shifts.length + 1}`;
    setFormData(prev => ({
      ...prev,
      shifts: [...prev.shifts, {
        id: newShiftId,
        name: `Shift ${formData.shifts.length + 1}`,
        startTime: '08:00',
        endTime: '17:00',
        breaks: []
      }]
    }));
  };

  const removeShift = (shiftId) => {
    if (formData.shifts.length === 1) {
      alert('Calendar must have at least one shift');
      return;
    }
    setFormData(prev => ({
      ...prev,
      shifts: prev.shifts.filter(s => s.id !== shiftId)
    }));
  };

  const updateShift = (shiftId, field, value) => {
    setFormData(prev => ({
      ...prev,
      shifts: prev.shifts.map(s => s.id === shiftId ? { ...s, [field]: value } : s)
    }));
  };

  const addBreak = (shiftId) => {
    setFormData(prev => ({
      ...prev,
      shifts: prev.shifts.map(s =>
        s.id === shiftId
          ? { ...s, breaks: [...s.breaks, { name: 'Break', startTime: '10:00', endTime: '10:15' }] }
          : s
      )
    }));
  };

  const removeBreak = (shiftId, breakIndex) => {
    setFormData(prev => ({
      ...prev,
      shifts: prev.shifts.map(s =>
        s.id === shiftId
          ? { ...s, breaks: s.breaks.filter((_, idx) => idx !== breakIndex) }
          : s
      )
    }));
  };

  const updateBreak = (shiftId, breakIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      shifts: prev.shifts.map(s =>
        s.id === shiftId
          ? {
            ...s,
            breaks: s.breaks.map((br, idx) =>
              idx === breakIndex ? { ...br, [field]: value } : br
            )
          }
          : s
      )
    }));
  };

  const addHoliday = () => {
    setFormData(prev => ({
      ...prev,
      holidays: [...prev.holidays, { date: '', name: '' }]
    }));
  };

  const removeHoliday = (index) => {
    setFormData(prev => ({
      ...prev,
      holidays: prev.holidays.filter((_, idx) => idx !== index)
    }));
  };

  const updateHoliday = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      holidays: prev.holidays.map((h, idx) =>
        idx === index ? { ...h, [field]: value } : h
      )
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shifts & Calendars</h1>
                <p className="text-sm text-gray-500 mt-1">Define working hours and schedules</p>
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
                  New Calendar
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search calendars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        } />

      {/* Calendars List */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredCalendars.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No calendars found</h3>
              <p className="text-gray-500 mb-4">Create your first calendar to get started</p>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Calendar
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCalendars.map(calendar => {
                const isExpanded = expandedCalendars[calendar.id];
                const workingHours = calculateWorkingHours(calendar.shifts, calendar.breaks);

                return (
                  <div key={calendar.id} className="hover:bg-gray-50 transition-colors">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <button
                            onClick={() => toggleCalendarExpand(calendar.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{calendar.name}</h3>
                              <span className="text-sm text-gray-500">({calendar.id})</span>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(calendar.status)}`}>
                                {calendar.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{calendar.workingDays.length} working days</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>{calendar.shifts.length} shift{calendar.shifts.length !== 1 ? 's' : ''}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>{workingHours} hrs/day</span>
                              </div>
                              {calendar.holidays.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <AlertCircle size={14} />
                                  <span>{calendar.holidays.length} holiday{calendar.holidays.length !== 1 ? 's' : ''}</span>
                                </div>
                              )}
                            </div>
                            {calendar.description && (
                              <div className="text-sm text-gray-500 mt-1">{calendar.description}</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openViewModal(calendar)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="View Details"
                          >
                            <Eye size={18} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleCopyCalendar(calendar)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="Copy Calendar"
                          >
                            <Copy size={18} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => openEditModal(calendar)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="Edit Calendar"
                          >
                            <Edit size={18} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteCalendar(calendar.id)}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="Delete Calendar"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 ml-12 space-y-4">
                          {/* Working Days */}
                          <div className="border border-gray-200 rounded-lg p-4 bg-white">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Working Days</h4>
                            <div className="flex flex-wrap gap-2">
                              {DAYS_OF_WEEK.map(day => (
                                <span
                                  key={day}
                                  className={`px-3 py-1 rounded text-sm ${calendar.workingDays.includes(day)
                                      ? 'bg-blue-100 text-blue-700 font-medium'
                                      : 'bg-gray-100 text-gray-400'
                                    }`}
                                >
                                  {day}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Shifts */}
                          <div className="border border-gray-200 rounded-lg p-4 bg-white">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Shifts</h4>
                            <div className="space-y-3">
                              {calendar.shifts.map((shift, idx) => (
                                <div key={shift.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                  <div className="flex items-start gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex-shrink-0">
                                      {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        {getShiftIcon(shift.name)}
                                        <span className="font-semibold text-gray-900">{shift.name}</span>
                                      </div>
                                      <div className="text-sm text-gray-600 space-y-1">
                                        <div>
                                          <span className="text-gray-500">Time:</span>
                                          <span className="ml-2 font-medium">
                                            {shift.startTime} - {shift.endTime} ({calculateShiftDuration(shift.startTime, shift.endTime)})
                                          </span>
                                        </div>
                                        {shift.breaks.length > 0 && (
                                          <div>
                                            <span className="text-gray-500">Breaks:</span>
                                            <div className="ml-2 mt-1 space-y-1">
                                              {shift.breaks.map((br, brIdx) => (
                                                <div key={brIdx} className="flex items-center gap-2">
                                                  <Coffee size={12} className="text-gray-400" />
                                                  <span className="text-xs">
                                                    {br.name}: {br.startTime} - {br.endTime}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Holidays */}
                          {calendar.holidays.length > 0 && (
                            <div className="border border-gray-200 rounded-lg p-4 bg-white">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">Holidays</h4>
                              <div className="space-y-2">
                                {calendar.holidays.map((holiday, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-900">{holiday.name}</span>
                                    <span className="text-gray-500">
                                      {new Date(holiday.date).toLocaleDateString()}
                                    </span>
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
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {viewMode === 'view' ? 'Calendar Details' : editingCalendar ? 'Edit Calendar' : 'Create New Calendar'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {viewMode === 'view' && editingCalendar ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Calendar ID</label>
                      <p className="mt-1 text-lg font-semibold">{editingCalendar.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-gray-900">{editingCalendar.name}</p>
                    </div>
                  </div>

                  {editingCalendar.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-gray-900">{editingCalendar.description}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Working Days</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <span
                          key={day}
                          className={`px-3 py-1 rounded text-sm ${editingCalendar.workingDays.includes(day)
                              ? 'bg-blue-100 text-blue-700 font-medium'
                              : 'bg-gray-100 text-gray-400 line-through'
                            }`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Shifts</label>
                    <div className="space-y-3">
                      {editingCalendar.shifts.map(shift => (
                        <div key={shift.id} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">{shift.name}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Time: {shift.startTime} - {shift.endTime}</div>
                            {shift.breaks.length > 0 && (
                              <div>
                                Breaks: {shift.breaks.map(br => `${br.name} (${br.startTime}-${br.endTime})`).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {editingCalendar.holidays.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">Holidays</label>
                      <div className="space-y-2">
                        {editingCalendar.holidays.map((holiday, idx) => (
                          <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                            <span>{holiday.name}</span>
                            <span className="text-gray-500">{new Date(holiday.date).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Calendar ID</label>
                        <input
                          type="text"
                          value={formData.id}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Standard 5-Day Week"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Brief description of this calendar..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Working Days */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Days *</h3>
                    <div className="grid grid-cols-7 gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <label
                          key={day}
                          className={`flex flex-col items-center px-3 py-3 border-2 rounded-lg cursor-pointer transition-colors ${formData.workingDays.includes(day)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.workingDays.includes(day)}
                            onChange={() => toggleWorkingDay(day)}
                            className="mb-2"
                          />
                          <span className="text-sm font-medium">{day.substring(0, 3)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Shifts */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Shifts *</h3>
                      <button
                        type="button"
                        onClick={addShift}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add Shift
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.shifts.map((shift, idx) => (
                        <div key={shift.id} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm flex-shrink-0">
                              {idx + 1}
                            </div>

                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-1">
                                    Shift Name *
                                  </label>
                                  <input
                                    type="text"
                                    value={shift.name}
                                    onChange={(e) => updateShift(shift.id, 'name', e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Day Shift"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-1">
                                    Start Time *
                                  </label>
                                  <input
                                    type="time"
                                    value={shift.startTime}
                                    onChange={(e) => updateShift(shift.id, 'startTime', e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-1">
                                    End Time *
                                  </label>
                                  <input
                                    type="time"
                                    value={shift.endTime}
                                    onChange={(e) => updateShift(shift.id, 'endTime', e.target.value)}
                                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>

                              {/* Breaks */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-xs font-medium text-gray-700">Breaks</label>
                                  <button
                                    type="button"
                                    onClick={() => addBreak(shift.id)}
                                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                  >
                                    <Plus size={14} />
                                    Add Break
                                  </button>
                                </div>
                                {shift.breaks.length > 0 && (
                                  <div className="space-y-2">
                                    {shift.breaks.map((br, brIdx) => (
                                      <div key={brIdx} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                                        <input
                                          type="text"
                                          value={br.name}
                                          onChange={(e) => updateBreak(shift.id, brIdx, 'name', e.target.value)}
                                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                          placeholder="Break name"
                                        />
                                        <input
                                          type="time"
                                          value={br.startTime}
                                          onChange={(e) => updateBreak(shift.id, brIdx, 'startTime', e.target.value)}
                                          className="w-24 px-2 py-1 text-xs border border-gray-300 rounded"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                          type="time"
                                          value={br.endTime}
                                          onChange={(e) => updateBreak(shift.id, brIdx, 'endTime', e.target.value)}
                                          className="w-24 px-2 py-1 text-xs border border-gray-300 rounded"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeBreak(shift.id, brIdx)}
                                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                                Duration: {calculateShiftDuration(shift.startTime, shift.endTime)}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeShift(shift.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Remove Shift"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Holidays */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Holidays (Optional)</h3>
                      <button
                        type="button"
                        onClick={addHoliday}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add Holiday
                      </button>
                    </div>

                    {formData.holidays.length > 0 ? (
                      <div className="space-y-2">
                        {formData.holidays.map((holiday, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <input
                              type="date"
                              value={holiday.date}
                              onChange={(e) => updateHoliday(idx, 'date', e.target.value)}
                              className="w-40 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={holiday.name}
                              onChange={(e) => updateHoliday(idx, 'name', e.target.value)}
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Holiday name"
                            />
                            <button
                              type="button"
                              onClick={() => removeHoliday(idx)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No holidays defined. Click "Add Holiday" to add one.</p>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <div className="font-medium mb-1">Calendar Summary</div>
                        <div className="space-y-1">
                          <div>Working Days: {formData.workingDays.length} days/week</div>
                          <div>Total Shifts: {formData.shifts.length}</div>
                          <div>Working Hours: {calculateWorkingHours(formData.shifts, [])} hrs/day</div>
                          <div>Holidays: {formData.holidays.length}</div>
                        </div>
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
              {viewMode === 'view' ? (
                <button
                  onClick={() => setViewMode('edit')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit size={18} />
                  Edit Calendar
                </button>
              ) : (
                <button
                  onClick={handleSaveCalendar}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Calendar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftsCalendarsMaster;