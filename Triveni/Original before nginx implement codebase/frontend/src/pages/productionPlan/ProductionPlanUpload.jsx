import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import RuleIcon from '@mui/icons-material/Rule';
import PageHeader from '../../components/common/PageHeader';
import ExcelUpload from '../../components/common/ExcelUpload';
import KpiCard from '../../components/common/KpiCard';
import { useUploadExcel, useConfirmImport } from '../../hooks/useProductionPlans';
import { useShiftSummary } from '../../hooks/useMachinePlanning';
import * as productionPlanApi from '../../api/productionPlan.api';

const STEPS = ['Upload File', 'Validate', 'Schedule & Confirm'];
const MAX_UPLOAD_MB = 25;

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

function HowItWorksStep({ icon, color, title, description }) {
  return (
    <Stack direction="row" spacing={1.5}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => alpha(theme.palette[color].main, 0.15),
          color: `${color}.main`,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Stack>
  );
}

function SummaryRow({ label, value, chip }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      {chip ? (
        <Chip label={value} size="small" color="success" variant="outlined" />
      ) : (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      )}
    </Stack>
  );
}

export default function ProductionPlanUpload() {
  const navigate = useNavigate();
  const uploadMutation = useUploadExcel();
  const confirmMutation = useConfirmImport();
  const { data: shiftOptions } = useShiftSummary();
  const [progress, setProgress] = useState(null);
  const [errorRows, setErrorRows] = useState(null);
  const [orderDate, setOrderDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [shiftId, setShiftId] = useState('');
  const [fileMeta, setFileMeta] = useState(null);

  const handleFileSelected = async (file) => {
    setErrorRows(null);
    uploadMutation.reset();
    setFileMeta({ name: file.name, size: file.size });
    await uploadMutation.mutateAsync({
      file,
      onUploadProgress: (evt) => setProgress(Math.round((evt.loaded * 100) / evt.total)),
    });
  };

  const changeFile = () => {
    setFileMeta(null);
    uploadMutation.reset();
    setErrorRows(null);
  };

  const result = uploadMutation.data;

  const loadErrorRows = async () => {
    if (!result) return;
    const rows = await productionPlanApi.getImportErrors(result.importId);
    setErrorRows(rows);
  };

  const handleConfirm = async () => {
    const order = await confirmMutation.mutateAsync({ importId: result.importId, orderDate, shiftId: Number(shiftId) });
    navigate(`/production-plans/${order.id}`);
  };

  const activeStep = !result ? 0 : result.validRows > 0 ? 2 : 1;
  const selectedShiftName = shiftOptions?.find((s) => String(s.shiftId) === String(shiftId))?.shiftName;

  return (
    <Box>
      <PageHeader
        title="Upload Production Order"
        subtitle="Bring a new plan onto the shop floor in three steps"
        onBack={() => navigate('/production-plans')}
        actions={
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => productionPlanApi.downloadTemplate()}>
            Download Template
          </Button>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(280px, 1fr)' }, gap: 3, alignItems: 'start' }}>
        {/* Main column */}
        <Stack spacing={3} sx={{ minWidth: 0 }}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5 }}>
            {!fileMeta ? (
              <>
                <ExcelUpload onFileSelected={handleFileSelected} uploading={uploadMutation.isPending} progress={progress} compact />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Not sure of the format? Use the Download Template button above first.
                </Typography>
              </>
            ) : (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'success.main',
                    color: 'success.contrastText',
                    flexShrink: 0,
                  }}
                >
                  <InsertDriveFileIcon fontSize="small" />
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={700} noWrap>
                    {fileMeta.name}
                  </Typography>
                  <Typography variant="caption" color={uploadMutation.isError ? 'error.main' : 'success.main'}>
                    {uploadMutation.isPending
                      ? 'Uploading...'
                      : uploadMutation.isError
                        ? 'Upload failed'
                        : '✓ Uploaded successfully'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {formatBytes(fileMeta.size)} · Uploaded just now
                  </Typography>
                </Box>
                <Button size="small" variant="outlined" startIcon={<AutorenewIcon />} onClick={changeFile} disabled={uploadMutation.isPending}>
                  Change File
                </Button>
              </Stack>
            )}
          </Paper>

          {uploadMutation.isError && (
            <Alert severity="error">{uploadMutation.error.response?.data?.message || 'Upload failed'}</Alert>
          )}

          {result && (
            <Paper variant="outlined" sx={{ p: 3 }}>
              {result.invalidRows === 0 ? (
                <Alert
                  icon={<CheckCircleIcon fontSize="inherit" />}
                  severity="success"
                  sx={{ mb: 3, '& .MuiAlert-message': { width: '100%' } }}
                >
                  <Typography variant="body2" fontWeight={700}>
                    Validation Complete
                  </Typography>
                  <Typography variant="body2">
                    {result.validRows} row{result.validRows === 1 ? '' : 's'} {result.validRows === 1 ? 'is' : 'are'} ready for scheduling. No
                    errors were found.
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2" fontWeight={700}>
                    Validation Issues Found
                  </Typography>
                  <Typography variant="body2">
                    {result.invalidRows} row{result.invalidRows === 1 ? '' : 's'} need attention before you can continue
                    {result.validRows > 0 ? ` - the other ${result.validRows} can still be imported.` : '.'}
                  </Typography>
                </Alert>
              )}

              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
                VALIDATION SUMMARY
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: result.invalidRows > 0 ? 2 : 0 }}>
                <KpiCard
                  icon={<DescriptionIcon fontSize="small" />}
                  color="info"
                  label="Total Rows"
                  value={result.totalRows}
                  caption="All rows in the file"
                />
                <KpiCard
                  icon={<CheckCircleIcon fontSize="small" />}
                  color="success"
                  label="Valid Rows"
                  value={result.validRows}
                  caption="Ready to import"
                />
                <KpiCard
                  icon={<ErrorOutlineIcon fontSize="small" />}
                  color="error"
                  label="Invalid Rows"
                  value={result.invalidRows}
                  caption="Errors found"
                />
              </Stack>

              {result.invalidRows > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Button startIcon={<DownloadIcon />} onClick={() => productionPlanApi.downloadImportErrors(result.importId)}>
                    Download Error Report
                  </Button>
                  <Button onClick={loadErrorRows} sx={{ ml: 1 }}>
                    View Errors Inline
                  </Button>
                </Box>
              )}

              {errorRows && (
                <Box sx={{ maxHeight: 300, overflow: 'auto', mb: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Table
                    size="small"
                    sx={{
                      '& .MuiTableCell-root': { border: '1px solid', borderColor: 'divider' },
                      '& .MuiTableHead-root .MuiTableCell-root': { fontWeight: 700, bgcolor: 'action.hover' },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Row</TableCell>
                        <TableCell>Column</TableCell>
                        <TableCell>Error</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {errorRows.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>{e.row_no}</TableCell>
                          <TableCell>{e.column_name}</TableCell>
                          <TableCell>{e.error_message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}

              {result.validRows > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <PlaylistAddCheckIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight={700}>
                      Schedule
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Every valid row will be scheduled onto this Date + Shift.
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                    <TextField
                      label="Schedule Date"
                      type="date"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthIcon fontSize="small" color="action" /></InputAdornment> }}
                      sx={{ width: { xs: '100%', sm: 220 } }}
                    />
                    <TextField
                      select
                      label="Shift"
                      size="small"
                      value={shiftId}
                      onChange={(e) => setShiftId(e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start"><AccessTimeIcon fontSize="small" color="action" /></InputAdornment> }}
                      sx={{ width: { xs: '100%', sm: 200 } }}
                    >
                      {shiftOptions?.map((s) => (
                        <MenuItem key={s.shiftId} value={s.shiftId}>
                          {s.shiftName}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>
                    IMPORT SUMMARY
                  </Typography>
                  <Paper variant="outlined" sx={{ px: 2, py: 0.5, mb: 3, bgcolor: 'action.hover' }}>
                    <SummaryRow label="Rows to Import" value={result.validRows} />
                    <Divider />
                    <SummaryRow label="Schedule Date" value={dayjs(orderDate).format('DD MMM YYYY')} />
                    <Divider />
                    <SummaryRow label="Shift" value={selectedShiftName || '—'} />
                    <Divider />
                    <SummaryRow label="Row Priority" value="From Template" chip />
                    <Divider />
                    <SummaryRow label="Order No" value="Auto-generated" chip />
                  </Paper>

                  {confirmMutation.isError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {confirmMutation.error.response?.data?.message || 'Import failed'}
                    </Alert>
                  )}

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<RocketLaunchIcon />}
                    disabled={!orderDate || !shiftId || confirmMutation.isPending}
                    onClick={handleConfirm}
                    sx={{ py: 1.5 }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                        {confirmMutation.isPending ? 'Importing...' : `Import & Schedule ${result.validRows} Row${result.validRows === 1 ? '' : 's'}`}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.85 }}>
                        This will create 1 production order with {result.validRows} valid row{result.validRows === 1 ? '' : 's'}.
                      </Typography>
                    </Box>
                  </Button>
                </>
              )}
            </Paper>
          )}
        </Stack>

        {/* Sidebar */}
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
              How it works
            </Typography>
            <Stack spacing={2}>
              <HowItWorksStep
                icon={<UploadFileIcon fontSize="small" />}
                color="success"
                title="1. Upload File"
                description="Upload your production order template in Excel format."
              />
              <HowItWorksStep
                icon={<FactCheckIcon fontSize="small" />}
                color="success"
                title="2. Validate"
                description="We'll validate your file and show you any issues to fix."
              />
              <HowItWorksStep
                icon={<EventAvailableIcon fontSize="small" />}
                color="primary"
                title="3. Schedule & Confirm"
                description="Choose a date and shift, then confirm to import your rows."
              />
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <RuleIcon fontSize="small" color="action" />
              <Typography variant="subtitle2" fontWeight={700}>
                File requirements
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {[
                'Excel file (.xlsx or .xls) only',
                `Maximum file size: ${MAX_UPLOAD_MB} MB`,
                'First row should contain column headers',
                'Do not delete or rename columns',
              ].map((req) => (
                <Stack key={req} direction="row" spacing={1} alignItems="flex-start">
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary', mt: 1, flexShrink: 0 }} />
                  <Typography variant="body2" color="text.secondary">
                    {req}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
