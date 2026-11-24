import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/role.api';

const ROLES_KEY = ['roles-managed'];
const PERMISSIONS_KEY = ['permissions-catalog'];

export function useManagedRoles() {
  return useQuery({ queryKey: ROLES_KEY, queryFn: api.listManagedRoles });
}

/** The fixed permission catalog every role picks from - see role.repository.js#listPermissionCatalog
 * for why this isn't itself creatable/editable through the UI. Rarely changes (only when a new
 * `requirePermission(...)` check ships), so a long staleTime avoids refetching it on every dialog open. */
export function usePermissionCatalog() {
  return useQuery({ queryKey: PERMISSIONS_KEY, queryFn: api.listPermissionCatalog, staleTime: 10 * 60 * 1000 });
}

export function useRole(id) {
  return useQuery({ queryKey: ['role', id], queryFn: () => api.getRole(id), enabled: Number.isFinite(id) });
}

function invalidateRoles(qc) {
  qc.invalidateQueries({ queryKey: ROLES_KEY });
  // The plain active-role list (User creation/edit's "Role" dropdown) shares the same underlying
  // data - a role rename/activation here should show up there too without a manual refresh.
  qc.invalidateQueries({ queryKey: ['roles'] });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createRole, onSuccess: () => invalidateRoles(qc) });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...payload }) => api.updateRole(id, payload), onSuccess: () => invalidateRoles(qc) });
}

export function useSetRoleActive() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, isActive }) => api.setRoleActive(id, isActive), onSuccess: () => invalidateRoles(qc) });
}

export function useSetRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissionCodes }) => api.setRolePermissions(id, permissionCodes),
    onSuccess: (_data, { id }) => {
      invalidateRoles(qc);
      qc.invalidateQueries({ queryKey: ['role', id] });
    },
  });
}
