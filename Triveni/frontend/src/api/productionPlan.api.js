import axiosClient from './axiosClient';

export const uploadExcel = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosClient
    .post('/production-plans/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
    .then((r) => r.data.data);
};

export const confirmImport = (importId, orderDate, shiftId) =>
  axiosClient.post(`/production-plans/imports/${importId}/confirm`, { orderDate, shiftId }).then((r) => r.data.data);

export const getImportErrors = (importId) =>
  axiosClient.get(`/production-plans/imports/${importId}/errors`).then((r) => r.data.data);

export const downloadImportErrors = async (importId) => {
  const response = await axiosClient.get(`/production-plans/imports/${importId}/errors/download`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `import-${importId}-errors.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const downloadTemplate = async () => {
  const response = await axiosClient.get('/production-plans/template', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'production-order-template.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const listPlans = (params) => axiosClient.get('/production-plans', { params }).then((r) => r.data);

export const getPlan = (id) => axiosClient.get(`/production-plans/${id}`).then((r) => r.data.data);

export const deletePlan = (id) => axiosClient.delete(`/production-plans/${id}`).then((r) => r.data.data);
