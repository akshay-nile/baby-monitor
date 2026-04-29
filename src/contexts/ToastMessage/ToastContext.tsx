import type { ToastMessageOptions } from 'primereact/toast';
import { createContext } from 'react';

type ToastContextType = {
    showToast: (options: ToastMessageOptions) => void,
    clearToast: () => void
};

export const ToastContext = createContext<ToastContextType | null>(null);
