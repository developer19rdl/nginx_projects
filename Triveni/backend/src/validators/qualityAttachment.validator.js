const { z } = require('zod');

// Multipart form fields arrive as strings (multer doesn't coerce text fields), so entityId is
// validated as a numeric string here and Number()-converted in the controller.
const uploadAttachmentSchema = z.object({
  entityType: z.enum(['INSPECTION', 'DEFECT', 'CAPA']),
  entityId: z.string().regex(/^\d+$/, 'entityId must be numeric'),
  attachmentType: z.enum(['PHOTO', 'TEST_CERTIFICATE', 'MEASUREMENT_REPORT', 'CALIBRATION_CERTIFICATE', 'OTHER']),
});

module.exports = { uploadAttachmentSchema };
