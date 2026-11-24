import { useQuery } from '@tanstack/react-query';
import * as api from '../api/dashboard.api';

export function useDashboardSummary() {
  return useQuery({ queryKey: ['dashboard-summary'], queryFn: api.getDashboardSummary });
}

export function useDashboardCharts() {
  return useQuery({ queryKey: ['dashboard-charts'], queryFn: api.getDashboardCharts });
}

/** Polls every 10s so the floor dashboard reflects new produced-qty/downtime events without a
 * manual refresh - cheap enough (a handful of machines, one query) to poll rather than wire up a
 * websocket for it. keepPreviousData avoids the grid flashing to a loading state on every tick. */
export function useMachinesLive() {
  return useQuery({
    queryKey: ['dashboard-machines-live'],
    queryFn: api.getMachinesLive,
    refetchInterval: 10000,
    keepPreviousData: true,
  });
}

/** Powers the Machine Insights panel - only enabled while it's actually open (`machineId` is
 * null when closed), and polls a bit slower than the card grid since it's a much heavier query
 * (per-shift breakdowns + an audit-trail scan) that only one supervisor is looking at at a time. */
export function useMachineInsights(machineId) {
  return useQuery({
    queryKey: ['dashboard-machine-insights', machineId],
    queryFn: () => api.getMachineInsights(machineId),
    enabled: machineId != null,
    refetchInterval: 20000,
    keepPreviousData: true,
  });
}

/** Powers the Downtime Trends card's Today/Weekly/Monthly period switcher - a separate query keyed
 * by (machineId, period) so flipping the period doesn't refetch or block on the rest of the
 * Machine Details page. Deliberately no keepPreviousData: the card is meant to show a loading
 * skeleton on every period switch (each period's chart/stats shape is different enough that
 * interpolating from the previous one wouldn't read as "loading", it'd read as a glitch). */
export function useDowntimeTrends(machineId, period) {
  return useQuery({
    queryKey: ['dashboard-machine-downtime-trends', machineId, period],
    queryFn: () => api.getDowntimeTrends(machineId, period),
    enabled: machineId != null,
    refetchInterval: 30000,
  });
}

/** Powers the Production Trend card's Today/Weekly/Monthly period switcher - same reasoning as
 * useDowntimeTrends: its own query keyed by (machineId, period), no keepPreviousData so a period
 * switch shows the loading skeleton rather than a stale/mismatched chart. */
export function useProductionTrend(machineId, period) {
  return useQuery({
    queryKey: ['dashboard-machine-production-trend', machineId, period],
    queryFn: () => api.getProductionTrend(machineId, period),
    enabled: machineId != null,
    refetchInterval: 30000,
  });
}
