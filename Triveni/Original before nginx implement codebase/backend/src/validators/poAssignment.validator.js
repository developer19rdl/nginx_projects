const { z } = require('zod');

const assignSchema = z.object({
  detailIds: z.array(z.number().int().positive()).min(1, 'Select at least one row'),
  machineId: z.number().int().positive(),
  scheduleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'scheduleDate must be YYYY-MM-DD'),
  shiftId: z.number().int().positive(),
});

const producedQtySchema = z.object({
  producedQty: z.number().nonnegative(),
});

const coilInfoSchema = z.object({
  coilNo: z.string().max(50).nullable().optional(),
  grade: z.string().max(50).nullable().optional(),
  coilSize: z.string().max(50).nullable().optional(),
  coilWt: z.number().nonnegative().nullable().optional(),
});

module.exports = { assignSchema, producedQtySchema, coilInfoSchema };
