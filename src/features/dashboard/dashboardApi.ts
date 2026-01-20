import { http } from '../../shared/api/http';

export type DashboardStats = {
    overview: {
        totalEvents: number;
        activeEvents: number;
        totalStaff: number;
        attendanceRate: string;
    };
    events: {
        stats: {
            total: number;
            published: number;
            draft: number;
            closed: number;
        };
        recent: Array<{
            _id: string;
            uniqueId: string;
            title: string;
            status: string;
            eventDate: {
                start: string;
                end: string;
            };
            location: {
                venue: string;
                state: string;
            };
            roles: Array<{
                roleName: string;
                price: number;
                capacity: number;
            }>;
        }>;
    };
    attendance: {
        total: number;
        assigned: number;
        active: number;
        checkedIn: number;
        completed: number;
        absent: number;
    };
    payments: {
        calculated: number;
        approved: number;
        paid: number;
        totalAmount: number;
    };
};

export type StaffDashboardStats = {
    overview: {
        totalAssignments: number;
        completedAssignments: number;
        totalEarnings: string;
        upcomingEvents: number;
    };
    attendance: {
        total: number;
        completed: number;
        active: number;
        checkedIn: number;
    };
    payments: {
        total: number;
        paid: number;
        pending: number;
        totalEarnings: number;
    };
    recentActivity: {
        attendances: Array<{
            attendanceId: string;
            eventId: {
                title: string;
                eventDate: { start: string; end: string };
            };
            roleId: {
                roleName: string;
                price: number;
            };
            status: string;
        }>;
        payments: Array<{
            _id: string;
            amount: string;
            status: string;
            eventId: { title: string };
            roleId: { roleName: string };
            createdAt: string;
        }>;
    };
    upcomingEvents: Array<{
        _id: string;
        title: string;
        eventDate: { start: string; end: string };
        location: { venue: string; state: string };
    }>;
};

type DashboardResponse = {
    success: boolean;
    message: string;
    data: DashboardStats;
};

type StaffDashboardResponse = {
    success: boolean;
    message: string;
    data: StaffDashboardStats;
};

export async function getDashboardStats() {
    const res = await http.get<DashboardResponse>('/api/dashboard/stats');
    return res.data.data;
}

export async function getStaffDashboardStats() {
    const res = await http.get<StaffDashboardResponse>('/api/dashboard/staff-stats');
    return res.data.data;
}
