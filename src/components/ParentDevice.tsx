import { Button } from 'primereact/button';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToastMessage } from '../contexts/ToastMessage/useToastMessage';
import { getSDP, postSDP, sendMessage, waitForIceGatheringCompletion } from '../services/connex';
import type { Baby } from '../services/models';
import Header from './Header';
import PageAnimation from './PageAnimation';
import ParentStatusPanel from './ParentStatusPanel';

function ParentDevice() {
    const { showToast } = useToastMessage();

    const babyRef = useRef<Baby>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream>(null);

    const [status, setStatus] = useState<'CONNECTED' | 'CONNECTING' | 'DISCONNECTED'>('DISCONNECTED');
    const [talking, setTalking] = useState<boolean>(false);

    const disconnect = useCallback(() => {
        if (babyRef.current) {
            sendMessage(babyRef.current.dc, 'DISCONNECT');
            babyRef.current.dc.close();
            babyRef.current.pc.getSenders().forEach(sender => sender.track?.stop());
            babyRef.current.pc.getReceivers().forEach(receiver => receiver.track?.stop());
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
        showToast({ severity: 'warn', summary: 'Disconnected' });
    }, [showToast]);

    async function connect() {
        // Start local media stream
        if (!streamRef.current) {
            if (!window.isSecureContext) {
                showToast({ severity: 'error', summary: 'No Secure Context' });
                return;
            }
            try {
                streamRef.current = await navigator.mediaDevices.getUserMedia({
                    audio: { noiseSuppression: true, echoCancellation: true, autoGainControl: true }
                });
                streamRef.current.getTracks().forEach(track => track.enabled = false);
            }
            catch (error) {
                showToast({ severity: 'error', summary: 'Media Access Denied', detail: error });
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
                    showToast({ severity: 'success', summary: 'Connection Success', detail: 'Baby ID: ' + offer.browserID });
                };
                dc.onmessage = (e: MessageEvent) => {
                    if (e.data === 'DISCONNECT') disconnect();
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
            const isPosted = await postSDP(pc.localDescription!);
            if (!isPosted) {
                pc.close();
                setStatus('DISCONNECTED');
                showToast({ severity: 'error', summary: 'Connection Failed', detail: 'Failed to post the answer sdp' });
            }
        } else {
            setStatus('DISCONNECTED');
            showToast({ severity: 'warn', summary: 'Baby Device Offline', detail: 'No offer sdp was detected' });
        }
    }

    function pushToTalk(pushed: boolean) {
        if (!babyRef.current || !videoRef.current || !streamRef.current) return;
        setTalking(pushed);
        videoRef.current.muted = pushed;
        streamRef.current.getTracks().forEach(track => track.enabled = pushed);
        sendMessage(babyRef.current.dc, pushed ? 'TALKING' : 'SILENCED');
    }

    useEffect(() => {
        return () => { if (streamRef.current || babyRef.current) disconnect(); };
    }, [disconnect]);

    return (
        <PageAnimation>
            <div className="w-full md:w-1/2 lg:w-1/3 mx-auto min-h-dvh flex flex-col justify-between items-center gap-12 p-4 text-white bg-neutral-800 rounded-xl select-none duration-300 transition-all">
                <Header>Parent Device ID</Header>

                <div className="w-full flex flex-col gap-1.5">
                    <ParentStatusPanel
                        isLive={status === 'CONNECTED'}
                        isMuted={talking}
                        onFullscreen={() => videoRef.current?.requestFullscreen()} />
                    <video ref={videoRef} autoPlay muted={talking}
                        className={`w-full rounded-lg border-2 shadow cursor-pointer ${!talking ? 'border-pink-500' : 'border-yellow-400'}`}
                        onMouseDown={() => pushToTalk(true)} onTouchStart={() => pushToTalk(true)}
                        onMouseUp={() => pushToTalk(false)} onTouchEnd={() => pushToTalk(false)}
                        onMouseLeave={() => pushToTalk(false)} />
                </div>

                <Button size="large"
                    label={status === 'DISCONNECTED' ? 'Connect' : status === 'CONNECTED' ? 'Disconnect' : 'Connecting'}
                    onClick={() => status === 'DISCONNECTED' ? connect() : disconnect()}
                    disabled={status === 'CONNECTING'} />
            </div>
        </PageAnimation>
    );
}

export default ParentDevice;