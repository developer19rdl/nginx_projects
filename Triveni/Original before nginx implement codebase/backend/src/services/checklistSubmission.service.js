const { withTransaction } = require('../config/database');
const checklistSubmissionRepository = require('../repositories/checklistSubmission.repository');
const checklistTemplateRepository = require('../repositories/checklistTemplate.repository');
const checklistAssignmentRepository = require('../repositories/checklistAssignment.repository');
const machineRepository = require('../repositories/machine.repository');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

const NEGATIVE_VALUES = new Set(['NO', 'NOT_OK', 'FAIL']);
const BINARY_TYPES = new Set(['YES_NO', 'OK_NOT_OK', 'PASS_FAIL']);

/** Turns a Date + a template's frequency into the key that "one submission per period" is
 * enforced against - mirrors the date-math style of downtimeLog.service.js's shiftWindow(),
 * just producing a string key instead of a datetime range. All computed in UTC to avoid
 * server-timezone drift, consistent with dateStrings:true elsewhere in this app. */
function computePeriodKey(scheduleDate, frequency) {
  const [y, m, d] = scheduleDate.split('-').map(Number);

  if (frequency === 'DAILY') return scheduleDate;

  if (frequency === 'MONTHLY') return `${y}-${String(m).padStart(2, '0')}`;

  // WEEKLY: standard ISO-8601 week key (GGGG-Www) - shift to the Thursday of this week (ISO
  // weeks belong to the year containing their Thursday), then count whole weeks since that
  // ISO year's own week 1.
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = date.getUTCDay() || 7; // Monday=1 .. Sunday=7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const isoYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${isoYear}-W${String(weekNo).padStart(2, '0')}`;
}

function validResponseValue(question, value) {
  if (value == null || value === '') return false;
  switch (question.response_type) {
    case 'YES_NO':
      return value === 'YES' || value === 'NO';
    case 'OK_NOT_OK':
      return value === 'OK' || value === 'NOT_OK';
    case 'PASS_FAIL':
      return value === 'PASS' || value === 'FAIL';
    case 'CHECKBOX':
      return value === '0' || value === '1';
    case 'VALUE':
      return !Number.isNaN(Number(value));
    case 'DROPDOWN':
      return Array.isArray(question.dropdown_options) && question.dropdown_options.includes(value);
    case 'TEXT':
      return typeof value === 'string' && value.trim() !== '';
    default:
      return false;
  }
}

/** Lists every template currently assigned+active for a machine, alongside whether it's already
 * been submitted for its own current period (Daily=today, Weekly=this ISO week, Monthly=this
 * month) - what the operator app's checklist list screen reads. */
async function listForMachine({ machineId, scheduleDate }) {
  if (!machineId) throw ApiError.badRequest('machineId is required');
  if (!scheduleDate) throw ApiError.badRequest('scheduleDate is required');

  const templates = await checklistAssignmentRepository.findActiveTemplatesForMachine(machineId);
  const submissions = await checklistSubmissionRepository.findSubmissionsForMachine(
    machineId,
    templates.map((t) => t.id)
  );

  return templates.map((template) => {
    const periodKey = computePeriodKey(scheduleDate, template.frequency);
    const submission = submissions.find((s) => s.template_id === template.id && s.period_key === periodKey);
    return { ...template, periodKey, done: !!submission, submission: submission || null };
  });
}

async function getOne({ templateId, machineId, scheduleDate }) {
  if (!templateId) throw ApiError.badRequest('templateId is required');
  if (!machineId) throw ApiError.badRequest('machineId is required');
  if (!scheduleDate) throw ApiError.badRequest('scheduleDate is required');

  const template = await checklistTemplateRepository.findById(templateId);
  if (!template) throw ApiError.notFound('Checklist template not found');

  const periodKey = computePeriodKey(scheduleDate, template.frequency);
  return checklistSubmissionRepository.findByTemplateMachinePeriod(templateId, machineId, periodKey);
}

/** Submits a checklist for a Template + Machine + Date - a sign-off record. Every mandatory
 * question must have a type-valid response; can only happen once per template/machine/period
 * (Daily=per date, Weekly=per ISO week, Monthly=per month) - the unique index on
 * checklist_submissions backs this up, checked here first for a clean error message. */
async function submit({ templateId, machineId, scheduleDate, supervisorName, comments, responses }, req) {
  const template = await checklistTemplateRepository.findById(templateId);
  if (!template || !template.is_active) throw ApiError.notFound('Checklist template not found');

  const machine = await machineRepository.findById(machineId);
  if (!machine) throw ApiError.notFound('Machine not found');

  const periodKey = computePeriodKey(scheduleDate, template.frequency);
  const existing = await checklistSubmissionRepository.findByTemplateMachinePeriod(templateId, machineId, periodKey);
  if (existing) throw ApiError.conflict('This checklist has already been submitted for this Machine and period.');

  const questions = await checklistTemplateRepository.findQuestions(templateId, { activeOnly: true });
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const responseMap = new Map(responses.map((r) => [r.questionId, r]));

  const unknown = responses.filter((r) => !questionMap.has(r.questionId));
  if (unknown.length) throw ApiError.badRequest('One or more checklist questions are invalid or no longer active');

  const invalid = [];
  for (const q of questions) {
    const r = responseMap.get(q.id);
    if (q.is_mandatory && !r) {
      invalid.push(`${q.question_text} (required)`);
    } else if (r && !validResponseValue(q, r.responseValue)) {
      invalid.push(`${q.question_text} (invalid response)`);
    }
  }
  if (invalid.length) throw ApiError.badRequest(`Missing or invalid response for: ${invalid.join(', ')}`);

  const overallStatus = questions.some((q) => {
    const r = responseMap.get(q.id);
    return r && BINARY_TYPES.has(q.response_type) && NEGATIVE_VALUES.has(r.responseValue);
  })
    ? 'NOT_OK'
    : 'OK';

  const submissionId = await withTransaction(async (connection) => {
    const id = await checklistSubmissionRepository.createHeader(
      {
        templateId,
        machineId,
        scheduleDate,
        periodKey,
        overallStatus,
        inspectorId: req.user?.id,
        supervisorName,
        comments,
      },
      connection
    );
    await checklistSubmissionRepository.bulkInsertResponses(id, responses, connection);
    return id;
  });

  const submission = await checklistSubmissionRepository.findByTemplateMachinePeriod(templateId, machineId, periodKey);
  await auditService.fromRequest(req, {
    action: 'SUBMIT',
    module: 'checklist_submission',
    recordId: submissionId,
    newValue: submission,
  });
  return submission;
}

module.exports = { computePeriodKey, listForMachine, getOne, submit };
