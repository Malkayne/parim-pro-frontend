import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type { EventStatus } from '../features/events/eventsApi';
import { createEvent, listEvents } from '../features/events/eventsApi';
import { CreateEventDialog } from '../features/events/CreateEventDialog';
import { PageHeader } from 'src/components/page/PageHeader';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { useToast } from 'src/components/ui/toast';

function statusBadgeVariant(status: EventStatus) {
  if (status === 'published') return 'success';
  if (status === 'draft') return 'warning';
  return 'gray';
}

export function EventsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EventStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const queryParams = useMemo(() => {
    return {
      search: search.trim() || undefined,
      status: status === 'all' ? undefined : status,
      page,
      limit: 10,
    };
  }, [page, search, status]);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['events', queryParams],
    queryFn: () => listEvents(queryParams),
  });

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event created', variant: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Failed to create event',
        description: err instanceof Error ? err.message : undefined,
        variant: 'error',
      });
    },
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Events"
        description="Create, publish and manage event roles"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Events' }]}
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Create event
          </Button>
        }
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-muted-foreground">Search</label>
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, venue, state, uniqueId"
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as EventStatus | 'all');
              setPage(1);
            }}
            className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <CreateEventDialog
        open={createOpen}
        submitting={createMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (input) => {
          await createMutation.mutateAsync(input);
        }}
      />

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-medium">Event list</div>
          <div className="text-xs text-muted-foreground">{isFetching ? 'Refreshing…' : ' '}</div>
        </div>

        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading events…</div>
        ) : isError ? (
          <div className="p-4 text-sm text-error">
            {error instanceof Error ? error.message : 'Failed to load events'}
          </div>
        ) : (data?.events?.length ?? 0) === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium text-nowrap">Unique ID</th>
                  <th className="px-4 py-3 font-medium text-nowrap">Title</th>
                  <th className="px-4 py-3 font-medium text-nowrap">Date</th>
                  <th className="px-4 py-3 font-medium text-nowrap">Location</th>
                  <th className="px-4 py-3 font-medium text-nowrap">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.events.map((event) => (
                  <tr key={event._id} className="hover:bg-muted">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground text-nowrap">
                      {event.uniqueId ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground text-nowrap">
                      {event.uniqueId ? (
                        <Link to={`/events/${encodeURIComponent(event.uniqueId)}`} className="hover:underline">
                          {event.title}
                        </Link>
                      ) : (
                        event.title
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-nowrap">
                      <div className="text-xs">
                        <div>{new Date(event.eventDate.start).toLocaleString()}</div>
                        <div className="text-muted-foreground">
                          to {new Date(event.eventDate.end).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-nowrap">
                      <div className="text-xs">
                        <div className="font-medium">{event.location.venue}</div>
                        <div className="text-muted-foreground">
                          {event.location.state} • {event.location.address}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-nowrap">
                      <Badge variant={statusBadgeVariant(event.status)}>{event.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-nowrap">
                      {event.uniqueId ? (
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/events/${encodeURIComponent(event.uniqueId)}`}>Manage</Link>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <div className="text-xs text-muted-foreground">
            Page {data?.pagination.page ?? page} of {data?.pagination.pages ?? 1} • Total{' '}
            {data?.pagination.total ?? 0}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={Boolean(data?.pagination.pages && page >= data.pagination.pages) || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
