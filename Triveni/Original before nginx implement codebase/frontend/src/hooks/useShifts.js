import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/shift.api';

export function useShifts(params) {
  return useQuery({ queryKey: ['shifts', params], queryFn: () => api.listShifts(params) });
}

function invalidateShifts(qc) {
  qc.invalidateQueries({ queryKey: ['shifts'] });
  // A shift's timing/active-state feeds Machine Planning's shift dropdown, the operator app's
  // Shift Performance section, and every Machine Insights OEE figure - all keyed off the same
  // Shift master, so a create/update here should invalidate that read too.
  qc.invalidateQueries({ queryKey: ['po-shift-summary'] });
}

export function useCreateShift() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createShift, onSuccess: () => invalidateShifts(qc) });
}

export function useUpdateShift() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...payload }) => api.updateShift(id, payload), onSuccess: () => invalidateShifts(qc) });
}
