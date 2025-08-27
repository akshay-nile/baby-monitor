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
        pcRef.current.onconnectionstatechange = e => console.log(e);
    });

    async function acceptConnection() {
        setBtnText("Accepting...");
        const answer = await loadSDP("answer");
        if (answer?.type === "answer") {
            await pcRef.current.setRemoteDescription(answer);
            setBtnText("Stop Camera");
            setBtnHandler(() => null);
        } else {
            setBtnText("Accept Connection");
            alert("No connection request found!");
        }
    }

    async function loadCameraStream() {
        const video = { facingMode: useFrontCamera ? "user" : { exact: "environment" } };
        vidRef.current.srcObject = await navigator.mediaDevices.getUserMedia({ video, audio: true });
        vidRef.current.srcObject.getTracks().forEach(track => pcRef.current.addTrack(track, vidRef.current.srcObject));
    }

    async function toggleCamera() {
        if (!vidRef.current.srcObject) {
            alert("Start the camera before toggling front/back!");
            return;
        }
        const isFrontCamActive = vidRef.current.srcObject.getVideoTracks()[0].getSettings().facingMode === "user";
        vidRef.current.srcObject.getTracks().forEach(track => track.stop());
        pcRef.current.getSenders().forEach(sender => pcRef.current.removeTrack(sender));
        setUseFrontCamera(!isFrontCamActive);
        await loadCameraStream();
    }

    async function startCamera() {
        setBtnText("Starting...");
        await loadCameraStream();
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        const response = await storeSDP(offer);
        if (response?.status === "offer-stored") {
            setBtnText("Accept Connection");
            setBtnHandler(() => acceptConnection);
        }
    }

    return (
        <div>
            <h2>Baby Device ({useFrontCamera ? "Front" : "Back"}-Camera & Mic)</h2>
            <video ref={vidRef} onClick={toggleCamera} autoPlay playsInline muted></video><br />
            <button onClick={btnHandler}>{btnText}</button>
        </div>
    );
}

export default BabyDevice;