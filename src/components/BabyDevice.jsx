import { useRef, useState, useEffect } from "react";
import { storeSDP, loadSDP, waitForIceGatheringCompletion } from "../services/exchange";
import { audioConfigs } from "../services/media";

function BabyDevice() {
    const pcRefs = useRef([]);
    const vidRef = useRef(null);
    const camRef = useRef([]);

    let [polling, setPolling] = useState(false);
    const [connectionCount, setConnectionCount] = useState(0);
    const [facingMode, setFacingMode] = useState("user");
    const [btnHandler, setBtnHandler] = useState(() => startCamera);
    const [btnText, setBtnText] = useState("Start Camera");

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(devices => camRef.current = devices.filter(device => device.kind === "videoinput"));
    });

    async function startCamera() {
        setBtnText("Starting...");
        setBtnHandler(() => null);
        await loadCameraStream();
        setBtnText("Stop Camera");
        setBtnHandler(() => stopCamera);

        setPolling(polling = true);
        setTimeout(() => setPolling(polling = false), 5 * 60 * 1000);
        await addNewPeerConnection();
    }

    async function loadCameraStream() {
        if (camRef.current.length === 0) {
            alert("No camera found on this device!");
            return;
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: audioConfigs });
        vidRef.current.srcObject = mediaStream;

        for (let pc of pcRefs.current) {
            for (let track of mediaStream.getTracks()) {
                const sender = pc.getSenders().find(s => s?.track?.kind === track.kind);
                if (sender) await sender.replaceTrack(track);
            }
        }
    }

    async function toggleCamera() {
        if (!vidRef.current.srcObject) {
            alert("Start the camera before toggling front/back!");
            return;
        }

        if (camRef.current.length === 1) {
            alert("Only one camera is available on this device!\nCannot toggle.");
            return;
        }

        setFacingMode(facingMode === "user" ? "environment" : "user");

        const oldMediaStream = vidRef.current.srcObject;
        const newMediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: audioConfigs });

        for (let pc of pcRefs.current) {
            for (let track of newMediaStream.getTracks()) {
                const sender = pc.getSenders().find(s => s?.track?.kind === track.kind);
                if (sender) await sender.replaceTrack(track);
            }
        }

        vidRef.current.srcObject = newMediaStream;
        oldMediaStream.getTracks().forEach(track => track.stop());
    }

    function stopCamera() {
        setBtnText("Stopping...");
        setBtnHandler(() => null);
        setPolling(polling = false);
        pcRefs.current.pop()?.close();

        pcRefs.current.forEach(pc => pc.getSenders().forEach(s => s?.track?.stop()));
        vidRef.current.srcObject.getTracks().forEach(track => track.stop());
        // vidRef.current.srcObject = null;
        setBtnText("Start Camera");
        setBtnHandler(() => startCamera);
    }

    async function addNewPeerConnection() {
        const pc = new RTCPeerConnection();
        pc.onconnectionstatechange = () => {
            if (pc.connectionState === "connected") {
                setConnectionCount(prevCount => prevCount + 1);
                addNewPeerConnection();
            } else if (["disconnected", "closed", "failed"].includes(pc.connectionState)) {
                pcRefs.current.splice(pcRefs.current.indexOf(pc), 1);
                setConnectionCount(prevCount => Math.max(prevCount - 1, 0));
            }
        };
        vidRef.current.srcObject.getTracks().forEach(track => pc.addTrack(track, vidRef.current.srcObject));
        pcRefs.current.push(pc);
        await createAndSendOffer(pc);
    }

    async function createAndSendOffer(pc) {
        pc.setLocalDescription(await pc.createOffer());
        await waitForIceGatheringCompletion(pc);
        const response = await storeSDP(pc.localDescription);
        if (response?.status === "offer-stored") await startPollingForAnswer(pc);
    }

    async function startPollingForAnswer(pc) {
        while (polling) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            const answer = await loadSDP("answer");
            if (answer?.type !== "answer") continue;
            await pc.setRemoteDescription(answer);
            break;
        }
        if (!polling) pc.close();
    }

    return (
        <div className="container">
            <h2 className="text-info">Baby Device (Camera & Mic)</h2>
            <video ref={vidRef} onClick={toggleCamera} autoPlay playsInline muted className="video" />
            <button onClick={btnHandler} className="button">{btnText}</button>
            {(polling || connectionCount > 0) && <h3 className="status-info">Connected Parents: {connectionCount} {polling && " and polling..."}</h3>}
        </div>
    );
}

export default BabyDevice;