import { useState } from "react";

function ToggleSwitch({ isChecked, onChange, id }) {
    const [checked, setChecked] = useState(isChecked);

    return (
        <div style={{
            ...outerDiv,
            border: "2px solid " + (checked ? "#007bff" : "#ff5b00")
        }}
            onClick={() => {
                const newChecked = !checked;
                onChange(newChecked);
                setChecked(newChecked);
            }}>
            <div style={{
                ...innerDiv,
                transform: `translateX(${checked ? 30 : 0}px)`,
                background: checked ? "#007bff" : "#ff5b00"
            }}></div>
            <input type="checkbox" id={id} style={fakeInputStyle} />
        </div>
    );
}

export default ToggleSwitch;

const outerDiv = {
    width: "60px", height: "30px",
    margin: "0", padding: "0",
    background: "white",
    cursor: "pointer",
    borderRadius: "16px",
    transition: "border 150ms ease-in-out"
};

const innerDiv = {
    position: "relative",
    width: "26px", height: "26px",
    margin: "0", padding: "0",
    border: "2px solid white", borderRadius: "16px",
    transition: "transform 150ms ease-in-out"
};

const fakeInputStyle = {
    display: "none",
    width: "0", height: "0",
    margin: "0", padding: "0"
};
