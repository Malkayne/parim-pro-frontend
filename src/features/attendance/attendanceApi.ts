import { http } from '../../shared/api/http';

export type QRCodeData = {
    qrId: string;
    qrImage: string;
    token: string;
    expiresAt: string;
    expiresInMinutes: number;
    isExpired?: boolean;
    remainingMinutes?: number;
};

type GenerateQRResponse = {
    success: boolean;
    message: string;
    data: QRCodeData;
};

export async function generateQR(eventId: string, expiresInMinutes: number) {
    const res = await http.post<GenerateQRResponse>('/api/attendance/qr/generate', {
        eventId,
        expiresInMinutes,
    });
    return res.data.data;
}

type GetActiveQRResponse = {
    success: boolean;
    message: string;
    data: QRCodeData;
};

export async function getActiveQR(eventId: string) {
    const res = await http.get<GetActiveQRResponse>(`/api/attendance/qr/event/${eventId}`);
    return res.data.data;
}

export async function deleteQR(qrId: string) {
    const res = await http.delete<{ success: boolean; message: string }>(`/api/attendance/qr/${qrId}`);
    return res.data;
}

export type LiveAttendanceStats = {
    eventId: string;
    eventTitle: string;
    summary: {
        totalApproved: number;
        assigned: number;
        checkedIn: number;
        active: number;
        completed: number;
        absent: number;
    };
    percentages: {
        attendance: number;
        completion: number;
    };
    lastUpdated: string;
    recentCheckIns?: Array<{
        attendanceId: string;
        staff: {
            fullName: string;
            email: string;
        };
        checkInTime: string;
        status: string;
    }>;
};

type GetLiveAttendanceResponse = {
    success: boolean;
    message: string;
    data: LiveAttendanceStats;
};

export async function getLiveAttendance(eventId: string) {
    const res = await http.get<GetLiveAttendanceResponse>(`/api/attendance/admin/events/${eventId}/live`);
    return res.data.data;
}

export type AttendanceRecord = {
    attendanceId: string;
    staff: {
        id: string;
        fullName: string;
        email: string;
        mail?: string; // Standardized back-end field
        phoneNumber?: string;
    } | null;
    role: string;
    status: 'ASSIGNED' | 'ACTIVE' | 'COMPLETED' | 'ABSENT' | 'CHECKED_IN';
    checkIn?: {
        time: string;
        method: string;
    } | null;
    checkOut?: {
        time: string;
        method: string;
    } | null;
    duration?: string;
    overridden?: boolean;
    notes?: string | null;
};

type GetAttendanceDetailsResponse = {
    success: boolean;
    message: string;
    data: {
        attendances: AttendanceRecord[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    };
};

export async function getAttendanceDetails(eventId: string, params?: { status?: string; page?: number; limit?: number }) {
    const res = await http.get<GetAttendanceDetailsResponse>(`/api/attendance/admin/events/${eventId}/details`, {
        params,
    });
    return res.data;
}

export type OverrideAction = 'CHECK_IN_OVERRIDE' | 'CHECK_OUT_OVERRIDE' | 'MARK_ABSENT' | 'STATUS_CHANGE';

export type OverrideHistoryItem = {
    overrideId: string;
    action: OverrideAction;
    reason: string;
    performedBy: any;
    before: any;
    after: any;
    timestamp: string;
};

export async function overrideAttendance(
    attendanceId: string,
    input: { action: OverrideAction; reason: string; checkInTime?: string; checkOutTime?: string; newStatus?: string },
) {
    const res = await http.post<{ success: boolean; message: string; data: { attendance: AttendanceRecord } }>(
        `/api/attendance/admin/${attendanceId}/override`,
        input,
    );
    return res.data.data;
}

export async function getOverrideHistory(attendanceId: string) {
    const res = await http.get<{ success: boolean; data: { overrides: OverrideHistoryItem[] } }>(
        `/api/attendance/admin/${attendanceId}/overrides`
    );
    return res.data.data.overrides;
}
