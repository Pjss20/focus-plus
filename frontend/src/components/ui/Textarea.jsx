import { forwardRef } from 'react';
import { clsx } from '../../utils/formatters';
const Textarea = forwardRef(function Textarea({ label, error, rows = 3, className, ...props }, ref) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
      <textarea ref={ref} rows={rows} {...props}
        className={clsx('w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none',
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700', className)} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});
export default Textarea;
