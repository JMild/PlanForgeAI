import { mockExternalData } from "./dbMock";
import { integrationConfigs } from "./integrationConfigs";

// ฟังก์ชันแปลงข้อมูลจากระบบภายนอกให้ตรง field ภายใน
export function mapExternalData(system: string, endpoint: string, apiData: any) {
  const config = integrationConfigs.find(
    (c) => c.system === system && c.endpoint === endpoint
  );
  if (!config) throw new Error(`No mapping config for ${system}${endpoint}`);

  const result: Record<string, any> = {};
  config.mappings.forEach((m) => {
    let value = apiData[m.externalField];
    if (m.type === "number") value = Number(value);
    result[m.internalField] = value;
  });
  return result;
}

// ฟังก์ชัน mock การ fetch API (แทน axios)
export async function fetchExternalData(system: string, endpoint: string) {
  // จำลองการ fetch จากระบบภายนอก
  const data = mockExternalData[system]?.[endpoint];
  if (!data) throw new Error(`No mock data for ${system}${endpoint}`);
  await new Promise((r) => setTimeout(r, 300)); // simulate delay
  return data;
}

// รวมทุกขั้นตอน: fetch → map → return
export async function integrate(system: string, endpoint: string) {
  const externalData = await fetchExternalData(system, endpoint);
  const mapped = mapExternalData(system, endpoint, externalData);
  return { system, endpoint, mapped };
}
