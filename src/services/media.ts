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
let previousFrame: Uint8Array | null = null;
let canvas: HTMLCanvasElement | null = null;
let context: CanvasRenderingContext2D | null = null;

export function startMotionDetection(video: HTMLVideoElement, onMotionDetected: () => void, sensitivity = 100): void {
    stopMotionDetection();

    const [interval, minThreshold, idealResolution, recentSamples] = [250, 100, 100_000, new Array<number>()];
    const videoResolution = video.videoWidth * video.videoHeight;
    const downscaleFactor = videoResolution > idealResolution ? Math.sqrt(videoResolution / idealResolution) : 1;

    canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth / downscaleFactor);
    canvas.height = Math.round(video.videoHeight / downscaleFactor);
    context = canvas.getContext('2d', { willReadFrequently: true });
    if (context) context.filter = 'grayscale(1); blur(2px);';

    timer = setInterval(() => {
        if (!canvas || !context) {
            stopMotionDetection();
            return;
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const currentFrame = context.getImageData(0, 0, canvas.width, canvas.height).data;

        if (!previousFrame) {
            previousFrame = new Uint8Array(currentFrame.length / 4);
            for (let cfi = 1, pfi = 0; cfi < currentFrame.length; cfi += 4, pfi++) previousFrame[pfi] = currentFrame[cfi];
            return;
        }

        let changedPixelCount = 0;
        for (let cfi = 1, pfi = 0; cfi < currentFrame.length; cfi += 4, pfi++) {
            const difference = Math.abs(currentFrame[cfi] - previousFrame[pfi]);
            if (difference > sensitivity) changedPixelCount++;
            previousFrame[pfi] = currentFrame[cfi];
        }

        recentSamples.push(changedPixelCount);
        while (recentSamples.length > 20) recentSamples.shift();

        const avgMotion = recentSamples.reduce((a, b) => a + b, 0) / recentSamples.length;
        const threshold = Math.round(avgMotion * 1.414) + minThreshold;
        if (changedPixelCount > threshold) onMotionDetected();
    }, interval);
}

export function stopMotionDetection(): void {
    if (timer) clearInterval(timer);
    timer = null;
    canvas = null;
    context = null;
    previousFrame = null;
}