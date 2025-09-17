const BROWSER_ID_KEY = "baby-monitor-browser-id";
const SETTINGS_KEY = "baby-monitor-settings";

export const defaultSettings = {
    startWithFrontCamera: true,
    maxParentConnections: 3,
    pollingTimeout: 5,
    restartPolling: true,
    usePushToTalk: true,
    trustedParents: []
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

export function isChanged(userSettings, currSettings = getSettings()) {
    for (let key in currSettings) {
        if (typeof currSettings[key] === "object" && typeof userSettings[key] === "object") {
            for (let val of currSettings[key]) if (!userSettings[key].includes(val)) return true;
            continue;
        }
        if (currSettings[key] !== userSettings[key]) return true;
    }
    return false;
}

export function resetSettings() {
    setSettings({ ...defaultSettings, trustedParents: getSettings().trustedParents });
}

const settings = getSettings();
for (let key in defaultSettings) {
    if (!(key in settings)) {
        setSettings(defaultSettings);
        console.warn(`Missing Key [${key}]: Default settings restored!`);
        break;
    }
}