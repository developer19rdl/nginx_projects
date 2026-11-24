const { z } = require('zod');

const downtimeReasonSchema = z.object({
  reasonName: z.string().min(1).max(100),
  isActive: z.union([z.literal(0), z.literal(1), z.boolean()]).optional(),
});

module.exports = { downtimeReasonSchema };
