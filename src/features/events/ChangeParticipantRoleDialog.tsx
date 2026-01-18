import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { EventRole, Participant } from './eventsApi';
import { cn } from '../../shared/utils/cn';

const schema = z.object({
    roleId: z.string().min(1, 'Please select a role'),
});

type FormValues = z.infer<typeof schema>;

type Props = {
    open: boolean;
    participant: Participant | null;
    roles: EventRole[];
    submitting?: boolean;
    onClose: () => void;
    onSubmit: (participantId: string, roleId: string) => Promise<void> | void;
};

export function ChangeParticipantRoleDialog({ open, participant, roles, submitting, onClose, onSubmit }: Props) {
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            roleId: participant?.role._id ?? '',
        },
    });

    if (!open || !participant) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                        <div className="text-sm font-semibold">Change Role</div>
                        <div className="text-xs text-muted-foreground">For {participant.user.fullName}</div>
                    </div>
                    <button
                        type="button"
                        className="rounded-md border border-border bg-transparent px-3 py-1.5 text-xs hover:bg-muted"
                        onClick={() => {
                            setServerError(null);
                            reset();
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
                            await onSubmit(participant._id, values.roleId);
                            onClose();
                        } catch (err) {
                            setServerError(err instanceof Error ? err.message : 'Failed to change role');
                        }
                    })}
                >
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground">New Role</label>
                        <select
                            {...register('roleId')}
                            className={cn(
                                'mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring',
                                errors.roleId && 'border-error focus:ring-error'
                            )}
                        >
                            <option value="">Select a role</option>
                            {roles.map((r) => (
                                <option key={r._id} value={r._id}>
                                    {r.roleName} — {r.price > 0 ? `₦${r.price}` : 'Free'}
                                </option>
                            ))}
                        </select>
                        {errors.roleId?.message && <span className="text-xs text-error">{errors.roleId.message}</span>}
                    </div>

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
                                reset();
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
                            {submitting ? 'Updating…' : 'Update Role'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
