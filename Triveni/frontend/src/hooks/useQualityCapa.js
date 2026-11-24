import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/qualityCapa.api';

export function useCapaList(params) {
  return useQuery({ queryKey: ['quality-capa', params], queryFn: () => api.listCapa(params) });
}

export function useUpdateCapa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => api.updateCapa(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quality-capa'] }),
  });
}

export function useCloseCapa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.closeCapa,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quality-capa'] }),
  });
}
