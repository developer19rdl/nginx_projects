import axiosClient from './axiosClient';

export const listDowntimeReasons = () => axiosClient.get('/downtime-reasons').then((r) => r.data.data);

export const getActiveDowntime = (machineId) =>
  axiosClient.get('/downtime/active', { params: { machineId } }).then((r) => r.data.data);

export const startDowntime = (machineId, reasonId) =>
  axiosClient.post('/downtime/start', { machineId, reasonId }).then((r) => r.data.data);

export const endDowntime = (id) => axiosClient.patch(`/downtime/${id}/end`).then((r) => r.data.data);

export const listDowntimeByMachine = (machineId, scheduleDate, shiftId) =>
  axiosClient.get('/downtime/by-machine', { params: { machineId, scheduleDate, shiftId } }).then((r) => r.data.data);
