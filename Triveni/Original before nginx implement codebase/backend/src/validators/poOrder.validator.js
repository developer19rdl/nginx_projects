const { z } = require('zod');

const confirmImportSchema = z.object({
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'orderDate must be YYYY-MM-DD'),
  shiftId: z.number().int().positive(),
});

module.exports = { confirmImportSchema };
