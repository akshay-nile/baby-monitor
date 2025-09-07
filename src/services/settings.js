export const defaultSettings = {
    startWithFrontCamera: true,
    maxParentConnections: 3,
    pollingTimeout: 5,
    restartPolling: true
};

export function getBrowserID() {
    let browserID = JSON.parse(localStorage.getItem("browserID"));
    if (!browserID) {
        browserID = Date.now();
        localStorage.setItem("browserID", JSON.stringify(browserID));
    }
    return browserID;
}

export function getSettings() {
    let settings = JSON.parse(localStorage.getItem("settings"));
    if (!settings) {
        settings = defaultSettings;
        localStorage.setItem("settings", JSON.stringify(settings));
    }
    return settings;
}

export function setSettings(settings) {
    if (typeof settings === "object") localStorage.setItem("settings", JSON.stringify(settings));
}
