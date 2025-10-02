"use client";

import React, { useState } from 'react';
import {
  Search, Filter, Download, Calendar, User, Activity,
  FileText, AlertCircle, CheckCircle, Edit, Trash2, Eye,
  Clock, ChevronDown, ChevronRight, Shield, Settings, Package,
  Upload,
  XCircle
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// Action types with icons
const ACTION_TYPES = {
  'CREATE': { label: 'Create', color: 'green', icon: CheckCircle },
  'UPDATE': { label: 'Update', color: 'blue', icon: Edit },
  'DELETE': { label: 'Delete', color: 'red', icon: Trash2 },
  'VIEW': { label: 'View', color: 'gray', icon: Eye },
  'LOGIN': { label: 'Login', color: 'purple', icon: User },
  'LOGOUT': { label: 'Logout', color: 'purple', icon: User },
  'EXPORT': { label: 'Export', color: 'orange', icon: Download },
  'IMPORT': { label: 'Import', color: 'orange', icon: Upload },
  'APPROVE': { label: 'Approve', color: 'green', icon: CheckCircle },
  'REJECT': { label: 'Reject', color: 'red', icon: XCircle },
};

// Entity types
const ENTITY_TYPES = [
  'Order',
  'Production Plan',
  'Machine',
  'Material',
  'Product',
  'Routing',
  'User',
  'Role',
  'Integration',
  'Shift Calendar',
  'Skills Matrix',
];

// Sample audit log data
const INITIAL_AUDIT_LOGS = [
  {
    id: 'LOG001',
    timestamp: '2025-10-02T09:45:23',
    userId: 'USR002',
    userName: 'John Smith',
    action: 'CREATE',
    entity: 'Production Plan',
    entityId: 'PLAN-2025-10-02-001',
    description: 'Created new production plan for October 2025',
    ipAddress: '192.168.1.105',
    changes: {
      status: 'Draft',
      totalJobs: 45,
      startDate: '2025-10-02',
      endDate: '2025-10-15'
    }
  },
  {
    id: 'LOG002',
    timestamp: '2025-10-02T09:30:15',
    userId: 'USR002',
    userName: 'John Smith',
    action: 'UPDATE',
    entity: 'Order',
    entityId: 'ORD003',
    description: 'Updated order priority from 2 to 1',
    ipAddress: '192.168.1.105',
    changes: {
      before: { priority: 2 },
      after: { priority: 1 }
    }
  },
  {
    id: 'LOG003',
    timestamp: '2025-10-02T09:15:00',
    userId: 'USR001',
    userName: 'System Administrator',
    action: 'LOGIN',
    entity: 'User',
    entityId: 'USR001',
    description: 'User logged in successfully',
    ipAddress: '192.168.1.100',
    changes: null
  },
  {
    id: 'LOG004',
    timestamp: '2025-10-02T09:00:45',
    userId: 'USR003',
    userName: 'Sarah Johnson',
    action: 'APPROVE',
    entity: 'Production Plan',
    entityId: 'PLAN-2025-09-28-005',
    description: 'Approved production plan for execution',
    ipAddress: '192.168.1.108',
    changes: {
      before: { status: 'Pending Approval' },
      after: { status: 'Approved' }
    }
  },
  {
    id: 'LOG005',
    timestamp: '2025-10-02T08:45:30',
    userId: 'USR006',
    userName: 'Emma Davis',
    action: 'UPDATE',
    entity: 'Machine',
    entityId: 'M001',
    description: 'Updated machine status from Idle to PM',
    ipAddress: '192.168.1.112',
    changes: {
      before: { status: 'Idle' },
      after: { status: 'PM', nextPMDate: '2025-10-15' }
    }
  },
  {
    id: 'LOG006',
    timestamp: '2025-10-02T08:30:20',
    userId: 'USR002',
    userName: 'John Smith',
    action: 'EXPORT',
    entity: 'Order',
    entityId: 'ALL',
    description: 'Exported all orders to CSV',
    ipAddress: '192.168.1.105',
    changes: {
      recordCount: 25,
      format: 'CSV'
    }
  },
  {
    id: 'LOG007',
    timestamp: '2025-10-02T08:15:10',
    userId: 'USR007',
    userName: 'Tom Anderson',
    action: 'CREATE',
    entity: 'Material',
    entityId: 'MAT-007',
    description: 'Created new material: Steel Plate 5mm',
    ipAddress: '192.168.1.115',
    changes: {
      code: 'MAT-007',
      name: 'Steel Plate 5mm',
      category: 'Raw Material'
    }
  },
  {
    id: 'LOG008',
    timestamp: '2025-10-02T08:00:00',
    userId: 'USR004',
    userName: 'Mike Chen',
    action: 'UPDATE',
    entity: 'User',
    entityId: 'USR008',
    description: 'Updated user role from Operator to Supervisor',
    ipAddress: '192.168.1.110',
    changes: {
      before: { roleId: 'ROLE004', roleName: 'Operator' },
      after: { roleId: 'ROLE003', roleName: 'Supervisor' }
    }
  },
  {
    id: 'LOG009',
    timestamp: '2025-10-01T17:45:00',
    userId: 'USR002',
    userName: 'John Smith',
    action: 'DELETE',
    entity: 'Production Plan',
    entityId: 'PLAN-2025-09-25-DRAFT',
    description: 'Deleted draft production plan',
    ipAddress: '192.168.1.105',
    changes: {
      reason: 'Outdated draft'
    }
  },
  {
    id: 'LOG010',
    timestamp: '2025-10-01T17:30:00',
    userId: 'USR001',
    userName: 'System Administrator',
    action: 'CREATE',
    entity: 'Integration',
    entityId: 'INT004',
    description: 'Created new ERP integration',
    ipAddress: '192.168.1.100',
    changes: {
      type: 'ERP',
      name: 'SAP ERP',
      status: 'Active'
    }
  },
];

const AuditLogSystem = () => {
  const [logs, setLogs] = useState(INITIAL_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [expandedLogs, setExpandedLogs] = useState({});
  const [selectedLog, setSelectedLog] = useState(null);

  const getActionColor = (action) => {
    return ACTION_TYPES[action]?.color || 'gray';
  };

  const getActionIcon = (action) => {
    const ActionIcon = ACTION_TYPES[action]?.icon || Activity;
    return <ActionIcon size={16} />;
  };

  const formatTimestamp = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const uniqueUsers = [...new Set(logs.map(log => log.userName))];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesEntity = filterEntity === 'all' || log.entity === filterEntity;
    const matchesUser = filterUser === 'all' || log.userName === filterUser;

    let matchesDateRange = true;
    if (dateRange.from) {
      matchesDateRange = matchesDateRange && new Date(log.timestamp) >= new Date(dateRange.from);
    }
    if (dateRange.to) {
      matchesDateRange = matchesDateRange && new Date(log.timestamp) <= new Date(dateRange.to + 'T23:59:59');
    }

    return matchesSearch && matchesAction && matchesEntity && matchesUser && matchesDateRange;
  });

  const toggleLogExpand = (id) => {
    setExpandedLogs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const viewLogDetails = (log) => {
    setSelectedLog(log);
  };

  const closeDetails = () => {
    setSelectedLog(null);
  };

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Entity', 'Entity ID', 'Description', 'IP Address'],
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.userName,
        log.action,
        log.entity,
        log.entityId,
        log.description,
        log.ipAddress
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAction('all');
    setFilterEntity('all');
    setFilterUser('all');
    setDateRange({ from: '', to: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
                <p className="text-sm text-gray-500 mt-1">Track all system activities and changes</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Filter size={18} />
                  Clear Filters
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download size={18} />
                  Export Logs
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-6 gap-4 mt-4">
              <div className="col-span-2 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Actions</option>
                {Object.entries(ACTION_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Entities</option>
                {ENTITY_TYPES.map(entity => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-400" />
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="From"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="To"
                />
              </div>
              <div className="text-sm text-gray-600 flex items-center">
                Showing {filteredLogs.length} of {logs.length} log entries
              </div>
            </div>
          </div>
        }
      />

      {/* Logs List */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Activity size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLogs.map(log => {
                const isExpanded = expandedLogs[log.id];

                return (
                  <div key={log.id} className="hover:bg-gray-50 transition-colors">
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleLogExpand(log.id)}
                          className="p-1 hover:bg-gray-200 rounded mt-1"
                        >
                          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </button>

                        <div className={`w-10 h-10 rounded-lg bg-${getActionColor(log.action)}-100 flex items-center justify-center flex-shrink-0 mt-1`}>
                          <div className={`text-${getActionColor(log.action)}-600`}>
                            {getActionIcon(log.action)}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded bg-${getActionColor(log.action)}-100 text-${getActionColor(log.action)}-700 font-medium`}>
                                  {ACTION_TYPES[log.action]?.label || log.action}
                                </span>
                                <span className="text-sm font-medium text-gray-900">{log.entity}</span>
                                <span className="text-sm text-gray-500">#{log.entityId}</span>
                              </div>

                              <p className="text-sm text-gray-700 mb-2">{log.description}</p>

                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <User size={12} />
                                  <span>{log.userName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>{formatTimestamp(log.timestamp)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Activity size={12} />
                                  <span>{log.ipAddress}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => viewLogDetails(log)}
                              className="p-2 hover:bg-gray-200 rounded text-gray-600"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && log.changes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="text-xs font-medium text-gray-700 mb-2">Changes:</div>
                              <pre className="text-xs text-gray-800 font-mono overflow-x-auto">
                                {JSON.stringify(log.changes, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Audit Log Details</h2>
              <button onClick={closeDetails} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-lg bg-${getActionColor(selectedLog.action)}-100 flex items-center justify-center`}>
                    <div className={`text-${getActionColor(selectedLog.action)}-600`}>
                      {getActionIcon(selectedLog.action)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedLog.description}</h3>
                    <p className="text-sm text-gray-500">{selectedLog.entity} #{selectedLog.entityId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Action</label>
                    <p className="mt-1">
                      <span className={`text-sm px-2 py-1 rounded bg-${getActionColor(selectedLog.action)}-100 text-${getActionColor(selectedLog.action)}-700`}>
                        {ACTION_TYPES[selectedLog.action]?.label}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Log ID</label>
                    <p className="mt-1 text-gray-900 font-mono text-sm">{selectedLog.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">User</label>
                    <p className="mt-1 text-gray-900">{selectedLog.userName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">User ID</label>
                    <p className="mt-1 text-gray-900 font-mono text-sm">{selectedLog.userId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="mt-1 text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">IP Address</label>
                    <p className="mt-1 text-gray-900 font-mono text-sm">{selectedLog.ipAddress}</p>
                  </div>
                </div>

                {selectedLog.changes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Changes</label>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <pre className="text-sm text-gray-800 font-mono overflow-x-auto">
                        {JSON.stringify(selectedLog.changes, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeDetails}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogSystem;