import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { useToast } from 'src/components/ui/toast'
import { PageHeader } from 'src/components/page/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs'
import {
  addEventRole,
  deleteEvent,
  getEventByUniqueId,
  updateEventStatus,
  updateEvent,
  updateEventRole,
  deleteEventRole,
  listParticipants,
  approveParticipant,
  rejectParticipant,
  type EventStatus,
} from 'src/features/events/eventsApi'
import { AttendanceView } from 'src/features/attendance/AttendanceView'
import { AddRoleDialog } from 'src/features/events/AddRoleDialog'
import { EditRoleDialog } from 'src/features/events/EditRoleDialog'
import { EditEventDialog } from 'src/features/events/EditEventDialog'
import { ConfirmDialog } from 'src/features/events/ConfirmDialog'
import { PaymentsView } from 'src/features/payments/PaymentsView'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  const setActiveTab = (tab: string) => {
    setSearchParams(prev => {
      prev.set('tab', tab)
      return prev
    })
  }

  // Edit Event State
  const [editEventOpen, setEditEventOpen] = useState(false)

  // Edit/Delete Role State
  const [editingRole, setEditingRole] = useState<any>(null)
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null)


  const { data: event, isLoading, isError, error } = useQuery({
    queryKey: ['event', uniqueId],
    queryFn: () => getEventByUniqueId(String(uniqueId)),
    enabled: Boolean(uniqueId),
  })

  // Participants Query
  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ['event-participants', event?._id],
    queryFn: () => listParticipants(String(event?._id)),
    enabled: Boolean(event?._id),
  })

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

  const updateEventMutation = useMutation({
    mutationFn: (input: any) => updateEvent(String(event?._id), input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['event', uniqueId] })
      toast({ title: 'Event updated', variant: 'success' })
    },
    onError: (err) => {
      toast({ title: 'Update failed', description: err instanceof Error ? err.message : undefined, variant: 'error' })
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: (input: any) => updateEventRole(String(editingRole?._id), input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['event', uniqueId] })
      toast({ title: 'Role updated', variant: 'success' })
    },
    onError: (err) => {
      toast({ title: 'Update failed', description: err instanceof Error ? err.message : undefined, variant: 'error' })
    },
  })

  const deleteRoleMutation = useMutation({
    mutationFn: () => deleteEventRole(String(deletingRoleId)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['event', uniqueId] })
      toast({ title: 'Role deleted', variant: 'success' })
      setDeletingRoleId(null)
    },
    onError: (err) => {
      toast({ title: 'Delete failed', description: err instanceof Error ? err.message : undefined, variant: 'error' })
    },
  })


  const participantActionMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: 'approve' | 'reject'; reason?: string }) =>
      action === 'approve' ? approveParticipant(id) : rejectParticipant(id, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['event-participants', event?._id] })
      toast({ title: 'Participant updated', variant: 'success' })
    },
    onError: (err) => {
      toast({ title: 'Action failed', description: err instanceof Error ? err.message : undefined, variant: 'error' })
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
            <Button variant="outline" onClick={() => setDeleteOpen(true)}>
              Delete Event
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Details</div>
                  <div className="mt-1 text-xs text-muted-foreground">Unique ID: {event.uniqueId ?? '—'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditEventOpen(true)}>Edit</Button>
                  <Badge variant={statusVariant(event.status)}>{event.status}</Badge>
                </div>
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
        </TabsContent>

        <TabsContent value="roles" className="space-y-4 pt-4">
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="text-sm font-medium">Event Roles</div>
              <Button size="sm" variant="outline" onClick={() => setRoleOpen(true)}>
                Add Role
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
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
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
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingRole(r)}>Edit</Button>
                            <Button size="sm" variant="outline" className="text-error hover:text-error hover:bg-error/10 border-error/20" onClick={() => { if (r._id) setDeletingRoleId(r._id) }}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="participants" className="space-y-4 pt-4">
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="text-sm font-medium">Participants</div>
              <div className="text-xs text-muted-foreground">Total: {participants?.length ?? 0}</div>
            </div>

            {participantsLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading participants...</div>
            ) : (participants?.length ?? 0) === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No participants found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-muted text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Applied At</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {participants?.map((p) => (
                      <tr key={p.participantId} className="hover:bg-muted">
                        <td className="px-4 py-3">
                          <div className="font-medium">{p.staff?.fullName ?? 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">{p.staff?.email ?? 'No email'}</div>
                          {p.staff?.phoneNumber && <div className="text-xs text-muted-foreground">{p.staff.phoneNumber}</div>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.role}</td>
                        <td className="px-4 py-3">
                          <Badge variant={
                            p.status === 'approved' ? 'success' :
                              p.status === 'rejected' ? 'error' :
                                p.status === 'cancelled' ? 'gray' :
                                  p.status === 'withdrawn' ? 'gray' : 'warning'
                          }>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(p.appliedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {p.status === 'applied' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-success hover:text-success hover:bg-success/10 border-success/20"
                                  onClick={() => participantActionMutation.mutate({ id: p.participantId, action: 'approve' })}
                                  disabled={participantActionMutation.isPending}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-error hover:text-error hover:bg-error/10 border-error/20"
                                  onClick={() => participantActionMutation.mutate({ id: p.participantId, action: 'reject' })} // Add prompt for reason later
                                  disabled={participantActionMutation.isPending}
                                >
                                  Reject
                                </Button>
                              </>
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
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4 pt-4">
          <AttendanceView eventId={String(event?._id)} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4 pt-4">
          <PaymentsView eventId={String(event?._id)} />
        </TabsContent>
      </Tabs>

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

      {event && (
        <EditEventDialog
          open={editEventOpen}
          event={event}
          submitting={updateEventMutation.isPending}
          onClose={() => setEditEventOpen(false)}
          onSubmit={async (input) => {
            await updateEventMutation.mutateAsync(input)
          }}
        />
      )}

      <EditRoleDialog
        open={Boolean(editingRole)}
        role={editingRole}
        submitting={updateRoleMutation.isPending}
        onClose={() => setEditingRole(null)}
        onSubmit={async (input) => {
          await updateRoleMutation.mutateAsync(input)
          setEditingRole(null)
        }}
      />


      <ConfirmDialog
        open={Boolean(deletingRoleId)}
        title="Delete Role"
        description="Are you sure you want to delete this role? This cannot be undone."
        confirmText="Delete"
        confirming={deleteRoleMutation.isPending}
        onCancel={() => setDeletingRoleId(null)}
        onConfirm={async () => {
          await deleteRoleMutation.mutateAsync()
        }}
      />
    </div>
  )
}
