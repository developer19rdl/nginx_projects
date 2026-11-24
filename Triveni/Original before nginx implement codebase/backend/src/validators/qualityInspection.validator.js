const { z } = require('zod');

const startInspectionSchema = z.object({
  inspectionType: z.enum(['INCOMING', 'IN_PROCESS', 'FINAL']).optional(),
});

const parameterResultSchema = z.object({
  planParameterId: z.number().int().positive().nullable().optional(),
  parameterName: z.string().min(1).max(150),
  parameterCategory: z.enum([
    'DIMENSION',
    'WEIGHT',
    'SURFACE_FINISH',
    'VISUAL',
    'HARDNESS',
    'COLOR',
    'THREAD_CHECK',
    'FUNCTIONAL_TEST',
    'CUSTOM',
  ]),
  specification: z.string().max(200).nullable().optional(),
  tolerance: z.string().max(100).nullable().optional(),
  unitOfMeasure: z.string().max(30).nullable().optional(),
  actualValue: z.string().max(255).nullable().optional(),
  result: z.enum(['PASS', 'FAIL']).nullable().optional(),
  remarks: z.string().max(300).nullable().optional(),
});

const saveParameterResultsSchema = z.object({
  results: z.array(parameterResultSchema),
});

const defectEntrySchema = z.object({
  defectCatalogId: z.number().int().positive(),
  quantityRejected: z.number().nonnegative(),
  notes: z.string().max(300).nullable().optional(),
});

const capaSchema = z.object({
  correctiveAction: z.string().min(1).max(500),
  preventiveAction: z.string().max(500).nullable().optional(),
  ownerId: z.number().int().positive().nullable().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dueDate must be YYYY-MM-DD').nullable().optional(),
});

const decisionSchema = z.object({
  status: z.enum(['APPROVED', 'APPROVED_WITH_DEVIATION', 'PARTIALLY_ACCEPTED', 'REWORK_REQUIRED', 'REJECTED', 'HOLD']),
  quantityAccepted: z.number().nonnegative().nullable().optional(),
  quantityRework: z.number().nonnegative().nullable().optional(),
  quantityRejected: z.number().nonnegative().nullable().optional(),
  rejectionReason: z.string().max(300).nullable().optional(),
  rootCause: z.string().max(300).nullable().optional(),
  correctiveAction: z.string().max(300).nullable().optional(),
  preventiveAction: z.string().max(300).nullable().optional(),
  remarks: z.string().max(500).nullable().optional(),
  capa: capaSchema.nullable().optional(),
});

module.exports = { startInspectionSchema, saveParameterResultsSchema, defectEntrySchema, decisionSchema };
