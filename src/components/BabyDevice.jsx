import { useEffect, useRef, useState } from "react";
import { getNewPC, createAndStoreOfferWhilePolling, loadAndApplyAnswerWhilePolling, disconnectAllConnections } from "../services/connex";
import { audioConfigs } from "../services/media";
import useRefState from "../custom-hooks/useRefState";

function BabyDevice() {
    const pcRef = useRef(null);
    const videoRef = useRef(null);
    const localStreamRef = useRef(null);
    const camerasRef = useRef({ cameras: [], count: 0 });

    const [polling, setPolling, getPolling] = useRefState(false);
    const [activeConnections, setActiveConnections, getActiveConnections] = useRefState([]);
    const [facingMode, setFacingMode, getFacingMode] = useRefState("user");

    const [button, setButton] = useState({ text: "Start Camera", color: "#007bff", disabled: false, click: startCamera });

    useEffect(() => {
        async function findCameraDevices() {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(device => device.kind === "videoinput");
            camerasRef.current = { cameras, count: cameras.length };
        }
        findCameraDevices();
        return cleanUp;
    }, []);

    async function startCamera() {
        setButton({ ...button, text: "Starting...", disabled: true });
        await loadCameraStream();
        setButton({ text: "Stop Camera", color: "#ff5b00", disabled: false, click: stopCamera });
        await beginPolling();
        await replaceTracksForAllConnections();
    }

    async function beginPolling() {
        setPolling(true);
        setTimeout(() => setPolling(false), 5 * 60 * 1000);
        while (getPolling()) {
            pcRef.current = getNewPC(onConnect, onDisconnect, localStreamRef.current);
            await createAndStoreOfferWhilePolling(pcRef.current, getPolling);
            await loadAndApplyAnswerWhilePolling(pcRef.current, getPolling);
        }
    }

    function onConnect() {
        setActiveConnections([...getActiveConnections(), pcRef.current]);
    }

    function onDisconnect() {
        setActiveConnections(getActiveConnections().filter(pc => pc.connectionState === "connected"));
        if (getActiveConnections().length === 0 && !getPolling()) beginPolling();
    }

    async function loadCameraStream() {
        if (camerasRef.current.count === 0) {
            alert("No camera found on this device!");
            return;
        }
        const mediaConfigs = { video: { facingMode: getFacingMode() }, audio: audioConfigs };
        localStreamRef.current = await navigator.mediaDevices.getUserMedia(mediaConfigs);
        videoRef.current.srcObject = new MediaStream(localStreamRef.current.getVideoTracks());
    }

    function unloadMediaStreams(streams) {
        if (streams) {
            streams.forEach(stream => stream.getTracks().forEach(track => track.stop()));
            return;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }

    async function replaceTracksForAllConnections(stream) {
        for (let pc of [...getActiveConnections(), pcRef.current]) {
            if (!pc || pc.connectionState === "closed") continue;
            for (let track of (stream || localStreamRef.current).getTracks()) {
                const sender = pc.getSenders().find(s => s.track.kind === track.kind);
                if (sender) await sender.replaceTrack(track);
            }
        }
    }

    async function flipCamera() {
        if (!videoRef.current.srcObject) {
            alert("Start the camera before flipping between front/back!");
            return;
        }
        if (camerasRef.current.count === 1) {
            alert("Only one camera is available on this device!\nCannot flip with single camera.");
            return;
        }
        setButton({ ...button, text: "Flipping...", disabled: true });
        setFacingMode(getFacingMode() === "user" ? { exact: "environment" } : "user");
        const [oldLocalStream, oldVideoStream] = [localStreamRef.current, videoRef.current.srcObject];
        await loadCameraStream();
        await replaceTracksForAllConnections();
        unloadMediaStreams([oldLocalStream, oldVideoStream]);
        setButton({ ...button, text: "Stop Camera", color: "#ff5b00", disabled: false });
    }

    async function stopCamera() {
        if (getActiveConnections().length > 0) {
            const cancel = !confirm("This will Disconnect all the parent devices!\nDo you still want to proceed?");
            if (cancel) return;
        }
        setButton({ ...button, text: "Stopping...", disabled: true });
        unloadMediaStreams();
        setPolling(false);
        await disconnectAllConnections([...activeConnections, pcRef.current]);
        setActiveConnections([]);
        setButton({ text: "Start Camera", color: "#007bff", disabled: false, click: startCamera });
    }

    function cleanUp() {
        setPolling(false);
        disconnectAllConnections([...getActiveConnections(), pcRef.current]);
        unloadMediaStreams();
    };

    return (
        <div className="container">
            <h2 className="text-info">Baby Device ({facingMode === "user" ? "Front" : "Back"}-Camera & Mic)</h2>
            <video ref={videoRef} onClick={flipCamera} autoPlay playsInline muted className="video" />
            <button onClick={button.click} disabled={button.disabled} className="button" style={{ background: button.color }}>{button.text}</button>
            {(polling || getActiveConnections().length > 0) &&
                <h3 className="status-info">
                    Connected Parents: {getActiveConnections().length} {polling && " and polling..."}
                </h3>}
        </div>
    );
}

export default BabyDevice;