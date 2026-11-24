function success(res, { message = 'Success', data = {}, meta = undefined, statusCode = 200 }) {
  const body = { success: true, message, data };
  if (meta !== undefined) body.meta = meta;
  return res.status(statusCode).json(body);
}

function failure(res, { message = 'Something went wrong', errors = [], statusCode = 400 }) {
  return res.status(statusCode).json({ success: false, message, errors });
}

module.exports = { success, failure };
