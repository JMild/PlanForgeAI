import axiosClient from "../utils/axiosClient";

export async function getUsers() {
  const res = await axiosClient.get("/users");
  return res.data;
}

export async function getDepartments() {
  const res = await axiosClient.get("/users/departments");
  return res.data;
}

export async function getRoles() {
  const res = await axiosClient.get("/users/roles");
  return res.data;
}
export async function getPermissionAll() {
  const res = await axiosClient.get("/users/all_permission");
  return res.data;
}
export async function getPermissionByRoleId(role_id: string) {
  const res = await axiosClient.get("/users/role_id", {
    params: { role_id },
  });
  return res.data;
}