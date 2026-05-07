import { Button } from 'primereact/button';
import { useState } from 'react';
import { getSettings } from '../services/settings';

type Props = {
    isLive: boolean,
    isPolling: boolean,
    onTogglePolling: (b: boolean) => void,
    onToggleMotionDetection: (n: number | null) => void
};

function BabyControlPanel({ isLive, isPolling, onTogglePolling, onToggleMotionDetection }: Props) {
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
                <div className="text-sm">Motion {motionDetectionValue ? 'Sensitivity' : 'Detection'}</div>
                <Button size="small" className="h-10"
                    severity={motionDetectionOptions[motionDetectionIndex].value ? undefined : 'secondary'}
                    label={motionDetectionOptions[motionDetectionIndex].name}
                    onClick={() => {
                        const i = (motionDetectionIndex + 1) % motionDetectionOptions.length;
                        setMotionDetectionIndex(i);
                        setMotionDetectionValue(motionDetectionOptions[i].value);
                        onToggleMotionDetection(motionDetectionOptions[i].value);
                    }}
                    disabled={!isLive} />
            </div>
        </div>
    );
}

export default BabyControlPanel;