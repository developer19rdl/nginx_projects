import axiosClient from './axiosClient';

// The plain active-role list (for the "Role" dropdown on User creation/edit) already lives in
// masters.api.js as listRoles() - these are the admin Role & Permission Management endpoints.
export const listManagedRoles = () => axiosClient.get('/roles/manage').then((r) => r.data.data);
export const listPermissionCatalog = () => axiosClient.get('/roles/permissions-catalog').then((r) => r.data.data);
export const getRole = (id) => axiosClient.get(`/roles/${id}`).then((r) => r.data.data);
export const createRole = (payload) => axiosClient.post('/roles', payload).then((r) => r.data.data);
export const updateRole = (id, payload) => axiosClient.put(`/roles/${id}`, payload).then((r) => r.data.data);
export const setRoleActive = (id, isActive) => axiosClient.patch(`/roles/${id}/active`, { isActive }).then((r) => r.data.data);
export const setRolePermissions = (id, permissionCodes) =>
  axiosClient.put(`/roles/${id}/permissions`, { permissionCodes }).then((r) => r.data.data);
