import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/qualityDefectCatalog.api';

export function useDefectCatalog(params) {
  return useQuery({ queryKey: ['quality-defect-catalog', params], queryFn: () => api.listDefects(params) });
}

export function useCreateDefect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createDefect,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quality-defect-catalog'] }),
  });
}

export function useUpdateDefect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => api.updateDefect(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quality-defect-catalog'] }),
  });
}

export function useDeleteDefect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteDefect,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quality-defect-catalog'] }),
  });
}
