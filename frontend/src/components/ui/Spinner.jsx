import { clsx } from '../../utils/formatters';
const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-[3px]' };
export default function Spinner({ size = 'md', className }) {
  return (
    <div className={clsx('animate-spin rounded-full border-gray-200 dark:border-gray-700 border-t-indigo-600 dark:border-t-indigo-400', sizes[size], className)} />
  );
}
