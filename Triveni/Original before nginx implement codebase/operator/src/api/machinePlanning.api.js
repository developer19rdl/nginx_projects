import axiosClient from './axiosClient';

export const listByMachine = (machineId, shiftId, scheduleDate) =>
  axiosClient.get('/machine-planning/by-machine', { params: { machineId, shiftId, scheduleDate } }).then((r) => r.data.data);

export const getShiftSummary = () => axiosClient.get('/machine-planning/shift-summary').then((r) => r.data.data);

export const startProduction = (id) => axiosClient.post(`/machine-planning/${id}/start`).then((r) => r.data.data);

export const stopProduction = (id) => axiosClient.post(`/machine-planning/${id}/stop`).then((r) => r.data.data);

export const resumeProduction = (id) => axiosClient.post(`/machine-planning/${id}/resume`).then((r) => r.data.data);

export const resetProduction = (id) => axiosClient.post(`/machine-planning/${id}/reset`).then((r) => r.data.data);

export const updateProducedQty = (id, producedQty) =>
  axiosClient.patch(`/machine-planning/${id}/produced-qty`, { producedQty }).then((r) => r.data.data);

export const updateCoilInfo = (id, coilInfo) =>
  axiosClient.patch(`/machine-planning/${id}/coil-info`, coilInfo).then((r) => r.data.data);
