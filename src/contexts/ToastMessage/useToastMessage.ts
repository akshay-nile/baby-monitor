import { useContext } from 'react';
import { ToastContext } from './ToastContext';

export function useToastMessage() {
    const toastContext = useContext(ToastContext);
    if (!toastContext) throw new Error('useToast hook must be used inside the ToastContextProvider');
    return toastContext;
}