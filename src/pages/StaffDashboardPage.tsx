import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

import { getStaffDashboardStats } from '../features/dashboard/dashboardApi';
import { PageHeader } from 'src/components/page/PageHeader';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { useAuth } from 'src/features/auth/useAuth';

function statusBadgeVariant(status: string) {
    if (status === 'COMPLETED') return 'success';
    if (status === 'ACTIVE' || status === 'CHECKED_IN') return 'default';
    return 'gray';
}

export function StaffDashboardPage() {
    const { user } = useAuth();
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['staff-dashboard-stats'],
        queryFn: getStaffDashboardStats,
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
                description={`Welcome back, ${user?.fullName || 'Staff'}`}
                breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
            />

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-muted-foreground">Total Assignments</div>
                            <div className="mt-1 text-2xl font-bold">{data.overview.totalAssignments}</div>
                        </div>
                        <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                            <Icon icon="solar:clipboard-check-linear" width={24} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-muted-foreground">Completed</div>
                            <div className="mt-1 text-2xl font-bold">{data.overview.completedAssignments}</div>
                        </div>
                        <div className="rounded-lg bg-green-100 p-3 text-green-600">
                            <Icon icon="solar:check-circle-linear" width={24} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-muted-foreground">Total Earnings</div>
                            <div className="mt-1 text-2xl font-bold">${data.overview.totalEarnings}</div>
                        </div>
                        <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
                            <Icon icon="solar:wallet-money-linear" width={24} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-muted-foreground">Upcoming Events</div>
                            <div className="mt-1 text-2xl font-bold">{data.overview.upcomingEvents}</div>
                        </div>
                        <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                            <Icon icon="solar:calendar-linear" width={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-xl border border-border bg-card">
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <div className="text-sm font-medium">Recent Activity</div>
                            <Button asChild variant="outline" size="sm">
                                <Link to="/attendance">View All</Link>
                            </Button>
                        </div>

                        <div className="divide-y">
                            {/* Recent Attendances */}
                            {data.recentActivity.attendances.length > 0 && (
                                <div className="p-4">
                                    <div className="mb-3 text-xs font-medium uppercase text-muted-foreground">Recent Assignments</div>
                                    <div className="space-y-3">
                                        {data.recentActivity.attendances.slice(0, 3).map((attendance) => (
                                            <div key={attendance.attendanceId} className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="font-medium">{attendance.eventId.title}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {attendance.roleId.roleName} • ${attendance.roleId.price}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(attendance.eventId.eventDate.start).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <Badge variant={statusBadgeVariant(attendance.status)}>
                                                    {attendance.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Payments */}
                            {data.recentActivity.payments.length > 0 && (
                                <div className="p-4">
                                    <div className="mb-3 text-xs font-medium uppercase text-muted-foreground">Recent Payments</div>
                                    <div className="space-y-3">
                                        {data.recentActivity.payments.slice(0, 3).map((payment) => (
                                            <div key={payment._id} className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="font-medium">{payment.eventId.title}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {payment.roleId.roleName} • ${payment.amount}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(payment.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <Badge variant={payment.status === 'paid' ? 'success' : 'warning'}>
                                                    {payment.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {data.recentActivity.attendances.length === 0 && data.recentActivity.payments.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Icon icon="solar:document-text-linear" width={48} className="mx-auto mb-2 opacity-50" />
                                    <p>No recent activity</p>
                                    <Button asChild className="mt-3">
                                        <Link to="/events">Browse Events</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="rounded-xl border border-border bg-card">
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <div className="text-sm font-medium">Upcoming Events</div>
                            <Button asChild variant="outline" size="sm">
                                <Link to="/events">View All</Link>
                            </Button>
                        </div>

                        {data.upcomingEvents.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Icon icon="solar:calendar-linear" width={48} className="mx-auto mb-2 opacity-50" />
                                <p>No upcoming events</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {data.upcomingEvents.map((event) => (
                                    <div key={event._id} className="p-4 hover:bg-muted">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <Link
                                                    to={`/events/${event._id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {event.title}
                                                </Link>
                                                <div className="mt-1 text-sm text-muted-foreground">
                                                    {event.location.venue} • {event.location.state}
                                                </div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {new Date(event.eventDate.start).toLocaleString()}
                                                </div>
                                            </div>
                                            <Button asChild variant="outline" size="sm">
                                                <Link to={`/events/${event._id}`}>View</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Stats */}
                <div className="space-y-4">
                    {/* Attendance Stats */}
                    <div className="rounded-xl border border-border bg-card p-4">
                        <div className="text-sm font-medium">My Assignments</div>
                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-medium">{data.attendance.total}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Active</span>
                                <span className="font-medium text-green-600">{data.attendance.active}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Completed</span>
                                <span className="font-medium">{data.attendance.completed}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Checked In</span>
                                <span className="font-medium text-blue-600">{data.attendance.checkedIn}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Stats */}
                    <div className="rounded-xl border border-border bg-card p-4">
                        <div className="text-sm font-medium">My Earnings</div>
                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Payments</span>
                                <span className="font-medium">{data.payments.total}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pending</span>
                                <span className="font-medium text-yellow-600">{data.payments.pending}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Paid</span>
                                <span className="font-medium text-green-600">{data.payments.paid}</span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-border">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Total Earnings</span>
                                    <span className="font-bold text-lg text-green-600">
                                        ${data.payments.totalEarnings.toLocaleString()}
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
                                <Link to="/events">Browse Events</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link to="/attendance">My Attendance</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link to="/payments">My Earnings</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
