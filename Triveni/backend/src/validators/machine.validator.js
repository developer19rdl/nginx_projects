const { z } = require('zod');

const machineSchema = z.object({
  machineCode: z.string().min(1).max(50),
  machineName: z.string().min(1).max(150),
  machineType: z.string().max(50).nullable().optional(),
  deviceId: z.string().max(50).nullable().optional(),
  slaveId: z.number().int().nonnegative().nullable().optional(),
  productionRate: z.number().nonnegative(),
  capacityPerDay: z.number().nonnegative().nullable().optional(),
  location: z.string().max(150).nullable().optional(),
  status: z.enum(['Available', 'Running', 'Maintenance', 'Breakdown', 'Inactive']).optional(),
});

const machineStatusSchema = z.object({
  status: z.enum(['Available', 'Running', 'Maintenance', 'Breakdown', 'Inactive']),
});

module.exports = { machineSchema, machineStatusSchema };
