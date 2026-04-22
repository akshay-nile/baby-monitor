import type { Settings } from './models';

const BROWSER_ID_KEY = 'baby-monitor-browser-id';
const SETTINGS_KEY = 'baby-monitor-settings';

let browserID: string | null = localStorage.getItem(BROWSER_ID_KEY);
let settings: string | Settings | null = localStorage.getItem(SETTINGS_KEY);

const defaultSettings: Settings = {
    startWithCamera: 'user',
    maxParentConnections: 3,
    pollingTimeout: 5,
    usePushToTalk: true,
    trustedParents: []
};

export function getBrowserID(): string {
    if (browserID === null) {
        browserID = URL.createObjectURL(new Blob()).split('/').pop()?.split('-').pop() as string;
        localStorage.setItem(BROWSER_ID_KEY, browserID);
    }
    return browserID;
}

export function getSettings(): Settings {
    if (settings === null) {
        settings = defaultSettings;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
    else if (typeof settings === 'string') {
        settings = JSON.parse(settings) as Settings;
    }
    return settings;
}

export function setSettings(userSettings: Settings) {
    settings = userSettings;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function resetSettings() {
    setSettings({
        ...defaultSettings,
        trustedParents: getSettings().trustedParents
    });
}

export function isSettingChanged(userSettings: Settings): boolean {
    const settings = getSettings();
    for (const key of Object.keys(settings) as Array<keyof Settings>) {
        if (settings[key] !== userSettings[key]) return true;
    }
    return false;
}