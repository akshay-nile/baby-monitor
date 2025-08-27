import { useRef, useState, useEffect } from "react";
import { storeSDP, loadSDP } from "../services/exchange";

function ParentDevice() {
    const pcRef = useRef(null);
    const vidRef = useRef(null);

    const [btnHandler, setBtnHandler] = useState(() => requestConnection);
    const [btnText, setBtnText] = useState("Request Connection");

    useEffect(() => {
        if (pcRef.current) return;
        pcRef.current = new RTCPeerConnection();
        pcRef.current.ontrack = event => vidRef.current.srcObject = event.streams[0];
        pcRef.current.onconnectionstatechange = e => console.log(e);
    });

    async function requestConnection() {
        setBtnText("Requesting...");
        const offer = await loadSDP("offer");
        if (offer?.type === "offer") {
            await pcRef.current.setRemoteDescription(offer);
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);
            const response = await storeSDP(answer);
            if (response?.status === "answer-stored") {
                setBtnText("Requested");
                setBtnHandler(() => null);
            } else {
                setBtnText("Request Connection");
                alert("Connection request failed!");
            }
        } else {
            setBtnText("Request Connection");
            alert("No baby (camera) device found!");
        }
    }

    return (
        <div>
            <h2>Parent Device (Video)</h2>
            <video ref={vidRef} autoPlay playsInline></video><br />
            <button onClick={btnHandler}>{btnText}</button>
        </div>
    );
}

export default ParentDevice;