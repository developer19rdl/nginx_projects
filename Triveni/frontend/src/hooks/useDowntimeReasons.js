import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/downtimeReason.api';

export function useDowntimeReasons(params) {
  return useQuery({ queryKey: ['downtime-reasons', params], queryFn: () => api.listDowntimeReasons(params) });
}

export function useCreateDowntimeReason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createDowntimeReason,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['downtime-reasons'] }),
  });
}

export function useUpdateDowntimeReason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => api.updateDowntimeReason(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['downtime-reasons'] }),
  });
}

export function useDeleteDowntimeReason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteDowntimeReason,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['downtime-reasons'] }),
  });
}
