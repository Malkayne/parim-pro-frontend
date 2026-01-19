import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { useToast } from 'src/components/ui/toast';
import { Icon } from '@iconify/react';
import {
    calculatePayments,
    getEventPayments,
    approvePayment,
    markAsPaid,
} from './paymentsApi';

type PaymentsViewProps = {
    eventId: string;
};

export function PaymentsView({ eventId }: PaymentsViewProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('all');

    const { data: payments, isLoading } = useQuery({
        queryKey: ['event-payments', eventId],
        queryFn: () => getEventPayments(eventId),
    });

    const calculateMutation = useMutation({
        mutationFn: () => calculatePayments(eventId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['event-payments', eventId] });
            toast({
                title: 'Payments Calculated',
                description: `Generated ${data.data.generatedCount} new payment records. Total: ${data.data.totalAmount}`,
                variant: 'success'
            });
        },
        onError: (err) => {
            toast({
                title: 'Calculation failed',
                description: err instanceof Error ? err.message : 'Unknown error',
                variant: 'error'
            });
        },
    });

    const approveMutation = useMutation({
        mutationFn: (paymentId: string) => approvePayment(paymentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-payments', eventId] });
            toast({ title: 'Payment approved', variant: 'success' });
        },
    });

    const payMutation = useMutation({
        mutationFn: (paymentId: string) => markAsPaid(paymentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-payments', eventId] });
            toast({ title: 'Payment marked as paid', variant: 'success' });
        },
    });

    const filteredPayments = payments?.filter(p => filter === 'all' || p.status === filter) || [];

    const stats = {
        total: (payments ?? []).reduce((acc, p) => acc + parseFloat(p.amount), 0),
        paid: (payments ?? []).filter(p => p.status === 'paid').reduce((acc, p) => acc + parseFloat(p.amount), 0),
        pending: (payments ?? []).filter(p => p.status !== 'paid').reduce((acc, p) => acc + parseFloat(p.amount), 0),
    };

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="text-xs font-semibold uppercase text-muted-foreground">Total Payout</div>
                    <div className="mt-1 text-2xl font-bold">₦{stats.total.toLocaleString()}</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="text-xs font-semibold uppercase text-muted-foreground text-success">Total Paid</div>
                    <div className="mt-1 text-2xl font-bold">₦{stats.paid.toLocaleString()}</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="text-xs font-semibold uppercase text-muted-foreground text-warning">Remaining</div>
                    <div className="mt-1 text-2xl font-bold">₦{stats.pending.toLocaleString()}</div>
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <select
                        className="h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All States</option>
                        <option value="calculated">Calculated</option>
                        <option value="approved">Approved</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
                <Button
                    onClick={() => calculateMutation.mutate()}
                    disabled={calculateMutation.isPending}
                    className="gap-2"
                >
                    <Icon icon="solar:calculator-linear" width={18} />
                    {calculateMutation.isPending ? 'Calculating...' : 'Calculate Payments'}
                </Button>
            </div>

            {/* Payments Table */}
            <div className="rounded-xl border border-border bg-card">
                {isLoading ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">Loading payments...</div>
                ) : filteredPayments.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">No payment records found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-muted text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Recipient</th>
                                    <th className="px-4 py-3 font-medium">Role</th>
                                    <th className="px-4 py-3 font-medium">Amount</th>
                                    <th className="px-4 py-3 font-medium">Bank Details</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredPayments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{payment.staffName}</div>
                                            <div className="text-[10px] text-muted-foreground font-mono uppercase">{payment._id.slice(-6)}</div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{payment.role}</td>
                                        <td className="px-4 py-3 font-semibold">₦{parseFloat(payment.amount).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            {payment.bankDetails ? (
                                                <div className="text-xs">
                                                    <div>{payment.bankDetails.bankName}</div>
                                                    <div className="text-muted-foreground font-mono">{payment.bankDetails.accountNumber}</div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-error italic">No bank setup</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={
                                                payment.status === 'paid' ? 'success' :
                                                    payment.status === 'approved' ? 'default' :
                                                        payment.status === 'calculated' ? 'gray' : 'warning'
                                            }>
                                                {payment.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                {payment.status === 'calculated' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => approveMutation.mutate(payment._id)}
                                                        disabled={approveMutation.isPending}
                                                    >
                                                        Approve
                                                    </Button>
                                                )}
                                                {payment.status === 'approved' && (
                                                    <Button
                                                        size="sm"
                                                        variant="default" // Emphasize payment action
                                                        onClick={() => payMutation.mutate(payment._id)}
                                                        disabled={payMutation.isPending}
                                                    >
                                                        Mark Paid
                                                    </Button>
                                                )}
                                                {payment.status === 'paid' && (
                                                    <Icon icon="solar:check-circle-bold" className="text-success" width={20} />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function parseFloat(val: any): number {
    return Number(val) || 0;
}
