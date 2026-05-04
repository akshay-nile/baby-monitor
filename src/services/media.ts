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


// ---------- Motion Detection Logic ---------- //

let timer: number | null = null;
let canvas: HTMLCanvasElement | null = null;
let previousFrame: Uint8ClampedArray | null = null;

export function startMotionDetection(video: HTMLVideoElement, onMotionDetected: () => void, interval = 250): void {
    stopMotionDetection();

    const samples: number[] = [];
    const idealResolution = 100_000;
    const videoResolution = video.videoWidth * video.videoHeight;
    const downscaleFactor = videoResolution > idealResolution ? Math.sqrt(videoResolution / idealResolution) : 1;

    canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth / downscaleFactor);
    canvas.height = Math.round(video.videoHeight / downscaleFactor);

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (context) context.filter = 'grayscale(1)';

    timer = setInterval(() => {
        if (!canvas || !context) {
            stopMotionDetection();
            return;
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = context.getImageData(0, 0, canvas.width, canvas.height);

        const currentFrame = new Uint8ClampedArray(frame.data);
        if (!previousFrame) {
            previousFrame = currentFrame;
            return;
        }

        let changedPixels = 0;
        const frameLength = Math.min(currentFrame.length, previousFrame.length);

        for (let i = 0; i < frameLength; i += 4) {
            const difference = Math.abs(currentFrame[i] - previousFrame[i]);
            if (difference > 10) changedPixels++;
        }

        samples.push(changedPixels);
        while (samples.length >= 20) samples.shift();
        const threshold = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length) * 2;

        if (changedPixels > threshold) onMotionDetected();
        previousFrame = currentFrame;
    }, interval);
}

export function stopMotionDetection(): void {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    previousFrame = null;
    canvas = null;
}