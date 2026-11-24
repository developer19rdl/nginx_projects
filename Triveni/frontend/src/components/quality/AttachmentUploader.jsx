import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useAttachments, useUploadAttachment, useDeleteAttachment } from '../../hooks/useQualityAttachments';
import { fetchAttachmentBlobUrl } from '../../api/qualityAttachment.api';

const ATTACHMENT_TYPES = [
  { value: 'PHOTO', label: 'Photo' },
  { value: 'TEST_CERTIFICATE', label: 'Test Certificate' },
  { value: 'MEASUREMENT_REPORT', label: 'Measurement Report' },
  { value: 'CALIBRATION_CERTIFICATE', label: 'Calibration Certificate' },
  { value: 'OTHER', label: 'Other' },
];

/**
 * Generalizes ExcelUpload.jsx's hand-rolled drag/drop shell to accept photos/PDFs for Quality
 * attachments (defect photos, test certificates, measurement/calibration reports) instead of
 * only .xlsx/.xls. `entityType`/`entityId` identify what the uploaded files attach to
 * (INSPECTION/DEFECT/CAPA row id) - the same polymorphic pattern the backend table uses.
 */
export default function AttachmentUploader({ entityType, entityId, disabled }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [attachmentType, setAttachmentType] = useState('PHOTO');

  const { data: attachments, isLoading } = useAttachments(entityType, entityId);
  const uploadMutation = useUploadAttachment(entityType, entityId);
  const deleteMutation = useDeleteAttachment(entityType, entityId);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (!file || disabled) return;
    uploadMutation.mutate({ file, attachmentType });
  };

  const view = async (id) => {
    const url = await fetchAttachmentBlobUrl(id);
    window.open(url, '_blank', 'noopener');
  };

  const dropzoneProps = {
    onDragOver: (e) => {
      e.preventDefault();
      if (!disabled) setDragOver(true);
    },
    onDragLeave: () => setDragOver(false),
    onDrop: (e) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
        <TextField
          select
          size="small"
          label="Attachment Type"
          value={attachmentType}
          onChange={(e) => setAttachmentType(e.target.value)}
          disabled={disabled}
          sx={{ minWidth: 200 }}
        >
          {ATTACHMENT_TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </TextField>
        <Box
          {...dropzoneProps}
          sx={{
            border: '2px dashed',
            borderColor: dragOver ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 1,
            px: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: dragOver ? 'action.hover' : 'background.paper',
            flex: 1,
            minWidth: 220,
          }}
        >
          <UploadFileIcon fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
            Drag & drop a photo or PDF, or
          </Typography>
          <Button size="small" onClick={() => inputRef.current?.click()} disabled={disabled || uploadMutation.isPending}>
            Browse
          </Button>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </Box>
      </Stack>

      {uploadMutation.isPending && <LinearProgress />}
      {uploadMutation.isError && (
        <Alert severity="error" sx={{ py: 0 }}>
          {uploadMutation.error.response?.data?.message || 'Upload failed'}
        </Alert>
      )}

      {!isLoading && attachments?.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {attachments.map((a) => (
            <Chip
              key={a.id}
              icon={<InsertDriveFileIcon fontSize="small" />}
              label={a.file_name}
              size="small"
              variant="outlined"
              onClick={() => view(a.id)}
              onDelete={disabled ? undefined : () => deleteMutation.mutate(a.id)}
              deleteIcon={<DeleteIcon fontSize="small" />}
              sx={{ maxWidth: 220 }}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
