import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { useToast } from 'src/components/ui/toast'
import { PageHeader } from 'src/components/page/PageHeader'
import {
  addEventRole,
  deleteEvent,
  getEventByUniqueId,
  updateEventStatus,
  type EventStatus,
} from 'src/features/events/eventsApi'
import { AddRoleDialog } from 'src/features/events/AddRoleDialog'
import { ConfirmDialog } from 'src/features/events/ConfirmDialog'

function statusVariant(status: EventStatus) {
  if (status === 'published') return 'success'
  if (status === 'draft') return 'default'
  return 'gray'
}

export function EventDetailsPage() {
  const { uniqueId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [roleOpen, setRoleOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['event', uniqueId],
    queryFn: () => getEventByUniqueId(String(uniqueId)),
    enabled: Boolean(uniqueId),
  })

  const event = data

  const statusMutation = useMutation({
    mutationFn: (next: EventStatus) => updateEventStatus(String(event?._id), next),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['event', uniqueId] }),
        queryClient.invalidateQueries({ queryKey: ['events'] }),
      ])
      toast({ title: 'Status updated', variant: 'success' })
    },
    onError: (err) => {
      toast({ title: 'Failed to update status', description: err instanceof Error ? err.message : undefined, variant: 'error' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(String(event?._id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      toast({ title: 'Event deleted', variant: 'success' })
      navigate('/events', { replace: true })
    },
    onError: (err) => {
      toast({ title: 'Delete failed', description: err instanceof Error ? err.message : undefined, variant: 'error' })
    },
  })

  const addRoleMutation = useMutation({
    mutationFn: (input: { roleName: string; price: number; capacity: number; duration?: string; roleDescription?: string }) =>
      addEventRole(String(event?._id), input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['event', uniqueId] })
      toast({ title: 'Role added', variant: 'success' })
    },
    onError: (err) => {
      toast({ title: 'Failed to add role', description: err instanceof Error ? err.message : undefined, variant: 'error' })
    },
  })

  const breadcrumbs = useMemo(
    () => [
      { label: 'Home', href: '/' },
      { label: 'Events', href: '/events' },
      { label: event?.title ?? String(uniqueId ?? 'Event') },
    ],
    [event?.title, uniqueId],
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Event" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Events', href: '/events' }, { label: 'Loading…' }]} />
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Loading event…</div>
      </div>
    )
  }

  if (isError || !event) {
    return (
      <div className="space-y-4">
        <PageHeader title="Event" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Events', href: '/events' }, { label: 'Error' }]} />
        <div className="rounded-xl border border-error bg-lighterror p-4 text-sm text-error">
          {error instanceof Error ? error.message : 'Failed to load event'}
        </div>
        <Button asChild variant="outline">
          <Link to="/events">Back to events</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={event.title}
        description={event.shortDescription}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setRoleOpen(true)}>
              Add role
            </Button>
            <Button variant="outline" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Overview</div>
              <div className="mt-1 text-xs text-muted-foreground">Unique ID: {event.uniqueId ?? '—'}</div>
            </div>
            <Badge variant={statusVariant(event.status)}>{event.status}</Badge>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-background px-3 py-2">
              <div className="text-xs text-muted-foreground">Start</div>
              <div className="text-sm font-medium">{new Date(event.eventDate.start).toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-border bg-background px-3 py-2">
              <div className="text-xs text-muted-foreground">End</div>
              <div className="text-sm font-medium">{new Date(event.eventDate.end).toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-border bg-background px-3 py-2 sm:col-span-2">
              <div className="text-xs text-muted-foreground">Location</div>
              <div className="text-sm font-medium">{event.location.venue}</div>
              <div className="text-xs text-muted-foreground">{event.location.state} • {event.location.address}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-semibold">Description</div>
            <div className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{event.longDescription ?? '—'}</div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-sm font-semibold">Actions</div>
          <div className="mt-3 space-y-2">
            <Button
              className="w-full"
              disabled={statusMutation.isPending || event.status === 'published'}
              onClick={() => statusMutation.mutate('published')}
            >
              {statusMutation.isPending && event.status !== 'published' ? 'Updating…' : 'Publish'}
            </Button>

            <Button
              className="w-full"
              variant="outline"
              disabled={statusMutation.isPending || event.status === 'draft'}
              onClick={() => statusMutation.mutate('draft')}
            >
              Set as draft
            </Button>

            <Button
              className="w-full"
              variant="outline"
              disabled={statusMutation.isPending || event.status === 'closed'}
              onClick={() => statusMutation.mutate('closed')}
            >
              Close event
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-medium">Roles</div>
          <Button variant="outline" onClick={() => setRoleOpen(true)}>
            Add role
          </Button>
        </div>

        {(event.roles?.length ?? 0) === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No roles added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Capacity</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {event.roles?.map((r) => (
                  <tr key={r._id ?? r.roleName} className="hover:bg-muted">
                    <td className="px-4 py-3 font-medium">{r.roleName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.price}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.capacity}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.duration ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.roleDescription ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddRoleDialog
        open={roleOpen}
        submitting={addRoleMutation.isPending}
        onClose={() => setRoleOpen(false)}
        onSubmit={async (input) => {
          await addRoleMutation.mutateAsync(input)
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete event"
        description="This is a safe delete. The server may reject if the event has active participants."
        confirmText="Delete"
        confirming={deleteMutation.isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await deleteMutation.mutateAsync()
        }}
      />
    </div>
  )
}
