const { z } = require('zod');

const submitChecklistSchema = z.object({
  templateId: z.number().int().positive(),
  machineId: z.number().int().positive(),
  scheduleDate: z.string().min(1),
  supervisorName: z.string().max(150).nullable().optional(),
  comments: z.string().max(500).nullable().optional(),
  responses: z.array(
    z.object({
      questionId: z.number().int().positive(),
      responseValue: z.string().nullable().optional(),
      remarks: z.string().max(500).nullable().optional(),
    })
  ),
});

module.exports = { submitChecklistSchema };
