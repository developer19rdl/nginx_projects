import axiosClient from './axiosClient';

export const getDashboardSummary = () => axiosClient.get('/dashboard/summary').then((r) => r.data.data);

export const getDashboardCharts = () => axiosClient.get('/dashboard/charts').then((r) => r.data.data);

export const getMachinesLive = () => axiosClient.get('/dashboard/machines-live').then((r) => r.data.data);

export const getMachineInsights = (machineId) =>
  axiosClient.get(`/dashboard/machines/${machineId}/insights`).then((r) => r.data.data);

export const getDowntimeTrends = (machineId, period) =>
  axiosClient.get(`/dashboard/machines/${machineId}/downtime-trends`, { params: { period } }).then((r) => r.data.data);

export const getProductionTrend = (machineId, period) =>
  axiosClient.get(`/dashboard/machines/${machineId}/production-trend`, { params: { period } }).then((r) => r.data.data);
