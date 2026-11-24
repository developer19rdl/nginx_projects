import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import UploadFileIcon from '@mui/icons-material/UploadFile';

/** Drag-and-drop / click-to-browse Excel picker. Calls onFileSelected(file) once chosen.
 * `compact` renders a slim single-row bar instead of the full square dropzone - handy once the
 * picker isn't the main focus of the page any more (e.g. above a validation result). */
export default function ExcelUpload({ onFileSelected, uploading, progress, compact = false }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState(null);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (!file) return;
    setFileName(file.name);
    onFileSelected(file);
  };

  const dropzoneProps = {
    onDragOver: (e) => {
      e.preventDefault();
      setDragOver(true);
    },
    onDragLeave: () => setDragOver(false),
    onDrop: (e) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
  };

  const hiddenInput = (
    <input ref={inputRef} type="file" hidden accept=".xlsx,.xls" onChange={(e) => handleFiles(e.target.files)} />
  );

  if (compact) {
    return (
      <Box
        {...dropzoneProps}
        sx={{
          border: '2px dashed',
          borderColor: dragOver ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 1.5,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: dragOver ? 'action.hover' : 'background.paper',
        }}
      >
        <UploadFileIcon color="primary" />
        <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 0 } }}>
          <Typography variant="body2" noWrap>
            {fileName || 'Drag & drop the Excel file here, or click to browse'}
          </Typography>
          {uploading && (
            <LinearProgress variant={progress != null ? 'determinate' : 'indeterminate'} value={progress} sx={{ mt: 0.5 }} />
          )}
        </Box>
        <Button size="small" variant="outlined" onClick={() => inputRef.current?.click()} disabled={uploading}>
          Select File
        </Button>
        {hiddenInput}
      </Box>
    );
  }

  return (
    <Box
      {...dropzoneProps}
      sx={{
        border: '2px dashed',
        borderColor: dragOver ? 'primary.main' : 'divider',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        bgcolor: dragOver ? 'action.hover' : 'background.paper',
      }}
    >
      <UploadFileIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
      <Typography variant="body1" gutterBottom>
        Drag & drop the production plan Excel file here, or
      </Typography>
      <Button variant="contained" onClick={() => inputRef.current?.click()} disabled={uploading}>
        Select Excel File
      </Button>
      {hiddenInput}
      {fileName && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          {fileName}
        </Typography>
      )}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant={progress != null ? 'determinate' : 'indeterminate'} value={progress} />
        </Box>
      )}
    </Box>
  );
}
