/**
 * Global Express error handler.
 * Must be registered AFTER all routes with 4 params: (err, req, res, next)
 */
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err);

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Duplicate entry — resource already exists.' });
  }

  // MySQL FK constraint
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ success: false, message: 'Referenced resource does not exist.' });
  }

  // MySQL connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({ success: false, message: 'Database unavailable.' });
  }

  // Validation errors from express-validator (passed manually)
  if (err.type === 'validation') {
    return res.status(422).json({ success: false, message: 'Validation error', errors: err.errors });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = { success: false, message };
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
