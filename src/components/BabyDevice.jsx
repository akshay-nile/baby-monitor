import { useEffect, useRef, useState } from "react";
import { getNewPC, createAndStoreOfferWhilePolling, loadAndApplyAnswerWhilePolling, disconnectAllConnections } from "../services/connex";
import { audioConfigs } from "../services/media";

function BabyDevice() {
    const pcRef = useRef(null);
    const vidRef = useRef(null);
    const streamRef = useRef(null);
    const facingModeRef = useRef("user");
    const cameraCountRef = useRef([]);

    let [polling, setPolling] = useState(false);
    let [activeConnections, setActiveConnections] = useState([]);
    const [button, setButton] = useState({ text: "Start Camera", color: "#007bff", disabled: false, click: startCamera });

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => cameraCountRef.current = devices.filter(device => device.kind === "videoinput").length);
    });

    async function startCamera() {
        setButton({ ...button, text: "Starting...", disabled: true });
        await loadCameraStream();
        await replaceTracksForAllConnections();
        setButton({ text: "Stop Camera", color: "#ff5b00", disabled: false, click: stopCamera });
        beginPolling();
    }

    async function beginPolling() {
        setPolling(polling = true);
        setTimeout(() => setPolling(polling = false), 5 * 60 * 1000);

        while (polling) {
            pcRef.current = getNewPC(onConnect, onDisconnect, streamRef.current);
            await createAndStoreOfferWhilePolling(pcRef.current, () => polling);
            await loadAndApplyAnswerWhilePolling(pcRef.current, () => polling);
        }
    }

    function onConnect() {
        setActiveConnections(activeConnections = [...activeConnections, pcRef.current]);
    }

    function onDisconnect() {
        setActiveConnections(activeConnections = activeConnections.filter(pc => pc.connectionState === "connected"));
    }

    async function loadCameraStream() {
        if (cameraCountRef.current === 0) {
            alert("No camera found on this device!");
            return;
        }

        stopAllMediaStreams();
        const mediaConfigs = { video: { facingMode: facingModeRef.current }, audio: audioConfigs };
        streamRef.current = await navigator.mediaDevices.getUserMedia(mediaConfigs);
        vidRef.current.srcObject = new MediaStream(streamRef.current.getVideoTracks());
    }

    function stopAllMediaStreams() {
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if (vidRef.current.srcObject) vidRef.current.srcObject.getTracks().forEach(track => track.stop());
        vidRef.current.srcObject = null;
    }

    async function replaceTracksForAllConnections() {
        for (let pc of [...activeConnections, pcRef.current]) {
            if (pc?.connectionState === "closed") continue;
            for (let track of streamRef.current.getTracks()) {
                const sender = pc?.getSenders().find(s => s?.track?.kind === track.kind);
                await sender?.replaceTrack(track);
            }
        }
    }

    async function flipCamera() {
        if (!vidRef.current.srcObject) {
            alert("Start the camera before flipping between front/back!");
            return;
        }

        if (cameraCountRef.current === 1) {
            alert("Only one camera is available on this device!\nCannot flip with single camera.");
            return;
        }

        setButton({ ...button, text: "Flipping...", disabled: true });
        facingModeRef.current = facingModeRef.current === "user" ? "environment" : "user";
        await loadCameraStream();
        await replaceTracksForAllConnections();
        setButton({ ...button, text: "Stop Camera", color: "#ff5b00", disabled: false });
    }

    async function stopCamera() {
        if (activeConnections.length > 0) {
            const cancel = !confirm("This will Disconnect all the parent devices!\nDo you want to proceed?");
            if (cancel) return;
        }

        setButton({ ...button, text: "Stopping...", disabled: true });
        stopAllMediaStreams();
        setPolling(polling = false);
        await disconnectAllConnections([...activeConnections, pcRef.current]);
        setActiveConnections(activeConnections = []);
        setButton({ text: "Start Camera", color: "#007bff", disabled: false, click: startCamera });
    }

    return (
        <div className="container">
            <h2 className="text-info">Baby Device (Camera & Mic)</h2>
            <video ref={vidRef} onClick={flipCamera} autoPlay playsInline muted className="video" />
            <button onClick={button.click} disabled={button.disabled} className="button" style={{ background: button.color }}>{button.text}</button>
            {(polling || activeConnections > 0) &&
                <h3 className="status-info">
                    Connected Parents: {activeConnections.length} {polling && " and polling..."}
                </h3>}
        </div>
    );
}

export default BabyDevice;