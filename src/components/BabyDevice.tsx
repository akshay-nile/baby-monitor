import { useRef, useState } from 'react';
import { useToastMessage } from '../contexts/ToastMessage/useToastMessage';
import { getSDP, postSDP, waitForIceGatheringCompletion } from '../services/connex';
import type { Parent } from '../services/models';
import { Button } from 'primereact/button';

function BabyDevice() {
    const toast = useToastMessage();

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream>(null);
    const timeoutRef = useRef<number>(null);
    const parentsRef = useRef<Map<string, Parent>>(new Map());

    const [parentsCount, setParentsCount] = useState<number>(0);
    const [status, setStatus] = useState<'CONNECTED' | 'POLLING' | 'DISCONNECTED'>('DISCONNECTED');

    async function connect() {
        // Start local media stream
        if (!streamRef.current) {
            try {
                streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) videoRef.current.srcObject = streamRef.current;
                toast.showMessage({ severity: 'info', summary: 'Camera Started', detail: 'Waiting for parent devices to connect.' });
            }
            catch (error) {
                toast.showMessage({ severity: 'error', summary: 'Media Access Denied', detail: error });
                return;
            }
        }

        // Set polling active
        setStatus('POLLING');
        let polling = true;

        // Reset polling after 5 minutes
        timeoutRef.current = setTimeout(() => {
            if (status === 'POLLING') {
                setStatus(parentsRef.current.size > 0 ? 'CONNECTED' : 'DISCONNECTED');
            }
            polling = false;
        }, 5 * 60 * 1000);

        // Keep storing connected parents until polling timeout
        while (polling) {
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
                addParent(parentID, { pc, dc, audio });
            };

            // When parent gets disconnected
            pc.onconnectionstatechange = () => {
                if (!parentID) return;
                if (['disconnected', 'closed', 'failed'].includes(pc.connectionState)) disconnect(parentID);
                if (!polling && parentsRef.current.size === 0) setStatus('DISCONNECTED');
            };

            // Create and send the offer sdp
            await pc.setLocalDescription(await pc.createOffer());
            await waitForIceGatheringCompletion(pc);
            const isPosted = await postSDP(pc.localDescription);
            console.log(isPosted);

            // Keep checking for the answer sdp
            while (isPosted && polling && pc.remoteDescription === null) {
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
                await postSDP(null);
            }
        }

        if (parentsRef.current.size > 0) {
            setStatus('CONNECTED');
            toast.showMessage({ severity: 'success', summary: 'Polling Stopped', detail: parentsRef.current.size + ' parent devices are connected.' });
        } else disconnectAll();
    }

    function disconnect(parentID: string) {
        const parent = parentsRef.current.get(parentID);
        if (parent) {
            parent.audio.pause();
            parent.dc.send('DISCONNECT');
            parent.dc.close();
            parent.pc.getSenders().forEach(sender => sender.track?.stop());
            parent.pc.close();
            removeParent(parentID);
        }
    }

    function disconnectAll() {
        const summary = parentsRef.current.size === 0 ? 'Camera Stopped' : 'All Parents Disconnected';

        parentsRef.current.keys().forEach(disconnect);
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

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setStatus('DISCONNECTED');
        toast.showMessage({ severity: 'warn', summary });
    }

    function addParent(parentID: string, parent: Parent) {
        parentsRef.current.set(parentID, parent);
        setParentsCount(parentsRef.current.size);
        toast.showMessage({ severity: 'info', summary: 'Parent Connected', detail: 'Parent ID: ' + parentID });
    }

    function removeParent(parentID: string) {
        parentsRef.current.delete(parentID);
        setParentsCount(parentsRef.current.size);
        toast.showMessage({ severity: 'info', summary: 'Parent Disconnected', detail: 'Parent ID: ' + parentID });
    }

    return (
        <div className="w-full md:w-1/2 lg:w-1/3 mx-auto min-h-dvh flex flex-col justify-between items-center gap-10 p-4 bg-white text-white select-none duration-300 transition-all">
            <span className="text-black text-xl">{parentsCount} Parent Devices Connected</span>
            <video ref={videoRef} autoPlay muted />
            <Button
                label={status === 'DISCONNECTED' ? 'Start Camera' : 'Stop Camera'}
                onClick={() => status === 'DISCONNECTED' ? connect() : disconnectAll()} />
        </div>
    );
}

export default BabyDevice;