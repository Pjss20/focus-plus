import { clsx } from '../../utils/formatters';

export default function Card({ children, className, onClick, ...props }) {
  return (
    <div
      {...props}
      onClick={onClick}
      className={clsx(
        'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm',
        onClick && 'cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  );
}
