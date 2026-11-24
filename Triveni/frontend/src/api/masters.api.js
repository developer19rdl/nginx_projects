import axiosClient from './axiosClient';

export const listItems = (params) => axiosClient.get('/items', { params }).then((r) => r.data);
export const listOperators = () => axiosClient.get('/operators').then((r) => r.data.data);
export const listRoles = () => axiosClient.get('/roles').then((r) => r.data.data);
export const listUsers = (params) => axiosClient.get('/users', { params }).then((r) => r.data);
export const createUser = (payload) => axiosClient.post('/users', payload).then((r) => r.data.data);
export const updateUser = (id, payload) => axiosClient.put(`/users/${id}`, payload).then((r) => r.data.data);
export const setUserStatus = (id, status) => axiosClient.patch(`/users/${id}/status`, { status }).then((r) => r.data.data);
export const resetUserPassword = (id) => axiosClient.post(`/users/${id}/reset-password`).then((r) => r.data.data);
export const listAuditLogs = (params) => axiosClient.get('/audit-logs', { params }).then((r) => r.data);
