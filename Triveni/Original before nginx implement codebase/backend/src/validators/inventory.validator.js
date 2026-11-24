const { z } = require('zod');

const dispatchSchema = z.object({
  itemCode: z.string().min(1).max(100),
  size: z.string().max(50).nullable().optional(),
  lotNo: z.string().max(50).nullable().optional(),
  quantity: z.number().positive(),
  warehouseId: z.number().int().positive().nullable().optional(),
  locationId: z.number().int().positive().nullable().optional(),
  referenceNo: z.string().max(100).nullable().optional(),
  remarks: z.string().max(500).nullable().optional(),
});

const transferSchema = z.object({
  itemCode: z.string().min(1).max(100),
  size: z.string().max(50).nullable().optional(),
  lotNo: z.string().max(50).nullable().optional(),
  quantity: z.number().positive(),
  fromWarehouseId: z.number().int().positive(),
  fromLocationId: z.number().int().positive(),
  toWarehouseId: z.number().int().positive(),
  toLocationId: z.number().int().positive(),
  remarks: z.string().max(500).nullable().optional(),
});

const adjustmentSchema = z.object({
  itemCode: z.string().min(1).max(100),
  size: z.string().max(50).nullable().optional(),
  lotNo: z.string().max(50).nullable().optional(),
  warehouseId: z.number().int().positive(),
  locationId: z.number().int().positive(),
  quantity: z.number().positive(),
  direction: z.enum(['IN', 'OUT']),
  reason: z.string().min(1).max(500),
});

const holdSchema = z.object({
  itemCode: z.string().min(1).max(100),
  size: z.string().max(50).nullable().optional(),
  lotNo: z.string().max(50).nullable().optional(),
  warehouseId: z.number().int().positive(),
  locationId: z.number().int().positive(),
  quantity: z.number().positive(),
  reason: z.string().min(1).max(500),
});

const releaseHoldSchema = z.object({
  remarks: z.string().max(500).nullable().optional(),
});

module.exports = { dispatchSchema, transferSchema, adjustmentSchema, holdSchema, releaseHoldSchema };
