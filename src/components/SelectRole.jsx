import { Settings, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBrowserID } from "../services/settings";
import { usePWAInstaller } from "../custom-hooks/usePWAInstaller";

function SelectRole({ showToast }) {
    const navigate = useNavigate();
    const [isInstalled, installPrompt] = usePWAInstaller();

    function showPWAInstallPrompt() {
        if (!installPrompt) {
            showToast("Not approved by the browser yet!");
            return;
        }
        installPrompt.prompt();
    }

    return (
        <div className="container-y no-select" style={{ width: "100%", height: "95vh" }}>
            <div className="container-x">
                <div style={{ margin: "0.75em" }}>
                    <div style={{ marginTop: "0.2em" }}><strong>Browser ID</strong></div>
                    <div style={{ marginTop: "0.1em", fontFamily: "Consolas, monospace", fontSize: "smaller" }}>{getBrowserID()}</div>
                </div>
                <div className="container-x" style={{ justifyContent: "flex-end", alignItems: "center", gap: "1em", margin: "0.75em" }}>
                    {!isInstalled && <Smartphone size={36} onClick={showPWAInstallPrompt} className="icon"><title>Install as PWA</title></Smartphone>}
                    <Settings size={40} onClick={() => navigate('/settings')} className="icon"><title>User Settings</title></Settings>
                </div>
            </div>

            <div className="container-y middle">
                <div className="text-title">
                    Select a Role for this Device
                </div>

                <button onClick={() => navigate('/baby-device')} className="button">
                    Use as Baby Device (Camera/Mic)
                </button>

                <button onClick={() => navigate('/parent-device')} className="button">
                    Use as Parent Device (Live Stream)
                </button>
            </div>
        </div>
    );
}

export default SelectRole;