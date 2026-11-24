import axiosClient from './axiosClient';

export const listChecklistTemplates = (params) => axiosClient.get('/checklist-templates', { params }).then((r) => r.data.data);
export const getChecklistTemplate = (id) => axiosClient.get(`/checklist-templates/${id}`).then((r) => r.data.data);
export const createChecklistTemplate = (payload) => axiosClient.post('/checklist-templates', payload).then((r) => r.data.data);
export const updateChecklistTemplate = (id, payload) => axiosClient.put(`/checklist-templates/${id}`, payload).then((r) => r.data.data);
export const deleteChecklistTemplate = (id) => axiosClient.delete(`/checklist-templates/${id}`).then((r) => r.data.data);

export const listTemplateAssignments = (id) => axiosClient.get(`/checklist-templates/${id}/assignments`).then((r) => r.data.data);
export const replaceTemplateAssignments = (id, machineIds) =>
  axiosClient.put(`/checklist-templates/${id}/assignments`, { machineIds }).then((r) => r.data.data);
