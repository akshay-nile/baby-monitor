import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(() => {
        console.log("Service Worker Registered!");
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data === "RELOAD") window.location.reload();
          else console.log("Message from SW:", event.data);
        });
      })
      .catch((err) => console.error("Service Worker Error:", err));
  });
}
