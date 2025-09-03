import { useNavigate } from "react-router-dom";

function SelectRole() {
    const navigate = useNavigate();
    const style = { minWidth: "66%", margin: "2em auto" };
    return (
        <div className="container no-select" style={{ width: "auto" }}>
            <h2 className="text-info" style={{ margin: "1.2em auto" }}>
                Select a Role for this Device
            </h2>

            <button onClick={() => navigate('/baby-device')} className="button" style={style}>
                Use as Baby Device (Camera/Mic)
            </button>

            <button onClick={() => navigate('/parent-device')} className="button" style={style}>
                Use as Parent Device (Live Stream)
            </button>
        </div>
    );
}

export default SelectRole;