const { z } = require('zod');

const questionSchema = z.object({
  id: z.number().int().positive().optional(),
  questionText: z.string().min(1).max(300),
  responseType: z.enum(['YES_NO', 'OK_NOT_OK', 'PASS_FAIL', 'VALUE', 'TEXT', 'DROPDOWN', 'CHECKBOX']),
  dropdownOptions: z.array(z.string().min(1)).optional().nullable(),
  isMandatory: z.union([z.literal(0), z.literal(1), z.boolean()]).optional(),
});

const checklistTemplateSchema = z.object({
  title: z.string().min(1).max(200),
  department: z.string().max(100).nullable().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  isActive: z.union([z.literal(0), z.literal(1), z.boolean()]).optional(),
  questions: z.array(questionSchema).min(1),
});

const assignMachinesSchema = z.object({
  machineIds: z.array(z.number().int().positive()),
});

module.exports = { checklistTemplateSchema, assignMachinesSchema };
