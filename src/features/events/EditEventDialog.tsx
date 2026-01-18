import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ReactNode } from 'react';

import type { CreateEventInput, Event } from './eventsApi';
import { cn } from '../../shared/utils/cn';

const schema = z.object({
    title: z.string().min(1, 'Title is required'),
    shortDescription: z.string().min(1, 'Short description is required'),
    longDescription: z.string().min(1, 'Long description is required'),
    bannerImage: z.string().optional(),
    venue: z.string().min(1, 'Venue is required'),
    address: z.string().min(1, 'Address is required'),
    state: z.string().min(1, 'State is required'),
    start: z.string().min(1, 'Start date/time is required'),
    end: z.string().min(1, 'End date/time is required'),
});

type FormValues = z.infer<typeof schema>;

type Props = {
    open: boolean;
    event: Event;
    submitting?: boolean;
    onClose: () => void;
    onSubmit: (input: Partial<CreateEventInput>) => Promise<void> | void;
};

export function EditEventDialog({ open, event, submitting, onClose, onSubmit }: Props) {
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: event.title,
            shortDescription: event.shortDescription ?? '',
            longDescription: event.longDescription ?? '',
            bannerImage: event.bannerImage ?? '',
            venue: event.location.venue,
            address: event.location.address,
            state: event.location.state,
            start: event.eventDate.start.slice(0, 16), // Format for datetime-local
            end: event.eventDate.end.slice(0, 16),
        },
    });

    // Reset form when event changes
    useEffect(() => {
        if (open) {
            reset({
                title: event.title,
                shortDescription: event.shortDescription ?? '',
                longDescription: event.longDescription ?? '',
                bannerImage: event.bannerImage ?? '',
                venue: event.location.venue,
                address: event.location.address,
                state: event.location.state,
                start: event.eventDate.start.slice(0, 16),
                end: event.eventDate.end.slice(0, 16),
            });
        }
    }, [open, event, reset]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                        <div className="text-sm font-semibold">Edit event</div>
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
                            await onSubmit({
                                title: values.title,
                                shortDescription: values.shortDescription,
                                longDescription: values.longDescription,
                                bannerImage: values.bannerImage || undefined,
                                location: {
                                    venue: values.venue,
                                    address: values.address,
                                    state: values.state,
                                },
                                eventDate: {
                                    start: values.start,
                                    end: values.end,
                                },
                            });
                            onClose();
                        } catch (err) {
                            setServerError(err instanceof Error ? err.message : 'Failed to update event');
                        }
                    })}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Title" error={errors.title?.message}>
                            <input
                                {...register('title')}
                                className={inputClass(errors.title?.message)}
                                placeholder="e.g. Tech Conference 2026"
                            />
                        </Field>

                        <Field label="Banner image URL" error={errors.bannerImage?.message}>
                            <input
                                {...register('bannerImage')}
                                className={inputClass(errors.bannerImage?.message)}
                                placeholder="https://..."
                            />
                        </Field>

                        <Field label="Start (ISO / datetime-local)" error={errors.start?.message}>
                            <input
                                {...register('start')}
                                className={inputClass(errors.start?.message)}
                                type="datetime-local"
                            />
                        </Field>

                        <Field label="End (ISO / datetime-local)" error={errors.end?.message}>
                            <input
                                {...register('end')}
                                className={inputClass(errors.end?.message)}
                                type="datetime-local"
                            />
                        </Field>

                        <Field label="Venue" error={errors.venue?.message}>
                            <input {...register('venue')} className={inputClass(errors.venue?.message)} />
                        </Field>

                        <Field label="State" error={errors.state?.message}>
                            <input {...register('state')} className={inputClass(errors.state?.message)} />
                        </Field>

                        <Field label="Address" error={errors.address?.message} className="md:col-span-2">
                            <input {...register('address')} className={inputClass(errors.address?.message)} />
                        </Field>

                        <Field
                            label="Short description"
                            error={errors.shortDescription?.message}
                            className="md:col-span-2"
                        >
                            <input
                                {...register('shortDescription')}
                                className={inputClass(errors.shortDescription?.message)}
                            />
                        </Field>

                        <Field
                            label="Long description"
                            error={errors.longDescription?.message}
                            className="md:col-span-2"
                        >
                            <textarea
                                {...register('longDescription')}
                                className={cn(inputClass(errors.longDescription?.message), 'min-h-28')}
                            />
                        </Field>
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
                            {submitting ? 'Updating…' : 'Update Event'}
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
