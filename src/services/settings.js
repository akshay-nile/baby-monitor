const BROWSER_ID_KEY = "baby-monitor-browser-id";
const SETTINGS_KEY = "baby-monitor-settings";

export const defaultSettings = {
    startWithFrontCamera: true,
    maxParentConnections: 3,
    pollingTimeout: 5,
    restartPolling: true,
    usePushToTalk: true
};

export function getBrowserID() {
    let browserID = JSON.parse(localStorage.getItem(BROWSER_ID_KEY));
    if (!browserID) {
        browserID = Date.now();
        localStorage.setItem(BROWSER_ID_KEY, JSON.stringify(browserID));
    }
    return browserID;
}

export function getSettings() {
    let settings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (!settings) {
        settings = defaultSettings;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
    return settings;
}

export function setSettings(settings) {
    if (typeof settings === "object") localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function isChanged(userSettings) {
    const currSettings = getSettings();
    for (let key in currSettings) {
        if (currSettings[key] !== userSettings[key]) return true;
    }
    return false;
}