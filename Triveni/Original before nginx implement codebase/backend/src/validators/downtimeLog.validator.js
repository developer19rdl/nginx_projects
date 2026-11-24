const { z } = require('zod');

const startDowntimeSchema = z.object({
  machineId: z.number().int().positive(),
  reasonId: z.number().int().positive(),
});

module.exports = { startDowntimeSchema };
