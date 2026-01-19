import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ReactNode } from 'react';

import { cn } from '../../shared/utils/cn';
import type { AttendanceRecord, OverrideAction } from './attendanceApi';

const schema = z.object({
    action: z.enum(['CHECK_IN_OVERRIDE', 'CHECK_OUT_OVERRIDE', 'MARK_ABSENT', 'STATUS_CHANGE']),
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    newStatus: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
    open: boolean;
    record: AttendanceRecord | null;
    submitting?: boolean;
    onClose: () => void;
    onSubmit: (input: {
        action: OverrideAction;
        reason: string;
        checkInTime?: string;
        checkOutTime?: string;
        newStatus?: string;
    }) => Promise<void> | void;
};

export function OverrideDialog({ open, record, submitting, onClose, onSubmit }: Props) {
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            action: 'CHECK_IN_OVERRIDE',
            reason: '',
            checkInTime: '',
            checkOutTime: '',
            newStatus: '',
        },
    });

    const selectedAction = watch('action');

    useEffect(() => {
        if (open && record) {
            // Suggest action based on current status
            let suggestedAction: OverrideAction = 'CHECK_IN_OVERRIDE';
            if (record.status === 'ACTIVE') suggestedAction = 'CHECK_OUT_OVERRIDE';
            else if (record.status === 'COMPLETED') suggestedAction = 'STATUS_CHANGE';

            reset({
                action: suggestedAction,
                reason: '',
                checkInTime: record.checkIn?.time ? new Date(record.checkIn.time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                checkOutTime: record.checkOut?.time ? new Date(record.checkOut.time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                newStatus: record.status,
            });
        }
    }, [open, record, reset]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                        <div className="text-sm font-semibold">Manual Attendance Override</div>
                        <div className="text-xs text-muted-foreground">{record?.staff?.fullName}</div>
                    </div>

                    <button
                        type="button"
                        className="rounded-md border border-border bg-transparent px-3 py-1.5 text-xs hover:bg-muted"
                        onClick={() => {
                            setServerError(null);
                            onClose();
                        }}
                    >
                        Close
                    </button>
                </div>

                <form
                    className="space-y-4 p-4"
                    onSubmit={handleSubmit(async (values) => {
                        setServerError(null);
                        try {
                            const payload: any = {
                                action: values.action,
                                reason: values.reason,
                            };
                            if (values.action === 'CHECK_IN_OVERRIDE') payload.checkInTime = values.checkInTime;
                            if (values.action === 'CHECK_OUT_OVERRIDE') payload.checkOutTime = values.checkOutTime;
                            if (values.action === 'STATUS_CHANGE') payload.newStatus = values.newStatus;

                            await onSubmit(payload);
                            onClose();
                        } catch (err) {
                            setServerError(err instanceof Error ? err.message : 'Failed to override attendance');
                        }
                    })}
                >
                    <Field label="Action" error={errors.action?.message}>
                        <select
                            {...register('action')}
                            className={inputClass(errors.action?.message)}
                        >
                            <option value="CHECK_IN_OVERRIDE">Manual Check-In</option>
                            <option value="CHECK_OUT_OVERRIDE">Manual Check-Out</option>
                            <option value="MARK_ABSENT">Mark as Absent</option>
                            <option value="STATUS_CHANGE">Direct Status Change</option>
                        </select>
                    </Field>

                    {selectedAction === 'CHECK_IN_OVERRIDE' && (
                        <Field label="Check-In Time" error={errors.checkInTime?.message}>
                            <input
                                {...register('checkInTime')}
                                type="datetime-local"
                                className={inputClass(errors.checkInTime?.message)}
                            />
                        </Field>
                    )}

                    {selectedAction === 'CHECK_OUT_OVERRIDE' && (
                        <Field label="Check-Out Time" error={errors.checkOutTime?.message}>
                            <input
                                {...register('checkOutTime')}
                                type="datetime-local"
                                className={inputClass(errors.checkOutTime?.message)}
                            />
                        </Field>
                    )}

                    {selectedAction === 'STATUS_CHANGE' && (
                        <Field label="New Status" error={errors.newStatus?.message}>
                            <select
                                {...register('newStatus')}
                                className={inputClass(errors.newStatus?.message)}
                            >
                                <option value="ASSIGNED">Assigned</option>
                                <option value="ACTIVE">Active (Checked In)</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ABSENT">Absent</option>
                            </select>
                        </Field>
                    )}

                    <Field label="Reason for Override" error={errors.reason?.message}>
                        <textarea
                            {...register('reason')}
                            className={cn(inputClass(errors.reason?.message), 'min-h-20')}
                            placeholder="e.g. Staff forgot to scan, scanner malfunctioned..."
                        />
                    </Field>

                    {serverError ? (
                        <div className="rounded-md border border-error bg-lighterror px-3 py-2 text-sm text-error">
                            {serverError}
                        </div>
                    ) : null}

                    <div className="flex justify-end gap-2 border-t border-border pt-4">
                        <button
                            type="button"
                            className="rounded-md border border-border bg-transparent px-3 py-2 text-sm hover:bg-muted"
                            onClick={() => {
                                setServerError(null);
                                onClose();
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={Boolean(submitting)}
                            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
                        >
                            {submitting ? 'Applying…' : 'Apply Override'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function inputClass(error?: string) {
    return cn(
        'mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring',
        error && 'border-error focus:ring-error'
    );
}

function Field({
    label,
    error,
    className,
    children,
}: {
    label: string;
    error?: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={className}>
            <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-muted-foreground">{label}</label>
                {error ? <span className="text-xs text-error">{error}</span> : null}
            </div>
            {children}
        </div>
    );
}
