import { useNavigate } from "react-router-dom";

function SelectRole() {
    const navigate = useNavigate();

    return (
        <div className="container" style={{ width: "auto" }}>
            <h2 className="text-info">Select a Role for this Device</h2>

            <button onClick={() => navigate('/baby-device')} className="button" style={{ width: "100%" }}>
                Use as Baby Device (Camera/Mic)
            </button>

            <button onClick={() => navigate('/parent-device')} className="button" style={{ width: "100%" }}>
                Use as Parent Device (Live Stream)
            </button>
        </div>
    );
}

export default SelectRole;