import { integrationList } from "@/src/config/integrationList";
import axios from "axios";

export async function fetchFromIntegration(key: string) {
  const integration = integrationList[key];
  if (!integration) throw new Error(`Integration ${key} not found`);

  // axios instance ใช้ dynamic baseURL ตาม integration
  const res = await axios.get(integration.endpoint, {
    headers: { "Content-Type": "application/json" },
    timeout: 10000,
  });

  return res.data;
}
