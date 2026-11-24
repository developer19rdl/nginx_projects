import axiosClient from './axiosClient';

export const listPendingInspections = () => axiosClient.get('/quality-inspections/pending').then((r) => r.data.data);

export const listInspections = (params) =>
  axiosClient.get('/quality-inspections', { params }).then((r) => ({ rows: r.data.data, meta: r.data.meta }));

export const getInspection = (id) => axiosClient.get(`/quality-inspections/${id}`).then((r) => r.data.data);

export const startInspection = (machinePlanningId, inspectionType) =>
  axiosClient
    .post(`/quality-inspections/from-lot/${machinePlanningId}`, inspectionType ? { inspectionType } : {})
    .then((r) => r.data.data);

export const saveParameterResults = (id, results) =>
  axiosClient.post(`/quality-inspections/${id}/parameter-results`, { results }).then((r) => r.data.data);

export const addDefect = (id, payload) => axiosClient.post(`/quality-inspections/${id}/defects`, payload).then((r) => r.data.data);

export const removeDefect = (id, defectId) =>
  axiosClient.delete(`/quality-inspections/${id}/defects/${defectId}`).then((r) => r.data.data);

export const recordDecision = (id, payload) => axiosClient.post(`/quality-inspections/${id}/decision`, payload).then((r) => r.data.data);

export const reopenInspection = (id) => axiosClient.post(`/quality-inspections/${id}/reopen`).then((r) => r.data.data);

export const releaseToInventory = (id) => axiosClient.post(`/quality-inspections/${id}/release`).then((r) => r.data.data);

export const downloadInspectionPdf = async (id, inspectionNo) => {
  const response = await axiosClient.get(`/quality-inspections/${id}/pdf`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${inspectionNo || `inspection-${id}`}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadInspectionExcel = async (id, inspectionNo) => {
  const response = await axiosClient.get(`/quality-inspections/${id}/excel`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(
    new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${inspectionNo || `inspection-${id}`}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
