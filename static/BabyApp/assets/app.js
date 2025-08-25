const btn = document.getElementById("cameraBtn");
const localVideo = document.getElementById("localVideo");

let localStream;

const pc = new RTCPeerConnection();

pc.onicecandidate = event => {
    if (event.candidate === null) {
        // Store the offer to the server
        fetch("/relay?role=baby", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "offer", sdp: pc.localDescription })
        })
            .then(res => res.json())
            .then(data => {
                // Start polling for the answer once offer is stored
                if (data?.status === "offer-stored") waitForAnswer();
            });
    }
};

async function waitForAnswer() {
    btn.textContent = "Waiting...";
    while (true) {
        let res = await fetch("/relay?role=baby"); // GET the Answer
        if (res.status === 200) {
            const data = await res.json();
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            console.log("Parent device connected!");
            btn.textContent = "Connected";
            break; // Stop polling, connection has been established
        }

        // Wait 5 seconds before polling again
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    btn.onclick = () => window.location.reload();
}

async function startCamera() {
    btn.textContent = "Starting...";
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    await startOffer()
    btn.onclick = null;
}

async function startOffer() {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Store the offer to server
    await fetch("/relay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "offer", sdp: pc.localDescription })
    });
}
