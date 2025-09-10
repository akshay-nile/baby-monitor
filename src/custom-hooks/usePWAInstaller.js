import { useState, useEffect } from "react";

export function usePWAInstaller(uniqueKey) {
    if (typeof uniqueKey !== "string") uniqueKey = "app-name";

    const [isPWA, setIsPWA] = useState(false);
    const [installPrompt, setInstallPrompt] = useState(null);

    useEffect(() => {
        function checkPWAInstallation() {
            try {
                let isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
                if ('getInstalledRelatedApps' in navigator) navigator.getInstalledRelatedApps().then(apps => {
                    isInstalled = apps.length > 0 || isInstalled;
                    setIsPWA(isInstalled);
                });
                isInstalled = !!localStorage.getItem(uniqueKey) || isInstalled;
                setIsPWA(isInstalled);
            } catch (error) { console.error(error); }
        };

        function captureBrowserPrompt(event) {
            event.preventDefault();
            event.userChoice.then(choice => {
                console.log("PWA installation is " + choice.outcome + "!");
                if (choice.outcome === "accepted") localStorage.setItem(uniqueKey, true);
            });
            localStorage.removeItem(uniqueKey);
            setIsPWA(false);
            setInstallPrompt(event);
        }

        checkPWAInstallation();
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        mediaQuery.addEventListener("change", checkPWAInstallation);
        window.addEventListener("beforeinstallprompt", captureBrowserPrompt);

        return () => {
            mediaQuery.removeEventListener("change", checkPWAInstallation);
            window.removeEventListener("beforeinstallprompt", captureBrowserPrompt);
        };
    }, [uniqueKey]);

    return [isPWA, installPrompt];
}
