import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RuleIcon from '@mui/icons-material/Rule';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShieldIcon from '@mui/icons-material/VerifiedUser';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormDialog from '../../components/common/FormDialog';
import { ROLES } from '../../constants';
import {
  useManagedRoles,
  usePermissionCatalog,
  useRole,
  useCreateRole,
  useUpdateRole,
  useSetRoleActive,
  useSetRolePermissions,
} from '../../hooks/useRoleManagement';

/** Title-cases a module key ("production_plan" -> "Production Plan") for the permission grid's
 * section headings - the catalog only carries the raw snake_case module name. */
function moduleLabel(module) {
  return module
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

/** New/Edit Role - role_code is immutable once created (see role.validator.js), so editing only
 * ever touches name/description. */
function RoleFormDialog({ open, onClose, role }) {
  const isEdit = !!role;
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const [form, setForm] = useState({ roleCode: '', roleName: '', description: '' });
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setForm(isEdit ? { roleCode: role.role_code, roleName: role.role_name, description: role.description || '' } : { roleCode: '', roleName: '', description: '' });
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const mutation = isEdit ? updateRole : createRole;
  const canSubmit = isEdit
    ? form.roleName.trim().length >= 2
    : /^[A-Z][A-Z0-9_]{1,49}$/.test(form.roleCode) && form.roleName.trim().length >= 2;

  const submit = async () => {
    if (isEdit) {
      await updateRole.mutateAsync({ id: role.id, roleName: form.roleName.trim(), description: form.description.trim() || undefined });
    } else {
      await createRole.mutateAsync({ roleCode: form.roleCode.trim(), roleName: form.roleName.trim(), description: form.description.trim() || undefined });
    }
    onClose();
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Role' : 'New Role'}
      onSubmit={submit}
      submitLabel={isEdit ? 'Save Changes' : 'Create Role'}
      canSubmit={canSubmit}
      loading={mutation.isPending}
      error={mutation.isError && (mutation.error.response?.data?.message || 'Could not save role')}
    >
      <TextField
        label="Role Code"
        required
        autoFocus={!isEdit}
        disabled={isEdit}
        placeholder="e.g. QUALITY_LEAD"
        helperText={isEdit ? 'Role code cannot be changed once created' : 'Uppercase letters, numbers and underscores only'}
        value={form.roleCode}
        onChange={(e) => setForm((f) => ({ ...f, roleCode: e.target.value.toUpperCase() }))}
      />
      <TextField
        label="Role Name"
        required
        autoFocus={isEdit}
        value={form.roleName}
        onChange={(e) => setForm((f) => ({ ...f, roleName: e.target.value }))}
      />
      <TextField
        label="Description"
        multiline
        rows={2}
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
      />
    </FormDialog>
  );
}

/** One module's group of permission checkboxes, with a "select all in this module" checkbox at
 * the top (indeterminate when only some of the module's permissions are checked) - saves clicking
 * through each one individually for a role that should just get a whole module's access. */
function ModuleGroup({ module, permissions, selected, onToggle, onToggleAll }) {
  const codes = permissions.map((p) => p.permission_code);
  const checkedCount = codes.filter((c) => selected.has(c)).length;
  const allChecked = checkedCount === codes.length;
  const someChecked = checkedCount > 0 && !allChecked;

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
      <FormControlLabel
        sx={{ mb: 0.5 }}
        control={<Checkbox size="small" checked={allChecked} indeterminate={someChecked} onChange={(e) => onToggleAll(codes, e.target.checked)} />}
        label={
          <Typography variant="subtitle2" fontWeight={700}>
            {moduleLabel(module)}
          </Typography>
        }
      />
      <Stack sx={{ pl: 3 }}>
        {permissions.map((p) => (
          <FormControlLabel
            key={p.permission_code}
            control={<Checkbox size="small" checked={selected.has(p.permission_code)} onChange={() => onToggle(p.permission_code)} />}
            label={
              <Box>
                <Typography variant="body2">{p.permission_code}</Typography>
                {p.description && (
                  <Typography variant="caption" color="text.secondary">
                    {p.description}
                  </Typography>
                )}
              </Box>
            }
          />
        ))}
      </Stack>
    </Box>
  );
}

/** The actual "assign or remove permissions from a role" screen - a full permission catalog,
 * grouped by module, with whatever this role currently holds pre-checked. Save replaces the
 * role's entire permission set in one call (see role.repository.js#replacePermissions) - simplest
 * correct semantics for "here's exactly what should be checked now". */
