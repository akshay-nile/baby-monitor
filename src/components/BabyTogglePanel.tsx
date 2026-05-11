import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useState, type RefObject } from 'react';
import { getMediaDevices } from '../services/media';
import { getSettings } from '../services/settings';

type Props = {
    isLive: boolean,
    isPolling: boolean,
    cameraStream: RefObject<MediaStream | null>,
    onSelectCamera: (m: MediaDeviceInfo) => void,
    onTogglePolling: (b: boolean) => void,
    onToggleMotionDetection: (n: number | null) => void
};

function BabyTogglePanel({ isLive, isPolling, cameraStream, onSelectCamera, onTogglePolling, onToggleMotionDetection }: Props) {
    const motionDetectionOptions = [
        { name: 'Disabled', value: null },
        { name: 'Low', value: 100 },
        { name: 'Medium', value: 50 },
        { name: 'High', value: 10 }
    ];

    const [motionDetectionValue, setMotionDetectionValue] = useState<number | null>(
        getSettings().useMotionDetection ? getSettings().motionSensitivity : null
    );
    const [motionDetectionIndex, setMotionDetectionIndex] = useState<number>(
        motionDetectionOptions.findIndex(op => op.value === motionDetectionValue)
    );

    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const selectedCameraId = cameraStream.current?.getVideoTracks()[0]?.getSettings()?.deviceId;

    useEffect(() => {
        if (isLive) (async () => setCameras(await getMediaDevices('videoinput')))();
    }, [isLive]);

    return (
        <div className="w-full flex justify-between px-2">
            <div className="flex flex-col items-center gap-1.5">
                <div className="text-xs">Parent Connections</div>
                <Button size="small" className="h-9 text-xs!"
                    severity={isPolling ? undefined : 'secondary'}
                    label={isPolling ? 'Allowed' : 'Disabled'}
                    onClick={() => onTogglePolling(!isPolling)}
                    disabled={!isLive} />
            </div>

            <div className="flex flex-col items-center gap-1.5">
                <div className="text-xs">Camera</div>
                <Dropdown className="h-9 text-xs!" pt={{ input: { style: { display: 'none', border: '1px solid pink' } } }}
                    options={cameras} optionLabel="label"
                    value={cameras.find(c => c.deviceId === selectedCameraId)}
                    onChange={e => onSelectCamera(e.value)}
                    disabled={!isLive} />
            </div>

            <div className="flex flex-col items-center gap-1.5">
                <div className="text-xs">Motion {motionDetectionValue ? 'Sensitivity' : 'Detection'}</div>
                <Button size="small" className="h-9 text-xs!"
                    severity={motionDetectionOptions[motionDetectionIndex].value ? undefined : 'secondary'}
                    label={motionDetectionOptions[motionDetectionIndex].name}
                    onClick={() => {
                        const i = (motionDetectionIndex + 1) % motionDetectionOptions.length;
                        setMotionDetectionIndex(i);
                        setMotionDetectionValue(motionDetectionOptions[i].value);
                        onToggleMotionDetection(motionDetectionOptions[i].value);
                    }} />
            </div>
        </div>
    );
}

export default BabyTogglePanel;