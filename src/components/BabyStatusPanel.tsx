import { Camera, CameraOff, Mic, MicOff, User, UserPlus, UserX, Volume2, VolumeOff, X } from 'lucide-react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useRef } from 'react';
import type { ParentState } from '../services/models';

type Props = { parents: ParentState[], isLive: boolean, isPolling: boolean, onDisconnect: (p: string) => void };

function BabyStatusPanel({ parents, isLive, isPolling, onDisconnect }: Props) {
    const opRef = useRef<OverlayPanel>(null);
    const isTalking = parents.some(p => p.talking);

    return (
        <div className="w-full flex justify-between px-2">
            <div className="flex flex-col items-center gap-0.5">
                <span className="flex gap-2 justify-center items-center">
                    {
                        isLive
                            ? <><Camera size={18} /> {isTalking ? <MicOff size={18} /> : <Mic size={18} />}</>
                            : <><CameraOff size={18} /> <MicOff size={18} /></>
                    }
                </span>
                <div className="text-sm">sending</div>
            </div>

            {
                isLive &&
                <div className="flex flex-col items-center gap-0.5 cursor-pointer" onClick={e => opRef.current?.toggle(e)}>
                    <span className="flex gap-0.5 justify-center items-center">
                        {parents.map(p => <User key={p.parentID} size={18} className={p.talking ? 'text-yellow-400' : undefined} />)}
                        {
                            isPolling
                                ? <UserPlus size={18} className="animate-[fade_0.66s_ease-in-out_infinite] text-green-400" />
                                : parents.length === 0 && <UserX size={18} className="text-red-500" />
                        }
                    </span>
                    <div className="text-sm">parents ({parents.length}{isPolling && '+'})</div>
                    <OverlayPanel ref={opRef} showCloseIcon closeOnEscape dismissable pt={{ content: { style: { padding: '0.4rem' } } }}>
                        <DataTable size="small" value={parents} key="parentID" emptyMessage={isPolling ? 'No Parent(s) Connected' : 'Polling Stopped'}>
                            <Column field="parentID" body={(p: ParentState) =>
                                <span className="flex gap-1 items-center font-medium font-mono">
                                    <User size={28} className={p.talking ? 'text-yellow-600' : undefined} /> {p.parentID}
                                </span>
                            } />
                            <Column body={(p: ParentState) => <Button size="small" className="p-2!" onClick={e => {
                                e.stopPropagation();
                                onDisconnect(p.parentID);
                            }}><X size={18} /></Button>} />
                        </DataTable>
                    </OverlayPanel>
                </div>
            }

            <div className="flex flex-col items-center gap-0.5">
                <span className="flex gap-2 justify-center items-center">
                    {isLive && isTalking ? <Volume2 size={18} /> : <VolumeOff size={18} />}
                </span>
                <div className="text-sm">receiving</div>
            </div>
        </div>
    );
}

export default BabyStatusPanel;