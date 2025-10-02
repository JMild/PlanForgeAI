"use client";

import React, { useState } from 'react';
import { Save, RefreshCw, Building, Globe, Sliders, Bell, Database, Key, Shield, Cpu, CheckCircle, AlertCircle } from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';

// Types
type CompanySettings = {
  companyName: string;
  industry: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo?: string;
};

type SystemSettings = {
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  language: string;
  weekStartDay: 'Sunday' | 'Monday';
  fiscalYearStart: string;
};

type PlanningGranularity = 'Minute' | 'Hour' | 'Shift' | 'Day';

type PlanningSettings = {
  defaultHorizonDays: number;
  planningGranularity: PlanningGranularity;
  autoReplanEnabled: boolean;
  replanTriggerDelay: number;
  bufferTimeMinutes: number;
  overtimeAllowed: boolean;
  maxOvertimePercent: number;
  considerSkills: boolean;
  considerToolAvailability: boolean;
};

type ObjectiveWeights = {
  onTimeDelivery: number;
  utilizationMax: number;
  changeoverMin: number;
  wipMin: number;
  costMin: number;
};

type EngineSettings = {
  algorithm: 'Genetic Algorithm' | 'Constraint Programming' | 'Heuristic' | 'Hybrid';
  populationSize: number;
  maxIterations: number;
  timeoutSeconds: number;
  convergenceThreshold: number;
  parallelThreads: number;
};

type NotificationSettings = {
  emailEnabled: boolean;
  emailRecipients: string[];
  notifyOnPlanComplete: boolean;
  notifyOnConflicts: boolean;
  notifyOnLateOrders: boolean;
  notifyOnMaintenance: boolean;
  notifyOnLowInventory: boolean;
};

