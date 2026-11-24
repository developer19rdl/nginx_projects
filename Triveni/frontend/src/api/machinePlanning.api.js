import axiosClient from './axiosClient';

export const listByMachine = (machineId, shiftId, scheduleDate) =>
  axiosClient.get('/machine-planning/by-machine', { params: { machineId, shiftId, scheduleDate } }).then((r) => r.data.data);

export const getShiftSummary = () =>
  axiosClient.get('/machine-planning/shift-summary').then((r) => r.data.data);

export const unassignRow = (id) => axiosClient.delete(`/machine-planning/${id}/assignment`).then((r) => r.data.data);

export const listUnassigned = (params) =>
  axiosClient.get('/machine-planning/unassigned', { params }).then((r) => r.data.data);

export const assignToMachine = ({ detailIds, machineId, scheduleDate, shiftId }) =>
  axiosClient.post('/machine-planning/assign', { detailIds, machineId, scheduleDate, shiftId }).then((r) => r.data.data);
