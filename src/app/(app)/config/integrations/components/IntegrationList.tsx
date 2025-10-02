import React from 'react';

type IntegrationItem = {
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
};

type IntegrationListProps = {
  integrations: Record<string, IntegrationItem>;
  activeProvider: string;
  onSelect: (key: string) => void;
};

const IntegrationList: React.FC<IntegrationListProps> = ({ integrations, activeProvider, onSelect }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
      <h3 className="font-semibold text-gray-800">Integration Center</h3>
      <span className="text-sm text-slate-500">เชื่อมต่อระบบภายนอก</span>
    </div>
    <div className="mt-4 space-y-2">
      {Object.entries(integrations).map(([key, item]) => (
        <div
          key={key}
          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
            activeProvider === key ? 'border-sky-500 bg-sky-50 shadow-sm' : 'border-gray-200 hover:border-sky-400'
          }`}
          onClick={() => onSelect(key)}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <div>
              <div className="font-semibold text-gray-900">{item.name}</div>
              <div className="text-xs text-slate-500">{item.description}</div>
            </div>
          </div>
          <div
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              item.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {item.enabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default IntegrationList;