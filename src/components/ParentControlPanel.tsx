import { Button } from 'primereact/button';
import { useEffect, useRef, useState } from 'react';
import { getSettings } from '../services/settings';

type Props = {
    isLive: boolean,
    isTorch: boolean | null,
    isRecording: boolean,
    onToggleTorch: (b: boolean) => void,
    onToggleRecording: (b: boolean) => void,
    onToggleMotionAlerts: (b: boolean) => void
};

function ParentControlPanel({ isLive, isTorch, isRecording, onToggleTorch, onToggleRecording, onToggleMotionAlerts }: Props) {
    const recordingTimerRef = useRef<number | null>(null);

    const [recordingLength, setRecordingLength] = useState<string>('00:00');
    const [motionDetectionAlerts, setMotionDetectionAlerts] = useState<boolean>(getSettings().motionDetectionAlerts);

    useEffect(() => {
        const stopTimer = () => {
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
            setRecordingLength('00:00');
        };

        if (isRecording) {
            const startTime = Date.now();
            recordingTimerRef.current = setInterval(() => {
                const ms = Date.now() - startTime;
                const s = Math.round(ms / 1000);
                const m = Math.floor(s / 60);
                const hours = Math.floor(m / 60).toString().padStart(2, '0');
                const minutes = (m % 60).toString().padStart(2, '0');
                const seconds = (s % 60).toString().padStart(2, '0');
                setRecordingLength((hours === '00' ? '' : `${hours}:`) + `${minutes}:${seconds}`);
            }, 1000);
        } else stopTimer();

        return stopTimer;
    }, [isRecording]);

    return (
        <div className="w-full flex justify-between px-2">
            <div className="flex flex-col items-center gap-1">
                <div className="text-sm">{isRecording ? `[${recordingLength}] Recording` : 'Stream Recorder'}</div>
                <Button size="small" className="h-10"
                    severity={isRecording ? undefined : 'secondary'}
                    label={isRecording ? 'On' : 'Off'}
                    onClick={() => onToggleRecording(!isRecording)}
                    disabled={!isLive} />
            </div>

            <div className="flex flex-col items-center gap-1">
                <div className="text-sm">Torch Light</div>
                <Button size="small" className="h-10"
                    severity={isTorch ? undefined : 'secondary'}
                    label={isTorch ? 'On' : 'Off'}
                    onClick={() => { if (isTorch !== null) onToggleTorch(!isTorch); }}
                    disabled={!isLive || isTorch === null} />
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