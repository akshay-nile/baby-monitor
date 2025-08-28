import { useRef, useState, useEffect } from "react";
import { storeSDP, loadSDP } from "../services/exchange";

function BabyDevice() {
    const pcRef = useRef(null);
    const vidRef = useRef(null);

    const [useFrontCamera, setUseFrontCamera] = useState(true);
    const [btnHandler, setBtnHandler] = useState(() => startCamera);
    const [btnText, setBtnText] = useState("Start Camera");

    useEffect(() => {
        if (pcRef.current) return;
        pcRef.current = new RTCPeerConnection();
        pcRef.current.onicecandidate = async (event) => {
            if (event.candidate !== null) return;
            const response = await storeSDP(pcRef.current.localDescription);
            if (response?.status === "offer-stored") {
                setBtnText("Polling...");
                setBtnHandler(() => null);
                await startPollingForAnswer(5 * 60);
            }
        };
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
        const video = { facingMode: useFrontCamera ? "user" : "environment" };
        vidRef.current.srcObject = await navigator.mediaDevices.getUserMedia({ video, audio: true });
        vidRef.current.srcObject.getTracks().forEach(track => pcRef.current.addTrack(track, vidRef.current.srcObject));
    }

    async function toggleCamera() {
        if (!vidRef.current.srcObject) {
            alert("Start the camera before toggling front/back!");
            return;
        }
        if ((await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === "videoinput").length === 1) {
            alert("Only one camera is available on this device!\nCannot toggle.");
            return;
        }
        const isFrontCamActive = vidRef.current.srcObject.getVideoTracks()[0].getSettings().facingMode === "user";
        pcRef.current.getSenders().forEach(sender => pcRef.current.removeTrack(sender));
        vidRef.current.srcObject.getTracks().forEach(track => track.stop());
        vidRef.current.srcObject = null;
        setUseFrontCamera(!isFrontCamActive);
        await loadCameraStream();
    }

    async function startCamera() {
        setBtnText("Starting...");
        await loadCameraStream();
        await pcRef.current.setLocalDescription(await pcRef.current.createOffer());
    }

    async function stopCamera() {
        alert("This feature is not implemented yet!\nYou can refresh the page manually.");
    }

    return (
        <div className="container">
            <h2 className="text-info">Baby Device ({useFrontCamera ? "Front" : "Back"}-Camera & Mic)</h2>
            <video ref={vidRef} onClick={toggleCamera} autoPlay playsInline muted className="video" />
            <button onClick={btnHandler} className="button">{btnText}</button>
        </div>
    );
}

export default BabyDevice;