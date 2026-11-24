import axiosClient from './axiosClient';

export const listShifts = (params) => axiosClient.get('/shifts', { params }).then((r) => r.data.data);
export const createShift = (payload) => axiosClient.post('/shifts', payload).then((r) => r.data.data);
export const updateShift = (id, payload) => axiosClient.put(`/shifts/${id}`, payload).then((r) => r.data.data);
