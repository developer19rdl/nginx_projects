import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/checklistTemplate.api';

export function useChecklistTemplates(params) {
  return useQuery({ queryKey: ['checklist-templates', params], queryFn: () => api.listChecklistTemplates(params) });
}

export function useChecklistTemplate(id) {
  return useQuery({ queryKey: ['checklist-template', id], queryFn: () => api.getChecklistTemplate(id), enabled: !!id });
}

export function useCreateChecklistTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createChecklistTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist-templates'] }),
  });
}

export function useUpdateChecklistTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => api.updateChecklistTemplate(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['checklist-templates'] });
      qc.invalidateQueries({ queryKey: ['checklist-template', id] });
    },
  });
}

export function useDeleteChecklistTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteChecklistTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist-templates'] }),
  });
}

export function useTemplateAssignments(id) {
  return useQuery({
    queryKey: ['checklist-template-assignments', id],
    queryFn: () => api.listTemplateAssignments(id),
    enabled: !!id,
  });
}

export function useReplaceTemplateAssignments(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (machineIds) => api.replaceTemplateAssignments(id, machineIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklist-template-assignments', id] });
      qc.invalidateQueries({ queryKey: ['checklist-templates'] });
    },
  });
}
