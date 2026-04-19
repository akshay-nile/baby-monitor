import { Camera, CameraOff, CirclePlus, CircleX, Mic, MicOff, User, Volume2, VolumeOff } from 'lucide-react';
import { type ReactNode } from 'react';

type Props = { parentsCount: number, isLive: boolean, isPolling: boolean, isMuted: boolean };

function BabyStatusPanel({ parentsCount, isLive, isPolling, isMuted }: Props) {
    const parents: Array<ReactNode> = [];

    for (let i = 0; i < parentsCount; i++) parents.push(<User key={i} size={18} />);

    return (
        <div className="w-full flex justify-between px-2">
            <div className="flex flex-col items-center gap-0.5">
                {
                    isLive
                        ? <span className="flex gap-2 justify-center items-center">
                            <Camera size={18} />
                            {isMuted ? <Mic size={18} /> : <MicOff size={18} />}
                        </span>
                        : <span className="flex gap-2 justify-center items-center">
                            <CameraOff size={18} />
                            <MicOff size={18} />
                        </span>
                }
                <div className="text-sm">sending</div>
            </div>

            <div className="flex flex-col items-center gap-0.5">
                <span className="flex gap-0.5 justify-center items-center">
                    {parentsCount > 0 ? parents : isPolling ? <CirclePlus size={18} /> : <CircleX size={18} />}
                </span>
                <div className="text-sm">parents ({parentsCount}{isPolling && '+'})</div>
            </div>

            <div className="flex flex-col items-center gap-0.5">
                <span className="flex gap-2 justify-center items-center">
                    {isMuted ? <VolumeOff size={18} /> : <Volume2 size={18} />}
                </span>
                <div className="text-sm">receiving</div>
            </div>
        </div>
    );
}

export default BabyStatusPanel;