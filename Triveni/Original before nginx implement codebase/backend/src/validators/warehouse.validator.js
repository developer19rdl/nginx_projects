const { z } = require('zod');

const warehouseSchema = z.object({
  warehouseCode: z.string().min(1).max(30),
  warehouseName: z.string().min(1).max(150),
});

const locationSchema = z.object({
  locationCode: z.string().min(1).max(50),
  locationName: z.string().max(150).nullable().optional(),
});

const activeSchema = z.object({
  isActive: z.boolean(),
});

module.exports = { warehouseSchema, locationSchema, activeSchema };
