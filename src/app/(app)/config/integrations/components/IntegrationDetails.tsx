import React, { useState } from 'react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ title, subtitle }) => (
  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
    <h3 className="font-semibold text-gray-800">{title}</h3>
    {subtitle && <span className="text-sm text-slate-500">{subtitle}</span>}
  </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
  <label className="relative inline-block w-10 h-5">
    <input type="checkbox" className="opacity-0 w-0 h-0" checked={checked} onChange={onChange} />
    <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition-colors duration-300 ${checked ? 'bg-sky-500' : ''}`}>
      <span className={`absolute content-[''] h-4 w-4 left-0.5 bottom-0.5 bg-white rounded-full transition-transform duration-300 ${checked ? 'translate-x-5' : ''}`}></span>
    </span>
  </label>
);

const IntegrationDetails = ({ provider, onToggle, onEdit }) => {
  if (!provider) return <Card><div className="text-slate-500">คลิกเลือกรายการ Integration ทางซ้ายเพื่อดูรายละเอียด</div></Card>;

  const authSummary = provider.config.auth.type === 'apikey' ? 'API Key' :
    provider.config.auth.type === 'basic' ? `Basic Auth` : 'OAuth 2.0';

  return (
    <Card>
      <SectionTitle title="Integration Details" subtitle={provider.name} />
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between items-center"><span className="text-slate-600">Enable Integration</span><ToggleSwitch checked={provider.enabled} onChange={onToggle} /></div>
        <div className="flex justify-between items-center"><span className="text-slate-600">Connection Type</span><strong className="text-gray-800">{provider.config.type.toUpperCase()}</strong></div>
        <div className="flex justify-between items-center"><span className="text-slate-600">Endpoint URL</span><code className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap bg-slate-100 px-1 py-0.5 rounded text-xs">{provider.config.url || 'Not set'}</code></div>
        <div className="flex justify-between items-center"><span className="text-slate-600">Authentication</span><strong className="text-gray-800">{authSummary}</strong></div>
        <div className="pt-3 border-t border-gray-200"><button onClick={onEdit} className="w-full bg-sky-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">แก้ไขการเชื่อมต่อ</button></div>
      </div>
    </Card>
  );
};

export default IntegrationDetails;
