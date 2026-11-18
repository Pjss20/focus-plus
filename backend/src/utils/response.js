/**
 * Standardized response helpers.
 */

exports.success = (res, data, message = 'OK', status = 200) =>
  res.status(status).json({ success: true, message, data });

exports.error = (res, message, status = 400) =>
  res.status(status).json({ success: false, message });
