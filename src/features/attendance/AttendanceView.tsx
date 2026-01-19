import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs';
import { useToast } from 'src/components/ui/toast';
import { cn } from 'src/shared/utils/cn';
import {
    generateQR,
    getActiveQR,
    deleteQR,
    getLiveAttendance,
    getAttendanceDetails,
    overrideAttendance,
    type AttendanceRecord,
} from './attendanceApi';
import { OverrideDialog } from './OverrideDialog';
import { OverrideHistoryDialog } from './OverrideHistoryDialog';
import { exportAttendanceCSV, exportAttendancePDF } from 'src/features/reports/reportsApi';

type AttendanceViewProps = {
    eventId: string;
};

export function AttendanceView({ eventId }: AttendanceViewProps) {
    const [tab, setTab] = useState('summary');

    return (
        <div className="space-y-4">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="summary">Live & QR</TabsTrigger>
                    <TabsTrigger value="details">Detailed List</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4 pt-4">
                    <LiveAndQRTab eventId={eventId} />
                </TabsContent>

                <TabsContent value="details" className="space-y-4 pt-4">
                    <DetailedListTab eventId={eventId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function LiveAndQRTab({ eventId }: { eventId: string }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: qrData, isLoading: qrLoading } = useQuery({
        queryKey: ['attendance-qr', eventId],
        queryFn: () => getActiveQR(eventId),
        retry: false,
    });

    const { data: liveData } = useQuery({
        queryKey: ['attendance-live', eventId],
        queryFn: () => getLiveAttendance(eventId),
        refetchInterval: 10000, // Refresh every 10s
    });

    const generateMutation = useMutation({
        mutationFn: () => generateQR(eventId, 120), // 2 hours default
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance-qr', eventId] });
            toast({ title: 'QR Code generated', variant: 'success' });
        },
        onError: (err) => {
            toast({
                title: 'Failed to generate QR',
                description: err instanceof Error ? err.message : undefined,
                variant: 'error',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteQR(String(qrData?.qrId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance-qr', eventId] });
            toast({ title: 'QR Code deleted', variant: 'success' });
        },
    });

    return (
        <div className="space-y-6">
            {/* Stats Overview Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
                <StatCard label="Approved" value={liveData?.summary?.totalApproved} color="text-primary" />
                <StatCard label="Assigned" value={liveData?.summary?.assigned} color="text-gray-500" />
                <StatCard label="Checked In" value={liveData?.summary?.checkedIn} color="text-warning" />
                <StatCard label="Active" value={liveData?.summary?.active} color="text-success" />
                <StatCard label="Completed" value={liveData?.summary?.completed} color="text-primary" />
                <StatCard label="Absent" value={liveData?.summary?.absent} color="text-error" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* QR Code Section */}
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold">Check-in QR Code</h3>
                        {qrData && !qrData.isExpired ? (
                            <Badge variant="success">Active</Badge>
                        ) : qrData?.isExpired ? (
                            <Badge variant="error">Expired</Badge>
                        ) : null}
                    </div>

                    {qrLoading ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">Loading QR Status...</div>
                    ) : qrData && !qrData.isExpired ? (
                        <div className="flex flex-col items-center">
                            <img src={qrData.qrImage} alt="Event QR Code" className="h-48 w-48 rounded-lg border border-border" />
                            <div className="mt-4 text-center text-sm text-muted-foreground">
                                <p>Expires in {qrData.remainingMinutes} minutes</p>
                                <p className="text-xs">Scan using the staff app to check-in/out</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 text-error border-error hover:bg-error/10 hover:text-error"
                                onClick={() => deleteMutation.mutate()}
                                disabled={deleteMutation.isPending}
                            >
                                Invalidate QR Code
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-8">
                            <div className="text-sm text-muted-foreground">No active QR code for this event.</div>
                            <Button
                                className="mt-4"
                                onClick={() => generateMutation.mutate()}
                                disabled={generateMutation.isPending}
                            >
                                Generate New QR Code
                            </Button>
                        </div>
                    )}
                </div>

                {/* Performance Section */}
                <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="mb-4 font-semibold">Live Performance</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="rounded-lg bg-muted/50 p-3">
                            <div className="text-xs text-muted-foreground uppercase font-medium">Attendance Rate</div>
                            <div className="text-2xl font-bold">{liveData?.percentages?.attendance ?? 0}%</div>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3">
                            <div className="text-xs text-muted-foreground uppercase font-medium">Completion Rate</div>
                            <div className="text-2xl font-bold">{liveData?.percentages?.completion ?? 0}%</div>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">Recent Activity</h4>
                        <div className="space-y-3">
                            {liveData?.recentCheckIns?.length ? (
                                liveData.recentCheckIns.slice(0, 5).map((checkIn) => (
                                    <div key={checkIn.attendanceId} className="flex items-center justify-between text-sm">
                                        <div>
                                            <div className="font-medium">{checkIn.staff.fullName}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(checkIn.checkInTime).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <Badge variant="gray">{checkIn.status}</Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-muted-foreground">No recent activity.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value?: number; color: string }) {
    return (
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">{label}</div>
            <div className={cn("text-lg font-bold", color)}>{value ?? 0}</div>
        </div>
    );
}


function DetailedListTab({ eventId }: { eventId: string }) {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<string>('all');
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [overrideOpen, setOverrideOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['attendance-details', eventId, page, status],
        queryFn: () => getAttendanceDetails(eventId, { status: status === 'all' ? undefined : status, page }),
    });

    const overrideMutation = useMutation({
        mutationFn: (input: { attendanceId: string; action: any; reason: string; newStatus?: string }) =>
            overrideAttendance(input.attendanceId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance-details', eventId] });
            queryClient.invalidateQueries({ queryKey: ['attendance-live', eventId] });
            toast({ title: 'Attendance updated', variant: 'success' });
            setOverrideOpen(false);
        },
        onError: (err) => {
            toast({
                title: 'Update failed',
                description: err instanceof Error ? err.message : undefined,
                variant: 'error',
            });
        },
    });

    return (
        <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-semibold">All Records</h3>
                <select
                    className="h-9 rounded-md border border-border bg-background px-3 py-1 text-sm"
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="all">All Status</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="ACTIVE">Active (Checked In)</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ABSENT">Absent</option>
                </select>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-9 px-3 gap-1"
                        onClick={() => exportAttendanceCSV(eventId)}
                    >
                        Export <span className="font-bold">CSV</span>
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-9 px-3 gap-1"
                        onClick={() => exportAttendancePDF(eventId)}
                    >
                        Export <span className="font-bold text-error">PDF</span>
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Loading records...</div>
            ) : (data?.data?.attendances?.length ?? 0) === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No attendance records found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-muted text-xs text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium text-nowrap">Participant</th>
                                <th className="px-4 py-3 font-medium text-nowrap">Status & Notes</th>
                                <th className="px-4 py-3 font-medium text-nowrap">Duration</th>
                                <th className="px-4 py-3 font-medium text-nowrap">Check-In/Out</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data?.data?.attendances?.map((record: AttendanceRecord) => (
                                <tr key={record.attendanceId} className="hover:bg-muted/50">
                                    <td className="px-4 py-3 text-nowrap">
                                        <div className="font-medium text-base">{record.staff?.fullName ?? 'Unknown'}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{record.staff?.mail || record.staff?.email || 'No email'}</div>
                                        <div className="text-xs text-muted-foreground">{record.role}</div>
                                    </td>
                                    <td className="px-4 py-3 text-nowrap max-w-[200px]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant={
                                                record.status === 'ACTIVE' ? 'success' :
                                                    record.status === 'COMPLETED' ? 'default' :
                                                        record.status === 'ABSENT' ? 'error' : 'gray'
                                            }>
                                                {record.status}
                                            </Badge>
                                            {record.overridden && (
                                                <Badge variant="warning" className="text-[10px] px-1 py-0 h-4">OVERRIDDEN</Badge>
                                            )}
                                        </div>
                                        {record.notes && (
                                            <div className="text-[11px] text-muted-foreground line-clamp-2 italic" title={record.notes}>
                                                "{record.notes}"
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground font-medium uppercase text-xs text-nowrap">
                                        {record.duration || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs text-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div>In: {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleString() : '—'}</div>
                                            <div>Out: {record.checkOut?.time ? new Date(record.checkOut.time).toLocaleString() : '—'}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-nowrap">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 px-2"
                                                onClick={() => {
                                                    setSelectedRecord(record);
                                                    setHistoryOpen(true);
                                                }}
                                                title="View History"
                                            >
                                                History
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 px-2"
                                                onClick={() => {
                                                    setSelectedRecord(record);
                                                    setOverrideOpen(true);
                                                }}
                                            >
                                                Override
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <div className="text-xs text-muted-foreground">
                    Page {data?.data?.pagination?.page ?? page} of {data?.data?.pagination?.pages ?? 1} • Total{' '}
                    {data?.data?.pagination?.total ?? 0}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={page <= 1 || isLoading}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Prev
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={Boolean(data?.data?.pagination?.pages && page >= data.data.pagination.pages) || isLoading}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <OverrideDialog
                open={overrideOpen}
                record={selectedRecord}
                submitting={overrideMutation.isPending}
                onClose={() => {
                    setOverrideOpen(false);
                    setSelectedRecord(null);
                }}
                onSubmit={(input: any) => overrideMutation.mutate({ ...input, attendanceId: String(selectedRecord?.attendanceId) })}
            />

            <OverrideHistoryDialog
                open={historyOpen}
                attendanceId={selectedRecord?.attendanceId || null}
                staffName={selectedRecord?.staff?.fullName}
                onClose={() => {
                    setHistoryOpen(false);
                    setSelectedRecord(null);
                }}
            />
        </div>
    );
}
