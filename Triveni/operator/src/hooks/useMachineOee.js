import { useQuery } from '@tanstack/react-query';
import * as api from '../api/machineOee.api';

/** Powers the Home screen's Run/Idle/Down KPIs and OEE card - same payload the admin dashboard's
 * Machine Insights panel uses (machineInsights.service.js#getMachineInsights), reached here via
 * /machines/:id/insights instead of /dashboard/machines/:id/insights since the operator role has
 * MACHINE_VIEW but not the admin dashboard permission (see machines.routes.js). Polls every 20s
 * so the numbers stay live without the operator having to refresh. */
export function useMachineOee(machineId) {
  return useQuery({
    queryKey: ['machine-oee', machineId],
    queryFn: () => api.getMachineInsights(machineId),
    enabled: machineId != null,
    refetchInterval: 20000,
    keepPreviousData: true,
  });
}
