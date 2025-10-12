import axiosClient from "../utils/axiosClient";

export async function getMaintenanceMachines() {
  const res = await axiosClient.get(`/maintenance`);
  return res.data;
}