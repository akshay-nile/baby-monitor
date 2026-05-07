import { Button } from 'primereact/button';
import { useState } from 'react';
import { getSettings } from '../services/settings';

type Props = {
    isLive: boolean,
    isRecording: boolean,
    onToggleRecording: (b: boolean) => void,
    onToggleMotionAlerts: (b: boolean) => void
};

function ParentControlPanel({ isLive, isRecording, onToggleRecording, onToggleMotionAlerts }: Props) {
    const [motionDetectionAlerts, setMotionDetectionAlerts] = useState<boolean>(getSettings().motionDetectionAlerts);

    return (
        <div className="w-full flex justify-between px-2">
            <div className="flex flex-col items-center gap-1">
                <div className="text-sm">Stream Recorder</div>
                <Button size="small" className="h-10"
                    severity={isRecording ? undefined : 'secondary'}
                    label={isRecording ? 'On' : 'Off'}
                    onClick={() => onToggleRecording(!isRecording)}
                    disabled={!isLive} />
            </div>

            <div className="flex flex-col items-center gap-1">
                <div className="text-sm">Motion Alerts</div>
                <Button size="small" className="h-10"
                    severity={motionDetectionAlerts ? undefined : 'secondary'}
                    label={motionDetectionAlerts ? 'On' : 'Off'}
                    onClick={() => {
                        const alerts = !motionDetectionAlerts;
                        setMotionDetectionAlerts(alerts);
                        onToggleMotionAlerts(alerts);
                    }}
                    disabled={!isLive} />
            </div>
        </div>
    );
}

export default ParentControlPanel;