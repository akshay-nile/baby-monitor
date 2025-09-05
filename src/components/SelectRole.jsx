import { useNavigate } from "react-router-dom";
import { getBrowserID } from "../services/settings";
import { Settings } from "lucide-react";

function SelectRole() {
    const navigate = useNavigate();
    const style = { minWidth: "66%", margin: "2em auto" };

    return (<>
        <div className="container no-select" style={{ height: "91vh" }}>
            <div className="settings-bar">
                <div>
                    <div style={{ color: "white", margin: "0.25em 0em" }}><strong>Browser ID</strong></div>
                    <div style={{ fontFamily: "Consolas, monospace", fontSize: "smaller", color: "lightgray" }}> {getBrowserID()}</div>
                </div>
                <Settings size={40} onClick={() => navigate('/settings')} className="icon" />
            </div>

            <div className="container" style={{ margin: "auto 0" }}>
                <h2 className="text-info" style={{ margin: "1.25em auto" }}>
                    Select a Role for this Device
                </h2>

                <button onClick={() => navigate('/baby-device')} className="button" style={style}>
                    Use as Baby Device (Camera/Mic)
                </button>

                <button onClick={() => navigate('/parent-device')} className="button" style={style}>
                    Use as Parent Device (Live Stream)
                </button>
            </div>
        </div>
    </>);
}

export default SelectRole;