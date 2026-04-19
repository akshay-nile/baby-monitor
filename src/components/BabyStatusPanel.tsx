import { Camera, CameraOff, CirclePlus, CircleX, Mic, MicOff, User, Volume2, VolumeOff } from 'lucide-react';

type Props = { parentsCount: number, isLive: boolean, isPolling: boolean, isTalking: boolean };

function BabyStatusPanel({ parentsCount, isLive, isPolling, isTalking }: Props) {
    const parents = Array.from({ length: parentsCount }, (_, i) => <User key={i} size={18} />);

    return (
        <div className="w-full flex justify-between px-2">
            <div className="flex flex-col items-center gap-0.5">
                {
                    isLive
                        ? <span className="flex gap-2 justify-center items-center">
                            <Camera size={18} />
                            {isTalking ? <MicOff size={18} /> : <Mic size={18} />}
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
                    {isTalking ? <Volume2 size={18} /> : <VolumeOff size={18} />}
                </span>
                <div className="text-sm">receiving</div>
            </div>
        </div>
    );
}

export default BabyStatusPanel;