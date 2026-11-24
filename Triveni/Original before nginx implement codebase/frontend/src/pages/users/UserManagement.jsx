import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import dayjs from 'dayjs';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SecurityIcon from '@mui/icons-material/Security';
import PageHeader from '../../components/common/PageHeader';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormDialog from '../../components/common/FormDialog';
import { useAuth } from '../../contexts/AuthContext';
import { PERMISSIONS } from '../../constants';
import { useUsers, useRoles, useCreateUser, useUpdateUser, useSetUserStatus, useResetUserPassword } from '../../hooks/useUsers';

const emptyForm = { fullName: '', email: '', password: '', roleId: '' };

export default function UserManagement() {
  const navigate = useNavigate();
  const { user: currentUser, hasPermission } = useAuth();
  const [filters, setFilters] = useState({ page: 1, pageSize: 25, search: '', status: '' });
  const update = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = creating, a user row = editing
  const [form, setForm] = useState(emptyForm);
  const [deactivating, setDeactivating] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetResult, setResetResult] = useState(null);

  const { data, isLoading } = useUsers({ ...filters, search: filters.search || undefined, status: filters.status || undefined });
  const { data: roles } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const setUserStatus = useSetUserStatus();
  const resetPassword = useResetUserPassword();

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setForm({ fullName: row.full_name, email: row.email, password: '', roleId: row.role_id });
    setFormOpen(true);
  };

  const mutation = editing ? updateUser : createUser;
  const canSubmit = editing
    ? Boolean(form.fullName.trim() && form.roleId)
    : Boolean(form.fullName.trim() && form.email.trim() && form.password.length >= 8 && form.roleId);

  const submit = async () => {
    if (editing) {
      await updateUser.mutateAsync({ id: editing.id, fullName: form.fullName.trim(), roleId: Number(form.roleId) });
    } else {
      await createUser.mutateAsync({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        roleId: Number(form.roleId),
      });
    }
    setFormOpen(false);
  };

  const confirmDeactivate = async () => {
    await setUserStatus.mutateAsync({ id: deactivating.id, status: 'Inactive' });
    setDeactivating(null);
  };

  const activate = (row) => setUserStatus.mutate({ id: row.id, status: 'Active' });

  const openResetPassword = (row) => {
    setResetResult(null);
    setResetTarget(row);
  };
  const confirmResetPassword = async () => {
    const result = await resetPassword.mutateAsync(resetTarget.id);
    setResetResult(result);
  };
  const closeResetPassword = () => {
    setResetTarget(null);
    setResetResult(null);
  };

  const columns = [
    {
      key: 'full_name',
      label: 'Name',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.full_name}
            {row.id === currentUser.id && ' (You)'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.email}
          </Typography>
        </Box>
      ),
    },
    { key: 'role_name', label: 'Role' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'last_login_at',
      label: 'Last Login',
      render: (row) => (row.last_login_at ? dayjs(row.last_login_at).format('DD MMM YYYY, hh:mm A') : 'Never'),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send Password Reset Link">
            <IconButton size="small" onClick={() => openResetPassword(row)}>
              <LockResetIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.status === 'Active' ? (
            <Tooltip title={row.id === currentUser.id ? "You can't deactivate your own account" : 'Deactivate'}>
              <span>
                <IconButton size="small" color="error" disabled={row.id === currentUser.id} onClick={() => setDeactivating(row)}>
                  <BlockIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          ) : row.status === 'Inactive' ? (
            <Tooltip title="Activate">
              <IconButton size="small" color="success" onClick={() => activate(row)}>
                <CheckCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        icon={<PeopleAltIcon />}
        title="Users"
        subtitle="Manage application accounts, roles, and access"
        actions={
          <>
            {hasPermission(PERMISSIONS.ROLE_MANAGE) && (
              <Button variant="outlined" startIcon={<SecurityIcon />} onClick={() => navigate('/roles')}>
                Roles & Permissions
              </Button>
            )}
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              New User
            </Button>
          </>
        }
      />

      <FilterBar>
        <TextField
          label="Search"
          placeholder="Name or email"
          size="small"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          sx={{ minWidth: 240 }}
        />
        <TextField select label="Status" size="small" sx={{ minWidth: 160 }} value={filters.status} onChange={(e) => update({ status: e.target.value })}>
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
          <MenuItem value="Locked">Locked</MenuItem>
        </TextField>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={data?.data}
        meta={data?.meta}
        loading={isLoading}
        onPageChange={(page) => update({ page })}
        onPageSizeChange={(pageSize) => update({ pageSize, page: 1 })}
        emptyMessage="No users found"
      />

      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit User' : 'New User'}
        onSubmit={submit}
        submitLabel={editing ? 'Save Changes' : 'Create User'}
        canSubmit={canSubmit}
        loading={mutation.isPending}
        error={mutation.isError && (mutation.error.response?.data?.message || 'Could not save user')}
      >
        <TextField
          label="Full Name"
          required
          autoFocus
          autoComplete="off"
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
        />
        <TextField
          label="Email"
          type="email"
          required
          disabled={!!editing}
          // "off" (not "email") - this creates someone else's account, so the browser shouldn't
          // offer to fill it with the signed-in admin's own saved email/password (that mismatch
          // is exactly what silently blocked submission: the visible autofilled text never made
          // it into form state, so Create User stayed disabled with no obvious reason why).
          autoComplete="off"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          helperText={editing ? 'Email cannot be changed once an account is created' : undefined}
        />
        {!editing && (
          <TextField
            label="Password"
            type="password"
            required
            // "new-password" is the standard signal browsers respect to stop suggesting/filling a
            // saved login password here, since this sets a new account's password, not the
            // admin's own.
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            error={form.password.length > 0 && form.password.length < 8}
            helperText={form.password.length > 0 && form.password.length < 8 ? 'Password must be at least 8 characters' : 'Minimum 8 characters'}
          />
        )}
        <TextField select label="Role" required value={form.roleId} onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}>
          {roles?.map((r) => (
            <MenuItem key={r.id} value={r.id}>
              {r.role_name}
            </MenuItem>
          ))}
        </TextField>
      </FormDialog>

      <ConfirmDialog
        open={!!deactivating}
        title="Deactivate User"
        message={`Deactivate "${deactivating?.full_name}"? They will no longer be able to sign in until reactivated.`}
        confirmLabel="Deactivate"
        danger
        loading={setUserStatus.isPending}
        onConfirm={confirmDeactivate}
        onClose={() => setDeactivating(null)}
      />

      <Dialog open={!!resetTarget} onClose={closeResetPassword} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        {resetResult ? (
          <>
            <DialogContent>
              <DialogContentText sx={{ mb: resetResult.resetLink ? 2 : 0 }}>{resetResult.message}</DialogContentText>
              {/* Only present when SMTP isn't configured (dev/local) - see mailer.service.js - since
                  there's no real inbox to check in that case. Same convention as the login page's
                  own Forgot Password dialog. */}
              {resetResult.resetLink && (
                <Alert severity="info" sx={{ wordBreak: 'break-all' }}>
                  No email server is configured in this environment, so here's the link directly:
                  <br />
                  <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {resetResult.resetLink}
                  </Box>
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={closeResetPassword} variant="contained">
                Done
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogContent>
              <DialogContentText>
                Send a password reset link to <strong>{resetTarget?.email}</strong>? Their current password stays valid
                until they open the link.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeResetPassword} disabled={resetPassword.isPending}>
                Cancel
              </Button>
              <Button variant="contained" onClick={confirmResetPassword} disabled={resetPassword.isPending}>
                {resetPassword.isPending ? 'Sending...' : 'Send Link'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
