import { useQuery } from '@tanstack/react-query';
import * as api from '../api/masters.api';

export function useItems(params) {
  return useQuery({ queryKey: ['items', params], queryFn: () => api.listItems(params), keepPreviousData: true });
}

export function useOperators() {
  return useQuery({ queryKey: ['operators'], queryFn: api.listOperators });
}

export function useRoles() {
  return useQuery({ queryKey: ['roles'], queryFn: api.listRoles });
}
