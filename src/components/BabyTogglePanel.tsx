import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import { getSettings } from '../services/settings';
import { getMediaDevices } from '../services/media';
import { Dropdown } from 'primereact/dropdown';

type Props = {
    isLive: boolean,
    isPolling: boolean,
    onSelectCamera: (m: MediaDeviceInfo) => void,
    onTogglePolling: (b: boolean) => void,
    onToggleMotionDetection: (n: number | null) => void
};

function BabyTogglePanel({ isLive, isPolling, onSelectCamera, onTogglePolling, onToggleMotionDetection }: Props) {
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

    useEffect(() => {
        if (isLive) (async () => setCameras(await getMediaDevices('videoinput')))();
    }, [isLive]);

    return (
        <div className="w-full flex justify-between px-2">
            <div className="flex flex-col items-center gap-1">
                <div className="text-sm">Parent Connections</div>
                <Button size="small" className="h-10"
                    severity={isPolling ? undefined : 'secondary'}
                    label={isPolling ? 'Allowed' : 'Disabled'}
                    onClick={() => onTogglePolling(!isPolling)}
                    disabled={!isLive} />
            </div>

            <div className="flex flex-col items-center gap-1">
                <div className="text-sm">Camera</div>
                <Dropdown className="h-10" pt={{ input: { style: { display: 'none', border: '1px solid pink' } } }}
                    options={cameras} optionLabel="label"
                    onChange={e => onSelectCamera(e.value)}
                    disabled={!isLive} />
            </div>

            <div className="flex flex-col items-center gap-1">
                <div className="text-sm">Motion {motionDetectionValue ? 'Sensitivity' : 'Detection'}</div>
                <Button size="small" className="h-10"
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