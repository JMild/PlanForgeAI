export const integrationConfigs = [
  {
    system: "ERP",
    endpoint: "/erp/orders",
    mappings: [
      { internalField: "orderId", externalField: "id" },
      { internalField: "customerName", externalField: "cust_name" },
      { internalField: "totalAmount", externalField: "amount", type: "number" },
    ],
  },
  {
    system: "ERP",
    endpoint: "/erp/products",
    mappings: [
      { internalField: "productCode", externalField: "item_code" },
      { internalField: "productName", externalField: "item_name" },
      { internalField: "unit", externalField: "uom" },
    ],
  },
  {
    system: "MES",
    endpoint: "/mes/machines",
    mappings: [
      { internalField: "machineCode", externalField: "machine_id" },
      { internalField: "machineName", externalField: "name" },
      { internalField: "status", externalField: "state" },
    ],
  },
  {
    system: "WMS",
    endpoint: "/wms/inventory",
    mappings: [
      { internalField: "itemCode", externalField: "sku" },
      { internalField: "quantity", externalField: "qty", type: "number" },
      { internalField: "location", externalField: "bin" },
    ],
  },
];
