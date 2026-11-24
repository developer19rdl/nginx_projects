import axiosClient from './axiosClient';

export const listDefects = (params) => axiosClient.get('/quality-defect-catalog', { params }).then((r) => r.data.data);
export const createDefect = (payload) => axiosClient.post('/quality-defect-catalog', payload).then((r) => r.data.data);
export const updateDefect = (id, payload) => axiosClient.put(`/quality-defect-catalog/${id}`, payload).then((r) => r.data.data);
export const deleteDefect = (id) => axiosClient.delete(`/quality-defect-catalog/${id}`).then((r) => r.data.data);
