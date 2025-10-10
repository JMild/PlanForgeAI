// integrationList.ts (ตัวอย่าง mock)
export type Integration = {
  name: string;
  endpoint: string;
};

export const integrationList: Record<string, Integration> = {
  personnel: { name: "Personnel Service", endpoint: "http://localhost:5678/webhook-test/hr/employee" },
  machines: { name: "Machines Service", endpoint: "http://localhost:5678/webhook-test/ems/machines" },
};
