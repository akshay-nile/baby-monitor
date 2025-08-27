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
        pcRef.current.onicecandidate = async (event) => {
            if (event.candidate !== null) return;
            const response = await storeSDP(pcRef.current.localDescription);
            if (response?.status === "answer-stored") {
                setBtnText("Waiting...");
                setBtnHandler(() => null);
            } else {
                setBtnText("Request Connection");
                setBtnHandler(() => requestConnection);
                alert("Connection request failed!");
            }
        };
        pcRef.current.onconnectionstatechange = () => {
            if (pcRef.current.connectionState === "connected") {
                setBtnText("Disconnect");
                setBtnHandler(() => disconnect);
            }
        };
    });

    async function requestConnection() {
        setBtnText("Requesting...");
        const offer = await loadSDP("offer");
        if (offer?.type === "offer") {
            await pcRef.current.setRemoteDescription(offer);
            await pcRef.current.setLocalDescription(await pcRef.current.createAnswer());
        } else {
            setBtnText("Request Connection");
            alert("No baby (camera) device found!");
        }
    }

    async function disconnect() {
        alert("This feature is not implemented yet!\nYou can refresh the page manually.");
    }

    return (
        <div className="container">
            <h2 className="text-info">Parent Device (Live Audio/Video)</h2>
            <video ref={vidRef} autoPlay playsInline className="video"></video><br />
            <button onClick={btnHandler} className="button">{btnText}</button>
        </div>
    );
}

export default ParentDevice;