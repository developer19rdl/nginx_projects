import axiosClient from './axiosClient';

export const getInventorySummary = (itemCode) =>
  axiosClient.get('/inventory/summary', { params: itemCode ? { itemCode } : {} }).then((r) => r.data.data);

export const getBatchStock = (params) => axiosClient.get('/inventory/batch-stock', { params }).then((r) => r.data.data);

export const getInventoryLedger = (params) => axiosClient.get('/inventory/ledger', { params }).then((r) => r.data.data);

export const exportInventoryLedger = async (params) => {
  const response = await axiosClient.get('/inventory/ledger/export', { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(
    new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `ledger-${params.itemCode}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const listInventoryTransactions = (params) =>
  axiosClient.get('/inventory/transactions', { params }).then((r) => r.data);

export const getInventoryTransaction = (id) => axiosClient.get(`/inventory/transactions/${id}`).then((r) => r.data.data);

export const getInventoryTransactionByInspection = (inspectionId) =>
  axiosClient.get(`/inventory/transactions/by-inspection/${inspectionId}`).then((r) => r.data.data);

export const dispatchStock = (payload) => axiosClient.post('/inventory/dispatches', payload).then((r) => r.data.data);

export const transferStock = (payload) => axiosClient.post('/inventory/transfers', payload).then((r) => r.data.data);

export const adjustStock = (payload) => axiosClient.post('/inventory/adjustments', payload).then((r) => r.data.data);

export const holdStock = (payload) => axiosClient.post('/inventory/holds', payload).then((r) => r.data.data);

export const releaseStockHold = (id, payload) => axiosClient.post(`/inventory/holds/${id}/release`, payload).then((r) => r.data.data);

export const listStockHolds = (status) => axiosClient.get('/inventory/holds', { params: status ? { status } : {} }).then((r) => r.data.data);

export const listWarehouses = (params) => axiosClient.get('/warehouses', { params }).then((r) => r.data.data);

export const createWarehouse = (payload) => axiosClient.post('/warehouses', payload).then((r) => r.data.data);

export const setWarehouseActive = (id, isActive) => axiosClient.patch(`/warehouses/${id}/active`, { isActive }).then((r) => r.data.data);

export const listWarehouseLocations = (warehouseId) =>
  axiosClient.get(`/warehouses/${warehouseId}/locations`).then((r) => r.data.data);

export const listAllWarehouseLocations = (params) => axiosClient.get('/warehouses/locations', { params }).then((r) => r.data.data);

export const createWarehouseLocation = (warehouseId, payload) =>
  axiosClient.post(`/warehouses/${warehouseId}/locations`, payload).then((r) => r.data.data);

export const setWarehouseLocationActive = (locationId, isActive) =>
  axiosClient.patch(`/warehouses/locations/${locationId}/active`, { isActive }).then((r) => r.data.data);
