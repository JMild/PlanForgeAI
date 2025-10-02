"use client";
import React, { useState } from 'react';
import { GitCompare, CheckCircle, XCircle, TrendingUp, TrendingDown, Minus, Calendar, Clock, Target, Users, DollarSign, AlertTriangle, Package, ArrowRight, Download, RefreshCw, Eye } from 'lucide-react';

// Types
type Scenario = {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  description: string;
  status: 'Draft' | 'Active' | 'Archived';
  kpis: {
    makespan: number; // hours
    onTimeDelivery: number; // percentage
    totalTardiness: number; // minutes
    avgUtilization: number; // percentage
    changeoverCount: number;
    totalChangeoverTime: number; // minutes
    wipCount: number;
    overtimeHours: number;
    totalCost: number;
    jobsScheduled: number;
    machinesUsed: number;
  };
  constraints: {
    skillsChecked: boolean;
    pmRespected: boolean;
    toolsChecked: boolean;
    inventoryChecked: boolean;
    conflictsFound: number;
  };
};

const App = () => {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['SC001', 'SC002']);
  const [comparisonMode, setComparisonMode] = useState<'kpis' | 'constraints' | 'gantt'>('kpis');

  // Sample scenarios
  const scenarios: Scenario[] = [
    {
      id: 'SC001',
      name: 'Baseline Plan',
      createdAt: '2025-10-01 14:30',
      createdBy: 'John Planner',
      description: 'Initial automated plan with balanced objectives',
      status: 'Active',
      kpis: {
        makespan: 168,
        onTimeDelivery: 85.5,
        totalTardiness: 2450,
        avgUtilization: 72.3,
        changeoverCount: 45,
        totalChangeoverTime: 340,
        wipCount: 28,
        overtimeHours: 12,
        totalCost: 45600,
        jobsScheduled: 156,
        machinesUsed: 12
      },
      constraints: {
        skillsChecked: true,
        pmRespected: true,
        toolsChecked: true,
        inventoryChecked: true,
        conflictsFound: 0
      }
    },
    {
      id: 'SC002',
      name: 'On-Time Optimized',
      createdAt: '2025-10-01 15:45',
      createdBy: 'John Planner',
      description: 'Prioritizes on-time delivery (60% weight)',
      status: 'Draft',
      kpis: {
        makespan: 184,
        onTimeDelivery: 94.2,
        totalTardiness: 680,
        avgUtilization: 68.5,
        changeoverCount: 52,
        totalChangeoverTime: 390,
        wipCount: 32,
        overtimeHours: 18,
        totalCost: 48200,
        jobsScheduled: 156,
        machinesUsed: 12
      },
      constraints: {
        skillsChecked: true,
        pmRespected: true,
        toolsChecked: true,
        inventoryChecked: true,
        conflictsFound: 0
      }
    },
    {
      id: 'SC003',
      name: 'High Utilization',
      createdAt: '2025-10-01 16:20',
      createdBy: 'Sarah Supervisor',
      description: 'Maximizes machine utilization (50% weight)',
      status: 'Draft',
      kpis: {
        makespan: 176,
        onTimeDelivery: 82.8,
        totalTardiness: 3120,
        avgUtilization: 81.7,
        changeoverCount: 38,
        totalChangeoverTime: 285,
        wipCount: 22,
        overtimeHours: 8,
        totalCost: 43800,
        jobsScheduled: 156,
        machinesUsed: 11
      },
      constraints: {
        skillsChecked: true,
        pmRespected: true,
        toolsChecked: true,
        inventoryChecked: false,
        conflictsFound: 2
      }
    },
    {
      id: 'SC004',
      name: 'Low Changeover',
      createdAt: '2025-10-02 09:15',
      createdBy: 'John Planner',
      description: 'Minimizes setup changes (40% weight)',
      status: 'Draft',
      kpis: {
        makespan: 172,
        onTimeDelivery: 88.3,
        totalTardiness: 1850,
        avgUtilization: 75.9,
        changeoverCount: 32,
        totalChangeoverTime: 245,
        wipCount: 26,
        overtimeHours: 10,
        totalCost: 44200,
        jobsScheduled: 156,
        machinesUsed: 12
      },
      constraints: {
        skillsChecked: true,
        pmRespected: true,
        toolsChecked: true,
        inventoryChecked: true,
        conflictsFound: 0
      }
    }
  ];

  const availableScenarios = scenarios.filter(s => !selectedScenarios.includes(s.id));
  const compareScenarios = scenarios.filter(s => selectedScenarios.includes(s.id));

  const handleAddScenario = (scenarioId: string) => {
    if (selectedScenarios.length < 4) {
      setSelectedScenarios([...selectedScenarios, scenarioId]);
    }
  };

  const handleRemoveScenario = (scenarioId: string) => {
    setSelectedScenarios(selectedScenarios.filter(id => id !== scenarioId));
  };

  const getComparison = (value: number, baseline: number, inverse: boolean = false) => {
    const diff = value - baseline;
    const isPositive = inverse ? diff < 0 : diff > 0;
    const percentage = ((Math.abs(diff) / baseline) * 100).toFixed(1);
    
    if (Math.abs(diff) < 0.01) return { icon: Minus, color: 'text-gray-400', text: 'Same' };
    
    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      text: `${isPositive ? '+' : '-'}${percentage}%`
    };
  };

  const kpiMetrics = [
    { key: 'onTimeDelivery', label: 'On-Time Delivery', unit: '%', icon: Target, inverse: false, color: 'blue' },
    { key: 'avgUtilization', label: 'Avg Utilization', unit: '%', icon: TrendingUp, inverse: false, color: 'green' },
    { key: 'makespan', label: 'Makespan', unit: 'hrs', icon: Clock, inverse: true, color: 'purple' },
    { key: 'totalTardiness', label: 'Total Tardiness', unit: 'min', icon: AlertTriangle, inverse: true, color: 'orange' },
    { key: 'changeoverCount', label: 'Changeovers', unit: '', icon: RefreshCw, inverse: true, color: 'yellow' },
    { key: 'wipCount', label: 'WIP Jobs', unit: '', icon: Package, inverse: true, color: 'indigo' },
    { key: 'totalCost', label: 'Total Cost', unit: '$', icon: DollarSign, inverse: true, color: 'red' },
  ];

  const baseline = compareScenarios[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <GitCompare className="w-7 h-7 text-blue-600" />
                Scenario Comparison
              </h1>
              <p className="text-sm text-gray-500 mt-1">Compare planning scenarios side-by-side (TRS103)</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Scenario Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Select Scenarios to Compare</h2>
            <span className="text-sm text-gray-500">
              {selectedScenarios.length} of 4 selected
            </span>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            {compareScenarios.map((scenario, idx) => (
              <div
                key={scenario.id}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {idx === 0 && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded font-medium">
                      Baseline
                    </span>
                  )}
                  <span className="font-medium text-gray-900">{scenario.name}</span>
                </div>
                <button
                  onClick={() => handleRemoveScenario(scenario.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {selectedScenarios.length < 4 && availableScenarios.length > 0 && (
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddScenario(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 cursor-pointer"
                >
                  <option value="">+ Add Scenario</option>
                  {availableScenarios.map(scenario => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Comparison Mode Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setComparisonMode('kpis')}
              className={`flex-1 px-6 py-3 font-medium border-b-2 transition-colors ${
                comparisonMode === 'kpis'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              KPIs Comparison
            </button>
            <button
              onClick={() => setComparisonMode('constraints')}
              className={`flex-1 px-6 py-3 font-medium border-b-2 transition-colors ${
                comparisonMode === 'constraints'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Constraints & Conflicts
            </button>
            <button
              onClick={() => setComparisonMode('gantt')}
              className={`flex-1 px-6 py-3 font-medium border-b-2 transition-colors ${
                comparisonMode === 'gantt'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Gantt Preview
            </button>
          </div>

          <div className="p-6">
            {/* KPIs Comparison */}
            {comparisonMode === 'kpis' && (
              <div className="space-y-6">
                {/* KPI Cards Grid */}
                <div className="grid grid-cols-4 gap-4">
                  {kpiMetrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                      <div key={metric.key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={`w-5 h-5 text-${metric.color}-600`} />
                          <h3 className="text-sm font-medium text-gray-700">{metric.label}</h3>
                        </div>
                        <div className="space-y-2">
                          {compareScenarios.map((scenario, idx) => {
                            const value = scenario.kpis[metric.key as keyof typeof scenario.kpis] as number;
                            const comparison = idx > 0 ? getComparison(value, baseline.kpis[metric.key as keyof typeof baseline.kpis] as number, metric.inverse) : null;
                            const CompIcon = comparison?.icon;
                            
                            return (
                              <div key={scenario.id} className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">{idx === 0 ? 'Baseline' : `Plan ${idx + 1}`}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-gray-900">
                                    {metric.unit === '$' && '$'}
                                    {value.toLocaleString()}
                                    {metric.unit && metric.unit !== '$' && metric.unit}
                                  </span>
                                  {comparison && CompIcon && (
                                    <div className={`flex items-center gap-1 ${comparison.color}`}>
                                      <CompIcon className="w-3 h-3" />
                                      <span className="text-xs font-medium">{comparison.text}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-y border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                        {compareScenarios.map((scenario, idx) => (
                          <th key={scenario.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            {idx === 0 ? 'Baseline' : `Plan ${idx + 1}`}
                            <div className="text-xs text-gray-400 font-normal mt-1">{scenario.name}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[
                        { key: 'jobsScheduled', label: 'Jobs Scheduled', unit: '' },
                        { key: 'machinesUsed', label: 'Machines Used', unit: '' },
                        { key: 'makespan', label: 'Total Makespan', unit: ' hours' },
                        { key: 'onTimeDelivery', label: 'On-Time Delivery', unit: '%' },
                        { key: 'totalTardiness', label: 'Total Tardiness', unit: ' min' },
                        { key: 'avgUtilization', label: 'Avg Utilization', unit: '%' },
                        { key: 'changeoverCount', label: 'Changeover Count', unit: '' },
                        { key: 'totalChangeoverTime', label: 'Changeover Time', unit: ' min' },
                        { key: 'wipCount', label: 'WIP Count', unit: '' },
                        { key: 'overtimeHours', label: 'Overtime Hours', unit: ' hrs' },
                        { key: 'totalCost', label: 'Total Cost', unit: '$' },
                      ].map((row) => (
                        <tr key={row.key} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.label}</td>
                          {compareScenarios.map((scenario) => {
                            const value = scenario.kpis[row.key as keyof typeof scenario.kpis] as number;
                            return (
                              <td key={scenario.id} className="px-4 py-3 text-center text-sm text-gray-900 font-medium">
                                {row.unit === '$' ? '$' : ''}{value.toLocaleString()}{row.unit !== '$' ? row.unit : ''}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Scenario Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {compareScenarios.map((scenario, idx) => (
                    <div key={scenario.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                        {idx === 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                            Baseline
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            scenario.status === 'Active' ? 'bg-green-100 text-green-800' :
                            scenario.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {scenario.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="text-gray-900">{scenario.createdAt}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">By:</span>
                          <span className="text-gray-900">{scenario.createdBy}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200">
                          {scenario.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints Comparison */}
            {comparisonMode === 'constraints' && (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-y border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Constraint</th>
                        {compareScenarios.map((scenario) => (
                          <th key={scenario.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            {scenario.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[
                        { key: 'skillsChecked', label: 'Skills Validated' },
                        { key: 'pmRespected', label: 'PM Windows Respected' },
                        { key: 'toolsChecked', label: 'Tool Availability Checked' },
                        { key: 'inventoryChecked', label: 'Inventory Verified' },
                      ].map((row) => (
                        <tr key={row.key} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.label}</td>
                          {compareScenarios.map((scenario) => {
                            const value = scenario.constraints[row.key as keyof typeof scenario.constraints];
                            return (
                              <td key={scenario.id} className="px-4 py-3 text-center">
                                {typeof value === 'boolean' ? (
                                  value ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                                  ) : (
                                    <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                                  )
                                ) : (
                                  <span className="text-sm text-gray-900">{value}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr className="hover:bg-gray-50 bg-yellow-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Conflicts Found</td>
                        {compareScenarios.map((scenario) => (
                          <td key={scenario.id} className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                              scenario.constraints.conflictsFound === 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {scenario.constraints.conflictsFound === 0 ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <AlertTriangle className="w-4 h-4" />
                              )}
                              {scenario.constraints.conflictsFound}
                            </span>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Gantt Preview */}
            {comparisonMode === 'gantt' && (
              <div className="space-y-4">
                {compareScenarios.map((scenario, idx) => (
                  <div key={scenario.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                        {idx === 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                            Baseline
                          </span>
                        )}
                      </div>
                      <button className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        <Eye className="w-4 h-4" />
                        View Full Gantt
                      </button>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 h-32 flex items-center justify-center">
                      <p className="text-gray-500 text-sm">Gantt Chart Thumbnail Preview</p>
                    </div>
                    <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Makespan:</span>
                        <span className="font-medium text-gray-900 ml-2">{scenario.kpis.makespan} hrs</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Jobs:</span>
                        <span className="font-medium text-gray-900 ml-2">{scenario.kpis.jobsScheduled}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Machines:</span>
                        <span className="font-medium text-gray-900 ml-2">{scenario.kpis.machinesUsed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recommendation */}
        {compareScenarios.length >= 2 && (
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommendation</h3>
                <p className="text-gray-700 mb-4">
                  Based on the comparison, <strong>{compareScenarios[1].name}</strong> offers the best balance with {compareScenarios[1].kpis.onTimeDelivery}% on-time delivery while maintaining {compareScenarios[1].kpis.avgUtilization}% utilization.
                </p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Activate This Plan
                  </button>
                  <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View in Planner
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;