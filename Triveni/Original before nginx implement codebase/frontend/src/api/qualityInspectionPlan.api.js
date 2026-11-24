import axiosClient from './axiosClient';

export const listInspectionPlans = (params) => axiosClient.get('/quality-inspection-plans', { params }).then((r) => r.data.data);
export const getInspectionPlan = (id) => axiosClient.get(`/quality-inspection-plans/${id}`).then((r) => r.data.data);
export const createInspectionPlan = (payload) => axiosClient.post('/quality-inspection-plans', payload).then((r) => r.data.data);
export const updateInspectionPlan = (id, payload) =>
  axiosClient.put(`/quality-inspection-plans/${id}`, payload).then((r) => r.data.data);
export const deleteInspectionPlan = (id) => axiosClient.delete(`/quality-inspection-plans/${id}`).then((r) => r.data.data);
