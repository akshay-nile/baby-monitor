export const defaultSettings = {
    startWithFrontCamera: true,
    maxParentConnections: 3,
    pollingTimeout: 5,
    restartPolling: true
};

export function getBrowserID() {
    let browserID = JSON.parse(localStorage.getItem("baby-monitor-browser-id"));
    if (!browserID) {
        browserID = Date.now();
        localStorage.setItem("baby-monitor-browser-id", JSON.stringify(browserID));
    }
    return browserID;
}

export function getSettings() {
    let settings = JSON.parse(localStorage.getItem("baby-monitor-settings"));
    if (!settings) {
        settings = defaultSettings;
        localStorage.setItem("baby-monitor-settings", JSON.stringify(settings));
    }
    return settings;
}

export function setSettings(settings) {
    if (typeof settings === "object") localStorage.setItem("baby-monitor-settings", JSON.stringify(settings));
}
