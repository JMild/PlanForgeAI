"use client";

import React, { useState } from 'react';
import { Save, RefreshCw, Building, Globe, Sliders, Bell, Database, Shield, CheckCircle, AlertCircle } from 'lucide-react';
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

// type ObjectiveWeights = {
//   onTimeDelivery: number;
//   utilizationMax: number;
//   changeoverMin: number;
//   wipMin: number;
//   costMin: number;
// };

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

  // const [objectiveWeights, setObjectiveWeights] = useState<ObjectiveWeights>({
  //   onTimeDelivery: 40,
  //   utilizationMax: 25,
  //   changeoverMin: 15,
  //   wipMin: 10,
  //   costMin: 10,
  // });

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

  // const totalWeight = Object.values(objectiveWeights).reduce((sum, val) => sum + val, 0);

  const sections = [
    { id: 'company', name: 'Company Profile', icon: Building },
    { id: 'system', name: 'System Settings', icon: Globe },
    { id: 'planning', name: 'Planning Parameters', icon: Sliders },
    // { id: 'objectives', name: 'Objective Weights', icon: Cpu },
    { id: 'engine', name: 'Planning Engine', icon: Database },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    // { id: 'integrations', name: 'Integrations', icon: Key },
  ];

  return (
    <div className="text-white">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-7 h-7 text-cyan-300" />
                System Settings & Configuration
              </h1>
              <p className="text-sm text-white/70 mt-1">Configure system parameters and preferences</p>
            </div>
          </div>
        }
        actions={
          <div className="flex gap-2">
            {hasChanges && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                          bg-amber-500/10 text-amber-200 border border-amber-400/30">
                <AlertCircle className="w-4 h-4" />
                Unsaved changes
              </div>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg inline-flex items-center gap-2
                     bg-white/10 text-white border border-white/20
                     hover:bg-white/20 active:bg-white/25 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saveStatus === 'saving'}
              className="px-4 py-2 rounded-lg inline-flex items-center gap-2
                     bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-500
                     text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        }
      />

      {/* Save Status */}
      {saveStatus === 'success' && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="rounded-lg p-3 flex items-center gap-2
                      bg-emerald-500/10 border border-emerald-400/30 text-emerald-200">
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
            <div className="rounded-xl p-2 bg-white/10 border border-white/15 backdrop-blur">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const active = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${active
                          ? 'bg-cyan-500/15 text-cyan-100 border border-cyan-400/30'
                          : 'text-white/80 hover:bg-white/10 border border-transparent'}`}
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
            <div className="rounded-xl p-6 bg-white/10 border border-white/15 backdrop-blur">
              {/* Company Profile */}
              {activeSection === 'company' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Company Profile</h2>
                    <p className="text-sm text-white/70">Basic information about your organization</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={companySettings.companyName}
                        onChange={(e) => { setCompanySettings({ ...companySettings, companyName: e.target.value }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white
                               border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Industry</label>
                      <input
                        type="text"
                        value={companySettings.industry}
                        onChange={(e) => { setCompanySettings({ ...companySettings, industry: e.target.value }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-white/80 mb-1">Address</label>
                    <textarea
                      rows={2}
                      value={companySettings.address}
                      onChange={(e) => { setCompanySettings({ ...companySettings, address: e.target.value }); markChanged(); }}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Phone</label>
                      <input
                        type="text"
                        value={companySettings.phone}
                        onChange={(e) => { setCompanySettings({ ...companySettings, phone: e.target.value }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Email</label>
                      <input
                        type="email"
                        value={companySettings.email}
                        onChange={(e) => { setCompanySettings({ ...companySettings, email: e.target.value }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Website</label>
                      <input
                        type="text"
                        value={companySettings.website}
                        onChange={(e) => { setCompanySettings({ ...companySettings, website: e.target.value }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* System Settings */}
              {activeSection === 'system' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">System Settings</h2>
                    <p className="text-sm text-white/70">Configure regional and display preferences</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Timezone</label>
                      <select
                        value={systemSettings.timezone}
                        onChange={(e) => { setSystemSettings({ ...systemSettings, timezone: e.target.value }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20
                               focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      >
                        {[
                          { v: 'Asia/Bangkok', l: 'Asia/Bangkok (GMT+7)' },
                          { v: 'America/New_York', l: 'America/New_York (EST)' },
                          { v: 'Europe/London', l: 'Europe/London (GMT)' },
                          { v: 'Asia/Tokyo', l: 'Asia/Tokyo (JST)' },
                        ].map(o => <option key={o.v} value={o.v} className="select option">{o.l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Language</label>
                      <select
                        value={systemSettings.language}
                        onChange={(e) => { setSystemSettings({ ...systemSettings, language: e.target.value }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      >
                        {[
                          { v: 'en-US', l: 'English (US)' },
                          { v: 'th-TH', l: 'ไทย (Thai)' },
                          { v: 'zh-CN', l: '中文 (Chinese)' },
                          { v: 'ja-JP', l: '日本語 (Japanese)' },
                        ].map(o => <option key={o.v} value={o.v} className="select option">{o.l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Date Format</label>
                      <select
                        value={systemSettings.dateFormat}
                        onChange={(e) => { setSystemSettings({ ...systemSettings, dateFormat: e.target.value }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      >
                        {['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'].map(v => (
                          <option key={v} value={v} className="select option">{v}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Time Format</label>
                      <select
                        value={systemSettings.timeFormat}
                        onChange={(e) => { setSystemSettings({ ...systemSettings, timeFormat: e.target.value as '12h' | '24h' }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      >
                        {['24h', '12h'].map(v => (
                          <option key={v} value={v} className="select option">
                            {v === '24h' ? '24-hour' : '12-hour (AM/PM)'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Currency</label>
                      <select
                        value={systemSettings.currency}
                        onChange={(e) => { setSystemSettings({ ...systemSettings, currency: e.target.value }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      >
                        {['THB', 'USD', 'EUR', 'JPY'].map(v => (
                          <option key={v} value={v} className="select option">
                            {v} {v === 'THB' ? '(฿)' : v === 'USD' ? '($)' : v === 'EUR' ? '(€)' : '(¥)'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Week Start Day</label>
                      <select
                        value={systemSettings.weekStartDay}
                        onChange={(e) => { setSystemSettings({ ...systemSettings, weekStartDay: e.target.value as 'Sunday' | 'Monday' }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      >
                        {['Monday', 'Sunday'].map(v => <option key={v} value={v} className="select option">{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Fiscal Year Start (MM-DD)</label>
                      <input
                        type="text"
                        value={systemSettings.fiscalYearStart}
                        onChange={(e) => { setSystemSettings({ ...systemSettings, fiscalYearStart: e.target.value }); markChanged(); }}
                        placeholder="01-01"
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Planning Parameters */}
              {activeSection === 'planning' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Planning Parameters</h2>
                    <p className="text-sm text-white/70">Configure production planning behavior</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Default Planning Horizon (days)</label>
                      <input
                        type="number"
                        value={planningSettings.defaultHorizonDays}
                        onChange={(e) => { setPlanningSettings({ ...planningSettings, defaultHorizonDays: parseInt(e.target.value) || 0 }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Planning Granularity</label>
                      <select
                        value={planningSettings.planningGranularity}
                        onChange={(e) => { setPlanningSettings({ ...planningSettings, planningGranularity: e.target.value as PlanningGranularity }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      >
                        {granularityOptions.map(o => (
                          <option key={o} value={o} className="select option">{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Buffer Time (minutes)</label>
                      <input
                        type="number"
                        value={planningSettings.bufferTimeMinutes}
                        onChange={(e) => { setPlanningSettings({ ...planningSettings, bufferTimeMinutes: parseInt(e.target.value) || 0 }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Auto-Replan Delay (minutes)</label>
                      <input
                        type="number"
                        value={planningSettings.replanTriggerDelay}
                        onChange={(e) => { setPlanningSettings({ ...planningSettings, replanTriggerDelay: parseInt(e.target.value) || 0 }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={planningSettings.autoReplanEnabled}
                        onChange={(e) => { setPlanningSettings({ ...planningSettings, autoReplanEnabled: e.target.checked }); markChanged(); }}
                        className="w-4 h-4 rounded accent-cyan-500"
                      />
                      <span className="text-sm text-white/80">Enable Automatic Replanning</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={planningSettings.overtimeAllowed}
                        onChange={(e) => { setPlanningSettings({ ...planningSettings, overtimeAllowed: e.target.checked }); markChanged(); }}
                        className="w-4 h-4 rounded accent-cyan-500"
                      />
                      <span className="text-sm text-white/80">Allow Overtime</span>
                    </label>
                    {planningSettings.overtimeAllowed && (
                      <div className="ml-7">
                        <label className="block text-sm text-white/80 mb-1">Max Overtime (%)</label>
                        <input
                          type="number"
                          value={planningSettings.maxOvertimePercent}
                          onChange={(e) => { setPlanningSettings({ ...planningSettings, maxOvertimePercent: parseInt(e.target.value) || 0 }); markChanged(); }}
                          className="w-32 px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                        />
                      </div>
                    )}
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={planningSettings.considerSkills}
                        onChange={(e) => { setPlanningSettings({ ...planningSettings, considerSkills: e.target.checked }); markChanged(); }}
                        className="w-4 h-4 rounded accent-cyan-500"
                      />
                      <span className="text-sm text-white/80">Consider Personnel Skills</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={planningSettings.considerToolAvailability}
                        onChange={(e) => { setPlanningSettings({ ...planningSettings, considerToolAvailability: e.target.checked }); markChanged(); }}
                        className="w-4 h-4 rounded accent-cyan-500"
                      />
                      <span className="text-sm text-white/80">Check Tool Availability</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Objective Weights */}
              {/* {activeSection === 'objectives' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Objective Weights</h2>
                    <p className="text-sm text-white/70">Define optimization priorities (total must equal 100%)</p>
                  </div>

                  <div className="rounded-lg p-6 bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold">Total Weight</span>
                      <span className={`text-3xl font-bold ${totalWeight === 100 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {totalWeight}%
                      </span>
                    </div>
                    {totalWeight !== 100 && (
                      <div className="text-sm text-rose-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Total weight must equal 100%
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {[
                      { key: 'onTimeDelivery', label: 'On-Time Delivery', color: 'cyan' },
                      { key: 'utilizationMax', label: 'Maximize Utilization', color: 'emerald' },
                      { key: 'changeoverMin', label: 'Minimize Changeovers', color: 'amber' },
                      { key: 'wipMin', label: 'Minimize WIP', color: 'violet' },
                      { key: 'costMin', label: 'Minimize Cost', color: 'rose' },
                    ].map((obj) => {
                      const value = objectiveWeights[obj.key as keyof ObjectiveWeights];
                      const bar =
                        ({ cyan: 'bg-cyan-400', emerald: 'bg-emerald-400', amber: 'bg-amber-400', violet: 'bg-violet-400', rose: 'bg-rose-400' } as any)[obj.color];
                      return (
                        <div key={obj.key}>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-white/80">{obj.label}</label>
                            <span className="text-lg font-bold">{value}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={value}
                            onChange={(e) => { setObjectiveWeights({ ...objectiveWeights, [obj.key]: parseInt(e.target.value) }); markChanged(); }}
                            className="w-full accent-cyan-500"
                          />
                          <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                            <div className={`${bar} h-2 rounded-full transition-all`} style={{ width: `${value}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <h3 className="text-sm font-semibold mb-3">Quick Presets</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => { setObjectiveWeights({ onTimeDelivery: 50, utilizationMax: 20, changeoverMin: 10, wipMin: 10, costMin: 10 }); markChanged(); }}
                        className="px-3 py-2 rounded-lg text-sm font-medium
                               bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-100 border border-cyan-400/30"
                      >
                        Delivery Focus
                      </button>
                      <button
                        onClick={() => { setObjectiveWeights({ onTimeDelivery: 20, utilizationMax: 40, changeoverMin: 20, wipMin: 10, costMin: 10 }); markChanged(); }}
                        className="px-3 py-2 rounded-lg text-sm font-medium
                               bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-100 border border-emerald-400/30"
                      >
                        Utilization Focus
                      </button>
                      <button
                        onClick={() => { setObjectiveWeights({ onTimeDelivery: 25, utilizationMax: 25, changeoverMin: 20, wipMin: 15, costMin: 15 }); markChanged(); }}
                        className="px-3 py-2 rounded-lg text-sm font-medium
                               bg-violet-500/10 hover:bg-violet-500/15 text-violet-100 border border-violet-400/30"
                      >
                        Balanced
                      </button>
                      <button
                        onClick={() => { setObjectiveWeights({ onTimeDelivery: 30, utilizationMax: 20, changeoverMin: 20, wipMin: 10, costMin: 20 }); markChanged(); }}
                        className="px-3 py-2 rounded-lg text-sm font-medium
                               bg-rose-500/10 hover:bg-rose-500/15 text-rose-100 border border-rose-400/30"
                      >
                        Cost Saving
                      </button>
                    </div>
                  </div>
                </div>
              )} */}

              {/* Engine Settings */}
              {activeSection === 'engine' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Planning Engine</h2>
                    <p className="text-sm text-white/70">Configure optimization engine behavior</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Algorithm</label>
                      <select
                        value={engineSettings.algorithm}
                        onChange={(e) => { setEngineSettings({ ...engineSettings, algorithm: e.target.value as EngineSettings['algorithm'] }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      >
                        {/* {['Genetic Algorithm', 'Constraint Programming', 'Heuristic', 'Hybrid'].map(v => ( */}
                        {['Genetic Algorithm'].map(v => (
                          <option key={v} value={v} className="select option">{v}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Population Size</label>
                      <input
                        type="number"
                        value={engineSettings.populationSize}
                        onChange={(e) => { setEngineSettings({ ...engineSettings, populationSize: parseInt(e.target.value) }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { k: 'maxIterations', l: 'Max Iterations' },
                      { k: 'timeoutSeconds', l: 'Timeout (s)' },
                      { k: 'parallelThreads', l: 'Threads' },
                    ].map(({ k, l }) => (
                      <div key={k}>
                        <label className="block text-sm text-white/80 mb-1">{l}</label>
                        <input
                          type="number"
                          value={engineSettings[k as keyof EngineSettings]} 
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setEngineSettings(prev => ({
                              ...prev,
                              [k]: isNaN(value) ? 0 : value, 
                            }));
                            markChanged();
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Notifications</h2>
                    <p className="text-sm text-white/70">Set up alerts and notifications</p>
                  </div>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailEnabled}
                      onChange={(e) => { setNotificationSettings({ ...notificationSettings, emailEnabled: e.target.checked }); markChanged(); }}
                      className="w-4 h-4 accent-cyan-500"
                    />
                    <span className="text-sm text-white/80">Enable Email Notifications</span>
                  </label>

                  {notificationSettings.emailEnabled && (
                    <div>
                      <label className="block text-sm text-white/80 mb-1">Recipients (comma separated)</label>
                      <input
                        type="text"
                        value={notificationSettings.emailRecipients.join(', ')}
                        onChange={(e) => { setNotificationSettings({ ...notificationSettings, emailRecipients: e.target.value.split(',').map(x => x.trim()) }); markChanged(); }}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20"
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
                          onChange={(e) => { setNotificationSettings({ ...notificationSettings, [n.key]: e.target.checked }); markChanged(); }}
                          className="w-4 h-4 accent-cyan-500"
                        />
                        <span className="text-sm text-white/80">{n.label}</span>
                      </label>
                    ))}
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
