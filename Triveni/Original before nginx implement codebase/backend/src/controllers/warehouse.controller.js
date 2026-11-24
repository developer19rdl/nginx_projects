const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const warehouseRepository = require('../repositories/warehouse.repository');
const auditService = require('../services/audit.service');

const list = asyncHandler(async (req, res) => {
  const warehouses = await warehouseRepository.findAllWarehouses({ activeOnly: req.query.activeOnly !== 'false' });
  success(res, { message: 'OK', data: warehouses });
});

const create = asyncHandler(async (req, res) => {
  const warehouse = await warehouseRepository.createWarehouse(req.body);
  await auditService.fromRequest(req, { action: 'CREATE', module: 'warehouse', recordId: warehouse.id, newValue: warehouse });
  success(res, { message: 'Warehouse created', data: warehouse, statusCode: 201 });
});

const setActive = asyncHandler(async (req, res) => {
  const warehouse = await warehouseRepository.setWarehouseActive(Number(req.params.id), req.body.isActive);
  await auditService.fromRequest(req, { action: 'UPDATE', module: 'warehouse', recordId: warehouse.id, newValue: warehouse });
  success(res, { message: 'Warehouse updated', data: warehouse });
});

const listLocations = asyncHandler(async (req, res) => {
  const locations = await warehouseRepository.findLocationsByWarehouse(Number(req.params.id));
  success(res, { message: 'OK', data: locations });
});

const listAllLocations = asyncHandler(async (req, res) => {
  const locations = await warehouseRepository.findAllLocations({ activeOnly: req.query.activeOnly !== 'false' });
  success(res, { message: 'OK', data: locations });
});

const createLocation = asyncHandler(async (req, res) => {
  const location = await warehouseRepository.createLocation({ ...req.body, warehouseId: Number(req.params.id) });
  await auditService.fromRequest(req, { action: 'CREATE', module: 'warehouse_location', recordId: location.id, newValue: location });
  success(res, { message: 'Location created', data: location, statusCode: 201 });
});

const setLocationActive = asyncHandler(async (req, res) => {
  const location = await warehouseRepository.setLocationActive(Number(req.params.locationId), req.body.isActive);
  await auditService.fromRequest(req, { action: 'UPDATE', module: 'warehouse_location', recordId: location.id, newValue: location });
  success(res, { message: 'Location updated', data: location });
});

module.exports = { list, create, setActive, listLocations, listAllLocations, createLocation, setLocationActive };
