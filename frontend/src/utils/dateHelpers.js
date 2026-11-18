import { format, formatDistanceToNow, isToday as dfIsToday, isTomorrow as dfIsTomorrow, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date, fmt = 'dd/MM/yyyy') => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt, { locale: es });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "dd MMM yyyy 'a las' HH:mm", { locale: es });
};

export const formatRelative = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
};

export const isToday = (date) => {
  if (!date) return false;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return dfIsToday(d);
};

export const isTomorrow = (date) => {
  if (!date) return false;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return dfIsTomorrow(d);
};

export const isOverdue = (date) => {
  if (!date) return false;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d < new Date() && !dfIsToday(d);
};

export const todayISO = () => format(new Date(), 'yyyy-MM-dd');

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

export const getDayName = (date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE', { locale: es });
};

export const getWeekDays = (date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getMonthDays = (date = new Date()) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

export const daysUntil = (date) => {
  if (!date) return null;
  const d = typeof date === 'string' ? parseISO(date) : date;
  const diff = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
};
