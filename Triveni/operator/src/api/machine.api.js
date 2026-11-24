import axiosClient from './axiosClient';

export const listMachines = (params) => axiosClient.get('/machines', { params }).then((r) => r.data);
