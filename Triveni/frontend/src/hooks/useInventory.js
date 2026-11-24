import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/inventory.api';

export function useInventorySummary(itemCode) {
  return useQuery({ queryKey: ['inventory-summary', itemCode], queryFn: () => api.getInventorySummary(itemCode) });
}

export function useBatchStock(params) {
  return useQuery({ queryKey: ['inventory-batch-stock', params], queryFn: () => api.getBatchStock(params) });
}

export function useInventoryLedger(params) {
  return useQuery({ queryKey: ['inventory-ledger', params], queryFn: () => api.getInventoryLedger(params), enabled: !!params?.itemCode });
}

export function useInventoryTransactions(params) {
  return useQuery({ queryKey: ['inventory-transactions', params], queryFn: () => api.listInventoryTransactions(params) });
}

/** Powers the "View Inventory Transaction" link on a released Quality Report. */
export function useInventoryTransaction(id) {
  return useQuery({ queryKey: ['inventory-transaction', id], queryFn: () => api.getInventoryTransaction(id), enabled: !!id });
}

/** Looks up a released report's posted transaction by inspection id - used so the "View
 * Inventory Transaction" button still works after a page reload, not just right after the
 * release mutation's own response. */
export function useInventoryTransactionByInspection(inspectionId) {
  return useQuery({
    queryKey: ['inventory-transaction-by-inspection', inspectionId],
    queryFn: () => api.getInventoryTransactionByInspection(inspectionId),
    enabled: !!inspectionId,
  });
}

export function useStockHolds(status) {
  return useQuery({ queryKey: ['inventory-holds', status], queryFn: () => api.listStockHolds(status) });
}

export function useWarehouses(params) {
  return useQuery({ queryKey: ['warehouses', params], queryFn: () => api.listWarehouses(params) });
}

export function useWarehouseLocations(warehouseId) {
  return useQuery({
    queryKey: ['warehouse-locations', warehouseId],
    queryFn: () => api.listWarehouseLocations(warehouseId),
    enabled: !!warehouseId,
  });
}

export function useAllWarehouseLocations(params) {
  return useQuery({ queryKey: ['all-warehouse-locations', params], queryFn: () => api.listAllWarehouseLocations(params) });
}

function invalidateInventory(qc) {
  qc.invalidateQueries({ queryKey: ['inventory-summary'] });
  qc.invalidateQueries({ queryKey: ['inventory-batch-stock'] });
  qc.invalidateQueries({ queryKey: ['inventory-ledger'] });
  qc.invalidateQueries({ queryKey: ['inventory-transactions'] });
  qc.invalidateQueries({ queryKey: ['inventory-holds'] });
}

export function useDispatchStock() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.dispatchStock, onSuccess: () => invalidateInventory(qc) });
}

export function useTransferStock() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.transferStock, onSuccess: () => invalidateInventory(qc) });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.adjustStock, onSuccess: () => invalidateInventory(qc) });
}

export function useHoldStock() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.holdStock, onSuccess: () => invalidateInventory(qc) });
}

export function useReleaseStockHold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.releaseStockHold(id, payload),
    onSuccess: () => invalidateInventory(qc),
  });
}

function invalidateWarehouses(qc) {
  qc.invalidateQueries({ queryKey: ['warehouses'] });
  qc.invalidateQueries({ queryKey: ['warehouse-locations'] });
  qc.invalidateQueries({ queryKey: ['all-warehouse-locations'] });
}

export function useCreateWarehouse() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createWarehouse, onSuccess: () => invalidateWarehouses(qc) });
}

export function useSetWarehouseActive() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, isActive }) => api.setWarehouseActive(id, isActive), onSuccess: () => invalidateWarehouses(qc) });
}

export function useCreateWarehouseLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ warehouseId, ...payload }) => api.createWarehouseLocation(warehouseId, payload),
    onSuccess: () => invalidateWarehouses(qc),
  });
}

export function useSetWarehouseLocationActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, isActive }) => api.setWarehouseLocationActive(locationId, isActive),
    onSuccess: () => invalidateWarehouses(qc),
  });
}
