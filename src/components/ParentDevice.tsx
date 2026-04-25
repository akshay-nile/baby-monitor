import { Button } from 'primereact/button';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToastMessage } from '../contexts/ToastMessage/useToastMessage';
import { getSDP, postSDP, sendMessage, waitForIceGatheringCompletion } from '../services/connex';
import { getMediaDevices, getMediaStream, getRecordingFormat } from '../services/media';
import type { Baby } from '../services/models';
import { getSettings } from '../services/settings';
import Header from './Header';
import PageAnimation from './PageAnimation';
import ParentStatusPanel from './ParentStatusPanel';

function ParentDevice() {
    const settings = getSettings();
    const { showToast } = useToastMessage();

    const babyRef = useRef<Baby>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream>(null);
    const recorderRef = useRef<MediaRecorder>(null);
    const audioToneRef = useRef<HTMLAudioElement>(new Audio('./tone.mp3'));

    const [connection, setConnection] = useState<'CONNECTED' | 'CONNECTING' | 'DISCONNECTED'>('DISCONNECTED');
    const [talking, setTalking] = useState<boolean>(false);
    const [recording, setRecording] = useState<'border-red-500' | 'border-transparent' | null>(null);

    const stopAndSaveRecording = useCallback(() => {
        const recorder = recorderRef.current;
        if (recorder && recorder.state === 'recording') {
            recorder.requestData();
            recorder.stop();
        }
    }, []);

    const disconnect = useCallback((toast = true) => {
        stopAndSaveRecording();

        if (babyRef.current) {
            sendMessage(babyRef.current.dc, 'DISCONNECT');
            babyRef.current.dc.close();
            babyRef.current.pc.getSenders().forEach(sender => sender.track?.stop());
            babyRef.current.pc.getReceivers().forEach(receiver => receiver.track?.stop());
            babyRef.current.pc.close();
            babyRef.current = null;
            toast = true;
        }

        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.srcObject = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        setConnection('DISCONNECTED');
        if (toast) showToast({ severity: 'warn', summary: 'Disconnected' });
    }, [showToast, stopAndSaveRecording]);

    async function startMicrophone() {
        if (streamRef.current || !settings.usePushToTalk) return;
        if (!window.isSecureContext) {
            showToast({ severity: 'error', summary: 'Insecure Web Context' });
            return;
        }
        const microphones = await getMediaDevices('audioinput');
        if (microphones.length === 0) {
            showToast({ severity: 'error', summary: 'No Microphone Found' });
            return;
        }
        try {
            streamRef.current = await getMediaStream();
            streamRef.current.getTracks().forEach(track => track.enabled = false);
        }
        catch (error) {
            showToast({ severity: 'error', summary: 'Media Access Denied', detail: error });
            return;
        }
    }

    async function connect() {
        setConnection('CONNECTING');
        await startMicrophone();
        const offer = await getSDP('offer');

        if (offer) {
            const pc = new RTCPeerConnection();

            if (settings.usePushToTalk) {
                const ms = streamRef.current as MediaStream;
                ms.getTracks().forEach(track => pc.addTrack(track, ms));
            }

            // When baby camera stream receives
            pc.ontrack = (e: RTCTrackEvent) => {
                if (videoRef.current) videoRef.current.srcObject = e.streams[0];
            };

            // When baby gets connected or sends a message
            pc.ondatachannel = (e: RTCDataChannelEvent) => {
                const dc = e.channel;
                dc.onopen = () => {
                    babyRef.current = { pc, dc };
                    setConnection('CONNECTED');
                    showToast({ severity: 'success', summary: 'Connection Success', detail: 'Baby ID: ' + offer.browserID });
                    audioToneRef.current.preload = 'auto';
                };
                dc.onmessage = (e: MessageEvent) => {
                    if (e.data === 'DISCONNECT') disconnect();
                    else if (e.data === 'MOTION' && settings.notifyMotionDetection) {
                        showToast({ severity: 'info', summary: 'Motion Detected' });
                        audioToneRef.current.play().catch(() => console.warn('Failed to play tone.mp3'));
                    }
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

            // Discard unfertilized pc
            const isPosted = await postSDP(pc.localDescription!);
            if (isPosted) {  // check if connection request is rejected by the baby
                let attempts = 10;
                while (attempts-- > 0) {
                    await new Promise(resolve => setTimeout(resolve, 5_000));
                    if (pc.connectionState === 'connected') break;  // connection accepted
                    if (await getSDP('offer') !== null) {  // connection rejected
                        pc.close();
                        disconnect(false);
                        showToast({ severity: 'warn', summary: 'Connection Rejected', detail: 'Baby device rejected the connection request' });
                        break;
                    }
                }
            } else {  // if failed to post the answer sdp
                pc.close();
                disconnect(false);
                showToast({ severity: 'error', summary: 'Connection Failed', detail: 'Failed to post the answer sdp' });
            }
        } else {
            disconnect(false);
            showToast({ severity: 'warn', summary: 'Baby Device Offline', detail: 'No offer sdp was detected' });
        }
    }

    function pushToTalk(pushed: boolean) {
        if (pushed && !settings.usePushToTalk) {
            showToast({ severity: 'warn', summary: 'Feature Disabled', detail: 'Push-To-Talk feature is disabled in settings' });
            return;
        }
        if (!babyRef.current || !videoRef.current || !streamRef.current) return;
        setTalking(pushed);
        videoRef.current.muted = pushed;
        streamRef.current.getTracks().forEach(track => track.enabled = pushed);
        sendMessage(babyRef.current.dc, pushed ? 'TALKING' : 'SILENCED');
    }

    function startRecording() {
        const remoteStream = videoRef.current?.srcObject as MediaStream;
        if (!babyRef.current || !remoteStream || recorderRef.current) return;

        const [mimeType, extension] = getRecordingFormat();
        const recorder = new MediaRecorder(remoteStream, { mimeType });
        const recordedChunks: Blob[] = [];

        recorder.ondataavailable = (e: BlobEvent) => recordedChunks.push(e.data);
        recorder.onstop = recorder.onerror = () => {
            if (recordedChunks.length === 0) return;
            const recordedBlob = new Blob(recordedChunks, { type: mimeType });
            const url = URL.createObjectURL(recordedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Recording_${Date.now()}.${extension}`;
            a.click();
            URL.revokeObjectURL(url);
            recorderRef.current = null;
            setRecording(null);
            clearInterval(blinker);
            showToast({ severity: 'info', summary: 'Recording Stopped', detail: 'Saved as ' + a.download });
        };

        recorder.start(1000);
        recorderRef.current = recorder;

        const blinker = setInterval(() => setRecording(prev => prev === 'border-red-500' ? 'border-transparent' : 'border-red-500'), 333);
        showToast({ severity: 'info', summary: 'Recording Started', detail: 'Supported format: ' + mimeType });
    }

    useEffect(() => {
        return () => { if (streamRef.current || babyRef.current) disconnect(false); };
    }, [disconnect]);

    return (
        <PageAnimation>
            <div className="w-full md:w-1/2 lg:w-1/3 mx-auto min-h-dvh flex flex-col justify-between items-center gap-4 p-4 text-white bg-neutral-800 rounded-xl select-none duration-300 transition-all">
                <Header screen="parent">Parent Device ID</Header>

                <div className="w-full flex flex-col items-center gap-1.5">
                    <ParentStatusPanel
                        isLive={connection === 'CONNECTED'}
                        isTalking={talking}
                        onFullscreen={() => videoRef.current?.requestFullscreen()} />

                    <video ref={videoRef} autoPlay muted={talking} className={`
                            w-full max-w-full shadow cursor-pointer rounded-lg border-2 transition-all ease-in-out duration-300
                            ${talking ? 'border-yellow-400' : recording ?? 'border-pink-500'} ${connection !== 'CONNECTED' ? 'h-[50vh]' : 'h-auto'}
                        `}
                        onMouseDown={() => pushToTalk(true)} onTouchStart={() => pushToTalk(true)}
                        onMouseUp={() => pushToTalk(false)} onTouchEnd={() => pushToTalk(false)}
                        onMouseLeave={() => pushToTalk(false)} />

                    <Button size="small" className="w-fit mt-1!"
                        label={recording ? 'Stop & Save Recording' : 'Start Recording'}
                        onClick={() => recording ? stopAndSaveRecording() : startRecording()}
                        disabled={connection !== 'CONNECTED'} />
                </div>

                <Button size="large"
                    label={connection === 'DISCONNECTED' ? 'Connect' : connection === 'CONNECTED' ? 'Disconnect' : 'Connecting...'}
                    onClick={() => connection === 'DISCONNECTED' ? connect() : connection === 'CONNECTED' ? disconnect() : null}
                    disabled={connection === 'CONNECTING'} />
            </div>
        </PageAnimation>
    );
}

export default ParentDevice;