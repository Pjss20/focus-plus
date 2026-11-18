import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { clsx } from '../../utils/formatters';

export default function Modal({ isOpen, onClose, title, children, size = 'md', className }) {
  const overlayRef = useRef();
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} onClick={(e) => e.target === overlayRef.current && onClose()} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className={clsx('bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-h-[92vh] flex flex-col animate-slide-up', sizes[size], className)}>
        {title && (
          <div className="flex items-center justify-between p-4 sm:p-6 pb-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
