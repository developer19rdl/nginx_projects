const { z } = require('zod');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

const shiftSchema = z.object({
  shiftCode: z.string().min(1).max(20),
  shiftName: z.string().min(1).max(100),
  startTime: z.string().regex(timeRegex, 'startTime must be HH:MM or HH:MM:SS'),
  endTime: z.string().regex(timeRegex, 'endTime must be HH:MM or HH:MM:SS'),
  breakDurationMinutes: z.number().int().nonnegative().optional(),
  isActive: z.union([z.literal(0), z.literal(1)]).optional(),
});

module.exports = { shiftSchema };
