import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/productionPlan.api';

export function usePlans(params) {
  return useQuery({ queryKey: ['production-plans', params], queryFn: () => api.listPlans(params), keepPreviousData: true });
}

export function usePlan(id) {
  return useQuery({ queryKey: ['production-plan', id], queryFn: () => api.getPlan(id), enabled: !!id });
}

export function useUploadExcel() {
  return useMutation({ mutationFn: ({ file, onUploadProgress }) => api.uploadExcel(file, onUploadProgress) });
}

export function useConfirmImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ importId, orderDate, shiftId }) => api.confirmImport(importId, orderDate, shiftId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['production-plans'] }),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.deletePlan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['production-plans'] }),
  });
}
