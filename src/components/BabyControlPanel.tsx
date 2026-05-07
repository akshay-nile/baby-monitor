import { Button } from 'primereact/button';
import { useState } from 'react';

type Props = {
    isLive: boolean,
    isPolling: boolean, startPolling: () => void, stopPolling: () => void,
    motionDetectionSensitivity: number | null,
    toggleMotionDetectionSensitivity: (n: number | null) => void
};

function BabyControlPanel({ isLive, isPolling, startPolling, stopPolling, motionDetectionSensitivity, toggleMotionDetectionSensitivity }: Props) {
    const motionDetectionLabels = [
        { name: 'Disabled', value: null },
        { name: 'Low', value: 100 },
        { name: 'Medium', value: 50 },
        { name: 'High', value: 10 }
    ];

    const [motionDetectionIndex, setMotionDetectionIndex] = useState<number>(
        motionDetectionLabels.findIndex(l => l.value === motionDetectionSensitivity)
    );

    return (
        <div className="w-full flex justify-between px-2">
            <div className="flex flex-col items-center gap-1">
                <div className="text-sm">Parent Connections</div>
                <Button size="small" className="h-10"
                    severity={isPolling ? undefined : 'secondary'}
                    label={isPolling ? 'Allowed' : 'Disabled'}
                    onClick={() => isPolling ? stopPolling() : startPolling()}
                    disabled={!isLive} />
            </div>

            <div className="flex flex-col items-center gap-1">
                <div className="text-sm">Motion {motionDetectionSensitivity ? 'Sensitivity' : 'Detection'}</div>
                <Button size="small" className="h-10"
                    severity={motionDetectionLabels[motionDetectionIndex].value ? undefined : 'secondary'}
                    label={motionDetectionLabels[motionDetectionIndex].name}
                    onClick={() => {
                        const i = (motionDetectionIndex + 1) % motionDetectionLabels.length;
                        setMotionDetectionIndex(i);
                        toggleMotionDetectionSensitivity(motionDetectionLabels[i].value);
                    }}
                    disabled={!isLive} />
            </div>
        </div>
    );
}

export default BabyControlPanel;