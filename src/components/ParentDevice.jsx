import { useRef, useState, useEffect } from "react";
import { storeSDP, loadSDP, getNewPC, waitForIceGatheringCompletion, attachDataChannel } from "../services/connex";
import { audioConfigs } from '../services/media';

function ParentDevice() {
    const pcRef = useRef(null);
    const videoRef = useRef(null);
    const micRef = useRef({ stream: null, track: null });

    const [muted, setMuted] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [button, setButton] = useState({ text: "Request Connection", color: "#007bff", disabled: false, click: requestConnection });

    useEffect(() => {
        return cleanUp;
    }, []);

    async function requestConnection() {
        setButton({ text: "Requesting...", disabled: true });
        if (!micRef.current.stream) micRef.current.stream = await navigator.mediaDevices.getUserMedia({ audio: audioConfigs });
        if (!micRef.current.track) micRef.current.track = micRef.current.stream.getAudioTracks()[0];
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
        pcRef.current = getNewPC({ onConnect, onDisconnect, onTrack, stream: micRef.current.stream });
        attachDataChannel(pcRef.current, null, onMessage);
        micRef.current.track.enabled = false;
    }

    function onConnect() {
        setIsLive(true);
        setButton({ text: "Disconnect", color: "#ff5b00", disabled: false, click: onDisconnect });
    }

    function onDisconnect() {
        setButton({ ...button, text: "Disconnecting...", color: "#ff5b00", disabled: true });
        pcRef.current.dataChannel.send("DISCONNECT: " + pcRef.current.localDescription);
        pcRef.current.close();
        pcRef.current = null;
        videoRef.current.srcObject = null;
        setIsLive(false);
        setButton({ text: "Request Connection", color: "#007bff", disabled: false, click: requestConnection });
    }

    function onTrack(event) {
        videoRef.current.srcObject = event.streams[0];
    }

    function onMessage(message) {
        if (message === "DISCONNECT") {
            onDisconnect();
            // show toast: The Baby device went offline!
            return;
        }
        console.warn("Unknown Command: " + message);
    }

    function pushToTalk(isPushed) {
        if (!videoRef.current.srcObject) return;
        setMuted(isPushed);
        micRef.current.track.enabled = isPushed;
        pcRef.current.dataChannel.send(isPushed ? "UNMUTE" : "MUTE");
    }

    function cleanUp() {
        pcRef.current && pcRef.current.close();
        micRef.current.track && micRef.current.track.stop();
    }

    return (
        <div className="container">
            <h2 className="text-info">Parent Device ({isLive && "Live "}{muted ? <s>Audio</s> : "Audio"}/Video)</h2>
            <video ref={videoRef}
                onMouseDown={() => pushToTalk(true)} onMouseUp={() => pushToTalk(false)}
                onTouchStart={() => pushToTalk(true)} onTouchEnd={() => pushToTalk(false)}
                muted={muted} autoPlay playsInline className="video">
            </video>
            <button onClick={button.click} disabled={button.disabled} className="button" style={{ background: button.color }}>
                {button.text}
            </button>
        </div>
    );
}

export default ParentDevice;