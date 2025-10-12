import axiosClient from "../utils/axiosClient";

export async function getDropdownMachineStatus() {
  const res = await axiosClient.get("/enum_values/machine-status");
  return res.data;
}

export async function getAllDropdownMaterial() {
  const res = await axiosClient.get("/enum_values/all-material");
  return res.data;
}
// export async function getWorkCenterDeptDropdown() {
//   const res = await axiosClient.get("/enum_values/work_centers-dept-dropdown");
//   return res.data;
// }