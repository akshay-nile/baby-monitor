const btn = document.getElementById("connectBtn");
const remoteVideo = document.getElementById("remoteVideo");

const pc = new RTCPeerConnection();

pc.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
};

pc.onicecandidate = event => {
    if (event.candidate === null) {
        // Store the answer to server
        fetch("/relay?role=parent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "answer", sdp: pc.localDescription })
        })
            .then(res => res.json())
            .then(data => {
                if (data?.status === "answer-stored") {
                    console.log('Answer stored');
                    btn.textContent = "Waiting...";
                    btn.onclick = () => null;
                }
            });
    }
};

pc.onconnectionstatechange = () => {
    if (pc.connectionState === "connected") {
        console.log("Baby device connected!");
        btn.textContent = "Connected";
        btn.onclick = () => window.location.reload();
    }
}

async function connect() {
    btn.textContent = "Connecting...";
    await getOffer();
}

async function getOffer() {
    const res = await fetch("/relay?role=parent", { headers: { "Content-Type": "application/json" } });
    const data = await res.json();

    if (data.sdp) {
        const offer = new RTCSessionDescription(data.sdp);
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
    }
    else {
        alert("Please turn ON the baby camera first !");
        console.log("No offer found!");
        btn.textContent = "Connect";
    }
}
