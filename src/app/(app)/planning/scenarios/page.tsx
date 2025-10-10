"use client";
import React, { useState } from 'react';
import { GitCompare, CheckCircle, XCircle, TrendingUp, TrendingDown, Minus, Clock, Target, DollarSign, AlertTriangle, Package, Download, RefreshCw, Eye } from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

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
    <div className="text-white">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <GitCompare className="w-7 h-7 text-sky-400" />
                Scenario Comparison
              </h1>
              <p className="text-sm text-white/60 mt-1">
                Compare planning scenarios side-by-side (TRS103)
              </p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Scenario Selection */}
        <div className="glass-card glass-card-default-padding mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Select Scenarios to Compare</h2>
            <span className="text-sm text-white/60">
              {selectedScenarios.length} of 4 selected
            </span>
          </div>

          <div className="flex gap-3 flex-wrap">
            {compareScenarios.map((scenario, idx) => (
              <div
                key={scenario.id}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {idx === 0 && (
                    <span className="px-2 py-0.5 bg-sky-500 text-white text-xs rounded font-medium">
                      Baseline
                    </span>
                  )}
                  <span className="font-medium">{scenario.name}</span>
                </div>
                <button
                  onClick={() => handleRemoveScenario(scenario.id)}
                  className="text-white/50 hover:text-rose-400"
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
                      e.target.value = "";
                    }
                  }}
                  className="px-4 py-2 border-2 border-dashed border-white/30 rounded-lg bg-white/5 text-white hover:border-sky-400 hover:text-sky-300 cursor-pointer"
                >
                  <option value="" className="select option">
                    + Add Scenario
                  </option>
                  {availableScenarios.map((scenario) => (
                    <option
                      key={scenario.id}
                      value={scenario.id}
                      className="select option"
                    >
                      {scenario.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Comparison Mode Tabs */}
        <div className="glass-card mb-6 px-0 pb-0 pt-2">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setComparisonMode("kpis")}
              className={`flex-1 px-6 py-3 font-medium border-b-2 transition-colors ${comparisonMode === "kpis"
                  ? "border-sky-400 text-sky-300"
                  : "border-transparent text-white/60 hover:text-white"
                }`}
            >
              KPIs Comparison
            </button>
            <button
              onClick={() => setComparisonMode("constraints")}
              className={`flex-1 px-6 py-3 font-medium border-b-2 transition-colors ${comparisonMode === "constraints"
                  ? "border-sky-400 text-sky-300"
                  : "border-transparent text-white/60 hover:text-white"
                }`}
            >
              Constraints & Conflicts
            </button>
            <button
              onClick={() => setComparisonMode("gantt")}
              className={`flex-1 px-6 py-3 font-medium border-b-2 transition-colors ${comparisonMode === "gantt"
                  ? "border-sky-400 text-sky-300"
                  : "border-transparent text-white/60 hover:text-white"
                }`}
            >
              Gantt Preview
            </button>
          </div>

          <div className="p-6">
            {/* KPIs Comparison */}
            {comparisonMode === "kpis" && (
              <div className="space-y-6">
                {/* KPI Cards Grid */}
                <div className="grid grid-cols-4 gap-4">
                  {kpiMetrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                      <div
                        key={metric.key}
                        className="bg-white/5 rounded-lg p-4 border border-white/10"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={`w-5 h-5 text-${metric.color}-400`} />
                          <h3 className="text-sm font-medium text-white/80">
                            {metric.label}
                          </h3>
                        </div>
                        <div className="space-y-2">
                          {compareScenarios.map((scenario, idx) => {
                            const value =
                              scenario.kpis[
                              metric.key as keyof typeof scenario.kpis
                              ] as number;
                            const comparison =
                              idx > 0
                                ? getComparison(
                                  value,
                                  baseline.kpis[
                                  metric.key as keyof typeof baseline.kpis
                                  ] as number,
                                  metric.inverse
                                )
                                : null;
                            const CompIcon = comparison?.icon;

                            return (
                              <div
                                key={scenario.id}
                                className="flex items-center justify-between"
                              >
                                <span className="text-xs text-white/60">
                                  {idx === 0 ? "Baseline" : `Plan ${idx + 1}`}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold">
                                    {metric.unit === "$" && "$"}
                                    {value.toLocaleString()}
                                    {metric.unit && metric.unit !== "$" && metric.unit}
                                  </span>
                                  {comparison && CompIcon && (
                                    <div
                                      className={`flex items-center gap-1 ${comparison.color}`}
                                    >
                                      <CompIcon className="w-3 h-3" />
                                      <span className="text-xs font-medium">
                                        {comparison.text}
                                      </span>
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
                    <thead className="bg-white/5 border-y border-white/10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">
                          Metric
                        </th>
                        {compareScenarios.map((scenario, idx) => (
                          <th
                            key={scenario.id}
                            className="px-4 py-3 text-center text-xs font-medium text-white/70 uppercase"
                          >
                            {idx === 0 ? "Baseline" : `Plan ${idx + 1}`}
                            <div className="text-xs text-white/50 font-normal mt-1">
                              {scenario.name}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {[
                        { key: "jobsScheduled", label: "Jobs Scheduled", unit: "" },
                        { key: "machinesUsed", label: "Machines Used", unit: "" },
                        { key: "makespan", label: "Total Makespan", unit: " hours" },
                        { key: "onTimeDelivery", label: "On-Time Delivery", unit: "%" },
                        { key: "totalTardiness", label: "Total Tardiness", unit: " min" },
                        { key: "avgUtilization", label: "Avg Utilization", unit: "%" },
                        { key: "changeoverCount", label: "Changeover Count", unit: "" },
                        { key: "totalChangeoverTime", label: "Changeover Time", unit: " min" },
                        { key: "wipCount", label: "WIP Count", unit: "" },
                        { key: "overtimeHours", label: "Overtime Hours", unit: " hrs" },
                        { key: "totalCost", label: "Total Cost", unit: "$" },
                      ].map((row) => (
                        <tr key={row.key} className="hover:bg-white/5">
                          <td className="px-4 py-3 text-sm font-medium">
                            {row.label}
                          </td>
                          {compareScenarios.map((scenario) => {
                            const value =
                              scenario.kpis[
                              row.key as keyof typeof scenario.kpis
                              ] as number;
                            return (
                              <td
                                key={scenario.id}
                                className="px-4 py-3 text-center text-sm font-medium"
                              >
                                {row.unit === "$" ? "$" : ""}
                                {value.toLocaleString()}
                                {row.unit !== "$" ? row.unit : ""}
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
                    <div
                      key={scenario.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{scenario.name}</h3>
                        {idx === 0 && (
                          <span className="px-2 py-1 bg-sky-500/20 text-sky-300 text-xs rounded font-medium">
                            Baseline
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Status:</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium border
                          ${scenario.status === "Active"
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-300/20"
                                : scenario.status === "Draft"
                                  ? "bg-amber-500/15 text-amber-300 border-amber-300/20"
                                  : "bg-white/10 text-white/80 border-white/10"
                              }`}
                          >
                            {scenario.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Created:</span>
                          <span>{scenario.createdAt}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">By:</span>
                          <span>{scenario.createdBy}</span>
                        </div>
                        <p className="text-xs text-white/70 mt-2 pt-2 border-t border-white/10">
                          {scenario.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints Comparison */}
            {comparisonMode === "constraints" && (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-y border-white/10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">
                          Constraint
                        </th>
                        {compareScenarios.map((scenario) => (
                          <th
                            key={scenario.id}
                            className="px-4 py-3 text-center text-xs font-medium text-white/70 uppercase"
                          >
                            {scenario.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {[
                        { key: "skillsChecked", label: "Skills Validated" },
                        { key: "pmRespected", label: "PM Windows Respected" },
                        { key: "toolsChecked", label: "Tool Availability Checked" },
                        { key: "inventoryChecked", label: "Inventory Verified" },
                      ].map((row) => (
                        <tr key={row.key} className="hover:bg-white/5">
                          <td className="px-4 py-3 text-sm font-medium">
                            {row.label}
                          </td>
                          {compareScenarios.map((scenario) => {
                            const value =
                              scenario.constraints[
                              row.key as keyof typeof scenario.constraints
                              ];
                            return (
                              <td key={scenario.id} className="px-4 py-3 text-center">
                                {typeof value === "boolean" ? (
                                  value ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
                                  ) : (
                                    <XCircle className="w-5 h-5 text-rose-400 mx-auto" />
                                  )
                                ) : (
                                  <span className="text-sm">{value}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr className="hover:bg-white/5 bg-amber-500/10">
                        <td className="px-4 py-3 text-sm font-medium">
                          Conflicts Found
                        </td>
                        {compareScenarios.map((scenario) => (
                          <td key={scenario.id} className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium
                            ${scenario.constraints.conflictsFound === 0
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-rose-500/15 text-rose-300"
                                }`}
                            >
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
            {comparisonMode === "gantt" && (
              <div className="space-y-4">
                {compareScenarios.map((scenario, idx) => (
                  <div
                    key={scenario.id}
                    className="border border-white/10 rounded-lg overflow-hidden"
                  >
                    <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{scenario.name}</h3>
                        {idx === 0 && (
                          <span className="px-2 py-1 bg-sky-500/20 text-sky-300 text-xs rounded font-medium">
                            Baseline
                          </span>
                        )}
                      </div>
                      <button className="flex items-center gap-2 px-3 py-1 bg-sky-500 text-white rounded text-sm hover:bg-sky-600">
                        <Eye className="w-4 h-4" />
                        View Full Gantt
                      </button>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-sky-500/10 to-violet-500/10 h-32 flex items-center justify-center">
                      <p className="text-white/70 text-sm">Gantt Chart Thumbnail Preview</p>
                    </div>
                    <div className="bg-white/5 px-4 py-2 border-t border-white/10 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-white/70">Makespan:</span>
                        <span className="font-medium ml-2">
                          {scenario.kpis.makespan} hrs
                        </span>
                      </div>
                      <div>
                        <span className="text-white/70">Jobs:</span>
                        <span className="font-medium ml-2">
                          {scenario.kpis.jobsScheduled}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/70">Machines:</span>
                        <span className="font-medium ml-2">
                          {scenario.kpis.machinesUsed}
                        </span>
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
          <div className="glass-card glass-card-default-padding bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-emerald-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Recommendation</h3>
                <p className="text-white/90 mb-4">
                  Based on the comparison,{" "}
                  <strong>{compareScenarios[1].name}</strong> offers the best balance
                  with {compareScenarios[1].kpis.onTimeDelivery}% on-time delivery
                  while maintaining {compareScenarios[1].kpis.avgUtilization}%
                  utilization.
                </p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Activate This Plan
                  </button>
                  <button className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 font-medium flex items-center gap-2">
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