export interface SDP {
    browserID: string,
    sdp: RTCSessionDescription,
}

export interface Baby {
    pc: RTCPeerConnection,
    dc: RTCDataChannel,
}

export interface Parent extends Baby {
    audio: HTMLAudioElement,
}
