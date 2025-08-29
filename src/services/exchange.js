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
