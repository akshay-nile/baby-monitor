import { User } from 'lucide-react';
import { Button } from 'primereact/button';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToastMessage } from '../contexts/ToastMessage/useToastMessage';
import { clearSDP, getSDP, postSDP, sendMessage, waitForIceGatheringCompletion } from '../services/connex';
import { getMediaDevices, getMediaStream, startMotionDetection, stopMotionDetection } from '../services/media';
import type { Parent } from '../services/models';
import { getSettings, setSettings } from '../services/settings';
import BabyStatusPanel from './BabyStatusPanel';
import Header from './Header';
import PageAnimation from './PageAnimation';


function BabyDevice() {
    const settings = getSettings();
    const { showToast } = useToastMessage();

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream>(null);
    const pollingRef = useRef<boolean>(false);
    const timeoutRef = useRef<number>(null);
    const parentsRef = useRef<Map<string, Parent>>(new Map());
    const facingModeRef = useRef<'user' | 'environment'>(settings.startWithCamera);

    const [camera, setCamera] = useState<'STARTED' | 'STARTING' | 'STOPPED'>('STOPPED');
    const [polling, setPolling] = useState<boolean>(false);
    const [talking, setTalking] = useState<boolean>(false);
    const [parentsCount, setParentsCount] = useState<number>(0);

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
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        pollingRef.current = false;
        setPolling(false);
        clearSDP();
        if (toast) showToast({ severity: 'info', summary: 'Polling Stopped', detail: parentsRef.current.size + ' parent devices are connected' });
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

    const stopCamera = useCallback((toast = true) => {
        const detail = parentsRef.current.size > 0
            ? `${parentsRef.current.size} parent(s) disconnected`
            : 'No parent was connected';

        parentsRef.current.keys().forEach(parentID => disconnect(parentID, false));
        parentsRef.current.clear();
        setParentsCount(0);

        if (videoRef.current) {
            stopMotionDetection();
            videoRef.current.pause();
            videoRef.current.srcObject = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        clearSDP();
        setTalking(false);
        stopPolling(false);
        setCamera('STOPPED');
        if (toast) showToast({ severity: 'info', summary: 'Camera Stopped', detail });
    }, [showToast, disconnect, stopPolling]);

    async function getCameraStream(): Promise<MediaStream | null> {
        if (!window.isSecureContext) {
            showToast({ severity: 'error', summary: 'Insecure Web Context' });
            return null;
        }
        const cameras = await getMediaDevices('videoinput');
        if (cameras.length === 0) {
            showToast({ severity: 'error', summary: 'No Camera Found' });
            return null;
        }
        if (cameras.length === 1) facingModeRef.current = 'user';
        try { return await getMediaStream(facingModeRef.current); }
        catch (error) {
            showToast({ severity: 'error', summary: 'Media Access Denied', detail: error });
            return null;
        }
    }

    function replaceParentTracks(parents: Array<Parent>, stream?: MediaStream) {
        const ms = stream ?? streamRef.current;
        if (ms) parents
            .forEach(parent => parent.pc.getSenders()
                .forEach(sender => ms.getTracks()
                    .forEach(track => track.kind === sender.track?.kind && sender.replaceTrack(track))));
    }

    async function startCamera() {
        const video = videoRef.current;
        if (streamRef.current || !video || camera === 'STARTING') return;
        setCamera('STARTING');
        streamRef.current = await getCameraStream();
        if (!streamRef.current) {
            setCamera('STOPPED');
            return;
        }
        if (settings.useMotionDetection) {
            const notifyAllParents = () => parentsRef.current.values().forEach(parent => sendMessage(parent.dc, 'MOTION'));
            video.onloadeddata = () => startMotionDetection(video, notifyAllParents);
            video.onerror = video.onended = stopMotionDetection;
        }
        video.srcObject = streamRef.current;
        setCamera('STARTED');
        showToast({ severity: 'success', summary: 'Camera Started', detail: 'Waiting for parent connections' });
        await startPolling(false);
    }

    async function startPolling(toast = true) {
        // Abort if polling is already active
        if (pollingRef.current) return;

        // Abort if max parents limit is reached
        if (parentsRef.current.size >= settings.maxParentConnections) {
            showToast({ severity: 'warn', summary: 'Max Parents Limit Reached', detail: `${settings.maxParentConnections} parents are already connected` });
            return;
        }

        // Start polling for parent connections
        setPolling(true);
        pollingRef.current = true;
        timeoutRef.current = setTimeout(stopPolling, settings.pollingTimeout * 60_000);
        if (toast) showToast({ severity: 'success', summary: 'Polling Started', detail: `Parent should connect within ${settings.pollingTimeout} minutes` });

        // Allow connecting parents while polling is active
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
                const parent = { pc, dc, audio, talking: false };
                addParent(parentID, parent);
                replaceParentTracks([parent]);
                if (parentsRef.current.size >= settings.maxParentConnections) stopPolling();
            };

            // When parent sends a message
            dc.onmessage = (e: MessageEvent) => {
                if (!parentID) return;
                if (e.data === 'DISCONNECT') {
                    disconnect(parentID);
                    return;
                }
                const parent = parentsRef.current.get(parentID);
                if (!parent) return;
                if (e.data === 'SILENCED') {
                    parent.talking = false;
                    setTalking(parentsRef.current.values().some(p => p.talking));
                    return;
                }
                if (e.data === 'TALKING') {
                    parent.talking = true;
                    showToast({ severity: 'info', summary: 'Parent Talking', detail: 'Parent ID: ' + parentID });
                    setTalking(true);
                }
            };

            // When parent gets disconnected
            pc.onconnectionstatechange = () => {
                if (!parentID) return;
                if (['disconnected', 'closed', 'failed'].includes(pc.connectionState)) disconnect(parentID);
            };

            // Create and send the offer sdp
            await pc.setLocalDescription(await pc.createOffer());
            await waitForIceGatheringCompletion(pc);
            let isPosted = await postSDP(pc.localDescription!);

            // Keep checking for the answer sdp
            while (isPosted && pollingRef.current && pc.remoteDescription === null) {
                await new Promise(resolve => setTimeout(resolve, 3000));
                const answer = await getSDP('answer');
                if (answer) {
                    parentID = answer.browserID;
                    if (settings.trustedParents.includes(parentID)) await pc.setRemoteDescription(answer.sdp);
                    else isPosted = await new Promise<boolean>(resolve => {
                        confirmDialog({
                            group: 'templating',
                            header: 'Confirm Parent Connection',
                            message: (
                                <div className="flex flex-col justify-center items-center gap-4">
                                    <span className="flex flex-col items-center font-semibold gap-1">
                                        <User size={70} strokeWidth={1.5} /> {parentID}
                                    </span>
                                    <span className="font-bold text-lg">Allow this parent to connect?</span>
                                </div>
                            ),
                            accept: async () => {
                                await pc.setRemoteDescription(answer.sdp);
                                settings.trustedParents.push(answer.browserID);
                                setSettings(settings);
                                resolve(false);
                            },
                            reject: async () => resolve(await postSDP(pc.localDescription!))
                        });
                    });
                }
            }

            // Discard the unfertilized pc
            if (pc.remoteDescription === null) {
                pc.close();
                await clearSDP();
            }
        }
    }

    async function flipCameraStream() {
        if (!streamRef.current) return;
        facingModeRef.current = facingModeRef.current === 'user' ? 'environment' : 'user';
        const [oldStream, newStream] = [streamRef.current, await getCameraStream()];
        if (!newStream || !videoRef.current) return;
        videoRef.current.srcObject = newStream;
        replaceParentTracks(parentsRef.current.values().toArray(), newStream);
        showToast({ severity: 'info', summary: `Switched to ${facingModeRef.current === 'user' ? 'Front' : 'Back'} Camera` });
        streamRef.current = newStream;
        if (oldStream) oldStream.getTracks().forEach(track => track.stop());
    }

    useEffect(() => {
        const parents = parentsRef.current;
        return () => { if (streamRef.current || parents.size > 0) stopCamera(); };
    }, [stopCamera]);

    return (
        <PageAnimation>
            <div className="w-full md:w-1/2 lg:w-1/3 mx-auto min-h-dvh flex flex-col justify-between items-center gap-4 p-4 text-white bg-neutral-800 rounded-xl select-none duration-300 transition-all">
                <Header screen="baby">Baby Device ID</Header>

                <div className="w-full flex flex-col items-center gap-1.5">
                    <BabyStatusPanel
                        isLive={camera === 'STARTED'}
                        isPolling={polling}
                        isTalking={talking}
                        parentsCount={parentsCount} />

                    <video ref={videoRef} autoPlay muted className={`
                            w-full max-w-full shadow cursor-pointer rounded-lg border-2 transition-all duration-300
                            ${talking ? 'border-yellow-400' : 'border-pink-500'} ${camera !== 'STARTED' ? 'h-[50vh]' : 'h-auto'}
                        `}
                        onClick={flipCameraStream} />

                    <Button size="small" className="w-fit mt-1!"
                        label={polling ? 'Stop Polling' : 'Start Polling'}
                        onClick={() => polling ? stopPolling() : startPolling()}
                        disabled={camera !== 'STARTED'} />
                </div>

                <Button size="large"
                    label={camera === 'STARTED' ? 'Stop Camera' : camera === 'STOPPED' ? 'Start Camera' : 'Starting...'}
                    onClick={() => camera === 'STARTED' ? stopCamera() : camera === 'STOPPED' ? startCamera() : null}
                    disabled={camera === 'STARTING'} />

                <ConfirmDialog group="templating" showCloseIcon={false} />
            </div>
        </PageAnimation>
    );
}

export default BabyDevice;