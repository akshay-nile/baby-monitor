import { useEffect } from "react";
import useRefState from "../custom-hooks/useRefState";
import { defaultSettings, getSettings, setSettings } from "../services/settings";

function Settings({ showToast }) {
    const [userSettings, setUserSettings, getUserSettings] = useRefState(getSettings());

    function validateParseAndUpdate(target, parser, key) {
        if (target.value && !target.validity.valid) {
            showToast("Max allowed value is " + target.max);
            return;
        }
        setUserSettings(({ ...getUserSettings(), [key]: target.value ? parser(target.value) : target.value }));
    }

    function reset() {
        setUserSettings(defaultSettings);
        setSettings(defaultSettings);
        showToast("Restored default settings!");
    }

    function save() {
        if (!getUserSettings().maxParentConnections || !getUserSettings().pollingTimeout) {
            showToast("Cannot save empty value!");
            return;
        }
        setSettings(getUserSettings());
        showToast("Settings saved!");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { return save; }, []);

    return (
        <div className="container-y" style={{ margin: "1em", padding: "0.5em", height: "90vh", justifyContent: "center", alignItems: "center" }}>
            <div className="text-title" style={{ marginBottom: "1em" }}>User Settings</div>

            <div className="container-x setting">
                <label htmlFor="startWithFrontCamera" style={{ fontSize: "larger" }}>Start With Front Camera</label>
                <input type="checkbox" id="startWithFrontCamera" required
                    style={{ zoom: "2.5" }}
                    checked={userSettings.startWithFrontCamera}
                    onChange={e => setUserSettings({ ...getUserSettings(), startWithFrontCamera: e.target.checked })} />
            </div>

            <div className="container-x setting">
                <label htmlFor="maxParentConnections" style={{ fontSize: "larger" }}>Max Parent Connections</label>
                <input type="number" id="maxParentConnections" min="1" max="5" required
                    style={{ padding: "0.25em", fontSize: "x-large", width: "3ch" }}
                    value={userSettings.maxParentConnections}
                    onChange={e => validateParseAndUpdate(e.target, parseInt, "maxParentConnections")} />
            </div>

            <div className="container-x setting">
                <label htmlFor="pollingTimeout" style={{ fontSize: "larger" }}>Polling Timeout (minutes)</label>
                <input type="number" id="pollingTimeout" min="1" max="15" required
                    style={{ padding: "0.25em", fontSize: "x-large", width: "3ch" }}
                    value={userSettings.pollingTimeout}
                    onChange={e => validateParseAndUpdate(e.target, parseInt, "pollingTimeout")} />
            </div>

            <div className="container-x setting">
                <label htmlFor="restartPolling" style={{ fontSize: "larger" }}>Restart Polling</label>
                <input type="checkbox" id="restartPolling" required
                    style={{ zoom: "2.5" }}
                    checked={userSettings.restartPolling}
                    onChange={e => setUserSettings({ ...getUserSettings(), restartPolling: e.target.checked })} />
            </div>

            <div className="container-x" style={{ margin: "1em", padding: "1em" }}>
                <button onClick={save} className="button">Save Settings</button>
                <button onClick={reset} className="button">Restore Defaults</button>
            </div>
        </div>
    );
}

export default Settings;