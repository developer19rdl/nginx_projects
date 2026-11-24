import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/checklist.api';

/** Templates currently assigned+active for a machine, each with its done/not-done status for the
 * current period (Daily=today, Weekly=this ISO week, Monthly=this month) - the Checklist list
 * screen's data source. */
export function useAssignedChecklists(machineId, scheduleDate) {
  return useQuery({
    queryKey: ['assigned-checklists', machineId, scheduleDate],
    queryFn: () => api.listAssignedChecklists(machineId, scheduleDate),
    enabled: !!machineId && !!scheduleDate,
  });
}

export function useChecklistTemplate(templateId) {
  return useQuery({
    queryKey: ['checklist-template', templateId],
    queryFn: () => api.getChecklistTemplate(templateId),
    enabled: !!templateId,
  });
}

export function useChecklistSubmission(templateId, machineId, scheduleDate) {
  return useQuery({
    queryKey: ['checklist-submission', templateId, machineId, scheduleDate],
    queryFn: () => api.getChecklistSubmission(templateId, machineId, scheduleDate),
    enabled: !!templateId && !!machineId && !!scheduleDate,
  });
}

export function useSubmitChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.submitChecklist(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklist-submission'] });
      qc.invalidateQueries({ queryKey: ['assigned-checklists'] });
    },
  });
}
