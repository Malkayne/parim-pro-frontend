import { useState } from 'react';
import { Icon } from '@iconify/react';

import { PageHeader } from 'src/components/page/PageHeader';
import { Button } from 'src/components/ui/button';
import { useAuth } from 'src/features/auth/useAuth';
import { UpdateProfileModal } from './UpdateProfileModal';
import { Badge } from 'src/components/ui/badge';

export function SettingsPage() {
  const { user } = useAuth();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Settings' }]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Details Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <Icon icon="solar:user-circle-linear" width={22} className="text-primary" />
              Profile Details
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsUpdateModalOpen(true)}>
              <Icon icon="solar:pen-new-square-linear" className="mr-2" />
              Edit Profile
            </Button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/20">
                {user?.fullName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <h3 className="text-xl font-bold">{user?.fullName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider">
                    {user?.role?.replace('_', ' ')}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Admin ID: {user?.id?.slice(-8).toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Icon icon="solar:letter-linear" />
                  Email Address
                </span>
                <span className="font-medium">{user?.mail}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Icon icon="solar:phone-linear" />
                  Phone Number
                </span>
                <span className="font-medium">{user?.phoneNumber || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Icon icon="solar:shield-check-linear" />
                  Verification Status
                </span>
                <Badge variant={user?.isVerified ? 'success' : 'warning'}>
                  {user?.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info/Help Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-6 flex flex-col justify-center items-center text-center space-y-4">
          <div className="rounded-full bg-blue-50 p-4 text-blue-600">
            <Icon icon="solar:info-circle-linear" width={40} />
          </div>
          <div>
            <h4 className="font-semibold text-lg">Account Security</h4>
            <p className="text-sm text-muted-foreground max-w-[300px] mt-1">
              Keep your profile information up to date to ensure account security and proper notifications.
            </p>
          </div>
          <Button variant="outline" className="mt-2" disabled>
            Change Password
          </Button>
          <p className="text-[10px] text-muted-foreground italic">Password changes coming soon</p>
        </div>
      </div>

      <UpdateProfileModal
        open={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      />
    </div>
  );
}
