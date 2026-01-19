import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs';
import { useToast } from 'src/components/ui/toast';
import {
    generateQR,
    getActiveQR,
    deleteQR,
    getLiveAttendance,
    getAttendanceDetails,
    overrideAttendance,
    type AttendanceRecord,
} from './attendanceApi';

type AttendanceViewProps = {
    eventId: string;
};

export function AttendanceView({ eventId }: AttendanceViewProps) {
    const [tab, setTab] = useState('summary');

    return (
        <div className="space-y-4">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
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
        <div className="grid gap-4 md:grid-cols-2">
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

            {/* Live Stats Section */}
            <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-4 font-semibold">Live Activity</h3>
                <div className="mb-6">
                    <div className="text-3xl font-bold">{liveData?.totalCheckedIn ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Currently checked in</div>
                </div>

                <div>
                    <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">Recent Check-ins</h4>
                    <div className="space-y-3">
                        {liveData?.recentCheckIns?.length ? (
                            liveData.recentCheckIns.map((checkIn) => (
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
    );
}

function DetailedListTab({ eventId }: { eventId: string }) {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<string>('all');
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
        },
        onError: (err) => {
            toast({
                title: 'Update failed',
                description: err instanceof Error ? err.message : undefined,
                variant: 'error',
            });
        },
    });

    const handleAction = (attendanceId: string, action: string, newStatus?: string) => {
        // Ideally this would open a dialog to input reason. For MVP using prompt.
        // In a real app we'd build an <OverrideDialog>
        const reason = prompt('Please enter a reason for this manual override:');
        if (!reason) return;

        overrideMutation.mutate({
            attendanceId,
            action,
            reason,
            newStatus,
        });
    };

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
                                <th className="px-4 py-3 font-medium">Participant</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Check-In</th>
                                <th className="px-4 py-3 font-medium">Check-Out</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data?.data?.attendances?.map((record: AttendanceRecord) => (
                                <tr key={record.attendanceId} className="hover:bg-muted/50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{record.staff?.fullName ?? 'Unknown'}</div>
                                        <div className="text-xs text-muted-foreground">{record.staff?.email ?? 'No email'}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={
                                            record.status === 'ACTIVE' ? 'success' :
                                                record.status === 'COMPLETED' ? 'default' :
                                                    record.status === 'ABSENT' ? 'error' : 'gray'
                                        }>
                                            {record.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleString() : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {record.checkOut?.time ? new Date(record.checkOut.time).toLocaleString() : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Contextual actions based on status */}
                                            {record.status !== 'ACTIVE' && record.status !== 'COMPLETED' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAction(record.attendanceId, 'CHECK_IN_OVERRIDE')}
                                                >
                                                    Check In
                                                </Button>
                                            )}
                                            {record.status === 'ACTIVE' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAction(record.attendanceId, 'CHECK_OUT_OVERRIDE')}
                                                >
                                                    Check Out
                                                </Button>
                                            )}
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
                    Page {data?.pagination?.page ?? page} of {data?.pagination?.pages ?? 1} • Total{' '}
                    {data?.pagination?.total ?? 0}
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
                        disabled={Boolean(data?.pagination?.pages && page >= data.pagination.pages) || isLoading}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
