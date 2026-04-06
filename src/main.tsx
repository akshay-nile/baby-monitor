import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { PrimeReactProvider } from 'primereact/api';

import './index.css';
import ToastContextProvider from './contexts/ToastMessage/ToastContextProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider value={{ ripple: true }}>
      <ToastContextProvider>
        <App />
      </ToastContextProvider>
    </PrimeReactProvider>
  </StrictMode>,
);

if ('serviceWorker' in navigator && window.location.href.startsWith('https')) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      await navigator.serviceWorker.ready;
      console.log('Service Worker Registered!');

      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data === 'UPDATED') window.location.reload();
        console.log('Message From SW:', event.data);
      });

      const controller = navigator.serviceWorker.controller ?? registration.active;
      controller?.postMessage('CHECK-UPDATE');
    }
    catch (err) { console.error('Service Worker Error:', err); }
  });
}