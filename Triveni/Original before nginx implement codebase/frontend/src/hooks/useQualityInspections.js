import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/qualityInspection.api';

export function usePendingInspections() {
  return useQuery({ queryKey: ['quality-inspections-pending'], queryFn: api.listPendingInspections });
}

export function useInspections(params) {
  return useQuery({ queryKey: ['quality-inspections', params], queryFn: () => api.listInspections(params) });
}

export function useInspection(id) {
  return useQuery({ queryKey: ['quality-inspection', id], queryFn: () => api.getInspection(id), enabled: !!id });
}

function invalidateInspection(qc, id) {
  qc.invalidateQueries({ queryKey: ['quality-inspection', id] });
  qc.invalidateQueries({ queryKey: ['quality-inspections'] });
  qc.invalidateQueries({ queryKey: ['quality-inspections-pending'] });
}

export function useStartInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ machinePlanningId, inspectionType }) => api.startInspection(machinePlanningId, inspectionType),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quality-inspections-pending'] }),
  });
}

export function useSaveParameterResults(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (results) => api.saveParameterResults(id, results),
    onSuccess: () => invalidateInspection(qc, id),
  });
}

export function useAddDefect(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.addDefect(id, payload),
    onSuccess: () => invalidateInspection(qc, id),
  });
}

export function useRemoveDefect(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (defectId) => api.removeDefect(id, defectId),
    onSuccess: () => invalidateInspection(qc, id),
  });
}

export function useRecordDecision(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.recordDecision(id, payload),
    onSuccess: () => invalidateInspection(qc, id),
  });
}

export function useReopenInspection(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.reopenInspection(id),
    onSuccess: () => invalidateInspection(qc, id),
  });
}

export function useReleaseToInventory(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.releaseToInventory(id),
    onSuccess: () => {
      invalidateInspection(qc, id);
      qc.invalidateQueries({ queryKey: ['inventory-summary'] });
      qc.invalidateQueries({ queryKey: ['inventory-batch-stock'] });
      qc.invalidateQueries({ queryKey: ['inventory-ledger'] });
      qc.invalidateQueries({ queryKey: ['inventory-transactions'] });
    },
  });
}
