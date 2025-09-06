// eslint-disable-next-line no-unused-vars
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBrowserID } from "../services/settings";

function SelectRole() {
    const navigate = useNavigate();

    return (
        <div className="container-y no-select" style={{ width: "100%", height: "95vh" }}>
            <div className="container-x">
                <div style={{ margin: "0.7em" }}>
                    <div style={{ marginTop: "0.2em" }}><strong>Browser ID</strong></div>
                    <div style={{ marginTop: "0.1em", fontFamily: "Consolas, monospace", fontSize: "smaller" }}> {getBrowserID()}</div>
                </div>
                <Settings size={40} onClick={() => navigate('/settings')} className="icon" style={{ margin: "0.7em" }} />
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