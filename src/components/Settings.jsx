import { useCallback, useEffect } from "react";
import useRefState from "../custom-hooks/useRefState";
import { getSettings, isChanged, resetSettings, setSettings } from "../services/settings";
import ToggleSwitch from "./ToggleSwitch";
import NumberInput from "./NumberInput";

function Settings({ showToast }) {
    const [userSettings, setUserSettings, getUserSettings] = useRefState(getSettings());

    function reset() {
        resetSettings();
        setUserSettings(getSettings());
        showToast("Restored default settings!");
    }

    const save = useCallback(() => {
        const settingsToSave = getUserSettings();
        if (!isChanged(settingsToSave)) {
            showToast("Settings not changed!");
            return;
        }
        setSettings(settingsToSave);
        showToast("Settings saved!");
    }, [getUserSettings, showToast]);

    useEffect(() => { return save; }, [save]);

    return (
        <div className="container-y" style={{ margin: "0em 0.5em", padding: "0em", height: "90vh", justifyContent: "center", alignItems: "center" }}>
            <div className="text-title" style={{ marginBottom: "1.5em" }}>User Settings</div>

            <div className="container-x setting">
                <label htmlFor="startWithFrontCamera" style={{ fontSize: "large" }}>Start With Front Camera</label>
                <ToggleSwitch id="startWithFrontCamera"
                    checked={userSettings.startWithFrontCamera}
                    onChange={checked => setUserSettings({ ...getUserSettings(), startWithFrontCamera: checked })} />
            </div>

            <div className="container-x setting">
                <label htmlFor="maxParentConnections" style={{ fontSize: "large" }}>Max Parent Connections</label>
                <NumberInput id="maxParentConnections" min={1} max={5}
                    value={userSettings.maxParentConnections}
                    onChange={value => setUserSettings({ ...getUserSettings(), maxParentConnections: value })} />
            </div>

            <div className="container-x setting">
                <label htmlFor="pollingTimeout" style={{ fontSize: "large" }}>Polling Timeout (minutes)</label>
                <NumberInput id="pollingTimeout" min={1} max={15}
                    value={userSettings.pollingTimeout}
                    onChange={value => setUserSettings({ ...getUserSettings(), pollingTimeout: value })} />
            </div>

            <div className="container-x setting">
                <label htmlFor="restartPolling" style={{ fontSize: "large" }}>Restart Polling Automatically</label>
                <ToggleSwitch id="restartPolling"
                    checked={userSettings.restartPolling}
                    onChange={checked => setUserSettings({ ...getUserSettings(), restartPolling: checked })} />
            </div>

            <div className="container-x setting">
                <label htmlFor="usePushToTalk" style={{ fontSize: "large" }}>Use Push-To-Talk Feature</label>
                <ToggleSwitch id="usePushToTalk"
                    checked={userSettings.usePushToTalk}
                    onChange={checked => setUserSettings({ ...getUserSettings(), usePushToTalk: checked })} />
            </div>

            <div className="container-x" style={{ width: "100%", gap: "1em", marginTop: "1.75em" }}>
                <button onClick={save} className="button">Save Settings</button>
                <button onClick={reset} className="button">Restore Defaults</button>
            </div>
        </div>
    );
}

export default Settings;