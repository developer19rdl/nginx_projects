const { z } = require('zod');

// machines.device_id is VARCHAR(50) and machines.slave_id is INT UNSIGNED, so the incoming
// values are coerced to match those columns rather than compared loosely - devices are expected
// to send Device_ID/Slave_ID/prod_qty as JSON numbers (per the sample payload) but this tolerates
// them arriving as numeric strings too, which is common with PLC/gateway firmware.
const mqttProductionMessageSchema = z.object({
  Device_ID: z.coerce.string().min(1),
  Slave_ID: z.coerce.number().int().nonnegative(),
  DATE: z.string().min(1),
  TIME: z.string().min(1),
  prod_qty: z.coerce.number().nonnegative(),
});

module.exports = { mqttProductionMessageSchema };
