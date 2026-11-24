import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/masters.api';

export function useUsers(params) {
  return useQuery({ queryKey: ['users', params], queryFn: () => api.listUsers(params) });
}

export function useRoles() {
  return useQuery({ queryKey: ['roles'], queryFn: api.listRoles, staleTime: 5 * 60 * 1000 });
}

function invalidateUsers(qc) {
  qc.invalidateQueries({ queryKey: ['users'] });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createUser, onSuccess: () => invalidateUsers(qc) });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...payload }) => api.updateUser(id, payload), onSuccess: () => invalidateUsers(qc) });
}

export function useSetUserStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }) => api.setUserStatus(id, status), onSuccess: () => invalidateUsers(qc) });
}

/** No cache to invalidate - this only sends a reset-password link, it doesn't change any user
 * field the table displays. */
export function useResetUserPassword() {
  return useMutation({ mutationFn: (id) => api.resetUserPassword(id) });
}
