import axiosClient from './axiosClient';

export const listCapa = (params) => axiosClient.get('/quality-capa', { params }).then((r) => r.data.data);
export const updateCapa = (id, payload) => axiosClient.put(`/quality-capa/${id}`, payload).then((r) => r.data.data);
export const closeCapa = (id) => axiosClient.post(`/quality-capa/${id}/close`).then((r) => r.data.data);
