import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/machine.api';

export function useMachines(params) {
  return useQuery({ queryKey: ['machines', params], queryFn: () => api.listMachines(params), keepPreviousData: true });
}

export function useCreateMachine() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createMachine, onSuccess: () => qc.invalidateQueries({ queryKey: ['machines'] }) });
}

export function useUpdateMachine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => api.updateMachine(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['machines'] }),
  });
}

export function useDeleteMachine() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.deleteMachine, onSuccess: () => qc.invalidateQueries({ queryKey: ['machines'] }) });
}

export function useSetMachineStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => api.setMachineStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['machines'] }),
  });
}

