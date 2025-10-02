import React from 'react';

// ---------------------
// ✅ Types
// ---------------------
type LogEntry = {
  time: string;
  event: string;
  result: boolean;
};

type Provider = {
  name: string;
  logs: LogEntry[];
};

type AuditLogsProps = {
  provider?: Provider;
};

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

// ---------------------
// ✅ Components
// ---------------------

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}>
    {children}
  </div>
);

const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle }) => (
  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
    <h3 className="font-semibold text-gray-800">{title}</h3>
    {subtitle && <span className="text-sm text-slate-500">{subtitle}</span>}
  </div>
);

// ---------------------
// ✅ Main Component
// ---------------------

const AuditLogs: React.FC<AuditLogsProps> = ({ provider }) => {
  if (!provider) {
    return (
      <Card>
        <SectionTitle title="Audit & Logs" />
        <div className="text-slate-500">เลือก Integration เพื่อดู Logs</div>
      </Card>
    );
  }

  return (
    <Card>
      <SectionTitle title="Audit & Logs" subtitle={provider.name} />
      <div className="mt-2">
        {provider.logs.length > 0 ? (
          <table className="w-full text-sm">
            <tbody>
              {provider.logs.map((log, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="p-2 text-slate-500">{log.time}</td>
                  <td className="p-2 text-gray-800">{log.event}</td>
                  <td className="p-2 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        log.result
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {log.result ? 'Success' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-slate-500 py-4">ไม่มี Log สำหรับ {provider.name}</div>
        )}
      </div>
    </Card>
  );
};

export default AuditLogs;