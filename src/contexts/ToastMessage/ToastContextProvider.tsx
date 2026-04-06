import { Toast, type ToastMessageOptions } from 'primereact/toast';
import { useRef, type ReactNode } from 'react';
import { ToastContext } from './ToastContext';
import { Tooltip } from 'primereact/tooltip';

type Props = { children: ReactNode };

function ToastContextProvider({ children }: Props) {
    const toastRef = useRef<Toast>(null);

    function showToast(options: ToastMessageOptions) {
        if (toastRef.current) toastRef.current.show(options);
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Toast ref={toastRef} />
            <Tooltip target="[data-pr-tooltip]" position="bottom" />
        </ToastContext.Provider>
    );
}

export default ToastContextProvider;
