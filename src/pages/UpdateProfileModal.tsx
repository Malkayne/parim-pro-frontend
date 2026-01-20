import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Icon } from '@iconify/react';

import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { updateAdminProfile } from 'src/features/auth/authApi';
import { useAuth } from 'src/features/auth/useAuth';
import { useToast } from 'src/components/ui/toast';

type Props = {
    open: boolean;
    onClose: () => void;
};

export function UpdateProfileModal({ open, onClose }: Props) {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');

    const mutation = useMutation({
        mutationFn: () => updateAdminProfile({ fullName, phoneNumber }),
        onSuccess: (res) => {
            if (res.success) {
                updateUser(res.data);
                toast({ title: 'Profile updated successfully', variant: 'success' });
                onClose();
            }
        },
        onError: (error: any) => {
            toast({
                title: 'Failed to update profile',
                description: error.message || 'Please try again',
                variant: 'error',
            });
        },
    });

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h3 className="text-lg font-semibold">Update Profile</h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-muted transition-colors"
                    >
                        <Icon icon="solar:close-circle-linear" width={24} />
                    </button>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        mutation.mutate();
                    }}
                    className="p-6 space-y-4"
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                        <Input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={mutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <Icon icon="solar:restart-linear" className="animate-spin" />
                                    Updating...
                                </span>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
