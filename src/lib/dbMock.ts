export const mockExternalData = {
  ERP: {
    "/erp/orders": { id: "ORD001", cust_name: "ACME Co", amount: "12500.5" },
    "/erp/products": { item_code: "P001", item_name: "Bolt M10", uom: "PCS" },
  },
  MES: {
    "/mes/machines": { machine_id: "MC001", name: "Lathe A", state: "Running" },
  },
  WMS: {
    "/wms/inventory": { sku: "P001", qty: "250", bin: "A-01-03" },
  },
};
