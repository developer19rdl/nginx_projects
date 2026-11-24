import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ReplayIcon from '@mui/icons-material/Replay';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import DownloadIcon from '@mui/icons-material/Download';
import PageHeader from '../../components/common/PageHeader';
import AttachmentUploader from '../../components/quality/AttachmentUploader';
import StatusBadge from '../../components/common/StatusBadge';
import { QUALITY_STATUS_LABELS } from '../../constants';
import * as mastersApi from '../../api/masters.api';
import { downloadInspectionPdf, downloadInspectionExcel } from '../../api/qualityInspection.api';
import {
  useInspection,
  useSaveParameterResults,
  useAddDefect,
  useRemoveDefect,
  useRecordDecision,
  useReopenInspection,
  useReleaseToInventory,
} from '../../hooks/useQualityInspections';
import { useInspectionPlan, useInspectionPlans } from '../../hooks/useQualityInspectionPlans';
import { useDefectCatalog } from '../../hooks/useQualityDefectCatalog';
import { useInventoryTransactionByInspection } from '../../hooks/useInventory';
import InventoryTransactionDialog from '../../components/inventory/InventoryTransactionDialog';

const EDITABLE_STATUSES = ['UNDER_INSPECTION', 'HOLD'];
const CATEGORY_LABELS = {
  DIMENSION: 'Dimension',
  WEIGHT: 'Weight',
  SURFACE_FINISH: 'Surface Finish',
  VISUAL: 'Visual Inspection',
  HARDNESS: 'Hardness',
  COLOR: 'Color',
  THREAD_CHECK: 'Thread Check',
  FUNCTIONAL_TEST: 'Functional Test',
  CUSTOM: 'Custom',
};

function InfoField({ label, value }) {
  return (
    <Grid item xs={6} sm={3}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value ?? '—'}
      </Typography>
    </Grid>
  );
}

/** Live preview under the decision form's quantity fields - shows exactly what will happen to
 * Finished Goods stock if this decision is released, before the inspector commits to it. Only
 * the accepted quantity ever moves to FG stock; rework/rejected are shown for context but never
 * counted as a receipt. */
function InventoryImpactPreview({ produced, accepted, rework, rejected, lotNo }) {
  const acceptedNum = Number(accepted) || 0;
  const reworkNum = Number(rework) || 0;
  const rejectedNum = Number(rejected) || 0;
  const producedNum = Number(produced) || 0;
  const overCommitted = acceptedNum + reworkNum + rejectedNum > producedNum;

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'action.hover' : 'grey.50') }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <Inventory2Icon fontSize="small" color="action" />
        <Typography variant="subtitle2" fontWeight={700}>
          Inventory Impact Preview
        </Typography>
      </Stack>
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <InfoField label="Production Quantity" value={producedNum} />
        <InfoField label="Accepted Quantity" value={acceptedNum} />
        <InfoField label="Rework Quantity" value={reworkNum} />
        <InfoField label="Rejected Quantity" value={rejectedNum} />
      </Grid>
      <Divider sx={{ mb: 1.5 }} />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="body2" fontWeight={700}>
          FG Store Receipt
        </Typography>
        <Typography variant="h6" fontWeight={800} color="success.main">
          +{acceptedNum}
        </Typography>
      </Stack>
      <Grid container spacing={1.5}>
        <InfoField label="Warehouse" value="Finished Goods Warehouse" />
        <InfoField label="Location" value="Default Location" />
        <InfoField label="Batch" value={lotNo || '—'} />
      </Grid>
      {overCommitted && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          Accepted + Rework + Rejected cannot exceed the produced quantity ({producedNum}).
        </Alert>
      )}
    </Paper>
  );
}

const emptyParamRow = () => ({
  key: `new-${Math.random()}`,
  planParameterId: null,
  parameterName: '',
  parameterCategory: 'CUSTOM',
  specification: '',
  tolerance: '',
  unitOfMeasure: '',
  actualValue: '',
  result: null,
  remarks: '',
});

