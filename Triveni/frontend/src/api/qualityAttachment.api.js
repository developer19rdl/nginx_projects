import axiosClient from './axiosClient';

export const listAttachments = (entityType, entityId) =>
  axiosClient.get('/quality-attachments', { params: { entityType, entityId } }).then((r) => r.data.data);

export const uploadAttachment = ({ file, entityType, entityId, attachmentType }, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', entityType);
  formData.append('entityId', entityId);
  formData.append('attachmentType', attachmentType);
  return axiosClient
    .post('/quality-attachments', formData, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress })
    .then((r) => r.data.data);
};

export const deleteAttachment = (id) => axiosClient.delete(`/quality-attachments/${id}`).then((r) => r.data.data);

/** The file route requires auth like everything else, so a plain <img src>/<a href> can't hit it
 * directly (the browser won't attach the Bearer token) - fetch it as a blob through axiosClient
 * instead and hand back an object URL the caller can open/display, then revoke when done. */
export const fetchAttachmentBlobUrl = async (id) => {
  const response = await axiosClient.get(`/quality-attachments/${id}/file`, { responseType: 'blob' });
  return URL.createObjectURL(response.data);
};
