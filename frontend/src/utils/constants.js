export const CATEGORIES = [
  { id: 1, name: 'Académicas', color: '#6366F1', icon: 'BookOpen', slug: 'academicas' },
  { id: 2, name: 'Hábitos y Bienestar', color: '#10B981', icon: 'Heart', slug: 'habitos-bienestar' },
  { id: 3, name: 'Productividad y Trabajo', color: '#F59E0B', icon: 'Briefcase', slug: 'productividad' },
  { id: 4, name: 'Finanzas y Ahorro', color: '#3B82F6', icon: 'PiggyBank', slug: 'finanzas' },
];

export const PRIORITIES = {
  low:    { label: 'Baja',     color: '#6B7280', bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  medium: { label: 'Media',    color: '#3B82F6', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  high:   { label: 'Alta',     color: '#F59E0B', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  urgent: { label: 'Urgente',  color: '#EF4444', bg: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
};

export const TASK_STATUSES = {
  pending:     { label: 'Pendiente',    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  in_progress: { label: 'En progreso',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  completed:   { label: 'Completada',   color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  archived:    { label: 'Archivada',    color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },
};

export const GOAL_TYPES = {
  quantifiable: { label: 'Cuantificable', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  habit:        { label: 'Hábito',         color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  project:      { label: 'Proyecto',       color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
};

export const NAV_ITEMS = [
  { path: '/',             icon: 'LayoutDashboard', label: 'Inicio' },
  { path: '/habits',       icon: 'Flame',           label: 'Mis hábitos' },
  { path: '/tasks',        icon: 'CheckSquare',      label: 'Mis tareas' },
  { path: '/goals',        icon: 'Target',           label: 'Mis objetivos' },
  { path: '/academic',     icon: 'GraduationCap',    label: 'Espacio académico' },
  { path: '/calendar',     icon: 'Calendar',         label: 'Calendario' },
  { path: '/planner',      icon: 'Clock',            label: 'Planificador' },
  { path: '/focus',        icon: 'Timer',            label: 'Temporizador' },
  { path: '/statistics',   icon: 'BarChart2',        label: 'Estadísticas' },
  { path: '/achievements', icon: 'Trophy',           label: 'Logros' },
  { path: '/notes',        icon: 'StickyNote',       label: 'Notas' },
  { path: '/profile',      icon: 'User',             label: 'Perfil' },
];

export const COLORS = [
  '#6366F1','#8B5CF6','#EC4899','#EF4444','#F97316',
  '#F59E0B','#10B981','#06B6D4','#3B82F6','#6B7280',
];

export const HABIT_ICONS = [
  'Flame','Heart','Dumbbell','BookOpen','Coffee','Moon','Sun',
  'Droplets','Apple','Music','Pencil','Code2','Bike','Running',
];
