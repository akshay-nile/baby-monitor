import { Button } from 'primereact/button';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToastMessage } from '../contexts/ToastMessage/useToastMessage';
import { clearSDP, getSDP, postSDP, sendMessage, waitForIceGatheringCompletion } from '../services/connex';
import type { Parent } from '../services/models';
import Header from './Header';

function BabyDevice() {
    const { showToast } = useToastMessage();

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream>(null);
    const facingMode = useRef<'user' | 'environment'>('user');
    const pollingRef = useRef<boolean>(false);
    const timeoutRef = useRef<number>(null);
    const parentsRef = useRef<Map<string, Parent>>(new Map());

    const [parentsCount, setParentsCount] = useState<number>(0);
    const [status, setStatus] = useState<'CONNECTED' | 'POLLING' | 'DISCONNECTED'>('DISCONNECTED');
    console.log(parentsCount);

    function addParent(parentID: string, parent: Parent, toast = true) {
        parentsRef.current.set(parentID, parent);
        setParentsCount(parentsRef.current.size);
        if (toast) showToast({ severity: 'info', summary: 'Parent Connected', detail: 'Parent ID: ' + parentID });
    }

    const removeParent = useCallback((parentID: string, toast = true) => {
        parentsRef.current.delete(parentID);
        setParentsCount(parentsRef.current.size);
        if (toast) showToast({ severity: 'warn', summary: 'Parent Disconnected', detail: 'Parent ID: ' + parentID });
    }, [showToast]);

    const stopPolling = useCallback((toast = true) => {
        pollingRef.current = false;
        setStatus(parentsRef.current.size > 0 ? 'CONNECTED' : 'DISCONNECTED');
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            if (toast) showToast({ severity: 'info', summary: 'Polling Stopped', detail: parentsRef.current.size + ' parent devices are connected.' });
        }
    }, [showToast]);

    const disconnect = useCallback((parentID: string, toast = true) => {
        const parent = parentsRef.current.get(parentID);
        if (parent) {
            parent.audio.pause();
            parent.audio.srcObject = null;
            sendMessage(parent.dc, 'DISCONNECT');
            parent.dc.close();
            parent.pc.getReceivers().forEach(receiver => receiver.track.stop());
            parent.pc.close();
            removeParent(parentID, toast);
        }
    }, [removeParent]);

    const disconnectAll = useCallback((toast = true) => {
        const detail = parentsRef.current.size > 0
            ? `${parentsRef.current.size} parent(s) disconnected`
            : 'No parent was connected';

        parentsRef.current.keys().forEach(parentID => disconnect(parentID, false));
        parentsRef.current.clear();
        setParentsCount(0);

        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.srcObject = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        clearSDP();
        stopPolling(false);
        if (toast) showToast({ severity: 'info', summary: 'Camera Stopped', detail });
    }, [showToast, disconnect, stopPolling]);

    async function getCameraStream(): Promise<MediaStream | null> {
        if (!window.isSecureContext) {
            showToast({ severity: 'error', summary: 'No Secure Context' });
            return null;
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        if (cameras.length === 0) {
            showToast({ severity: 'error', summary: 'No Camera Found' });
            return null;
        }
        if (cameras.length === 1) facingMode.current = 'user';
        try {
            return await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode.current },
                audio: { noiseSuppression: true, echoCancellation: true, autoGainControl: true }
            });
        }
        catch (error) {
            showToast({ severity: 'error', summary: 'Media Access Denied', detail: error });
            return null;
        }
    }

    function replaceParentTracks(parents: Array<Parent>) {
        const ms = streamRef.current;
        if (ms) parents
            .forEach(parent => parent.pc.getSenders()
                .forEach(sender => ms.getTracks()
                    .forEach(track => track.kind === sender.track?.kind && sender.replaceTrack(track))));
    }

    async function connect() {
        // Start local video stream
        if (!streamRef.current) {
            streamRef.current = await getCameraStream();
            if (videoRef.current) {
                videoRef.current.srcObject = streamRef.current;
                showToast({ severity: 'info', summary: 'Camera Started', detail: 'Waiting for parent connections.' });
            }
        }

        // Start polling for parent connections
        pollingRef.current = true;
        setStatus('POLLING');
        timeoutRef.current = setTimeout(stopPolling, 5 * 60 * 1000);

        // Allow connecting parents until polling timeout
        while (pollingRef.current) {
            const pc = new RTCPeerConnection();
            let parentID: string | null = null;

            const ms = streamRef.current as MediaStream;
            ms.getTracks().forEach(track => pc.addTrack(track, ms));

            // When parent mic stream receives
            let audio: HTMLAudioElement;
            pc.ontrack = (e: RTCTrackEvent) => {
                audio = new Audio();
                audio.srcObject = e.streams[0];
                audio.autoplay = true;
            };

            // When parent gets connected
            const dc = pc.createDataChannel('SIGNAL');
            dc.onopen = () => {
                if (!parentID) return;
                const parent = { pc, dc, audio };
                addParent(parentID, parent);
                replaceParentTracks([parent]);
            };

            // When parent signals disconnect
            dc.onmessage = (e: MessageEvent) => {
                if (!parentID) return;
                if (e.data === 'DISCONNECT') {
                    disconnect(parentID);
                    if (!pollingRef.current && parentsRef.current.size === 0) setStatus('DISCONNECTED');
                }
            };

            // When parent gets disconnected
            pc.onconnectionstatechange = () => {
                if (!parentID) return;
                if (['disconnected', 'closed', 'failed'].includes(pc.connectionState)) disconnect(parentID);
                if (!pollingRef.current && parentsRef.current.size === 0) setStatus('DISCONNECTED');
            };

            // Create and send the offer sdp
            await pc.setLocalDescription(await pc.createOffer());
            await waitForIceGatheringCompletion(pc);
            const isPosted = await postSDP(pc.localDescription!);

            // Keep checking for the answer sdp
            while (isPosted && pollingRef.current && pc.remoteDescription === null) {
                await new Promise(resolve => setTimeout(resolve, 3000));
                const answer = await getSDP('answer');
                if (answer) {
                    parentID = answer.browserID;
                    await pc.setRemoteDescription(answer.sdp);
                }
            }

            // Discard the unfertilized pc
            if (pc.remoteDescription === null) {
                pc.close();
                await clearSDP();
            }
        }

        if (parentsRef.current.size > 0) {
            setStatus('CONNECTED');
        } else disconnectAll(pollingRef.current);
    }

    async function flipCameraStream() {
        facingMode.current = facingMode.current === 'user' ? 'environment' : 'user';
        const [oldStream, newStream] = [streamRef.current, await getCameraStream()];
        if (!newStream || !videoRef.current) return;
        videoRef.current.srcObject = newStream;
        replaceParentTracks(parentsRef.current.values().toArray());
        showToast({ severity: 'info', summary: `Switched to ${facingMode.current === 'user' ? 'Front' : 'Back'} Camera` });
        streamRef.current = newStream;
        if (oldStream) oldStream.getTracks().forEach(track => track.stop());
    }

    useEffect(() => {
        const parents = parentsRef.current;
        return () => { if (streamRef.current !== null || parents.size > 0) disconnectAll(); };
    }, [disconnectAll]);

    return (
        <div className="w-full md:w-1/2 lg:w-1/3 mx-auto min-h-dvh flex flex-col justify-between items-center gap-12 p-4 text-white bg-neutral-800 rounded-xl select-none duration-300 transition-all">
            <Header>Baby Device ID</Header>

            <video ref={videoRef} autoPlay muted onClick={flipCameraStream} className="w-full my-auto rounded-lg border-2 border-pink-500 shadow" />

            <Button size="large"
                label={status === 'DISCONNECTED' ? 'Start Camera' : 'Stop Camera'}
                onClick={() => status === 'DISCONNECTED' ? connect() : disconnectAll()} />
        </div>
    );
}

export default BabyDevice;