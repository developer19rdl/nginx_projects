import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Checkbox from '@mui/material/Checkbox';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChecklistIcon from '@mui/icons-material/Checklist';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import { usePlanningContext } from '../contexts/PlanningContext';
import { useAuth } from '../contexts/AuthContext';
import { useMachines } from '../hooks/useMachinePlanning';
import { useChecklistTemplate, useChecklistSubmission, useSubmitChecklist } from '../hooks/useChecklist';

const FREQUENCY_COLORS = { DAILY: 'info', WEEKLY: 'secondary', MONTHLY: 'warning' };

const BINARY_OPTIONS = {
  YES_NO: [
    { value: 'YES', label: 'Yes' },
    { value: 'NO', label: 'No' },
  ],
  OK_NOT_OK: [
    { value: 'OK', label: 'OK' },
    { value: 'NOT_OK', label: 'Not OK' },
  ],
  PASS_FAIL: [
    { value: 'PASS', label: 'Pass' },
    { value: 'FAIL', label: 'Fail' },
  ],
};

function displayValue(question, value) {
  if (value == null || value === '') return '—';
  const options = BINARY_OPTIONS[question.response_type];
  if (options) return options.find((o) => o.value === value)?.label || value;
  if (question.response_type === 'CHECKBOX') return value === '1' ? 'Checked' : 'Unchecked';
  return value;
}

/** Renders the right input control for a question's response_type - one control type per type,
 * all writing back a plain string (matches the generic response_value column server-side). */
