import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

import { getDashboardStats } from '../features/dashboard/dashboardApi';
import { PageHeader } from 'src/components/page/PageHeader';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { useAuth } from 'src/features/auth/useAuth';

function statusBadgeVariant(status: string) {
    if (status === 'published') return 'success';
    if (status === 'draft') return 'warning';
    return 'gray';
}

export function DashboardPage() {
    const { user } = useAuth();
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: getDashboardStats,
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <PageHeader title="Dashboard" description="Loading dashboard..." />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-border bg-card p-4">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="space-y-4">
                <PageHeader title="Dashboard" description="Error loading dashboard" />
                <div className="rounded-xl border border-error bg-lighterror p-4 text-error">
                    {error instanceof Error ? error.message : 'Failed to load dashboard data'}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Dashboard"
                description={`Welcome back, ${user?.fullName || 'Admin'}`}
                breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
            />

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-muted-foreground">Total Events</div>
                            <div className="mt-1 text-2xl font-bold">{data.overview.totalEvents}</div>
                        </div>
                        <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                            <Icon icon="solar:calendar-linear" width={24} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-muted-foreground">Active Events</div>
                            <div className="mt-1 text-2xl font-bold">{data.overview.activeEvents}</div>
                        </div>
                        <div className="rounded-lg bg-green-100 p-3 text-green-600">
                            <Icon icon="solar:check-circle-linear" width={24} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-muted-foreground">Total Staff</div>
                            <div className="mt-1 text-2xl font-bold">{data.overview.totalStaff}</div>
                        </div>
                        <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
                            <Icon icon="solar:users-group-two-rounded-linear" width={24} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-muted-foreground">Attendance Rate</div>
                            <div className="mt-1 text-2xl font-bold">{data.overview.attendanceRate}</div>
                        </div>
                        <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                            <Icon icon="solar:chart-square-linear" width={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Events Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-xl border border-border bg-card">
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <div className="text-sm font-medium">Recent Events</div>
                            <Button asChild variant="outline" size="sm">
                                <Link to="/events">View All</Link>
                            </Button>
                        </div>

                        {data.events.recent.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Icon icon="solar:calendar-linear" width={48} className="mx-auto mb-2 opacity-50" />
                                <p>No events created yet</p>
                                <Button asChild className="mt-3">
                                    <Link to="/events">Create Event</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {data.events.recent.map((event) => (
                                    <div key={event._id} className="p-4 hover:bg-muted">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        to={`/events/${event.uniqueId}`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {event.title}
                                                    </Link>
                                                    <Badge variant={statusBadgeVariant(event.status)}>
                                                        {event.status}
                                                    </Badge>
                                                </div>
                                                <div className="mt-1 text-sm text-muted-foreground">
                                                    {event.location.venue} • {event.location.state}
                                                </div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {new Date(event.eventDate.start).toLocaleDateString()}
                                                </div>
                                                {event.roles.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {event.roles.slice(0, 3).map((role, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="rounded bg-muted px-2 py-1 text-xs"
                                                            >
                                                                {role.roleName}
                                                            </span>
                                                        ))}
                                                        {event.roles.length > 3 && (
                                                            <span className="rounded bg-muted px-2 py-1 text-xs">
                                                                +{event.roles.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link to={`/events/${event.uniqueId}`}>Manage</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Event Stats */}
                    <div className="rounded-xl border border-border bg-card p-4">
                        <div className="text-sm font-medium">Event Statistics</div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border border-border bg-background p-3">
                                <div className="text-xs text-muted-foreground">Total</div>
                                <div className="mt-1 text-lg font-bold">{data.events.stats.total}</div>
                            </div>
                            <div className="rounded-lg border border-border bg-background p-3">
                                <div className="text-xs text-muted-foreground">Published</div>
                                <div className="mt-1 text-lg font-bold text-success">{data.events.stats.published}</div>
                            </div>
                            <div className="rounded-lg border border-border bg-background p-3">
                                <div className="text-xs text-muted-foreground">Draft</div>
                                <div className="mt-1 text-lg font-bold text-warning">{data.events.stats.draft}</div>
                            </div>
                            <div className="rounded-lg border border-border bg-background p-3">
                                <div className="text-xs text-muted-foreground">Closed</div>
                                <div className="mt-1 text-lg font-bold">{data.events.stats.closed}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Stats */}
                <div className="space-y-4">
                    {/* Attendance Summary */}
                    <div className="rounded-xl border border-border bg-card p-4">
                        <div className="text-sm font-medium">Attendance Summary</div>
                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Assigned</span>
                                <span className="font-medium">{data.attendance.total}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Checked In</span>
                                <span className="font-medium text-blue-600">{data.attendance.checkedIn}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Active</span>
                                <span className="font-medium text-green-600">{data.attendance.active}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Completed</span>
                                <span className="font-medium">{data.attendance.completed}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="rounded-xl border border-border bg-card p-4">
                        <div className="text-sm font-medium">Payment Summary</div>
                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Calculated</span>
                                <span className="font-medium">{data.payments.calculated}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Approved</span>
                                <span className="font-medium text-yellow-600">{data.payments.approved}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Paid</span>
                                <span className="font-medium text-green-600">{data.payments.paid}</span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-border">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Total Amount</span>
                                    <span className="font-bold text-lg">
                                        ₦{data.payments.totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="rounded-xl border border-border bg-card p-4">
                        <div className="text-sm font-medium">Quick Actions</div>
                        <div className="mt-4 flex flex-col gap-2">
                            <Button asChild variant="outline">
                                <Link to="/events">Create Event</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link to="/attendance">View Attendance</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link to="/reports">Generate Reports</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
