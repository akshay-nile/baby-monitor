import { useRef, useState, useEffect } from "react";
import { storeSDP, loadSDP, waitForIceGatheringCompletion } from "../services/exchange";
import { audioConfigs } from "../services/media";

function BabyDevice() {
    const pcRef = useRef(null);
    const vidRef = useRef(null);
    const camRef = useRef([]);

    const [facingMode, setFacingMode] = useState("user");
    const [btnHandler, setBtnHandler] = useState(() => startCamera);
    const [btnText, setBtnText] = useState("Start Camera");

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(devices => camRef.current = devices.filter(device => device.kind === "videoinput"));

        if (pcRef.current) return;
        pcRef.current = new RTCPeerConnection();
        pcRef.current.onconnectionstatechange = () => {
            if (pcRef.current.connectionState === "connected") {
                setBtnText("Stop Camera");
                setBtnHandler(() => stopCamera);
            }
        };
    });

    async function startPollingForAnswer(timeout) {
        while (timeout > 0) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            timeout -= 5;
            const answer = await loadSDP("answer");
            if (answer?.type !== "answer") continue;
            await pcRef.current.setRemoteDescription(answer);
            setBtnText("Connected");
            break;
        }
        if (timeout <= 0) {
            alert("Could not find the connection request!\nPolling aborted due to timeout.");
            setBtnText("Polling Aborted");
            setBtnHandler(() => stopCamera);
        }
    }

    async function loadCameraStream() {
        if (camRef.current.length === 0) {
            alert("No camera found on this device!");
            return;
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: audioConfigs });
        vidRef.current.srcObject = mediaStream;
        mediaStream.getTracks().forEach(track => pcRef.current.addTrack(track, mediaStream));
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

        for (let track of newMediaStream.getTracks()) {
            const sender = pcRef.current.getSenders().find(s => s.track && s.track.kind === track.kind);
            if (sender) await sender.replaceTrack(track);
        }

        vidRef.current.srcObject = newMediaStream;
        oldMediaStream.getTracks().forEach(track => track.stop());
    }

    async function startCamera() {
        setBtnText("Starting...");
        await loadCameraStream();
        await createAndSendOffer();
    }

    async function createAndSendOffer() {
        pcRef.current.setLocalDescription(await pcRef.current.createOffer());
        await waitForIceGatheringCompletion(pcRef.current);
        const response = await storeSDP(pcRef.current.localDescription);
        if (response?.status === "offer-stored") {
            setBtnText("Polling...");
            setBtnHandler(() => null);
            await startPollingForAnswer(5 * 60);
        }
    }

    async function stopCamera() {
        alert("This feature is not implemented yet!\nYou can refresh the page manually.");
    }

    return (
        <div className="container">
            <h2 className="text-info">Baby Device (Camera & Mic)</h2>
            <video ref={vidRef} onClick={toggleCamera} autoPlay playsInline muted className="video" />
            <button onClick={btnHandler} className="button">{btnText}</button>
        </div>
    );
}

export default BabyDevice;