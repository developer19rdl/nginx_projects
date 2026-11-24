import { useState } from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import FormDialog from '../common/FormDialog';
import { useMachines } from '../../hooks/useMachines';
import { useTemplateAssignments, useReplaceTemplateAssignments } from '../../hooks/useChecklistTemplates';

/** Which machines this checklist template currently applies to. Pre-checks whatever's already
 * actively assigned, and Save replaces the whole set in one call (matches the backend's
 * replace-whole-assignment-set-on-save design - simpler than separate assign/unassign actions). */
export default function AssignMachinesDialog({ templateId, onClose }) {
  const { data: machines } = useMachines({ pageSize: 200 });
  const { data: assignments, isLoading } = useTemplateAssignments(templateId);
  const replaceMutation = useReplaceTemplateAssignments(templateId);

  const [selected, setSelected] = useState(null);

  // Seed local selection from the currently-active assignments once loaded.
  if (selected === null && assignments) {
    setSelected(new Set(assignments.filter((a) => a.assignment_active).map((a) => a.id)));
  }

  const toggle = (machineId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(machineId)) next.delete(machineId);
      else next.add(machineId);
      return next;
    });
  };

  const save = async () => {
    await replaceMutation.mutateAsync([...selected]);
    onClose();
  };

  return (
    <FormDialog
      onClose={onClose}
      title="Assign Machines"
      maxWidth="xs"
      onSubmit={save}
      canSubmit={!!selected}
      loading={replaceMutation.isPending}
      error={replaceMutation.isError && (replaceMutation.error.response?.data?.message || 'Save failed')}
    >
      {isLoading || !selected ? (
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      ) : (
        <FormGroup>
          {machines?.data?.map((m) => (
            <FormControlLabel
              key={m.id}
              control={<Checkbox checked={selected.has(m.id)} onChange={() => toggle(m.id)} />}
              label={`${m.machine_code} - ${m.machine_name}`}
            />
          ))}
        </FormGroup>
      )}
    </FormDialog>
  );
}
