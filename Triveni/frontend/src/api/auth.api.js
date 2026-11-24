import axiosClient from './axiosClient';

export const login = (payload) => axiosClient.post('/auth/login', payload).then((r) => r.data.data);
export const me = () => axiosClient.get('/auth/me').then((r) => r.data.data);

export const forgotPassword = (email) => axiosClient.post('/auth/forgot-password', { email }).then((r) => r.data.data);
export const resetPassword = (token, newPassword) =>
  axiosClient.post('/auth/reset-password', { token, newPassword }).then((r) => r.data.data);
