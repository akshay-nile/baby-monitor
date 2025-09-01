import { useRef, useState, useEffect } from "react";
import { storeSDP, loadSDP, getNewPC, waitForIceGatheringCompletion } from "../services/connex";

function ParentDevice() {
    const pcRef = useRef(null);
    const videoRef = useRef(null);

    const [muted, setMuted] = useState(false);
    const [button, setButton] = useState({ text: "Request Connection", color: "#007bff", disabled: false, click: requestConnection });

    useEffect(() => {
        return cleanUp;
    }, []);

    async function requestConnection() {
        setButton({ text: "Requesting...", disabled: true });
        if (!pcRef.current) setupPeerConnectionRef();
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
            alert("No baby active device found!\nMake sure the baby device is Polling.");
            onDisconnect();
        }
    }

    function setupPeerConnectionRef() {
        if (pcRef.current?.connectionState === "connected") return;
        pcRef.current = getNewPC({ onConnect, onDisconnect, onTrack });
    }

    function onConnect() {
        setButton({ text: "Disconnect", color: "#ff5b00", disabled: false, click: onDisconnect });
    }

    function onDisconnect() {
        setButton({ ...button, text: "Disconnecting...", color: "#ff5b00", disabled: true });
        if (pcRef.current) pcRef.current.close();
        pcRef.current = null;
        videoRef.current.srcObject = null;
        setButton({ text: "Request Connection", color: "#007bff", disabled: false, click: requestConnection });
    }

    function onTrack(event) {
        videoRef.current.srcObject = event.streams[0];
    }

    function cleanUp() {
        pcRef.current && pcRef.current.close();
    }

    return (
        <div className="container">
            <h2 className="text-info">Parent Device (Live {muted ? <s>Audio</s> : "Audio"}/Video)</h2>
            <video ref={videoRef} onMouseDown={() => setMuted(true)} onMouseUp={() => setMuted(false)} muted={muted} autoPlay playsInline className="video"></video>
            <button onClick={button.click} disabled={button.disabled} className="button" style={{ background: button.color }}>{button.text}</button>
        </div>
    );
}

export default ParentDevice;