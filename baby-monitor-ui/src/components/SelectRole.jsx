import { useNavigate } from "react-router-dom";

function SelectRole() {
    const navigate = useNavigate();

    return (
        <div>
            <h2>Select a role for this device:</h2>

            <button onClick={() => navigate('/baby-device')}>
                Use as Baby Device (Camera/Mic)
            </button>
            <br />
            <button onClick={() => navigate('/parent-device')}>
                Use as Parent Device (Display)
            </button>
        </div>
    )
}

export default SelectRole;