import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from 'src/components/ui/button';
import { useToast } from 'src/components/ui/toast';

const schema = z.object({
    title: z.string().min(3, 'Title is too short'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    youtubeUrl: z.string().url('Invalid URL').includes('youtu', { message: 'Must be a YouTube URL' }),
});

type FormValues = z.infer<typeof schema>;

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: FormValues) => Promise<void>;
    submitting: boolean;
};

export function CreateTrainingDialog({ open, onClose, onSubmit, submitting }: Props) {
    const { toast } = useToast();
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    if (!open) return null;

    const onFormSubmit = async (data: FormValues) => {
        try {
            await onSubmit(data);
            reset();
            onClose();
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to create training',
                variant: 'error',
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="border-b border-border px-4 py-3 bg-muted/50">
                    <h3 className="text-sm font-semibold">Create Training Module</h3>
                </div>

                <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase text-muted-foreground">Title</label>
                        <input
                            {...register('title')}
                            className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:ring-1 focus:ring-primary outline-none"
                            placeholder="e.g. Health & Safety Essentials"
                        />
                        {errors.title && <p className="text-[10px] text-error">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase text-muted-foreground">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
                            placeholder="What will staff learn in this module?"
                        />
                        {errors.description && <p className="text-[10px] text-error">{errors.description.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase text-muted-foreground">YouTube Video URL</label>
                        <input
                            {...register('youtubeUrl')}
                            className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:ring-1 focus:ring-primary outline-none"
                            placeholder="https://youtu.be/..."
                        />
                        {errors.youtubeUrl && <p className="text-[10px] text-error">{errors.youtubeUrl.message}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4 h-14 items-center">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                reset();
                                onClose();
                            }}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={submitting}
                        >
                            {submitting ? 'Creating...' : 'Create Module'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
