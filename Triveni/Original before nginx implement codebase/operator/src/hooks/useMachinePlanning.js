import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/machinePlanning.api';
import * as machineApi from '../api/machine.api';
import { lookupCoilInfo } from '../api/coilLookup.api';

export function useMachines() {
  return useQuery({ queryKey: ['machines'], queryFn: () => machineApi.listMachines({ pageSize: 200 }) });
}

export function useShiftSummary() {
  return useQuery({ queryKey: ['shift-summary'], queryFn: api.getShiftSummary });
}

// Loads automatically once Machine + Date are known (Shift is optional - blank means every
// shift), not gated behind an explicit Load click any more - live updates after that come from
// the WebSocket (useProductionSocket), which patches this exact query's cache directly, not from
// polling. See ShiftPlan.jsx.
export function useByMachine(machineId, shiftId, scheduleDate) {
  return useQuery({
    queryKey: ['by-machine', machineId, shiftId, scheduleDate],
    queryFn: () => api.listByMachine(machineId, shiftId, scheduleDate),
    enabled: !!machineId && !!scheduleDate,
  });
}

/** Replaces one row (by id) in every cached `by-machine` list that contains it - a partial key
 * match (there's normally just one loaded at a time) rather than a specific [machineId, shiftId,
 * scheduleDate] key, since these mutations are called per-row without that context. Used instead
 * of invalidateQueries: an invalidate forces a full-list refetch (and this screen's isLoading
 * gate briefly blanks the whole table for it) for something the mutation response - and shortly
 * after, the WebSocket - already gives us for free. */
function patchRowInCache(qc, row) {
  if (!row?.id) return;
  qc.setQueriesData({ queryKey: ['by-machine'] }, (rows) => {
    if (!rows) return rows;
    const idx = rows.findIndex((r) => r.id === row.id);
    if (idx === -1) return rows;
    const next = [...rows];
    next[idx] = row;
    return next;
  });
}

export function useStartProduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.startProduction(id),
    onSuccess: (row) => patchRowInCache(qc, row),
  });
}

export function useStopProduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.stopProduction(id),
    onSuccess: (row) => patchRowInCache(qc, row),
  });
}

export function useResumeProduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.resumeProduction(id),
    onSuccess: (row) => patchRowInCache(qc, row),
  });
}

export function useResetProduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.resetProduction(id),
    onSuccess: (row) => patchRowInCache(qc, row),
  });
}

export function useUpdateProducedQty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, producedQty }) => api.updateProducedQty(id, producedQty),
    onSuccess: (row) => patchRowInCache(qc, row),
  });
}

// Coil Info isn't pushed over the WebSocket (it's not part of the production-timer feed), so this
// still needs an actual refetch to pick up the change.
export function useUpdateCoilInfo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, coilInfo }) => api.updateCoilInfo(id, coilInfo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['by-machine'] }),
  });
}

/** Looks up coil details from the external coil API by coil number. This is a lookup, not a
 * write, so it's a mutation only because it's user-triggered on click rather than automatic. */
export function useLookupCoilInfo() {
  return useMutation({ mutationFn: (coilNo) => lookupCoilInfo(coilNo) });
}
