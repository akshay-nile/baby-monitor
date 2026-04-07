import { Button } from 'primereact/button';
import { useRef, useState } from 'react';
import { useToastMessage } from '../contexts/ToastMessage/useToastMessage';
import { getSDP, postSDP, waitForIceGatheringCompletion } from '../services/connex';
import type { Baby } from '../services/models';

function ParentDevice() {
    const toast = useToastMessage();

    const babyRef = useRef<Baby>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream>(null);

    const [status, setStatus] = useState<'CONNECTED' | 'CONNECTING' | 'DISCONNECTED'>('DISCONNECTED');

    async function connect() {
        // Start local media stream
        if (!streamRef.current) {
            try {
                streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current.getTracks().forEach(track => track.enabled = false);
            }
            catch (error) {
                toast.showMessage({ severity: 'error', summary: 'Media Access Denied', detail: error });
                return;
            }
        }

        setStatus('CONNECTING');
        const offer = await getSDP('offer');

        if (offer) {
            const pc = new RTCPeerConnection();

            const ms = streamRef.current as MediaStream;
            ms.getTracks().forEach(track => pc.addTrack(track, ms));

            // When baby media stream receives
            pc.ontrack = (e: RTCTrackEvent) => {
                if (videoRef.current) videoRef.current.srcObject = e.streams[0];
            };

            // When baby gets connected
            pc.ondatachannel = (e: RTCDataChannelEvent) => {
                const dc = e.channel;
                dc.onopen = () => {
                    babyRef.current = { pc, dc };
                    setStatus('CONNECTED');
                    toast.showMessage({ severity: 'success', summary: 'Connection Success', detail: 'Baby ID: ' + offer.browserID });
                };
            };

            // When baby gets disconnected
            pc.onconnectionstatechange = () => {
                if (['disconnected', 'closed', 'failed'].includes(pc.connectionState)) disconnect();
            };

            // Accept offer sdp and send the answer sdp
            await pc.setRemoteDescription(offer.sdp);
            await pc.setLocalDescription(await pc.createAnswer());
            await waitForIceGatheringCompletion(pc);

            // Discard unfertilized pc if failed to post the answer sdp
            const isPosted = await postSDP(pc.localDescription);
            if (!isPosted) {
                pc.close();
                setStatus('DISCONNECTED');
                toast.showMessage({ severity: 'error', summary: 'Connection Failed', detail: 'Failed to post the answer sdp' });
            }
        } else {
            setStatus('DISCONNECTED');
            toast.showMessage({ severity: 'warn', summary: 'Baby Device Offline', detail: 'No offer sdp was detected' });
        }
    }

    function disconnect() {
        if (babyRef.current) {
            babyRef.current.dc.send('DISCONNECT');
            babyRef.current.dc.close();
            babyRef.current.pc.getSenders().forEach(sender => sender.track?.stop());
            babyRef.current.pc.close();
            babyRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.srcObject = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        setStatus('DISCONNECTED');
        toast.showMessage({ severity: 'warn', summary: 'Disconnected' });
    }

    return (
        <div className="w-full md:w-1/2 lg:w-1/3 mx-auto min-h-dvh flex flex-col justify-between items-center gap-10 p-4 bg-white text-white select-none duration-300 transition-all">
            <video ref={videoRef} autoPlay />
            <Button
                label={status === 'DISCONNECTED' ? 'Connect' : status === 'CONNECTED' ? 'Disconnect' : 'Connecting'}
                onClick={() => status === 'DISCONNECTED' ? connect() : disconnect()}
                disabled={status === 'CONNECTING'} />
        </div>
    );
}

export default ParentDevice;