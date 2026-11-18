export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
};

export const formatNumber = (n, decimals = 0) => {
  if (n === null || n === undefined) return '0';
  return Number(n).toLocaleString('es-PE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export const truncateText = (text, max = 80) => {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
};

export const percentage = (current, total) => {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
};

export const clsx = (...classes) => classes.filter(Boolean).join(' ');
