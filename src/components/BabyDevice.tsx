import { Baby } from 'lucide-react';
import { Button } from 'primereact/button';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToastMessage } from '../contexts/ToastMessage/useToastMessage';
import { clearSDP, getSDP, postSDP, sendMessage, waitForIceGatheringCompletion } from '../services/connex';
import type { Parent } from '../services/models';
import { browserID } from '../services/settings';

function BabyDevice() {
    const { showToast } = useToastMessage();

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream>(null);
    const pollingRef = useRef<boolean>(false);
    const timeoutRef = useRef<number>(null);
    const parentsRef = useRef<Map<string, Parent>>(new Map());

    const [parentsCount, setParentsCount] = useState<number>(0);
    const [status, setStatus] = useState<'CONNECTED' | 'POLLING' | 'DISCONNECTED'>('DISCONNECTED');
    console.log(parentsCount);

    async function connect() {
        // Start local media stream
        if (!streamRef.current) {
            if (!window.isSecureContext) {
                showToast({ severity: 'error', summary: 'No Secure Context' });
                return;
            }
            try {
                streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) videoRef.current.srcObject = streamRef.current;
                showToast({ severity: 'info', summary: 'Camera Started', detail: 'Waiting for parent connections.' });
            }
            catch (error) {
                showToast({ severity: 'error', summary: 'Media Access Denied', detail: error });
                return;
            }
        }

        // Set polling active
        startPolling(false);

        // Keep storing connected parents until polling timeout
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
                addParent(parentID, { pc, dc, audio });
            };

            // When parent signals disconnect
            dc.onmessage = (e: MessageEvent) => {
                if (!parentID) return;
                if (e.data === 'DISCONNECT') disconnect(parentID);
                if (!pollingRef.current && parentsRef.current.size === 0) setStatus('DISCONNECTED');
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

    function startPolling(toast = true) {
        pollingRef.current = true;
        setStatus('POLLING');
        timeoutRef.current = setTimeout(stopPolling, 5 * 60 * 1000);
        if (toast) showToast({ severity: 'info', summary: 'Polling Started', detail: parentsRef.current.size + ' parent devices are connected.' });
    }

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

    useEffect(() => {
        if (streamRef.current !== null || parentsRef.current.size > 0) return disconnectAll;
    }, [disconnectAll]);

    return (
        <div className="w-full md:w-1/2 lg:w-1/3 mx-auto min-h-dvh flex flex-col justify-between items-center gap-12 p-4 bg-white text-white select-none duration-300 transition-all">
            <div className="w-full flex justify-between items-center p-4 bg-pink-500 rounded-lg shadow shadow-gray-200">
                <div className="w-full flex justify-between">
                    <span className="flex items-center gap-2 text-lg font-bold"><Baby size="30" strokeWidth="2.4" />Baby Device ID</span>
                    <span className="text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded font-mono select-text">{browserID}</span>
                </div>
            </div>

            <video ref={videoRef} autoPlay muted className="w-full my-auto rounded-lg border-2 border-pink-500 shadow-xl shadow-gray-200" />

            <div className="w-full flex justify-center items-center gap-2 sm:gap-4">
                {
                    status !== 'DISCONNECTED' &&
                    <Button size="large"
                        label={status === 'POLLING' ? 'Stop Polling' : 'Start Polling'}
                        onClick={() => status === 'POLLING' ? stopPolling() : startPolling()} />
                }
                <Button size="large"
                    label={status === 'DISCONNECTED' ? 'Start Camera' : 'Stop Camera'}
                    onClick={() => status === 'DISCONNECTED' ? connect() : disconnectAll()} />
            </div>
        </div>
    );
}

export default BabyDevice;