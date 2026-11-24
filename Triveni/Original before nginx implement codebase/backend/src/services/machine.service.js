const machineRepository = require('../repositories/machine.repository');
const { parsePagination, buildMeta } = require('../utils/pagination');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');
const { MACHINE_STATUS } = require('../config/constants');

async function list(query) {
  const { page, pageSize, limit, offset } = parsePagination(query);
  const { rows, total } = await machineRepository.findAll({
    search: query.search,
    status: query.status,
    limit,
    offset,
  });
  return { rows, meta: buildMeta({ page, pageSize, total }) };
}

async function getById(id) {
  const machine = await machineRepository.findById(id);
  if (!machine) throw ApiError.notFound('Machine not found');
  return machine;
}

async function create(data, req) {
  const existing = await machineRepository.findByCode(data.machineCode);
  if (existing) throw ApiError.conflict(`Machine code "${data.machineCode}" already exists`);
  const machine = await machineRepository.create({ ...data, createdBy: req.user.id });
  await auditService.fromRequest(req, { action: 'CREATE', module: 'machine', recordId: machine.id, newValue: machine });
  return machine;
}

async function update(id, data, req) {
  const existing = await machineRepository.findById(id);
  if (!existing) throw ApiError.notFound('Machine not found');
  const updated = await machineRepository.update(id, data, req.user.id);
  await auditService.fromRequest(req, {
    action: 'UPDATE',
    module: 'machine',
    recordId: id,
    oldValue: existing,
    newValue: updated,
  });
  return updated;
}

async function setStatus(id, status, req) {
  if (!Object.values(MACHINE_STATUS).includes(status)) throw ApiError.badRequest('Invalid machine status');
  const existing = await machineRepository.findById(id);
  if (!existing) throw ApiError.notFound('Machine not found');
  const updated = await machineRepository.updateStatus(id, status, req.user.id);
  await auditService.fromRequest(req, {
    action: 'STATUS_CHANGE',
    module: 'machine',
    recordId: id,
    oldValue: { status: existing.status },
    newValue: { status },
  });
  return updated;
}

async function remove(id, req) {
  const existing = await machineRepository.findById(id);
  if (!existing) throw ApiError.notFound('Machine not found');
  await machineRepository.deactivate(id, req.user.id);
  await auditService.fromRequest(req, { action: 'DELETE', module: 'machine', recordId: id, oldValue: existing });
}

module.exports = { list, getById, create, update, setStatus, remove };
