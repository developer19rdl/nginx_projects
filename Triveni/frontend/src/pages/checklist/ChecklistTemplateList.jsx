import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import AssignMachinesDialog from '../../components/checklist/AssignMachinesDialog';
import { useChecklistTemplates, useDeleteChecklistTemplate } from '../../hooks/useChecklistTemplates';

const FREQUENCY_COLORS = { DAILY: 'info', WEEKLY: 'secondary', MONTHLY: 'warning' };

const TEMPLATE_COLUMNS = (onAssign, onDelete, navigate) => [
  { key: 'title', label: 'Title' },
  { key: 'department', label: 'Department', render: (row) => row.department || '—' },
  {
    key: 'frequency',
    label: 'Frequency',
    render: (row) => <Chip size="small" label={row.frequency} color={FREQUENCY_COLORS[row.frequency]} />,
  },
  { key: 'question_count', label: 'Questions' },
  { key: 'machine_count', label: 'Machines Assigned' },
  {
    key: 'is_active',
    label: 'Status',
    render: (row) => <Chip size="small" label={row.is_active ? 'Active' : 'Inactive'} color={row.is_active ? 'success' : 'default'} />,
  },
  {
    key: 'actions',
    label: '',
    render: (row) => (
      <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
        <IconButton size="small" onClick={() => onAssign(row.id)} title="Assign Machines">
          <GroupAddIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => navigate(`/checklist-templates/${row.id}/edit`)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => onDelete(row)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    ),
  },
];

export default function ChecklistTemplateList() {
  const navigate = useNavigate();
  const [assigningId, setAssigningId] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);

  const { data: templates, isLoading } = useChecklistTemplates({ activeOnly: false });
  const deleteTemplate = useDeleteChecklistTemplate();

  const confirmDelete = async () => {
    await deleteTemplate.mutateAsync(deletingTemplate.id);
    setDeletingTemplate(null);
  };

  return (
    <Box>
      <PageHeader
        title="Checklist Templates"
        subtitle="Inspection/maintenance checklists, assignable to one or more machines"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/checklist-templates/new')}>
            New Template
          </Button>
        }
      />

      <DataTable
        columns={TEMPLATE_COLUMNS(setAssigningId, setDeletingTemplate, navigate)}
        rows={templates}
        loading={isLoading}
        emptyMessage="No checklist templates yet"
        onRowClick={(row) => navigate(`/checklist-templates/${row.id}/edit`)}
      />

      {assigningId && <AssignMachinesDialog templateId={assigningId} onClose={() => setAssigningId(null)} />}

      <ConfirmDialog
        open={!!deletingTemplate}
        title="Delete Checklist Template"
        message={`Remove "${deletingTemplate?.title}"? It will no longer appear on any assigned machine, but existing submission history is kept.`}
        confirmLabel="Delete"
        danger
        loading={deleteTemplate.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeletingTemplate(null)}
      />
    </Box>
  );
}
