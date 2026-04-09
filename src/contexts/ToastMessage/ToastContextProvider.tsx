import { Toast, type ToastMessageOptions } from 'primereact/toast';
import { useCallback, useRef, type ReactNode } from 'react';
import { ToastContext } from './ToastContext';

type Props = { children: ReactNode };

function ToastContextProvider({ children }: Props) {
    const toastRef = useRef<Toast>(null);

    const showMessage = useCallback((options: ToastMessageOptions) => {
        if (toastRef.current) toastRef.current.show(options);
    }, []);

    return (
        <ToastContext.Provider value={{ showMessage }}>
            <div>
                {children}
                <Toast ref={toastRef} position="top-center" />
            </div>
        </ToastContext.Provider>
    );
}

export default ToastContextProvider;
