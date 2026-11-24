import { useEffect, useState } from 'react';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PageHeader from '../../components/common/PageHeader';
import { useChecklistTemplate, useCreateChecklistTemplate, useUpdateChecklistTemplate } from '../../hooks/useChecklistTemplates';

const RESPONSE_TYPES = [
  { value: 'YES_NO', label: 'Yes / No' },
  { value: 'OK_NOT_OK', label: 'OK / Not OK' },
  { value: 'PASS_FAIL', label: 'Pass / Fail' },
  { value: 'VALUE', label: 'Numeric Value' },
  { value: 'TEXT', label: 'Text' },
  { value: 'DROPDOWN', label: 'Dropdown' },
  { value: 'CHECKBOX', label: 'Checkbox' },
];

const emptyQuestion = () => ({
  key: `new-${Math.random()}`,
  questionText: '',
  responseType: 'YES_NO',
  dropdownOptionsText: '',
  isMandatory: true,
});

function QuestionRow({ question, index, total, onChange, onRemove, onMove }) {
  const set = (patch) => onChange({ ...question, ...patch });

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 1.5 }}>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Typography variant="body2" color="text.secondary" sx={{ pt: 1, minWidth: 24 }}>
          {index + 1}.
        </Typography>
        <Stack spacing={1.5} sx={{ flex: 1 }}>
          <TextField
            label="Question"
            fullWidth
            size="small"
            value={question.questionText}
            onChange={(e) => set({ questionText: e.target.value })}
          />
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <TextField
              select
              label="Response Type"
              size="small"
              value={question.responseType}
              onChange={(e) => set({ responseType: e.target.value })}
              sx={{ minWidth: 180 }}
            >
              {RESPONSE_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={<Switch checked={!!question.isMandatory} onChange={(e) => set({ isMandatory: e.target.checked })} />}
              label="Mandatory"
            />
          </Stack>
          {question.responseType === 'DROPDOWN' && (
            <TextField
              label="Dropdown Options (comma separated)"
              fullWidth
              size="small"
              value={question.dropdownOptionsText}
              onChange={(e) => set({ dropdownOptionsText: e.target.value })}
              placeholder="e.g. Morning, Evening, Night"
            />
          )}
        </Stack>
        <Stack alignItems="center">
          <IconButton size="small" onClick={() => onMove(-1)} disabled={index === 0}>
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onMove(1)} disabled={index === total - 1}>
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={onRemove}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function ChecklistTemplateBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: existing } = useChecklistTemplate(isEdit ? Number(id) : undefined);
  const createTemplate = useCreateChecklistTemplate();
  const updateTemplate = useUpdateChecklistTemplate();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [frequency, setFrequency] = useState('DAILY');
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (isEdit && existing && !loaded) {
      setTitle(existing.title);
      setDepartment(existing.department || '');
      setFrequency(existing.frequency);
      setQuestions(
        existing.questions.map((q) => ({
          key: `existing-${q.id}`,
          id: q.id,
          questionText: q.question_text,
          responseType: q.response_type,
          dropdownOptionsText: (q.dropdown_options || []).join(', '),
          isMandatory: !!q.is_mandatory,
        }))
      );
      setLoaded(true);
    }
  }, [isEdit, existing, loaded]);

  const addQuestion = () => setQuestions((qs) => [...qs, emptyQuestion()]);
  const updateQuestion = (idx, next) => setQuestions((qs) => qs.map((q, i) => (i === idx ? next : q)));
  const removeQuestion = (idx) => setQuestions((qs) => qs.filter((_, i) => i !== idx));
  const moveQuestion = (idx, dir) =>
    setQuestions((qs) => {
      const next = [...qs];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return qs;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });

  const mutation = isEdit ? updateTemplate : createTemplate;

  const submit = async () => {
    const payload = {
      title,
      department: department || null,
      frequency,
      questions: questions.map((q) => ({
        ...(q.id ? { id: q.id } : {}),
        questionText: q.questionText,
        responseType: q.responseType,
        dropdownOptions:
          q.responseType === 'DROPDOWN'
            ? q.dropdownOptionsText.split(',').map((s) => s.trim()).filter(Boolean)
            : undefined,
        isMandatory: q.isMandatory,
      })),
    };
    if (isEdit) {
      await updateTemplate.mutateAsync({ id: Number(id), payload });
    } else {
      await createTemplate.mutateAsync(payload);
    }
    navigate('/configuration?tab=checklists');
  };

  const valid = title.trim() && questions.length > 0 && questions.every((q) => q.questionText.trim());

  return (
    <Box>
      <PageHeader
        title={isEdit ? 'Edit Checklist Template' : 'New Checklist Template'}
        subtitle="Header details, then the questions operators will respond to"
        actions={
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/configuration?tab=checklists')}>
            Back
          </Button>
        }
      />

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Stack spacing={2}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} fullWidth />
            <TextField select label="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} sx={{ minWidth: 200 }}>
              <MenuItem value="DAILY">Daily</MenuItem>
              <MenuItem value="WEEKLY">Weekly</MenuItem>
              <MenuItem value="MONTHLY">Monthly</MenuItem>
            </TextField>
          </Stack>
        </Stack>
      </Paper>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Questions
      </Typography>

      {questions.map((q, idx) => (
        <QuestionRow
          key={q.key}
          question={q}
          index={idx}
          total={questions.length}
          onChange={(next) => updateQuestion(idx, next)}
          onRemove={() => removeQuestion(idx)}
          onMove={(dir) => moveQuestion(idx, dir)}
        />
      ))}

      <Button startIcon={<AddIcon />} onClick={addQuestion} sx={{ mb: 3 }}>
        Add Question
      </Button>

      <Divider sx={{ mb: 3 }} />

      {mutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {mutation.error.response?.data?.message || 'Save failed'}
        </Alert>
      )}

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Button variant="contained" size="large" disabled={!valid || mutation.isPending} onClick={submit}>
          {mutation.isPending ? 'Saving...' : 'Save Template'}
        </Button>
        <Button size="large" onClick={() => navigate('/configuration?tab=checklists')}>
          Cancel
        </Button>
      </Stack>
    </Box>
  );
}
