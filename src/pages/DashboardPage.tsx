import { Link } from 'react-router-dom'

import { PageHeader } from 'src/components/page/PageHeader'
import { Button } from 'src/components/ui/button'
import { useAuth } from 'src/features/auth/useAuth'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        hideHeader={true}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
        banner={
          <div className="rounded-xl border border-border bg-card p-6 bg-primary/10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Welcome back</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight">
                  {user?.fullName ?? 'Admin'}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Manage events, roles, attendance and more from one place.
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link to="/events">Manage events</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/attendance">Attendance</Link>
                </Button>
              </div>
            </div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-sm font-medium">Quick actions</div>
          <div className="mt-3 flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link to="/events">Create or edit an event</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/settings">Update profile</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 md:col-span-2">
          <div className="text-sm font-medium">Getting started</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Tip: create an event, add roles (price/quantity), then publish when ready.
          </div>
        </div>
      </div>
    </div>
  )
}
