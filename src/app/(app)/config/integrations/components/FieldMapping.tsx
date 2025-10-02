// @ts-nocheck

import React, { useEffect, useState } from 'react';

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

const apiDocs = {
  erp: `<div class="p-1"><h4 class="font-semibold text-gray-800">GET /products</h4><p class="text-sm text-slate-500 mb-2">รับรายการสินค้าทั้งหมด</p><pre class="bg-gray-800 text-white p-3 rounded-md text-xs">{\n  "item_code": "string",\n  "stock_qty": "number"\n}</pre></div>`,
  wms: `<div class="p-1"><h4 class="font-semibold text-gray-800">GET /inventory</h4><p class="text-sm text-slate-500 mb-2">ตรวจสอบข้อมูลสต็อก</p><pre class="bg-gray-800 text-white p-3 rounded-md text-xs">{\n  "sku": "string",\n  "lot_no": "string",\n  "quantity_on_hand": "number"\n}</pre></div>`
};

const mockApiData = {
  erp: { products: { json: `{\n  "data": [\n    {\n      "item_code": "PROD-001",\n      "item_name": "Product A",\n      "uom": "EA",\n      "stock_qty": 250,\n      "price": 150.75\n    }\n  ]\n}` } },
  wms: { stock: { json: `{\n  "warehouse_inventory": [\n    {\n      "sku": "PROD-001",\n      "lot_no": "LOT-ABC-123",\n      "quantity_on_hand": 50\n    }\n  ]\n}` } }
};

const FieldMapping = ({ provider, onEditMapping }) => {
  const [activeTab, setActiveTab] = useState('mapping');

  useEffect(() => {
    if (provider) setActiveTab('mapping');
  }, [provider]);

  if (!provider) return <Card><SectionTitle title="Field Mapping & Sync Rules" /><div className="text-center py-8 text-slate-500">เลือก Integration เพื่อดู Mapping</div></Card>;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'api-docs':
        return <div className="text-sm p-2" dangerouslySetInnerHTML={{ __html: apiDocs[provider.key] || 'ไม่มี API documentation' }} />;
      case 'data-preview':
        const sampleData = mockApiData[provider.key]?.products?.json || mockApiData[provider.key]?.stock?.json;
        return <div className="p-2"><pre className="bg-gray-800 text-white p-3 rounded-md text-xs whitespace-pre-wrap">{sampleData || 'ไม่มีข้อมูลตัวอย่าง'}</pre></div>;
      case 'mapping':
      default:
        return (
          <div className="p-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b"><th className="text-left font-semibold text-slate-500 p-2">Local Field</th><th className="text-left font-semibold text-slate-500 p-2">External Field</th><th className="text-left font-semibold text-slate-500 p-2">Direction</th></tr>
              </thead>
              <tbody>
                {provider.mapping.length > 0 ? provider.mapping.map(m => (
                  <tr key={m.id} className="border-b border-gray-100">
                    <td className="p-2"><code>{m.local}</code></td>
                    <td className="p-2"><code>{m.external}</code></td>
                    <td className="p-2">{m.dir === 'in' ? '→ In' : m.dir === 'out' ? '← Out' : '↔ Bi-directional'}</td>
                  </tr>
                )) : <tr><td colSpan="3" className="text-center py-6 text-slate-500">ไม่มี Field Mapping</td></tr>}
              </tbody>
            </table>
            <div className="mt-4"><button onClick={onEditMapping} className="text-sm font-medium text-sky-600 hover:underline">แก้ไข Field Mapping</button></div>
          </div>
        );
    }
  };

  return (
    <Card>
      <SectionTitle title="Field Mapping & Sync Rules" subtitle={provider.name} />
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4">
          {['mapping', 'api-docs', 'data-preview'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-gray-700 hover:border-gray-300'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-2">{renderTabContent()}</div>
    </Card>
  );
};

export default FieldMapping;
