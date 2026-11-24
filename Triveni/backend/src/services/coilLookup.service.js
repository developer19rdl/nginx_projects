const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Pulls a value out of an external API's JSON response trying a handful of likely field-name
 * variants, since the exact vendor/ERP contract isn't confirmed yet (COIL_LOOKUP_API_URL is a
 * placeholder until then). Update this map once the real response shape is known.
 */
function pick(obj, keys) {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key];
    }
  }
  return null;
}

function normalizeResponse(raw, coilNo) {
  // Some APIs wrap the payload in { data: {...} } or { result: {...} }.
  const obj = raw?.data && typeof raw.data === 'object' ? raw.data : raw?.result && typeof raw.result === 'object' ? raw.result : raw;

  if (!obj || typeof obj !== 'object') {
    throw ApiError.internal('Coil lookup API returned an unexpected response format');
  }

  const grade = pick(obj, ['grade', 'Grade', 'coilGrade', 'coil_grade']);
  const coilSize = pick(obj, ['coilSize', 'coil_size', 'size', 'Size']);
  const coilWtRaw = pick(obj, ['coilWt', 'coil_wt', 'weight', 'Weight', 'coilWeight', 'coil_weight']);
  const coilWt = coilWtRaw != null ? Number(coilWtRaw) : null;

  return {
    coilNo: pick(obj, ['coilNo', 'coil_no', 'CoilNo']) || coilNo,
    grade: grade ? String(grade) : null,
    coilSize: coilSize ? String(coilSize) : null,
    coilWt: coilWt != null && !Number.isNaN(coilWt) ? coilWt : null,
  };
}

/**
 * Looks up coil details (grade, size, weight) from the external vendor/ERP coil API for a given
 * coil number. Returns null fields for whatever the API doesn't provide - the operator fills the
 * rest in manually. Throws ApiError if the feature isn't configured, or the call fails/times out.
 */
async function lookupCoil(coilNo) {
  if (!env.coilLookup.url) {
    throw ApiError.badRequest('Coil lookup API is not configured. Enter coil details manually.');
  }

  const url = new URL(env.coilLookup.url);
  url.searchParams.set('coilNo', coilNo);

  const headers = { Accept: 'application/json' };
  if (env.coilLookup.apiKey) {
    headers['X-API-Key'] = env.coilLookup.apiKey;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.coilLookup.timeoutMs);

  let response;
  try {
    response = await fetch(url, { method: 'GET', headers, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw ApiError.internal('Coil lookup API timed out. Enter coil details manually.');
    }
    logger.error('Coil lookup API request failed', { error: err.message });
    throw ApiError.internal('Could not reach the coil lookup API. Enter coil details manually.');
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404) {
    throw ApiError.notFound(`No coil info found for "${coilNo}".`);
  }
  if (!response.ok) {
    logger.error('Coil lookup API returned an error status', { status: response.status });
    throw ApiError.internal(`Coil lookup API returned an error (${response.status}). Enter coil details manually.`);
  }

  const raw = await response.json();
  return normalizeResponse(raw, coilNo);
}

module.exports = { lookupCoil };
