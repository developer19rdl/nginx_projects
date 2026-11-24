const { z } = require('zod');

const qualityDefectSchema = z.object({
  defectCode: z.string().min(1).max(30),
  defectName: z.string().min(1).max(150),
  category: z.enum(['CRITICAL', 'MAJOR', 'MINOR']),
  description: z.string().max(300).nullable().optional(),
  isActive: z.union([z.literal(0), z.literal(1), z.boolean()]).optional(),
});

module.exports = { qualityDefectSchema };
