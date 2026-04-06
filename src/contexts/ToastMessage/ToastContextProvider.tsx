import { Toast, type ToastMessageOptions } from 'primereact/toast';
import { useRef, type ReactNode } from 'react';
import { ToastContext } from './ToastContext';

type Props = { children: ReactNode };

function ToastContextProvider({ children }: Props) {
    const toastRef = useRef<Toast>(null);

    function showToast(options: ToastMessageOptions) {
        if (toastRef.current) toastRef.current.show(options);
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            < Toast ref={toastRef} />
        </ToastContext.Provider>
    );
}

export default ToastContextProvider;
