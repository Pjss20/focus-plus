import { forwardRef } from 'react';
import { clsx } from '../../utils/formatters';

const Input = forwardRef(function Input({ label, error, helper, icon: Icon, iconRight, className, ...props }, ref) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
      <div className="relative">
        {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon className="h-4 w-4 text-gray-400" /></div>}
        <input
          ref={ref}
          {...props}
          className={clsx(
            'w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all',
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700',
            Icon && 'pl-10',
            iconRight && 'pr-10',
            className
          )}
        />
        {iconRight && <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{iconRight}</div>}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helper && !error && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helper}</p>}
    </div>
  );
});
export default Input;