type IntegrationSettings = {
  emsEnabled: boolean;
  emsApiUrl: string;
  emsApiKey: string;
  emsPollInterval: number;
  erpEnabled: boolean;
  erpApiUrl: string;
  erpApiKey: string;
  erpSyncInterval: number;
};

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState<string>('company');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const granularityOptions: PlanningGranularity[] = ['Minute', 'Hour', 'Shift', 'Day'];

  // Settings State
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: 'ACME Manufacturing Co.',
    industry: 'Automotive Parts',
    address: '123 Industrial Park, Bangkok 10110, Thailand',
    phone: '+66-2-123-4567',
    email: 'contact@acme-mfg.com',
    website: 'www.acme-mfg.com',
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    timezone: 'Asia/Bangkok',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    currency: 'THB',
    language: 'en-US',
    weekStartDay: 'Monday',
    fiscalYearStart: '01-01',
  });

  const [planningSettings, setPlanningSettings] = useState<PlanningSettings>({
    defaultHorizonDays: 14,
    planningGranularity: 'Hour',
    autoReplanEnabled: true,
    replanTriggerDelay: 30,
    bufferTimeMinutes: 15,
    overtimeAllowed: true,
    maxOvertimePercent: 20,
    considerSkills: true,
    considerToolAvailability: true,
  });

  const [objectiveWeights, setObjectiveWeights] = useState<ObjectiveWeights>({
    onTimeDelivery: 40,
    utilizationMax: 25,
    changeoverMin: 15,
    wipMin: 10,
    costMin: 10,
  });

  const [engineSettings, setEngineSettings] = useState<EngineSettings>({
    algorithm: 'Genetic Algorithm',
    populationSize: 100,
    maxIterations: 500,
    timeoutSeconds: 300,
    convergenceThreshold: 0.01,
    parallelThreads: 4,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    emailRecipients: ['planner@acme-mfg.com', 'supervisor@acme-mfg.com'],
    notifyOnPlanComplete: true,
    notifyOnConflicts: true,
    notifyOnLateOrders: true,
    notifyOnMaintenance: true,
    notifyOnLowInventory: false,
  });

  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    emsEnabled: false,
    emsApiUrl: 'https://ems.acme-mfg.com/api',
    emsApiKey: '',
    emsPollInterval: 60,
    erpEnabled: false,
    erpApiUrl: 'https://erp.acme-mfg.com/api',
    erpApiKey: '',
    erpSyncInterval: 300,
  });

  const handleSave = async () => {
    setSaveStatus('saving');
    setHasChanges(false);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default values?')) {
      setSaveStatus('idle');
      setHasChanges(false);
    }
  };

  const markChanged = () => {
    if (!hasChanges) setHasChanges(true);
  };

  const totalWeight = Object.values(objectiveWeights).reduce((sum, val) => sum + val, 0);

  const sections = [
    { id: 'company', name: 'Company Profile', icon: Building },
    { id: 'system', name: 'System Settings', icon: Globe },
    { id: 'planning', name: 'Planning Parameters', icon: Sliders },
    { id: 'objectives', name: 'Objective Weights', icon: Cpu },
    { id: 'engine', name: 'Planning Engine', icon: Database },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'integrations', name: 'Integrations', icon: Key },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-7 h-7 text-blue-600" />
                  System Settings & Configuration
                </h1>
                <p className="text-sm text-gray-500 mt-1">Configure system parameters and preferences</p>
              </div>
              <div className="flex gap-2">
                {hasChanges && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Unsaved changes
                  </div>
                )}
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saveStatus === 'saving'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        }
      />

      {/* Save Status */}
      {saveStatus === 'success' && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Settings saved successfully!</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === section.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      {section.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Company Profile */}
              {activeSection === 'company' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Company Profile</h2>
                    <p className="text-sm text-gray-500">Basic information about your organization</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={companySettings.companyName}
                        onChange={(e) => {
                          setCompanySettings({ ...companySettings, companyName: e.target.value });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                      <input
                        type="text"
                        value={companySettings.industry}
                        onChange={(e) => {
                          setCompanySettings({ ...companySettings, industry: e.target.value });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={companySettings.address}
                      onChange={(e) => {
                        setCompanySettings({ ...companySettings, address: e.target.value });
                        markChanged();
                      }}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={companySettings.phone}
                        onChange={(e) => {
                          setCompanySettings({ ...companySettings, phone: e.target.value });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={companySettings.email}
                        onChange={(e) => {
                          setCompanySettings({ ...companySettings, email: e.target.value });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="text"
                        value={companySettings.website}
                        onChange={(e) => {
                          setCompanySettings({ ...companySettings, website: e.target.value });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* System Settings */}
              {activeSection === 'system' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">System Settings</h2>
                    <p className="text-sm text-gray-500">Configure regional and display preferences</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                      <select
                        value={systemSettings.timezone}
                        onChange={(e) => {
                          setSystemSettings({ ...systemSettings, timezone: e.target.value });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                        <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                      <select
                        value={systemSettings.language}
                        onChange={(e) => {
                          setSystemSettings({ ...systemSettings, language: e.target.value });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="en-US">English (US)</option>
                        <option value="th-TH">ไทย (Thai)</option>
                        <option value="zh-CN">中文 (Chinese)</option>
                        <option value="ja-JP">日本語 (Japanese)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                      <select
                        value={systemSettings.dateFormat}
                        onChange={(e) => {
                          setSystemSettings({ ...systemSettings, dateFormat: e.target.value });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
                      <select
                        value={systemSettings.timeFormat}
                        onChange={(e) => {
                          setSystemSettings({ ...systemSettings, timeFormat: e.target.value as '12h' | '24h' });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="24h">24-hour</option>
                        <option value="12h">12-hour (AM/PM)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select
                        value={systemSettings.currency}
                        onChange={(e) => {
                          setSystemSettings({ ...systemSettings, currency: e.target.value });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="THB">THB (฿)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="JPY">JPY (¥)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Week Start Day</label>
                      <select
                        value={systemSettings.weekStartDay}
                        onChange={(e) => {
                          setSystemSettings({ ...systemSettings, weekStartDay: e.target.value as 'Sunday' | 'Monday' });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Monday">Monday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year Start (MM-DD)</label>
                      <input
                        type="text"
                        value={systemSettings.fiscalYearStart}
                        onChange={(e) => {
                          setSystemSettings({ ...systemSettings, fiscalYearStart: e.target.value });
                          markChanged();
                        }}
                        placeholder="01-01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Planning Parameters */}
              {activeSection === 'planning' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Planning Parameters</h2>
                    <p className="text-sm text-gray-500">Configure production planning behavior</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Default Planning Horizon (days)</label>
                      <input
                        type="number"
                        value={planningSettings.defaultHorizonDays}
                        onChange={(e) => {
                          setPlanningSettings({ ...planningSettings, defaultHorizonDays: parseInt(e.target.value) || 0 });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Planning Granularity</label>
                      <select
                        value={planningSettings.planningGranularity}
                        onChange={(e) => {
                          const value = e.target.value as PlanningGranularity;
                          setPlanningSettings({ ...planningSettings, planningGranularity: value });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {granularityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Buffer Time (minutes)</label>
                      <input
                        type="number"
                        value={planningSettings.bufferTimeMinutes}
                        onChange={(e) => {
                          setPlanningSettings({ ...planningSettings, bufferTimeMinutes: parseInt(e.target.value) || 0 });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Replan Delay (minutes)</label>
                      <input
                        type="number"
                        value={planningSettings.replanTriggerDelay}
                        onChange={(e) => {
                          setPlanningSettings({ ...planningSettings, replanTriggerDelay: parseInt(e.target.value) || 0 });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={planningSettings.autoReplanEnabled}
                        onChange={(e) => {
                          setPlanningSettings({ ...planningSettings, autoReplanEnabled: e.target.checked });
                          markChanged();
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable Automatic Replanning</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={planningSettings.overtimeAllowed}
                        onChange={(e) => {
                          setPlanningSettings({ ...planningSettings, overtimeAllowed: e.target.checked });
                          markChanged();
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Allow Overtime</span>
                    </label>
                    {planningSettings.overtimeAllowed && (
                      <div className="ml-7">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Overtime (%)</label>
                        <input
                          type="number"
                          value={planningSettings.maxOvertimePercent}
                          onChange={(e) => {
                            setPlanningSettings({ ...planningSettings, maxOvertimePercent: parseInt(e.target.value) || 0 });
                            markChanged();
                          }}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={planningSettings.considerSkills}
                        onChange={(e) => {
                          setPlanningSettings({ ...planningSettings, considerSkills: e.target.checked });
                          markChanged();
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Consider Personnel Skills</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={planningSettings.considerToolAvailability}
                        onChange={(e) => {
                          setPlanningSettings({ ...planningSettings, considerToolAvailability: e.target.checked });
                          markChanged();
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Check Tool Availability</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Objective Weights */}
              {activeSection === 'objectives' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Objective Weights</h2>
                    <p className="text-sm text-gray-500">Define optimization priorities (total must equal 100%)</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-gray-900">Total Weight</span>
                      <span className={`text-3xl font-bold ${totalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalWeight}%
                      </span>
                    </div>
                    {totalWeight !== 100 && (
                      <div className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Total weight must equal 100%
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {[
                      { key: 'onTimeDelivery', label: 'On-Time Delivery', color: 'blue' },
                      { key: 'utilizationMax', label: 'Maximize Utilization', color: 'green' },
                      { key: 'changeoverMin', label: 'Minimize Changeovers', color: 'yellow' },
                      { key: 'wipMin', label: 'Minimize WIP', color: 'purple' },
                      { key: 'costMin', label: 'Minimize Cost', color: 'red' },
                    ].map((obj) => {
                      const value = objectiveWeights[obj.key as keyof ObjectiveWeights];
                      return (
                        <div key={obj.key}>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">{obj.label}</label>
                            <span className="text-lg font-bold text-gray-900">{value}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={value}
                            onChange={(e) => {
                              setObjectiveWeights({ ...objectiveWeights, [obj.key]: parseInt(e.target.value) });
                              markChanged();
                            }}
                            className="w-full"
                          />
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className={`bg-${obj.color}-500 h-2 rounded-full transition-all`}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Presets</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setObjectiveWeights({ onTimeDelivery: 50, utilizationMax: 20, changeoverMin: 10, wipMin: 10, costMin: 10 });
                          markChanged();
                        }}
                        className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                      >
                        Delivery Focus
                      </button>
                      <button
                        onClick={() => {
                          setObjectiveWeights({ onTimeDelivery: 20, utilizationMax: 40, changeoverMin: 20, wipMin: 10, costMin: 10 });
                          markChanged();
                        }}
                        className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium"
                      >
                        Utilization Focus
                      </button>
                      <button
                        onClick={() => {
                          setObjectiveWeights({ onTimeDelivery: 25, utilizationMax: 25, changeoverMin: 20, wipMin: 15, costMin: 15 });
                          markChanged();
                        }}
                        className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-medium"
                      >
                        Balanced
                      </button>
                      <button
                        onClick={() => {
                          setObjectiveWeights({ onTimeDelivery: 30, utilizationMax: 20, changeoverMin: 20, wipMin: 10, costMin: 20 });
                          markChanged();
                        }}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium"
                      >
                        Cost Saving
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Engine Settings */}
              {activeSection === 'engine' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Planning Engine</h2>
                    <p className="text-sm text-gray-500">Configure optimization engine behavior</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Algorithm</label>
                      <select
                        value={engineSettings.algorithm}
                        onChange={(e) => {
                          const value = e.target.value as EngineSettings['algorithm'];
                          setEngineSettings({ ...engineSettings, algorithm: value });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="Genetic Algorithm">Genetic Algorithm</option>
                        <option value="Constraint Programming">Constraint Programming</option>
                        <option value="Heuristic">Heuristic</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Population Size</label>
                      <input
                        type="number"
                        value={engineSettings.populationSize}
                        onChange={(e) => {
                          setEngineSettings({ ...engineSettings, populationSize: parseInt(e.target.value) });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Iterations</label>
                      <input
                        type="number"
                        value={engineSettings.maxIterations}
                        onChange={(e) => {
                          setEngineSettings({ ...engineSettings, maxIterations: parseInt(e.target.value) });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (s)</label>
                      <input
                        type="number"
                        value={engineSettings.timeoutSeconds}
                        onChange={(e) => {
                          setEngineSettings({ ...engineSettings, timeoutSeconds: parseInt(e.target.value) });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Threads</label>
                      <input
                        type="number"
                        value={engineSettings.parallelThreads}
                        onChange={(e) => {
                          setEngineSettings({ ...engineSettings, parallelThreads: parseInt(e.target.value) });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Notifications</h2>
                    <p className="text-sm text-gray-500">Set up alerts and notifications</p>
                  </div>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailEnabled}
                      onChange={(e) => {
                        setNotificationSettings({ ...notificationSettings, emailEnabled: e.target.checked });
                        markChanged();
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Email Notifications</span>
                  </label>

                  {notificationSettings.emailEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recipients (comma separated)</label>
                      <input
                        type="text"
                        value={notificationSettings.emailRecipients.join(', ')}
                        onChange={(e) => {
                          setNotificationSettings({ ...notificationSettings, emailRecipients: e.target.value.split(',').map(x => x.trim()) });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'notifyOnPlanComplete', label: 'On Plan Completion' },
                      { key: 'notifyOnConflicts', label: 'On Conflicts Detected' },
                      { key: 'notifyOnLateOrders', label: 'On Late Orders' },
                      { key: 'notifyOnMaintenance', label: 'On Maintenance Required' },
                      { key: 'notifyOnLowInventory', label: 'On Low Inventory' },
                    ].map((n) => (
                      <label key={n.key} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={notificationSettings[n.key as keyof NotificationSettings] as boolean}
                          onChange={(e) => {
                            setNotificationSettings({ ...notificationSettings, [n.key]: e.target.checked });
                            markChanged();
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{n.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Integrations */}
              {activeSection === 'integrations' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Integrations</h2>
                    <p className="text-sm text-gray-500">Connect with external systems</p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={integrationSettings.emsEnabled}
                        onChange={(e) => {
                          setIntegrationSettings({ ...integrationSettings, emsEnabled: e.target.checked });
                          markChanged();
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable EMS Integration</span>
                    </label>

                    {integrationSettings.emsEnabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">EMS API URL</label>
                          <input
                            type="text"
                            value={integrationSettings.emsApiUrl}
                            onChange={(e) => {
                              setIntegrationSettings({ ...integrationSettings, emsApiUrl: e.target.value });
                              markChanged();
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">EMS API Key</label>
                          <input
                            type="password"
                            value={integrationSettings.emsApiKey}
                            onChange={(e) => {
                              setIntegrationSettings({ ...integrationSettings, emsApiKey: e.target.value });
                              markChanged();
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    )}

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={integrationSettings.erpEnabled}
                        onChange={(e) => {
                          setIntegrationSettings({ ...integrationSettings, erpEnabled: e.target.checked });
                          markChanged();
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable ERP Integration</span>
                    </label>

                    {integrationSettings.erpEnabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ERP API URL</label>
                          <input
                            type="text"
                            value={integrationSettings.erpApiUrl}
                            onChange={(e) => {
                              setIntegrationSettings({ ...integrationSettings, erpApiUrl: e.target.value });
                              markChanged();
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ERP API Key</label>
                          <input
                            type="password"
                            value={integrationSettings.erpApiKey}
                            onChange={(e) => {
                              setIntegrationSettings({ ...integrationSettings, erpApiKey: e.target.value });
                              markChanged();
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
