import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from 'src/components/page/PageHeader';
import { Button } from 'src/components/ui/button';
import { listEvents, type Event } from 'src/features/events/eventsApi';
import { getLiveAttendance } from 'src/features/attendance/attendanceApi';
import { Icon } from '@iconify/react';

export function AttendancePage() {
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events', 'published'],
    queryFn: () => listEvents({ status: 'published', limit: 100 }),
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Attendance Dashboard"
        description="Monitor live attendance and manage QR codes for active events."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Attendance' }]}
      />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
          Loading events...
        </div>
      ) : (eventsData?.events?.length ?? 0) === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card text-muted-foreground">
          <Icon icon="solar:calendar-linear" width={32} />
          <p>No active events found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {eventsData?.events.map((event) => (
            <EventAttendanceCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventAttendanceCard({ event }: { event: Event }) {
  const navigate = useNavigate();

  // Fetch live stats for this card
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['attendance-live', event._id],
    queryFn: () => getLiveAttendance(event._id),
    refetchInterval: 30000, // Refresh every 30s
    retry: false,
  });

  // Format date nicely
  const eventDate = new Date(event.eventDate.start);
  const dateStr = eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = eventDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-sidebar-foreground/20">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="line-clamp-1 font-semibold" title={event.title}>
            {event.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon icon="solar:calendar-linear" width={14} />
            <span>{dateStr} • {timeStr}</span>
          </div>
        </div>
        {/* Status dot if event is today */}
        {isToday(eventDate) && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success"></span>
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-2">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-xs text-muted-foreground">Live Check-ins</div>
          <div className="mt-1 flex items-baseline gap-1">
            {statsLoading ? (
              <span className="h-6 w-8 animate-pulse rounded bg-muted"></span>
            ) : (
              <span className="text-2xl font-bold">{stats?.totalCheckedIn ?? 0}</span>
            )}
            <span className="text-xs text-muted-foreground">participants active</span>
          </div>
        </div>

        {stats?.recentCheckIns && stats.recentCheckIns.length > 0 && (
          <div className="mt-1">
            <div className="mb-1 text-[10px] uppercase text-muted-foreground">Latest</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                {getInitials(stats.recentCheckIns[0].staff.fullName)}
              </div>
              <div className="truncate flex-1">
                <span className="font-medium">{stats.recentCheckIns[0].staff.fullName}</span> checked in
              </div>
              <span className="text-[10px] text-muted-foreground">
                {getTimeAgo(new Date(stats.recentCheckIns[0].checkInTime))}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Icon icon="solar:map-point-linear" width={14} />
          <span className="truncate max-w-[120px]" title={event.location.venue}>{event.location.venue}</span>
        </div>
        <Button
          size="sm"
          variant="default" // Using default primary style for main action
          onClick={() => navigate(`/events/${event.uniqueId}?tab=attendance`)}
        >
          Manage
        </Button>
      </div>
    </div>
  );
}

function isToday(date: Date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
