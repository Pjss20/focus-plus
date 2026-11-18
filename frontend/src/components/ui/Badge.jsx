import { clsx } from '../../utils/formatters';
export default function Badge({ children, className, color }) {
  return (
    <span style={color ? { backgroundColor: color + '22', color } : {}}
      className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', !color && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', className)}>
      {children}
    </span>
  );
}
