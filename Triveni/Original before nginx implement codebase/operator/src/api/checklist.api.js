import axiosClient from './axiosClient';

export const listAssignedChecklists = (machineId, scheduleDate) =>
  axiosClient.get('/checklist/for-machine', { params: { machineId, scheduleDate } }).then((r) => r.data.data);

export const getChecklistTemplate = (id) => axiosClient.get(`/checklist-templates/${id}`).then((r) => r.data.data);

export const getChecklistSubmission = (templateId, machineId, scheduleDate) =>
  axiosClient.get('/checklist/submission', { params: { templateId, machineId, scheduleDate } }).then((r) => r.data.data);

export const submitChecklist = (payload) => axiosClient.post('/checklist/submit', payload).then((r) => r.data.data);