export default function InspectionReport() {
  const navigate = useNavigate();
  const { id } = useParams();
  const inspectionId = Number(id);

  const { data: inspection, isLoading } = useInspection(inspectionId);
  const { data: plan, isLoading: planLoading } = useInspectionPlan(inspection?.inspection_plan_id);
  // If this inspection started before a matching Inspection Plan existed, inspection_plan_id is
  // null and no parameters get pre-filled. Rather than leave the inspector to retype each
  // parameter by hand, look for a plan that matches now (same item+type rule the backend uses at
  // creation time: item-specific first, then a generic item-less plan) and offer to load it.
  const { data: allPlans } = useInspectionPlans({ activeOnly: true });
  const catchUpPlan =
    !inspection?.inspection_plan_id && allPlans
      ? allPlans.find((p) => p.item_code === inspection?.item_code && p.inspection_type === inspection?.inspection_type) ||
        allPlans.find((p) => !p.item_code && p.inspection_type === inspection?.inspection_type)
      : null;
  const { data: catchUpPlanDetail } = useInspectionPlan(catchUpPlan?.id);
  const { data: defectCatalog } = useDefectCatalog({ activeOnly: true });
  const { data: users } = useQuery({
    queryKey: ['users-for-capa'],
    queryFn: () => mastersApi.listUsers({ pageSize: 200 }).then((r) => r.data),
  });

  const saveParams = useSaveParameterResults(inspectionId);
  const addDefect = useAddDefect(inspectionId);
  const removeDefect = useRemoveDefect(inspectionId);
  const recordDecision = useRecordDecision(inspectionId);
  const reopen = useReopenInspection(inspectionId);
  const release = useReleaseToInventory(inspectionId);
  const { data: releasedTransaction } = useInventoryTransactionByInspection(
    inspection?.released_to_inventory ? inspectionId : null
  );

  const [paramRows, setParamRows] = useState([]);
  const [defectForm, setDefectForm] = useState({ defectCatalogId: '', quantityRejected: '', notes: '' });
  const [decisionForm, setDecisionForm] = useState(null);
  const [loadedKey, setLoadedKey] = useState(null);
  const [viewTransactionId, setViewTransactionId] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      await downloadInspectionPdf(id, inspection?.inspection_no);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);
    try {
      await downloadInspectionExcel(id, inspection?.inspection_no);
    } finally {
      setDownloadingExcel(false);
    }
  };

  // Re-seed the editable forms only when we land on a genuinely different inspection, or a
  // reopen bumps its attempt_no (a fresh measurement round with no results/defects yet on the
  // server for that attempt) - NOT on every background refetch after a save, which would wipe
  // whatever the inspector is mid-typing. Same "don't clobber unsaved work" reasoning as the
  // wasOpen pattern used for permanently-mounted dialogs elsewhere in this app.
  useEffect(() => {
    if (!inspection) return;
    const key = `${inspection.id}:${inspection.attempt_no}`;
    if (loadedKey === key) return;
    // A fresh inspection (no saved parameterResults yet) with a matched plan needs that plan's
    // parameters to seed the table - but useInspectionPlan only starts fetching once `inspection`
    // itself has loaded (it depends on inspection.inspection_plan_id), so this effect's first run
    // can fire before `plan` has actually arrived. Marking loadedKey done right away used to lock
    // in an empty table forever in that case: the guard above would then block every later re-run
    // of this effect, including the one where `plan` finally showed up, since "done" was already
    // recorded. Wait for the plan to actually finish loading before deciding there's nothing to
    // seed from it.
    if (!inspection.parameterResults?.length && inspection.inspection_plan_id && planLoading) return;
    setLoadedKey(key);

    if (inspection.parameterResults?.length) {
      setParamRows(
        inspection.parameterResults.map((r) => ({
          key: `existing-${r.id}`,
          planParameterId: r.plan_parameter_id,
          parameterName: r.parameter_name,
          parameterCategory: r.parameter_category,
          specification: r.specification || '',
          tolerance: r.tolerance || '',
          unitOfMeasure: r.unit_of_measure || '',
          actualValue: r.actual_value || '',
          result: r.result,
          remarks: r.remarks || '',
        }))
      );
    } else if (plan?.parameters?.length) {
      setParamRows(
        plan.parameters.map((p) => ({
          key: `plan-${p.id}`,
          planParameterId: p.id,
          parameterName: p.parameter_name,
          parameterCategory: p.parameter_category,
          specification: p.specification || '',
          tolerance: p.tolerance || '',
          unitOfMeasure: p.unit_of_measure || '',
          actualValue: '',
          result: null,
          remarks: '',
        }))
      );
    } else {
      setParamRows([]);
    }

    setDecisionForm({
      status: 'APPROVED',
      quantityAccepted: inspection.quantity_accepted ?? inspection.quantity_produced,
      quantityRework: inspection.quantity_rework ?? 0,
      quantityRejected: inspection.quantity_rejected ?? 0,
      rejectionReason: inspection.rejection_reason || '',
      rootCause: inspection.root_cause || '',
      correctiveAction: inspection.corrective_action || '',
      preventiveAction: inspection.preventive_action || '',
      remarks: inspection.remarks || '',
      addCapa: false,
      capaCorrectiveAction: '',
      capaPreventiveAction: '',
      capaOwnerId: '',
      capaDueDate: '',
    });
  }, [inspection, plan, planLoading, loadedKey]);

  if (isLoading || !inspection || !decisionForm) return <LinearProgress />;

  const editable = EDITABLE_STATUSES.includes(inspection.status);
  const statusLabel = QUALITY_STATUS_LABELS[inspection.status] || inspection.status;

  const updateParamRow = (idx, patch) => setParamRows((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const removeParamRow = (idx) => setParamRows((rows) => rows.filter((_, i) => i !== idx));

  const loadCatchUpPlan = () => {
    if (!catchUpPlanDetail?.parameters?.length) return;
    setParamRows(
      catchUpPlanDetail.parameters.map((p) => ({
        key: `plan-${p.id}`,
        planParameterId: p.id,
        parameterName: p.parameter_name,
        parameterCategory: p.parameter_category,
        specification: p.specification || '',
        tolerance: p.tolerance || '',
        unitOfMeasure: p.unit_of_measure || '',
        actualValue: '',
        result: null,
        remarks: '',
      }))
    );
  };

  const saveParameters = () => {
    saveParams.mutate(
      paramRows.map((r) => ({
        planParameterId: r.planParameterId,
        parameterName: r.parameterName,
        parameterCategory: r.parameterCategory,
        specification: r.specification || null,
        tolerance: r.tolerance || null,
        unitOfMeasure: r.unitOfMeasure || null,
        actualValue: r.actualValue || null,
        result: r.result,
        remarks: r.remarks || null,
      }))
    );
  };

  const submitDefect = () => {
    if (!defectForm.defectCatalogId || !defectForm.quantityRejected) return;
    addDefect.mutate(
      {
        defectCatalogId: Number(defectForm.defectCatalogId),
        quantityRejected: Number(defectForm.quantityRejected),
        notes: defectForm.notes || null,
      },
      { onSuccess: () => setDefectForm({ defectCatalogId: '', quantityRejected: '', notes: '' }) }
    );
  };

  const submitDecision = () => {
    const payload = {
      status: decisionForm.status,
      quantityAccepted: decisionForm.quantityAccepted === '' ? null : Number(decisionForm.quantityAccepted),
      quantityRework: decisionForm.quantityRework === '' ? null : Number(decisionForm.quantityRework),
      quantityRejected: decisionForm.quantityRejected === '' ? null : Number(decisionForm.quantityRejected),
      rejectionReason: decisionForm.rejectionReason || null,
      rootCause: decisionForm.rootCause || null,
      correctiveAction: decisionForm.correctiveAction || null,
      preventiveAction: decisionForm.preventiveAction || null,
      remarks: decisionForm.remarks || null,
      capa: decisionForm.addCapa
        ? {
            correctiveAction: decisionForm.capaCorrectiveAction,
            preventiveAction: decisionForm.capaPreventiveAction || null,
            ownerId: decisionForm.capaOwnerId ? Number(decisionForm.capaOwnerId) : null,
            dueDate: decisionForm.capaDueDate || null,
          }
        : null,
    };
    recordDecision.mutate(payload);
  };

  return (
    <Box>
      <PageHeader
        title={inspection.inspection_no}
        subtitle={`${inspection.item_code}${inspection.item_name ? ' - ' + inspection.item_name : ''} · ${inspection.customer_name}`}
        actions={
          <Stack direction="row" spacing={1.5}>
            <StatusBadge status={statusLabel} />
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
            >
              {downloadingPdf ? 'Preparing…' : 'Download PDF'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadExcel}
              disabled={downloadingExcel}
            >
              {downloadingExcel ? 'Preparing…' : 'Download Excel'}
            </Button>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/quality')}>
              Back
            </Button>
          </Stack>
        }
      />

      {/* Header / traceability snapshot */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={2}>
          <InfoField label="Order No" value={inspection.order_no} />
          <InfoField label="Lot No" value={inspection.lot_no} />
          {inspection.coil_no && <InfoField label="Coil No" value={inspection.coil_no} />}
          {inspection.grade && <InfoField label="Grade" value={inspection.grade} />}
          {inspection.coil_size && <InfoField label="Coil Size" value={inspection.coil_size} />}
          {inspection.coil_wt != null && <InfoField label="Coil Wt (T)" value={inspection.coil_wt} />}
          <InfoField label="Item + Size" value={`${inspection.item_code}${inspection.size ? ` / ${inspection.size}` : ''}`} />
          <InfoField label="Machine" value={`${inspection.machine_code} - ${inspection.machine_name}`} />
          <InfoField label="Operator" value={inspection.operator_name} />
          <InfoField label="Shift" value={inspection.shift_name} />
          <InfoField label="Inspection Type" value={inspection.inspection_type} />
          <InfoField label="Sample Size" value={inspection.sample_size} />
          <InfoField label="Attempt" value={inspection.attempt_no} />
          <InfoField label="Quantity Produced" value={inspection.quantity_produced} />
          <InfoField label="Inspector" value={inspection.inspector_full_name} />
          <InfoField label="Inspection Date" value={dayjs(inspection.inspection_datetime).format('DD-MMM-YYYY HH:mm')} />
          <InfoField
            label="Released to Inventory"
            value={inspection.released_to_inventory ? `Yes (${dayjs(inspection.released_at).format('DD-MMM-YYYY')})` : 'No'}
          />
        </Grid>
      </Paper>

      {inspection.status === 'REWORK_REQUIRED' && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" startIcon={<ReplayIcon />} onClick={() => reopen.mutate()} disabled={reopen.isPending}>
              Reopen for Re-Inspection
            </Button>
          }
        >
          This lot needs rework before it can be re-inspected. Once the physical rework is done, reopen it to record a fresh measurement pass.
        </Alert>
      )}

      {['APPROVED', 'APPROVED_WITH_DEVIATION', 'PARTIALLY_ACCEPTED'].includes(inspection.status) && !inspection.released_to_inventory && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<Inventory2Icon />}
              onClick={() => release.mutate()}
              disabled={release.isPending}
            >
              Release to Inventory
            </Button>
          }
        >
          This inspection is {QUALITY_STATUS_LABELS[inspection.status]}. Release the accepted quantity ({inspection.quantity_accepted ?? 0}
          ) to Finished Goods Store when ready.
        </Alert>
      )}
      {release.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {release.error.response?.data?.message || 'Could not release to inventory'}
        </Alert>
      )}
      {!!inspection.released_to_inventory && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon fontSize="inherit" />}
          sx={{ mb: 3 }}
          action={
            releasedTransaction && (
              <Button
                color="inherit"
                size="small"
                startIcon={<ReceiptLongIcon />}
                onClick={() => setViewTransactionId(releasedTransaction.id)}
              >
                View Inventory Transaction
              </Button>
            )
          }
        >
          ✓ {inspection.quantity_accepted} units released to Finished Goods Store
          {releasedTransaction ? ` (${releasedTransaction.transaction_no})` : ''}
        </Alert>
      )}

      <InventoryTransactionDialog transactionId={viewTransactionId} onClose={() => setViewTransactionId(null)} />

      {/* Parameter results */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Inspection Parameters
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        {editable && !paramRows.length && catchUpPlanDetail?.parameters?.length > 0 && (
          <Alert
            severity="info"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" startIcon={<PlaylistAddCheckIcon />} onClick={loadCatchUpPlan}>
                Load Parameters
              </Button>
            }
          >
            This inspection started before "{catchUpPlanDetail.plan_name}" existed, so its {catchUpPlanDetail.parameters.length}{' '}
            parameters weren't pre-filled. Load them now instead of adding each one by hand.
          </Alert>
        )}
        {!editable && !paramRows.length && (
          <Typography variant="body2" color="text.secondary">
            No parameters were recorded for this inspection.
          </Typography>
        )}
        {paramRows.length > 0 && (
          <Table
            size="small"
            sx={{
              '& .MuiTableCell-root': { border: '1px solid', borderColor: 'divider' },
              '& .MuiTableHead-root .MuiTableCell-root': { fontWeight: 700, bgcolor: 'action.hover' },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Parameter</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Specification</TableCell>
                <TableCell>Tolerance</TableCell>
                <TableCell>UOM</TableCell>
                <TableCell>Actual Value</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>Remarks</TableCell>
                {editable && <TableCell />}
              </TableRow>
            </TableHead>
            <TableBody>
              {paramRows.map((row, idx) => (
                <TableRow key={row.key}>
                  <TableCell sx={{ minWidth: 160 }}>{row.parameterName}</TableCell>
                  <TableCell sx={{ minWidth: 150 }}>{CATEGORY_LABELS[row.parameterCategory]}</TableCell>
                  <TableCell>{row.specification || '—'}</TableCell>
                  <TableCell>{row.tolerance || '—'}</TableCell>
                  <TableCell>{row.unitOfMeasure || '—'}</TableCell>
                  <TableCell sx={{ minWidth: 140 }}>
                    {editable ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={row.actualValue}
                        onChange={(e) => updateParamRow(idx, { actualValue: e.target.value })}
                      />
                    ) : (
                      row.actualValue || '—'
                    )}
                  </TableCell>
                  <TableCell>
                    {editable ? (
                      <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={row.result}
                        onChange={(e, val) => updateParamRow(idx, { result: val })}
                      >
                        <ToggleButton value="PASS" color="success">
                          Pass
                        </ToggleButton>
                        <ToggleButton value="FAIL" color="error">
                          Fail
                        </ToggleButton>
                      </ToggleButtonGroup>
                    ) : (
                      row.result && <Chip size="small" label={row.result} color={row.result === 'PASS' ? 'success' : 'error'} />
                    )}
                  </TableCell>
                  <TableCell sx={{ minWidth: 140 }}>
                    {editable ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={row.remarks}
                        onChange={(e) => updateParamRow(idx, { remarks: e.target.value })}
                      />
                    ) : (
                      row.remarks || '—'
                    )}
                  </TableCell>
                  {editable && (
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => removeParamRow(idx)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {editable && paramRows.length > 0 && (
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveParameters}
              disabled={saveParams.isPending || !paramRows.length}
            >
              {saveParams.isPending ? 'Saving...' : 'Save Parameters'}
            </Button>
          </Stack>
        )}
      </Paper>

      {/* Defects */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Defects
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        {inspection.defects?.length > 0 ? (
          <Stack spacing={2} sx={{ mb: editable ? 2 : 0 }}>
            {inspection.defects.map((d) => (
              <Paper key={d.id} variant="outlined" sx={{ p: 1.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    label={d.category}
                    color={d.category === 'CRITICAL' ? 'error' : d.category === 'MAJOR' ? 'warning' : 'info'}
                  />
                  <Typography variant="body2" fontWeight={600}>
                    {d.defect_code} - {d.defect_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Qty: {d.quantity_rejected}
                  </Typography>
                  {d.notes && (
                    <Typography variant="body2" color="text.secondary">
                      {d.notes}
                    </Typography>
                  )}
                  {editable && (
                    <IconButton size="small" color="error" onClick={() => removeDefect.mutate(d.id)} sx={{ ml: 'auto' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
                <Box sx={{ mt: 1.5 }}>
                  <AttachmentUploader entityType="DEFECT" entityId={d.id} disabled={!editable} />
                </Box>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: editable ? 2 : 0 }}>
            No defects logged.
          </Typography>
        )}

        {editable && (
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <TextField
              select
              size="small"
              label="Defect"
              value={defectForm.defectCatalogId}
              onChange={(e) => setDefectForm((f) => ({ ...f, defectCatalogId: e.target.value }))}
              sx={{ minWidth: 220 }}
            >
              {defectCatalog?.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.defect_code} - {d.defect_name} ({d.category})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Qty Rejected"
              type="number"
              value={defectForm.quantityRejected}
              onChange={(e) => setDefectForm((f) => ({ ...f, quantityRejected: e.target.value }))}
              sx={{ width: 140 }}
            />
            <TextField
              size="small"
              label="Notes"
              value={defectForm.notes}
              onChange={(e) => setDefectForm((f) => ({ ...f, notes: e.target.value }))}
              sx={{ minWidth: 200 }}
            />
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={submitDefect}
              disabled={addDefect.isPending || !defectForm.defectCatalogId || !defectForm.quantityRejected}
            >
              Add Defect
            </Button>
          </Stack>
        )}
      </Paper>

      {/* Decision */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Quality Decision
      </Typography>
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        {editable ? (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <TextField
                select
                label="Decision"
                size="small"
                value={decisionForm.status}
                onChange={(e) => setDecisionForm((f) => ({ ...f, status: e.target.value }))}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="APPROVED_WITH_DEVIATION">Approved with Deviation</MenuItem>
                <MenuItem value="PARTIALLY_ACCEPTED">Partially Accepted</MenuItem>
                <MenuItem value="REWORK_REQUIRED">Rework Required</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
                <MenuItem value="HOLD">Hold</MenuItem>
              </TextField>
              <TextField
                label="Quantity Accepted"
                type="number"
                size="small"
                value={decisionForm.quantityAccepted}
                onChange={(e) => setDecisionForm((f) => ({ ...f, quantityAccepted: e.target.value }))}
                sx={{ width: 160 }}
              />
              <TextField
                label="Quantity Rework"
                type="number"
                size="small"
                value={decisionForm.quantityRework}
                onChange={(e) => setDecisionForm((f) => ({ ...f, quantityRework: e.target.value }))}
                sx={{ width: 160 }}
              />
              <TextField
                label="Quantity Rejected"
                type="number"
                size="small"
                value={decisionForm.quantityRejected}
                onChange={(e) => setDecisionForm((f) => ({ ...f, quantityRejected: e.target.value }))}
                sx={{ width: 160 }}
              />
            </Stack>

            <InventoryImpactPreview
              produced={inspection.quantity_produced}
              accepted={decisionForm.quantityAccepted}
              rework={decisionForm.quantityRework}
              rejected={decisionForm.quantityRejected}
              lotNo={inspection.lot_no}
            />

            {decisionForm.status === 'REJECTED' && (
              <TextField
                label="Rejection Reason"
                required
                size="small"
                fullWidth
                value={decisionForm.rejectionReason}
                onChange={(e) => setDecisionForm((f) => ({ ...f, rejectionReason: e.target.value }))}
              />
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Root Cause"
                size="small"
                fullWidth
                value={decisionForm.rootCause}
                onChange={(e) => setDecisionForm((f) => ({ ...f, rootCause: e.target.value }))}
              />
              <TextField
                label="Remarks"
                size="small"
                fullWidth
                value={decisionForm.remarks}
                onChange={(e) => setDecisionForm((f) => ({ ...f, remarks: e.target.value }))}
              />
            </Stack>

            <Divider />
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                clickable
                color={decisionForm.addCapa ? 'primary' : 'default'}
                label={decisionForm.addCapa ? 'CAPA will be recorded' : '+ Add CAPA (Corrective/Preventive Action)'}
                onClick={() => setDecisionForm((f) => ({ ...f, addCapa: !f.addCapa }))}
              />
            </Stack>
            {decisionForm.addCapa && (
              <Stack spacing={2} sx={{ pl: 1, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                <TextField
                  label="Corrective Action"
                  required
                  size="small"
                  fullWidth
                  value={decisionForm.capaCorrectiveAction}
                  onChange={(e) => setDecisionForm((f) => ({ ...f, capaCorrectiveAction: e.target.value }))}
                />
                <TextField
                  label="Preventive Action"
                  size="small"
                  fullWidth
                  value={decisionForm.capaPreventiveAction}
                  onChange={(e) => setDecisionForm((f) => ({ ...f, capaPreventiveAction: e.target.value }))}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    select
                    label="Owner"
                    size="small"
                    sx={{ minWidth: { xs: 0, sm: 200 } }}
                    value={decisionForm.capaOwnerId}
                    onChange={(e) => setDecisionForm((f) => ({ ...f, capaOwnerId: e.target.value }))}
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {users?.map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.full_name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Due Date"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={decisionForm.capaDueDate}
                    onChange={(e) => setDecisionForm((f) => ({ ...f, capaDueDate: e.target.value }))}
                  />
                </Stack>
              </Stack>
            )}

            {recordDecision.isError && <Alert severity="error">{recordDecision.error.response?.data?.message || 'Save failed'}</Alert>}

            <Button
              variant="contained"
              size="large"
              sx={{ alignSelf: 'flex-start' }}
              onClick={submitDecision}
              disabled={
                recordDecision.isPending ||
                (decisionForm.status === 'REJECTED' && !decisionForm.rejectionReason) ||
                (decisionForm.addCapa && !decisionForm.capaCorrectiveAction) ||
                Number(decisionForm.quantityAccepted || 0) + Number(decisionForm.quantityRework || 0) + Number(decisionForm.quantityRejected || 0) >
                  Number(inspection.quantity_produced)
              }
            >
              {recordDecision.isPending ? 'Recording...' : 'Record Decision'}
            </Button>
          </Stack>
        ) : (
          <Grid container spacing={2}>
            <InfoField label="Quantity Accepted" value={inspection.quantity_accepted} />
            <InfoField label="Quantity Rework" value={inspection.quantity_rework} />
            <InfoField label="Quantity Rejected" value={inspection.quantity_rejected} />
            <InfoField label="Rejection Reason" value={inspection.rejection_reason} />
            <InfoField label="Root Cause" value={inspection.root_cause} />
            <InfoField label="Corrective Action" value={inspection.corrective_action} />
            <InfoField label="Preventive Action" value={inspection.preventive_action} />
            <InfoField label="Remarks" value={inspection.remarks} />
            {inspection.capa && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" fontWeight={700}>
                    CAPA
                  </Typography>
                </Grid>
                <InfoField label="Corrective Action" value={inspection.capa.corrective_action} />
                <InfoField label="Preventive Action" value={inspection.capa.preventive_action} />
                <InfoField label="Owner" value={inspection.capa.owner_name} />
                <InfoField label="Due Date" value={inspection.capa.due_date} />
                <InfoField label="Status" value={inspection.capa.status} />
              </>
            )}
          </Grid>
        )}
      </Paper>

      {/* Inspection-level attachments */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Attachments
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <AttachmentUploader entityType="INSPECTION" entityId={inspection.id} disabled={false} />
      </Paper>

      {/* Status history */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon fontSize="small" /> Status History
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          {inspection.statusHistory?.map((h) => (
            <Stack key={h.id} direction="row" spacing={1.5} alignItems="center">
              <StatusBadge status={QUALITY_STATUS_LABELS[h.to_status] || h.to_status} />
              <Typography variant="body2" color="text.secondary">
                {h.from_status ? `from ${QUALITY_STATUS_LABELS[h.from_status] || h.from_status}` : 'started'} · {h.changed_by_name || 'System'} ·{' '}
                {dayjs(h.changed_at).format('DD-MMM-YYYY HH:mm')}
              </Typography>
              {h.remarks && (
                <Typography variant="body2" color="text.secondary">
                  — {h.remarks}
                </Typography>
              )}
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
