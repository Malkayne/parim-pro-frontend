import { useQuery } from '@tanstack/react-query';
import { getOverrideHistory } from './attendanceApi';

type Props = {
    open: boolean;
    attendanceId: string | null;
    staffName?: string;
    onClose: () => void;
};

export function OverrideHistoryDialog({ open, attendanceId, staffName, onClose }: Props) {
    const { data: overrides, isLoading } = useQuery({
        queryKey: ['attendance-overrides', attendanceId],
        queryFn: () => getOverrideHistory(attendanceId!),
        enabled: open && Boolean(attendanceId),
    });

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                        <div className="text-sm font-semibold">Override History</div>
                        <div className="text-xs text-muted-foreground">{staffName}</div>
                    </div>

                    <button
                        type="button"
                        className="rounded-md border border-border bg-transparent px-3 py-1.5 text-xs hover:bg-muted"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">Loading history...</div>
                    ) : (overrides?.length ?? 0) === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">No override history found.</div>
                    ) : (
                        <div className="space-y-4">
                            {overrides?.map((item) => (
                                <div key={item.overrideId} className="rounded-lg border border-border p-3 bg-muted/30">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-xs font-bold uppercase tracking-wider text-primary">
                                            {item.action.replace(/_/g, ' ')}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground bg-background border border-border px-2 py-0.5 rounded-full">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="text-sm border-l-2 border-primary/20 pl-3 mb-4">
                                        <span className="font-semibold text-[10px] uppercase text-muted-foreground">Reason:</span>
                                        <p className="mt-0.5 italic text-card-foreground">"{item.reason}"</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-tight text-center">Before</div>
                                            <StateView data={item.before} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-primary mb-1.5 uppercase tracking-tight text-center">After</div>
                                            <StateView data={item.after} isNew />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StateView({ data, isNew }: { data: any; isNew?: boolean }) {
    if (!data) return <div className="text-[10px] text-muted-foreground italic p-3 text-center border border-dashed rounded-lg font-medium">No data found</div>;

    const items = [
        { label: 'Status', value: data.status, isBadge: true },
        { label: 'Check-In', value: data.checkIn?.time ? new Date(data.checkIn.time).toLocaleString() : '—' },
        { label: 'Check-Out', value: data.checkOut?.time ? new Date(data.checkOut.time).toLocaleString() : '—' },
        { label: 'Method (In/Out)', value: `${data.checkIn?.method || '—'} / ${data.checkOut?.method || '—'}` },
    ];

    return (
        <div className={`rounded-lg border shadow-sm ${isNew ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/50'} p-2.5 space-y-2.5`}>
            {items.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-70 tracking-tighter">{item.label}</span>
                    {item.isBadge ? (
                        <div className={`text-[10px] font-extrabold ${isNew ? 'text-primary' : 'text-foreground'}`}>
                            {item.value || '—'}
                        </div>
                    ) : (
                        <div className="text-[10px] font-medium text-card-foreground">
                            {item.value}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
