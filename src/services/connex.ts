import type { SDP } from './models';
import { browserID } from './settings';

const baseURL = 'https://akshaynile.pythonanywhere.com/exchange/baby-monitor';

export async function getSDP(type: 'offer' | 'answer'): Promise<SDP | null> {
    const response = await fetch(baseURL);
    if (!response.ok) return null;
    const data = await response.json();
    if (data && data.browserID !== browserID && data.sdp?.type === type) return data;
    return null;
}

export async function postSDP(sdp: RTCSessionDescription): Promise<boolean> {
    const response = await fetch(baseURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdp, browserID })
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.browserID == browserID;
}

export async function clearSDP(): Promise<boolean> {
    const response = await fetch(baseURL, { method: 'DELETE' });
    return response.ok;
}

export async function waitForIceGatheringCompletion(pc: RTCPeerConnection): Promise<void> {
    return await new Promise((resolve, reject) => {
        if (!pc.localDescription) reject(new Error('pc.localDescription is not set'));
        function checkIceGatheringState() {
            if (pc.iceGatheringState === 'complete') {
                pc.removeEventListener('icegatheringstatechange', checkIceGatheringState);
                return resolve();
            }
        }
        pc.addEventListener('icegatheringstatechange', checkIceGatheringState);
        checkIceGatheringState();
    });
}

export function sendMessage(dc: RTCDataChannel, message: string): boolean {
    if (dc.readyState === 'open') {
        dc.send(message);
        return true;
    }
    return false;
}
