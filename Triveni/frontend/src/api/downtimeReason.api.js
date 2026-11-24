import axiosClient from './axiosClient';

export const listDowntimeReasons = (params) => axiosClient.get('/downtime-reasons', { params }).then((r) => r.data.data);
export const createDowntimeReason = (payload) => axiosClient.post('/downtime-reasons', payload).then((r) => r.data.data);
export const updateDowntimeReason = (id, payload) => axiosClient.put(`/downtime-reasons/${id}`, payload).then((r) => r.data.data);
export const deleteDowntimeReason = (id) => axiosClient.delete(`/downtime-reasons/${id}`).then((r) => r.data.data);
