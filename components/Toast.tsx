import React, { useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { CheckIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from './icons';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

const icons = {
    success: <CheckIcon className="h-6 w-6 text-green-500" />,
    error: <XCircleIcon className="h-6 w-6 text-red-500" />,
    info: <InformationCircleIcon className="h-6 w-6 text-blue-500" />,
};

const TOAST_DURATION = 5000; // 5 seconds

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, TOAST_DURATION);

        return () => {
            clearTimeout(timer);
        };
    }, [onClose]);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const swipeThreshold = 50; // pixels to swipe before dismiss
        const isRtl = document.documentElement.dir === 'rtl';

        // In RTL, dismiss by swiping left (negative offset)
        if (isRtl && info.offset.x < -swipeThreshold) {
            onClose();
            return;
        }

        // In LTR, dismiss by swiping right (positive offset)
        if (!isRtl && info.offset.x > swipeThreshold) {
            onClose();
            return;
        }
    };


    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={handleDragEnd}
            className="w-full max-w-sm bg-white dark:bg-zinc-800 shadow-lg rounded-xl pointer-events-auto ring-1 ring-black ring-opacity-5 dark:ring-white/10 overflow-hidden"
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {icons[type]}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                            {message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={onClose}
                            className="inline-flex rounded-md bg-white dark:bg-zinc-800 text-slate-400 hover:text-slate-500 dark:text-zinc-400 dark:hover:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-zinc-800"
                        >
                            <span className="sr-only">Close</span>
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Toast;