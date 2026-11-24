const poDetailRepository = require('../repositories/poDetail.repository');
const machineRepository = require('../repositories/machine.repository');
const auditService = require('./audit.service');
const websocketService = require('./websocket.service');
const logger = require('../utils/logger');
const { mqttProductionMessageSchema } = require('../validators/mqttMessage.validator');

/**
 * Handles one raw MQTT message off the production topic - JSON.parse -> validate -> locate the
 * machine's active (RUNNING) production record by Device_ID+Slave_ID -> apply the reading.
 * Deliberately never throws: every failure mode (bad JSON, missing fields, unknown device, no
 * active run, a stale/duplicate reading) is logged and swallowed so one bad message can never
 * take down the MQTT listener - see mqttClient.service.js, which calls this per message.
 */
async function processMessage(rawMessage) {
  let parsed;
  try {
    parsed = JSON.parse(rawMessage);
  } catch (err) {
    logger.warn('MQTT production message is not valid JSON', { error: err.message, rawMessage: truncate(rawMessage) });
    return;
  }

  const result = mqttProductionMessageSchema.safeParse(parsed);
  if (!result.success) {
    logger.warn('MQTT production message failed validation', {
      errors: result.error.flatten().fieldErrors,
      payload: parsed,
    });
    return;
  }

  const { Device_ID: deviceId, Slave_ID: slaveId, DATE: date, TIME: time, prod_qty: prodQty } = result.data;
  const logCtx = { deviceId, slaveId, date, time, prodQty };

  const activeRow = await poDetailRepository.findActiveByDeviceSlave({ deviceId, slaveId });
  if (!activeRow) {
    const machine = await machineRepository.findByDeviceSlave(deviceId, slaveId);
    if (!machine) {
      logger.warn('MQTT production message references an unknown Device_ID/Slave_ID - ignored', logCtx);
    } else {
      logger.info('MQTT production message received but nothing is currently RUNNING on this machine - ignored', {
        ...logCtx,
        machineCode: machine.machine_code,
      });
    }
    return;
  }

  const wasApplied = await poDetailRepository.applyMqttProducedQty({ id: activeRow.id, prodQty });
  if (!wasApplied) {
    // prodQty didn't advance past what's already stored (an exact duplicate, a stale/out-of-order
    // reading, or the row already completed between the lookup above and this update) - this is
    // exactly the idempotent no-op path, not an error.
    logger.debug('MQTT production reading ignored (duplicate or stale - not newer than current produced_qty)', {
      ...logCtx,
      machinePlanningId: activeRow.id,
      currentProducedQty: activeRow.produced_qty,
    });
    return;
  }

  const updated = await poDetailRepository.findById(activeRow.id);
  const justCompleted = updated.production_status === 'COMPLETED' && activeRow.production_status === 'RUNNING';

  logger.info('MQTT production reading applied', {
    ...logCtx,
    machinePlanningId: activeRow.id,
    orderId: activeRow.order_id,
    previousProducedQty: activeRow.produced_qty,
    plannedQty: activeRow.quantity,
    completed: justCompleted,
  });

  await auditService.record({
    action: 'UPDATE',
    module: 'machine_planning',
    recordId: activeRow.id,
    oldValue: { produced_qty: activeRow.produced_qty, production_status: activeRow.production_status },
    newValue: { produced_qty: updated.produced_qty, production_status: updated.production_status },
    remarks: `Updated via MQTT (Device ${deviceId} / Slave ${slaveId}, device timestamp ${date} ${time})`,
  });

  websocketService.emitProductionUpdate(updated);

  if (justCompleted) {
    logger.info('Production completed via MQTT', {
      machinePlanningId: activeRow.id,
      orderId: activeRow.order_id,
      producedQty: updated.produced_qty,
      plannedQty: activeRow.quantity,
      productionEndAt: updated.production_end_at,
    });
  }
}

function truncate(str, max = 500) {
  const s = String(str);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

module.exports = { processMessage };
