import axiosClient from './axiosClient';

export const listMachines = (params) => axiosClient.get('/machines', { params }).then((r) => r.data);
export const getMachine = (id) => axiosClient.get(`/machines/${id}`).then((r) => r.data.data);
export const createMachine = (payload) => axiosClient.post('/machines', payload).then((r) => r.data.data);
export const updateMachine = (id, payload) => axiosClient.put(`/machines/${id}`, payload).then((r) => r.data.data);
export const setMachineStatus = (id, status) =>
  axiosClient.patch(`/machines/${id}/status`, { status }).then((r) => r.data.data);
export const deleteMachine = (id) => axiosClient.delete(`/machines/${id}`).then((r) => r.data.data);
