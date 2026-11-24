import axiosClient from './axiosClient';

export const login = (payload) => axiosClient.post('/auth/login', payload).then((r) => r.data.data);
