import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/qualityAttachment.api';

export function useAttachments(entityType, entityId) {
  return useQuery({
    queryKey: ['quality-attachments', entityType, entityId],
    queryFn: () => api.listAttachments(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useUploadAttachment(entityType, entityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.uploadAttachment({ ...payload, entityType, entityId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quality-attachments', entityType, entityId] }),
  });
}

export function useDeleteAttachment(entityType, entityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteAttachment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quality-attachments', entityType, entityId] }),
  });
}
