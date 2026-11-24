import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/downtime.api';

export function useDowntimeReasons() {
  return useQuery({ queryKey: ['downtime-reasons'], queryFn: api.listDowntimeReasons });
}

/** The currently-running downtime for a machine, if any - this is what makes "resume" work: the
 * modal calls this on every open and, if something is already running, jumps straight to the live
 * timer view instead of the Start form. */
export function useActiveDowntime(machineId) {
  return useQuery({
    queryKey: ['active-downtime', machineId],
    queryFn: () => api.getActiveDowntime(machineId),
    enabled: !!machineId,
  });
}

export function useStartDowntime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ machineId, reasonId }) => api.startDowntime(machineId, reasonId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['active-downtime'] }),
  });
}

export function useEndDowntime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.endDowntime(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['active-downtime'] }),
  });
}

/** Downtime events for a specific Machine + Date + Shift - powers the Operator Log's Shift
 * Activity Summary (distinct from useActiveDowntime, which is just "is it down right now"). */
export function useDowntimeByMachineShift(machineId, scheduleDate, shiftId) {
  return useQuery({
    queryKey: ['downtime-by-machine', machineId, scheduleDate, shiftId],
    queryFn: () => api.listDowntimeByMachine(machineId, scheduleDate, shiftId),
    enabled: !!machineId && !!scheduleDate && !!shiftId,
  });
}
