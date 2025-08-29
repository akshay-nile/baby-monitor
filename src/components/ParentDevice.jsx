import { useRef, useState } from "react";
import { storeSDP, loadSDP, waitForIceGatheringCompletion } from "../services/exchange";

function ParentDevice() {
    const pcRef = useRef(null);
    const vidRef = useRef(null);

    const [btnHandler, setBtnHandler] = useState(() => requestConnection);
    const [btnText, setBtnText] = useState("Request Connection");

    function addNewPeerConnection() {
        if (pcRef.current) return;
        pcRef.current = new RTCPeerConnection();
        pcRef.current.ontrack = event => vidRef.current.srcObject = event.streams[0];
        pcRef.current.onconnectionstatechange = () => {
            if (pcRef.current.connectionState === "connected") {
                setBtnText("Disconnect");
                setBtnHandler(() => disconnect);
            } else if (["disconnected", "failed"].includes(pcRef.current.connectionState)) {
                disconnect();
            }
        };
    }

    async function requestConnection() {
        setBtnText("Requesting...");
        setBtnHandler(() => null);
        addNewPeerConnection();
        const offer = await loadSDP("offer");
        if (offer?.type === "offer") {
            await pcRef.current.setRemoteDescription(offer);
            await pcRef.current.setLocalDescription(await pcRef.current.createAnswer());
            await waitForIceGatheringCompletion(pcRef.current);
            const response = await storeSDP(pcRef.current.localDescription);
            if (response?.status === "answer-stored") {
                setBtnText("Waiting...");
            } else {
                alert("Connection request failed!\nPlease try again after 5 seconds.");
                disconnect();
            }
        } else {
            alert("No baby (camera) device found!");
            disconnect();
        }
    }

    async function disconnect() {
        setBtnText("Disconnecting...");
        setBtnHandler(() => null);
        pcRef.current.close();
        pcRef.current = null;
        vidRef.current.srcObject = null;
        setBtnText("Request Connection");
        setBtnHandler(() => requestConnection);
    }

    return (
        <div className="container">
            <h2 className="text-info">Parent Device (Live Audio/Video)</h2>
            <video ref={vidRef} autoPlay playsInline className="video"></video>
            <button onClick={btnHandler} className="button">{btnText}</button>
        </div>
    );
}

export default ParentDevice;