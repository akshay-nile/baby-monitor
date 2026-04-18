import { Fullscreen, Mic, MicOff, Video, VideoOff, Volume2, VolumeOff } from 'lucide-react';

type Props = { isLive: boolean, isMuted: boolean, onFullscreen: () => void };

function ParentStatusPanel({ isLive, isMuted, onFullscreen }: Props) {
    return (
        <div className="w-full flex justify-between items-center px-2">
            <div className="flex flex-col">
                <span className="flex gap-2 justify-center items-center">
                    {isMuted ? <Mic size={18} /> : <MicOff size={18} />}
                </span>
                <div className="text-sm">sending</div>
            </div>

            {
                isLive &&
                <Fullscreen size={34} className="text-white cursor-pointer" onClick={onFullscreen}>
                    <title>Fullscreen</title>
                </Fullscreen>
            }

            <div className="flex flex-col">
                {
                    isLive
                        ? <span className="flex gap-2 justify-center items-center">
                            <Video size={18} />
                            {isMuted ? <VolumeOff size={18} /> : <Volume2 size={18} />}
                        </span>
                        : <span className="flex gap-2 justify-center items-center">
                            <VideoOff size={18} />
                            <VolumeOff size={18} />
                        </span>
                }
                <div className="text-sm">receiving</div>
            </div>
        </div>
    );
}

export default ParentStatusPanel;