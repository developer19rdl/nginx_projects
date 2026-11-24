import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/qualityInspectionPlan.api';

export function useInspectionPlans(params) {
  return useQuery({ queryKey: ['quality-inspection-plans', params], queryFn: () => api.listInspectionPlans(params) });
}

export function useInspectionPlan(id) {
  return useQuery({ queryKey: ['quality-inspection-plan', id], queryFn: () => api.getInspectionPlan(id), enabled: !!id });
}

export function useCreateInspectionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createInspectionPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quality-inspection-plans'] }),
  });
}

export function useUpdateInspectionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => api.updateInspectionPlan(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['quality-inspection-plans'] });
      qc.invalidateQueries({ queryKey: ['quality-inspection-plan', id] });
    },
  });
}

export function useDeleteInspectionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteInspectionPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quality-inspection-plans'] }),
  });
}
