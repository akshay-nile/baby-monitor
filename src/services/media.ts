export async function getMediaStream(facingMode?: 'user' | 'environment') {
    const audio = {
        channelCount: { ideal: 2 },
        sampleRate: { ideal: 48_000 },
        noiseSuppression: true,
        echoCancellation: true,
        autoGainControl: true
    };
    const video = {
        facingMode: { exact: facingMode },
        frameRate: { ideal: 60 },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
    };
    const configs = facingMode ? { video, audio } : { audio };
    return navigator.mediaDevices.getUserMedia(configs);
}

export async function getMediaDevices(kind: 'videoinput' | 'audioinput') {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === kind);
}

export function getRecordingFormat() {
    const format = [
        'video/mp4;codecs="hvc1, mp4a.40.2"',
        'video/mp4;codecs="avc3.42E01E, mp4a.40.2"',
        'video/mp4;codecs="avc3.4D401E, mp4a.40.2"',
        'video/mp4;codecs="avc3"',
        'video/webm;codecs=av1,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
    ].find(mt => MediaRecorder.isTypeSupported(mt)) ?? 'video/webm';
    const extension = format.startsWith('video/mp4') ? 'mp4' : 'webm';
    return [format, extension];
}