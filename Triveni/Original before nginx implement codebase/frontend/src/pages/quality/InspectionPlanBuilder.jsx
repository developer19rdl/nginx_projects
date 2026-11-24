import { memo, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PageHeader from '../../components/common/PageHeader';
import { PARAMETER_CATEGORIES } from '../../constants';
import { useInspectionPlan, useCreateInspectionPlan, useUpdateInspectionPlan } from '../../hooks/useQualityInspectionPlans';

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

const emptyParameter = () => ({
  key: `new-${Math.random()}`,
  parameterName: '',
  parameterCategory: 'DIMENSION',
  specification: '',
  tolerance: '',
  unitOfMeasure: '',
  isMandatory: true,
});

// Memoized, with onChange/onRemove/onMove taking `index` as an argument rather than each row
// getting its own freshly-bound closure from the parent every render - the parent below passes
// the exact same three function references to every row (useCallback, no deps), so React.memo's
// shallow prop comparison actually holds for the ~35 untouched rows on every keystroke in one row,
// instead of every row re-rendering on every keystroke anywhere (the original, unmemoized version
// - fine at a handful of parameters, but exactly what got sluggish once a plan had 36 of them).
const ParameterRow = memo(function ParameterRow({ parameter, index, total, onChange, onRemove, onMove }) {
  const set = (patch) => onChange(index, { ...parameter, ...patch });

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 1.5 }}>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Typography variant="body2" color="text.secondary" sx={{ pt: 1, minWidth: 24 }}>
          {index + 1}.
        </Typography>
        <Stack spacing={1.5} sx={{ flex: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Parameter Name"
              fullWidth
              size="small"
              value={parameter.parameterName}
              onChange={(e) => set({ parameterName: e.target.value })}
            />
            <TextField
              select
              label="Category"
              size="small"
              value={parameter.parameterCategory}
              onChange={(e) => set({ parameterCategory: e.target.value })}
              sx={{ minWidth: 200 }}
            >
              {PARAMETER_CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <TextField
              label="Specification"
              size="small"
              value={parameter.specification}
              onChange={(e) => set({ specification: e.target.value })}
              sx={{ minWidth: 180 }}
            />
            <TextField
              label="Tolerance"
              size="small"
              value={parameter.tolerance}
              onChange={(e) => set({ tolerance: e.target.value })}
              placeholder="e.g. ±0.05"
              sx={{ minWidth: 140 }}
            />
            <TextField
              label="Unit"
              size="small"
              value={parameter.unitOfMeasure}
              onChange={(e) => set({ unitOfMeasure: e.target.value })}
              placeholder="e.g. mm"
              sx={{ minWidth: 100 }}
            />
            <FormControlLabel
              control={<Switch checked={!!parameter.isMandatory} onChange={(e) => set({ isMandatory: e.target.checked })} />}
              label="Mandatory"
            />
          </Stack>
        </Stack>
        <Stack alignItems="center">
          <IconButton size="small" onClick={() => onMove(index, -1)} disabled={index === 0}>
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onMove(index, 1)} disabled={index === total - 1}>
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => onRemove(index)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
});

export default function InspectionPlanBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: existing, isLoading: loadingExisting } = useInspectionPlan(isEdit ? Number(id) : undefined);
  const createPlan = useCreateInspectionPlan();
  const updatePlan = useUpdateInspectionPlan();

  const [planName, setPlanName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [inspectionType, setInspectionType] = useState('FINAL');
  const [sampleSize, setSampleSize] = useState(1);
  const [parameters, setParameters] = useState([emptyParameter()]);
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (isEdit && existing && !loaded) {
      setPlanName(existing.plan_name);
      setItemCode(existing.item_code || '');
      setInspectionType(existing.inspection_type);
      setSampleSize(existing.sample_size);
      setParameters(
        existing.parameters.map((p) => ({
          key: `existing-${p.id}`,
          id: p.id,
          parameterName: p.parameter_name,
          parameterCategory: p.parameter_category,
          specification: p.specification || '',
          tolerance: p.tolerance || '',
          unitOfMeasure: p.unit_of_measure || '',
          isMandatory: !!p.is_mandatory,
        }))
      );
      setLoaded(true);
    }
  }, [isEdit, existing, loaded]);

  const addParameter = () => setParameters((ps) => [...ps, emptyParameter()]);
  // useCallback with no deps (all functional setState) - so every ParameterRow receives the exact
  // same onChange/onRemove/onMove reference across renders, which is what lets React.memo above
  // actually skip re-rendering the rows nobody touched.
  const updateParameter = useCallback((idx, next) => setParameters((ps) => ps.map((p, i) => (i === idx ? next : p))), []);
  const removeParameter = useCallback((idx) => setParameters((ps) => ps.filter((_, i) => i !== idx)), []);
  const moveParameter = useCallback(
    (idx, dir) =>
      setParameters((ps) => {
        const next = [...ps];
        const target = idx + dir;
        if (target < 0 || target >= next.length) return ps;
        [next[idx], next[target]] = [next[target], next[idx]];
        return next;
      }),
    []
  );

  const mutation = isEdit ? updatePlan : createPlan;

  const submit = async () => {
    const payload = {
      planName,
      itemCode: itemCode.trim() || null,
      inspectionType,
      sampleSize: Number(sampleSize) || 1,
      parameters: parameters.map((p) => ({
        ...(p.id ? { id: p.id } : {}),
        parameterName: p.parameterName,
        parameterCategory: p.parameterCategory,
        specification: p.specification || null,
        tolerance: p.tolerance || null,
        unitOfMeasure: p.unitOfMeasure || null,
        isMandatory: p.isMandatory,
      })),
    };
    if (isEdit) {
      await updatePlan.mutateAsync({ id: Number(id), payload });
    } else {
      await createPlan.mutateAsync(payload);
    }
    navigate('/configuration?tab=inspection-plans');
  };

  const valid = planName.trim() && parameters.length > 0 && parameters.every((p) => p.parameterName.trim());

  return (
    <Box>
      <PageHeader
        title={isEdit ? 'Edit Inspection Plan' : 'New Inspection Plan'}
        subtitle="Header details, then the parameters inspectors will measure"
        actions={
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/configuration?tab=inspection-plans')}>
            Back
          </Button>
        }
      />

      {isEdit && !loaded ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
            <Stack spacing={2}>
              <TextField label="Plan Name" value={planName} onChange={(e) => setPlanName(e.target.value)} required fullWidth />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Item Code"
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  placeholder="Leave blank for a generic plan applying to any item"
                  fullWidth
                />
                <TextField
                  select
                  label="Inspection Type"
                  value={inspectionType}
                  onChange={(e) => setInspectionType(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="INCOMING">Incoming</MenuItem>
                  <MenuItem value="IN_PROCESS">In-Process</MenuItem>
                  <MenuItem value="FINAL">Final</MenuItem>
                </TextField>
                <TextField
                  label="Sample Size"
                  type="number"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(e.target.value)}
                  inputProps={{ min: 1 }}
                  sx={{ minWidth: 140 }}
                />
              </Stack>
            </Stack>
          </Paper>

          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
            Parameters
          </Typography>

          {parameters.map((p, idx) => (
            <ParameterRow
              key={p.key}
              parameter={p}
              index={idx}
              total={parameters.length}
              onChange={updateParameter}
              onRemove={removeParameter}
              onMove={moveParameter}
            />
          ))}

          <Button startIcon={<AddIcon />} onClick={addParameter} sx={{ mb: 3 }}>
            Add Parameter
          </Button>

          <Divider sx={{ mb: 3 }} />

          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {mutation.error.response?.data?.message || 'Save failed'}
            </Alert>
          )}

          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Button variant="contained" size="large" disabled={!valid || mutation.isPending} onClick={submit}>
              {mutation.isPending ? 'Saving...' : 'Save Plan'}
            </Button>
            <Button size="large" onClick={() => navigate('/configuration?tab=inspection-plans')}>
              Cancel
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}
