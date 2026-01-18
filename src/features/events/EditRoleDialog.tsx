import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ReactNode } from 'react';

import type { EventRole } from './eventsApi';
import { cn } from '../../shared/utils/cn';

const schema = z.object({
    roleName: z.string().min(1, 'Role name is required'),
    roleDescription: z.string().optional(),
    price: z.number().min(0, 'Price must be 0 or greater'),
    capacity: z.number().int().min(1, 'Capacity must be at least 1'),
    duration: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
    open: boolean;
    role: EventRole | null;
    submitting?: boolean;
    onClose: () => void;
    onSubmit: (input: {
        roleName: string;
        price: number;
        capacity: number;
        duration?: string;
        roleDescription?: string;
    }) => Promise<void> | void;
};

export function EditRoleDialog({ open, role, submitting, onClose, onSubmit }: Props) {
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            roleName: '',
            roleDescription: '',
            price: 0,
            capacity: 10,
            duration: '',
        },
    });

    useEffect(() => {
        if (open && role) {
            reset({
                roleName: role.roleName,
                roleDescription: role.roleDescription ?? '',
                price: role.price,
                capacity: role.capacity,
                duration: role.duration ?? '',
            });
        }
    }, [open, role, reset]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                        <div className="text-sm font-semibold">Edit Role</div>
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
                            await onSubmit({
                                roleName: values.roleName,
                                price: values.price,
                                capacity: values.capacity,
                                duration: values.duration || undefined,
                                roleDescription: values.roleDescription || undefined,
                            });
                            onClose();
                        } catch (err) {
                            setServerError(err instanceof Error ? err.message : 'Failed to update role');
                        }
                    })}
                >
                    <Field label="Role Name" error={errors.roleName?.message}>
                        <input
                            {...register('roleName')}
                            className={inputClass(errors.roleName?.message)}
                            placeholder="e.g. VIP, Regular"
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Price (₦)" error={errors.price?.message}>
                            <input
                                {...register('price', { valueAsNumber: true })}
                                type="number"
                                className={inputClass(errors.price?.message)}
                                placeholder="0"
                            />
                        </Field>

                        <Field label="Capacity" error={errors.capacity?.message}>
                            <input
                                {...register('capacity', { valueAsNumber: true })}
                                type="number"
                                className={inputClass(errors.capacity?.message)}
                                placeholder="10"
                            />
                        </Field>
                    </div>

                    <Field label="Duration" error={errors.duration?.message}>
                        <input
                            {...register('duration')}
                            className={inputClass(errors.duration?.message)}
                            placeholder="e.g. 2 hours"
                        />
                    </Field>

                    <Field label="Description" error={errors.roleDescription?.message}>
                        <textarea
                            {...register('roleDescription')}
                            className={cn(inputClass(errors.roleDescription?.message), 'min-h-20')}
                            placeholder="Role details..."
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

function inputClass(error?: string) {
    return cn(
        'mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring',
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
