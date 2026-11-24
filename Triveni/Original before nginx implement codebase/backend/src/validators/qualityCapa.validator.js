const { z } = require('zod');

const updateCapaSchema = z.object({
  correctiveAction: z.string().min(1).max(500),
  preventiveAction: z.string().max(500).nullable().optional(),
  ownerId: z.number().int().positive().nullable().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dueDate must be YYYY-MM-DD').nullable().optional(),
});

module.exports = { updateCapaSchema };
