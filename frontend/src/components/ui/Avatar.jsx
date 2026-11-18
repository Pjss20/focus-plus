import { getInitials } from '../../utils/formatters';
import { clsx } from '../../utils/formatters';
const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
export default function Avatar({ name, src, size = 'md', className }) {
  return src
    ? <img src={src} alt={name} className={clsx('rounded-full object-cover ring-2 ring-white dark:ring-gray-900', sizes[size], className)} />
    : <div className={clsx('rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold flex items-center justify-center ring-2 ring-white dark:ring-gray-900', sizes[size], className)}>{getInitials(name)}</div>;
}
