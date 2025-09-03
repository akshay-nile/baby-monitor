export let browserIDStatus = "exists";

const defaultSettings = {
    maxParentConnections: 5,
    pollingWindow: 5,
    restartPolling: true
};

export function getBrowserID() {
    let browserID = localStorage.getItem("browserID");
    if (!browserID) {
        browserID = crypto.randomUUID();
        localStorage.setItem("browserID", browserID);
        browserIDStatus = "created";
    }
    return browserID;
}

export function getSettings() {
    let settings = localStorage.getItem("settings");
    if (!settings) {
        settings = defaultSettings;
        localStorage.setItem("settings", settings);
    }
    return settings;
}

export function setSettings(settings) {
    if (typeof settings === "object") localStorage.setItem("settings", settings);
}