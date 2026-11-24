import axiosClient from './axiosClient';

export const getMachineInsights = (machineId) => axiosClient.get(`/machines/${machineId}/insights`).then((r) => r.data.data);
