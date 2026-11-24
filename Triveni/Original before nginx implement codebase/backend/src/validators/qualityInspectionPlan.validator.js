const { z } = require('zod');

const PARAMETER_CATEGORIES = [
  'DIMENSION',
  'WEIGHT',
  'SURFACE_FINISH',
  'VISUAL',
  'HARDNESS',
  'COLOR',
  'THREAD_CHECK',
  'FUNCTIONAL_TEST',
  'CUSTOM',
];

const parameterSchema = z.object({
  id: z.number().int().positive().optional(),
  parameterName: z.string().min(1).max(150),
  parameterCategory: z.enum(PARAMETER_CATEGORIES),
  specification: z.string().max(200).nullable().optional(),
  tolerance: z.string().max(100).nullable().optional(),
  unitOfMeasure: z.string().max(30).nullable().optional(),
  isMandatory: z.union([z.literal(0), z.literal(1), z.boolean()]).optional(),
});

const qualityInspectionPlanSchema = z.object({
  itemCode: z.string().max(100).nullable().optional(),
  planName: z.string().min(1).max(150),
  inspectionType: z.enum(['INCOMING', 'IN_PROCESS', 'FINAL']),
  sampleSize: z.number().int().positive().optional(),
  isActive: z.union([z.literal(0), z.literal(1), z.boolean()]).optional(),
  parameters: z.array(parameterSchema).min(1, 'At least one parameter is required'),
});

module.exports = { qualityInspectionPlanSchema, PARAMETER_CATEGORIES };
