import { useEffect, useState } from 'react';

// Extend Navigator for iOS PWA detection
interface Navigator {
    standalone?: boolean;
}

// Declare BeforeInstallPromptEvent 
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    prompt(): Promise<void>;
}

// Add a property to window to store the event
declare global {
    interface Window {
        deferredPrompt?: BeforeInstallPromptEvent;
    }
}

export default function usePWAInstaller(PWA_KEY = 'app-name'): [boolean, BeforeInstallPromptEvent | null] {
    const [isPWAInstalled, setIsPWAInstalled] = useState<boolean>(false);
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        function checkPWAInstallation() {
            try {
                let isInstalled = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator).standalone === true;
                isInstalled = !!localStorage.getItem(PWA_KEY) || isInstalled;
                setIsPWAInstalled(isInstalled);
            } catch (error) { console.error(error); }
        };

        function captureBrowserPrompt(event: Event) {
            (event as BeforeInstallPromptEvent).preventDefault();
            (event as BeforeInstallPromptEvent).userChoice.then(choice => {
                console.log('PWA installation is ' + choice.outcome + '!');
                if (choice.outcome === 'accepted') localStorage.setItem(PWA_KEY, choice.outcome);
            });
            localStorage.removeItem(PWA_KEY);
            setIsPWAInstalled(false);
            setInstallPrompt(event as BeforeInstallPromptEvent);
        }

        checkPWAInstallation();
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        mediaQuery.addEventListener('change', checkPWAInstallation);
        window.addEventListener('beforeinstallprompt', captureBrowserPrompt);

        return () => {
            mediaQuery.removeEventListener('change', checkPWAInstallation);
            window.removeEventListener('beforeinstallprompt', captureBrowserPrompt);
        };
    }, [PWA_KEY]);

    return [isPWAInstalled, installPrompt];
}
