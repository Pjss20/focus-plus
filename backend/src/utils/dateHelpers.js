/**
 * Date helper utilities.
 */

/**
 * Returns today's date as YYYY-MM-DD string in UTC.
 */
function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns a date N days ago as YYYY-MM-DD string.
 * @param {number} days
 */
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * Format a Date object to YYYY-MM-DD.
 * @param {Date} date
 */
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Returns the first day of the current week (Monday) as YYYY-MM-DD.
 */
function startOfWeek() {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return formatDate(d);
}

/**
 * Returns the first day of the current month as YYYY-MM-DD.
 */
function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  return formatDate(d);
}

/**
 * Generate a cryptographically-secure random hex token.
 * @param {number} bytes
 */
function randomToken(bytes = 32) {
  const crypto = require('crypto');
  return crypto.randomBytes(bytes).toString('hex');
}

module.exports = { todayUTC, daysAgo, formatDate, startOfWeek, startOfMonth, randomToken };
