import { useState, useEffect } from "react";

export function usePWAInstaller() {
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
                let wasInstalled = localStorage.getItem("wasInstalled");
                if (wasInstalled) isInstalled = JSON.parse(wasInstalled) || isInstalled;
                setIsPWA(isInstalled);
            } catch (error) { console.error(error); }
        };

        function captureBrowserPrompt(event) {
            event.preventDefault();
            event.userChoice.then(choice => {
                console.log("PWA installation is " + choice.outcome + "!");
                localStorage.setItem("wasInstalled", JSON.stringify(choice.outcome === "accepted"));
            });
            localStorage.removeItem("wasInstalled");
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
    }, []);

    return [isPWA, installPrompt];
}
