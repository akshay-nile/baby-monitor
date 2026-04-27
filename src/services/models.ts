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
    talking: boolean
}

export interface ParentState {
    parentID: string,
    talking: boolean
}

export interface Settings {
    startWithCamera: 'user' | 'environment',
    maxParentConnections: number,
    pollingTimeout: number,
    usePushToTalk: boolean,
    useMotionDetection: boolean,
    motionSensitivity: 100 | 250 | 400,
    motionDetectionAlerts: boolean,
    trustedParents: string[],
}
