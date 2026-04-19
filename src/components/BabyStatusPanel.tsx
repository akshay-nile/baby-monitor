import { Ban, Camera, CameraOff, Mic, MicOff, User, Users, Volume2, VolumeOff } from 'lucide-react';

type Props = { parentsCount: number, isLive: boolean, isPolling: boolean, isMuted: boolean };

function BabyStatusPanel({ parentsCount, isLive, isPolling, isMuted }: Props) {
    return (
        <div className="w-full flex justify-between px-2">
            <div className="flex flex-col">
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

            <div className="flex flex-col">
                {
                    (isPolling || parentsCount > 0)
                        ? <span className="flex gap-2 justify-center items-center">
                            {parentsCount > 1 ? <Users size={18} /> : <User size={18} />}
                            <span className="text-sm font-bold tracking-widest">
                                {parentsCount}{isPolling && '+'}
                            </span>
                        </span>
                        : <span className="flex gap-2 justify-center items-center">
                            <Ban size={18} />
                        </span>
                }
                <div className="text-sm">connections</div>
            </div>

            <div className="flex flex-col">
                <span className="flex gap-2 justify-center items-center">
                    {isMuted ? <VolumeOff size={18} /> : <Volume2 size={18} />}
                </span>
                <div className="text-sm">receiving</div>
            </div>
        </div>
    );
}

export default BabyStatusPanel;