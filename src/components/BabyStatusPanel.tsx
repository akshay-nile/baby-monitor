import { Camera, CameraOff, CirclePlus, CircleX, Mic, MicOff, User, Volume2, VolumeOff } from 'lucide-react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useRef } from 'react';
import type { ParentState } from '../services/models';

type Props = { parents: ParentState[], isLive: boolean, isPolling: boolean, onDisconnect: (p: string) => void };

function BabyStatusPanel({ parents, isLive, isPolling, onDisconnect }: Props) {
    const opRef = useRef<OverlayPanel>(null);

    return (
        <div className="w-full flex justify-between px-2">
            <div className="flex flex-col items-center gap-0.5">
                {
                    isLive
                        ? <span className="flex gap-2 justify-center items-center">
                            <Camera size={18} />
                            {parents.some(p => p.talking) ? <MicOff size={18} /> : <Mic size={18} />}
                        </span>
                        : <span className="flex gap-2 justify-center items-center">
                            <CameraOff size={18} />
                            <MicOff size={18} />
                        </span>
                }
                <div className="text-sm">sending</div>
            </div>

            <div className="flex flex-col items-center gap-0.5 cursor-pointer" onClick={e => opRef.current?.toggle(e)}>
                <span className="flex gap-0.5 justify-center items-center">
                    {
                        parents.length > 0
                            ? parents.map(p => <User key={p.parentID} size={18} className={p.talking ? 'text-yellow-400' : undefined} />)
                            : isPolling ? <CirclePlus size={18} /> : <CircleX size={18} />
                    }
                </span>
                <div className="text-sm">parents ({parents.length}{isPolling && '+'})</div>
                <OverlayPanel ref={opRef} showCloseIcon closeOnEscape dismissable={false} pt={{ content: { style: { padding: '0.4rem' } } }}>
                    <DataTable size="small" value={parents} key="parentID" emptyMessage={isPolling ? 'No Parent(s) Connected' : 'Polling Stopped'}>
                        <Column field="parentID" body={(p: ParentState) =>
                            <span className="flex gap-1 items-center font-medium font-mono">
                                <User size={28} className={p.talking ? 'text-yellow-600' : undefined} /> {p.parentID}
                            </span>
                        } />
                        <Column body={(p: ParentState) => <Button label="Disconnect" size="small" onClick={e => {
                            e.stopPropagation();
                            onDisconnect(p.parentID);
                        }} />} />
                    </DataTable>
                </OverlayPanel>
            </div>

            <div className="flex flex-col items-center gap-0.5">
                <span className="flex gap-2 justify-center items-center">
                    {parents.some(p => p.talking) ? <Volume2 size={18} /> : <VolumeOff size={18} />}
                </span>
                <div className="text-sm">receiving</div>
            </div>
        </div>
    );
}

export default BabyStatusPanel;