function RolePermissionsDialog({ roleId, onClose }) {
  const { data: role, isLoading: roleLoading } = useRole(roleId);
  const { data: catalog, isLoading: catalogLoading } = usePermissionCatalog();
  const setPermissions = useSetRolePermissions();

  const [selected, setSelected] = useState(null);
  if (selected === null && role) {
    setSelected(new Set(role.permissionCodes));
  }

  const grouped = useMemo(() => {
    if (!catalog) return [];
    const byModule = new Map();
    for (const p of catalog) {
      if (!byModule.has(p.module)) byModule.set(p.module, []);
      byModule.get(p.module).push(p);
    }
    return [...byModule.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [catalog]);

  const toggle = (code) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const toggleAll = (codes, checked) =>
    setSelected((prev) => {
      const next = new Set(prev);
      codes.forEach((c) => (checked ? next.add(c) : next.delete(c)));
      return next;
    });

  const save = async () => {
    await setPermissions.mutateAsync({ id: roleId, permissionCodes: [...selected] });
    onClose();
  };

  const loading = roleLoading || catalogLoading || !selected;
  const isAdmin = role?.role_code === ROLES.ADMIN;

  return (
    <FormDialog
      open
      onClose={onClose}
      title={role ? `Permissions - ${role.role_name}` : 'Permissions'}
      maxWidth="md"
      onSubmit={save}
      submitLabel="Save Permissions"
      canSubmit={!loading && !isAdmin}
      loading={setPermissions.isPending}
      error={setPermissions.isError && (setPermissions.error.response?.data?.message || 'Could not save permissions')}
    >
      {loading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress size={28} />
        </Stack>
      ) : (
        <>
          {isAdmin && (
            <Alert severity="info">The Administrator role always has every permission and can't be changed here.</Alert>
          )}
          <Typography variant="body2" color="text.secondary">
            {selected.size} of {catalog.length} permissions selected
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {grouped.map(([module, permissions]) => (
              <ModuleGroup key={module} module={module} permissions={permissions} selected={selected} onToggle={toggle} onToggleAll={toggleAll} />
            ))}
          </Box>
        </>
      )}
    </FormDialog>
  );
}

const ROLE_COLUMNS = (onEdit, onManagePermissions, onDeactivate, onActivate) => [
  {
    key: 'role_name',
    label: 'Role',
    render: (row) => (
      <Box>
        <Typography variant="body2" fontWeight={700}>
          {row.role_name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {row.role_code}
        </Typography>
      </Box>
    ),
  },
  { key: 'description', label: 'Description', render: (row) => row.description || '—' },
  {
    key: 'permission_count',
    label: 'Permissions',
    render: (row) => <Chip size="small" variant="outlined" label={`${row.permission_count} assigned`} />,
  },
  { key: 'user_count', label: 'Users', render: (row) => row.user_count },
  { key: 'is_active', label: 'Status', render: (row) => <StatusBadge status={row.is_active ? 'Active' : 'Inactive'} /> },
  {
    key: '',
    label: '',
    render: (row) => {
      const isAdmin = row.role_code === ROLES.ADMIN;
      return (
        <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={isAdmin ? "The Administrator role's permissions can't be changed" : 'Manage Permissions'}>
            <span>
              <IconButton size="small" onClick={() => onManagePermissions(row)} disabled={isAdmin}>
                <RuleIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {row.is_active ? (
            <Tooltip title={isAdmin ? 'The Administrator role cannot be deactivated' : 'Deactivate'}>
              <span>
                <IconButton size="small" color="error" onClick={() => onDeactivate(row)} disabled={isAdmin}>
                  <BlockIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <Tooltip title="Activate">
              <IconButton size="small" color="success" onClick={() => onActivate(row)}>
                <CheckCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      );
    },
  },
];

export default function RoleManagement() {
  const navigate = useNavigate();
  const { data: roles, isLoading } = useManagedRoles();
  const setRoleActive = useSetRoleActive();

  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [permissionsRoleId, setPermissionsRoleId] = useState(null);
  const [deactivatingRole, setDeactivatingRole] = useState(null);

  const openCreate = () => {
    setEditingRole(null);
    setFormOpen(true);
  };
  const openEdit = (row) => {
    setEditingRole(row);
    setFormOpen(true);
  };
  const activate = (row) => setRoleActive.mutate({ id: row.id, isActive: true });
  const confirmDeactivate = async () => {
    await setRoleActive.mutateAsync({ id: deactivatingRole.id, isActive: false });
    setDeactivatingRole(null);
  };

  return (
    <Box>
      <PageHeader
        icon={<ShieldIcon />}
        title="Roles & Permissions"
        subtitle="Define what each role can access - changes apply to everyone with that role automatically"
        onBack={() => navigate('/users')}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            New Role
          </Button>
        }
      />

      <DataTable
        columns={ROLE_COLUMNS(openEdit, (row) => setPermissionsRoleId(row.id), setDeactivatingRole, activate)}
        rows={roles}
        loading={isLoading}
        emptyMessage="No roles yet"
      />

      <RoleFormDialog open={formOpen} onClose={() => setFormOpen(false)} role={editingRole} />

      {permissionsRoleId && <RolePermissionsDialog roleId={permissionsRoleId} onClose={() => setPermissionsRoleId(null)} />}

      <ConfirmDialog
        open={!!deactivatingRole}
        title="Deactivate Role?"
        message={
          deactivatingRole?.user_count > 0
            ? `${deactivatingRole.role_name} is currently assigned to ${deactivatingRole.user_count} user${deactivatingRole.user_count === 1 ? '' : 's'}. Deactivating it only hides it from being assigned to new/edited users - it won't change access for anyone already on this role.`
            : `Deactivate ${deactivatingRole?.role_name}? It will no longer be selectable when creating or editing a user.`
        }
        confirmLabel="Deactivate"
        danger
        loading={setRoleActive.isPending}
        onConfirm={confirmDeactivate}
        onClose={() => setDeactivatingRole(null)}
      />
    </Box>
  );
}
