import { getBrowserID } from './settings';

const baseURL = "https://akshaynile.pythonanywhere.com";
const headers = { "Content-Type": "application/json" };

export async function storeSDP(sdp) {
    const response = await fetch(`${baseURL}/exchange`, {
        method: "POST", headers,
        body: JSON.stringify(sdp)
    });
    return await response.json();
}

export async function loadSDP(type) {
    const response = await fetch(`${baseURL}/exchange?type=${type}`, {
        method: "GET", headers
    });
    return await response.json();
}

export function getNewPC({ onConnect, onDisconnect, onTrack, stream }) {
    const pc = new RTCPeerConnection();
    pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") onConnect(pc);
        if (["disconnected", "closed", "failed"].includes(pc.connectionState)) onDisconnect(pc);
    };
    if (stream) stream.getTracks().forEach(track => pc.addTrack(track, stream));
    if (onTrack) pc.ontrack = event => onTrack(event);
    return pc;
}

export function attachDataChannel(pc, dataChannel, onMessage) {
    if (dataChannel) {
        dataChannel.onopen = () => {
            pc.dataChannel = dataChannel;
            pc.dataChannel.onmessage = (event) => onMessage(event.data, pc);
        };
    } else {
        pc.ondatachannel = event => event.channel.onopen = () => {
            pc.dataChannel = event.channel;
            pc.dataChannel.onmessage = (event) => onMessage(event.data, pc);
            pc.parentID = Date.now() + "-" + getBrowserID();
            pc.dataChannel.send("PARENT-ID: " + pc.parentID);
        };
    }
}

export async function waitForIceGatheringCompletion(pc) {
    return new Promise(resolve => {
        function checkGatheringState() {
            if (pc.iceGatheringState === "complete") {
                pc.removeEventListener('icegatheringstatechange', checkGatheringState);
                return resolve(pc.iceGatheringState);
            }
            pc.addEventListener('icegatheringstatechange', checkGatheringState);
        }
        checkGatheringState();
    });
}

export async function createAndStoreOfferWhilePolling(pc, isPolling = () => false) {
    pc.setLocalDescription(await pc.createOffer());
    await waitForIceGatheringCompletion(pc);
    while (isPolling()) {
        const response = await storeSDP(pc.localDescription);
        if (response?.status === "offer-stored") break;
    }
    if (!isPolling()) disconnectAllConnections([pc]);
}

export async function loadAndApplyAnswerWhilePolling(pc, isPolling = () => false) {
    while (isPolling()) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const answer = await loadSDP("answer");
        if (answer?.type !== "answer") continue;
        await pc.setRemoteDescription(answer);
        break;
    }
    if (!pc.remoteDescription) disconnectAllConnections([pc]);
}

export async function disconnectAllConnections(pcs) {
    pcs.forEach(pc => pc && pc.close());
    await storeSDP({ type: null });
}
