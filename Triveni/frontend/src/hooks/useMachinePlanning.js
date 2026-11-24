import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/machinePlanning.api';

// machineId is optional - omitting it (the Machine Planning screen's default view) lists every
// machine's plan for the date instead of one machine's.
export function useByMachine(machineId, shiftId, scheduleDate) {
  return useQuery({
    queryKey: ['po-by-machine', machineId, shiftId, scheduleDate],
    queryFn: () => api.listByMachine(machineId, shiftId, scheduleDate),
    enabled: !!scheduleDate,
  });
}

// Shift options are always every active shift from the Shift master, independent of machine or
// date - there's no more per-machine/per-date allocation to look up.
export function useShiftSummary() {
  return useQuery({ queryKey: ['po-shift-summary'], queryFn: api.getShiftSummary });
}

export function useUnassigned(params) {
  return useQuery({ queryKey: ['po-unassigned', params], queryFn: () => api.listUnassigned(params) });
}

function invalidateAll(qc) {
  qc.invalidateQueries({ queryKey: ['po-by-machine'] });
  qc.invalidateQueries({ queryKey: ['po-shift-summary'] });
  qc.invalidateQueries({ queryKey: ['po-unassigned'] });
  qc.invalidateQueries({ queryKey: ['production-plans'] });
  qc.invalidateQueries({ queryKey: ['production-plan'] });
}

export function useUnassignRow() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.unassignRow, onSuccess: () => invalidateAll(qc) });
}

export function useAssignToMachine() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.assignToMachine, onSuccess: () => invalidateAll(qc) });
}