function ResponseControl({ question, value, onChange }) {
  const options = BINARY_OPTIONS[question.response_type];
  if (options) {
    return (
      <ToggleButtonGroup size="small" exclusive value={value || null} onChange={(e, next) => next && onChange(next)}>
        {options.map((o) => (
          <ToggleButton key={o.value} value={o.value}>
            {o.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    );
  }
  if (question.response_type === 'CHECKBOX') {
    return <Checkbox checked={value === '1'} onChange={(e) => onChange(e.target.checked ? '1' : '0')} />;
  }
  if (question.response_type === 'DROPDOWN') {
    return (
      <TextField select size="small" value={value || ''} onChange={(e) => onChange(e.target.value)} sx={{ minWidth: 160 }}>
        {(question.dropdown_options || []).map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </TextField>
    );
  }
  if (question.response_type === 'VALUE') {
    return <TextField type="number" size="small" value={value || ''} onChange={(e) => onChange(e.target.value)} sx={{ width: 140 }} />;
  }
  return <TextField size="small" value={value || ''} onChange={(e) => onChange(e.target.value)} fullWidth />;
}

export default function ChecklistTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { machineId, date } = usePlanningContext();
  const { user } = useAuth();

  const { data: machines } = useMachines();
  const { data: template, isLoading: templateLoading } = useChecklistTemplate(Number(templateId));
  const { data: submission, isLoading: submissionLoading } = useChecklistSubmission(
    Number(templateId),
    machineId ? Number(machineId) : undefined,
    date
  );
  const submitMutation = useSubmitChecklist();

  const [responses, setResponses] = useState({});
  const [supervisorName, setSupervisorName] = useState('');
  const [comments, setComments] = useState('');

  const machine = machines?.data?.find((m) => String(m.id) === String(machineId));
  const loading = templateLoading || submissionLoading;

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBar title="Checklist" />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
        <BottomBar />
      </Box>
    );
  }

  const questions = template?.questions || [];
  const answeredCount = questions.filter((q) => responses[q.id]?.value?.trim()).length;
  const mandatoryUnanswered = questions.filter((q) => q.is_mandatory && !responses[q.id]?.value?.trim());
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  const setResponseValue = (questionId, value) =>
    setResponses((prev) => ({ ...prev, [questionId]: { ...prev[questionId], value } }));
  const setResponseRemarks = (questionId, remarks) =>
    setResponses((prev) => ({ ...prev, [questionId]: { ...prev[questionId], remarks } }));

  const handleSubmit = () => {
    submitMutation.mutate({
      templateId: Number(templateId),
      machineId: Number(machineId),
      scheduleDate: date,
      supervisorName: supervisorName || null,
      comments: comments || null,
      responses: questions
        .filter((q) => responses[q.id]?.value?.trim())
        .map((q) => ({ questionId: q.id, responseValue: responses[q.id].value, remarks: responses[q.id].remarks || null })),
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar title={template?.title || 'Checklist'} />

      <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%', flexGrow: 1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/checklist')} sx={{ mb: 1.5 }}>
          Back to Checklists
        </Button>

        {/* Header */}
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <ChecklistIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              {template?.title}
            </Typography>
            <Chip size="small" label={template?.frequency} color={FREQUENCY_COLORS[template?.frequency]} />
          </Stack>
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <Box>
              <Typography variant="caption" color="text.secondary">Machine</Typography>
              <Typography variant="body2" fontWeight={600}>{machine ? `${machine.machine_code} - ${machine.machine_name}` : '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Department</Typography>
              <Typography variant="body2" fontWeight={600}>{template?.department || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Date</Typography>
              <Typography variant="body2" fontWeight={600}>{date}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Inspector</Typography>
              <Typography variant="body2" fontWeight={600}>{submission?.inspector_name || user?.fullName}</Typography>
            </Box>
          </Stack>
        </Paper>

        {submission ? (
          <>
            {/* Locked read-only view */}
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>Submitted</Typography>
                <Stack direction="row" spacing={1}>
                  <Chip size="small" label="Locked" color="default" />
                  <Chip size="small" label={submission.overall_status === 'OK' ? 'OK' : 'Needs Attention'} color={submission.overall_status === 'OK' ? 'success' : 'error'} />
                </Stack>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Submitted {dayjs(submission.submitted_at).format('DD-MM-YYYY hh:mm A')}
              </Typography>
              <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Question</TableCell>
                      <TableCell>Response</TableCell>
                      <TableCell>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submission.responses.map((r, idx) => (
                      <TableRow key={r.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{r.question_text}</TableCell>
                        <TableCell>{displayValue(r, r.response_value)}</TableCell>
                        <TableCell>{r.remarks || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
                <Box>
                  <Typography variant="caption" color="text.secondary">Supervisor</Typography>
                  <Typography variant="body2" fontWeight={600}>{submission.supervisor_name || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Comments</Typography>
                  <Typography variant="body2" fontWeight={600}>{submission.comments || '—'}</Typography>
                </Box>
              </Stack>
            </Paper>
          </>
        ) : (
          <>
            {/* Fill-in form */}
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {answeredCount} of {questions.length} answered
                </Typography>
                <Typography variant="body2" color="text.secondary">{progress}%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, mb: 2.5 }} />

              <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Question</TableCell>
                      <TableCell>Response</TableCell>
                      <TableCell>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questions.map((q, idx) => (
                      <TableRow key={q.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          {q.question_text}
                          {q.is_mandatory && (
                            <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
                              *
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <ResponseControl
                            question={q}
                            value={responses[q.id]?.value}
                            onChange={(v) => setResponseValue(q.id, v)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={responses[q.id]?.remarks || ''}
                            onChange={(e) => setResponseRemarks(q.id, e.target.value)}
                            placeholder="Optional"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Footer */}
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <TextField label="Supervisor Name" size="small" value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} />
                <TextField label="Comments" size="small" multiline minRows={2} value={comments} onChange={(e) => setComments(e.target.value)} />
                {submitMutation.isError && (
                  <Alert severity="error">{submitMutation.error.response?.data?.message || 'Submit failed'}</Alert>
                )}
                <Button
                  variant="contained"
                  size="large"
                  disabled={mandatoryUnanswered.length > 0 || submitMutation.isPending}
                  onClick={handleSubmit}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Checklist'}
                </Button>
              </Stack>
            </Paper>
          </>
        )}
      </Box>

      <BottomBar />
    </Box>
  );
}
