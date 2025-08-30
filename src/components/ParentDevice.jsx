import { useRef, useState } from "react";
import { storeSDP, loadSDP, waitForIceGatheringCompletion, getNewPC } from "../services/connex";

function ParentDevice() {
    const pcRef = useRef(null);
    const vidRef = useRef(null);

    const [button, setButton] = useState({ text: "Start Camera", color: "#007bff", disabled: false, click: requestConnection });

    async function requestConnection() {
        setButton({ text: "Requesting...", disabled: true });
        setupPeerConnection();
        const offer = await loadSDP("offer");
        if (offer?.type === "offer") {
            await pcRef.current.setRemoteDescription(offer);
            await pcRef.current.setLocalDescription(await pcRef.current.createAnswer());
            await waitForIceGatheringCompletion(pcRef.current);
            const response = await storeSDP(pcRef.current.localDescription);
            if (response?.status === "answer-stored") {
                setButton({ text: "Connecting...", disabled: true });
            } else {
                alert("Connection request failed!\nPlease try again after 5 seconds.");
                onDisconnect();
            }
        } else {
            alert("No baby (camera) device found!");
            onDisconnect();
        }
    }

    function onConnect() {
        setButton({ text: "Disconnect", color: "#ff5b00", disabled: false, click: onDisconnect });
    }

    function onDisconnect() {
        setButton({ ...button, text: "Disconnecting...", color: "#ff5b00", disabled: true });
        pcRef.current.close();
        pcRef.current = null;
        vidRef.current.srcObject = null;
        setButton({ text: "Request Connection", color: "#007bff", disabled: false, click: requestConnection });
    }

    function setupPeerConnection() {
        if (pcRef.current?.connectionState === "connected") return;
        pcRef.current = getNewPC(onConnect, onDisconnect);
        pcRef.current.ontrack = event => vidRef.current.srcObject = event.streams[0];
    }


    return (
        <div className="container">
            <h2 className="text-info">Parent Device (Live Audio/Video)</h2>
            <video ref={vidRef} autoPlay playsInline className="video"></video>
            <button onClick={button.click} disabled={button.disabled} className="button" style={{ background: button.color }}>{button.text}</button>
        </div>
    );
}

export default ParentDevice;