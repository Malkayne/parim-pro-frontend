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
    totalCheckedIn: number;
    recentCheckIns: Array<{
        _id: string;
        user: {
            fullName: string;
            mail: string;
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
    _id: string;
    user: {
        _id: string;
        fullName: string;
        mail: string;
        phoneNumber?: string;
    };
    event: string;
    status: 'ASSIGNED' | 'ACTIVE' | 'COMPLETED' | 'ABSENT';
    checkInTime?: string;
    checkOutTime?: string;
    history: Array<{
        action: string;
        timestamp: string;
        reason?: string;
    }>;
};

type GetAttendanceDetailsResponse = {
    success: boolean;
    message: string;
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
    data: {
        attendance: AttendanceRecord[];
    };
};

export async function getAttendanceDetails(eventId: string, params?: { status?: string; page?: number; limit?: number }) {
    const res = await http.get<GetAttendanceDetailsResponse>(`/api/attendance/admin/events/${eventId}/details`, {
        params,
    });
    return res.data; // Return full object to access pagination
}

export type OverrideAction = 'CHECK_IN_OVERRIDE' | 'CHECK_OUT_OVERRIDE' | 'MARK_ABSENT' | 'STATUS_CHANGE';

export async function overrideAttendance(
    attendanceId: string,
    input: { action: OverrideAction; reason: string; checkInTime?: string; checkOutTime?: string; newStatus?: string },
) {
    const res = await http.post<{ success: boolean; message: string; data: { attendance: AttendanceRecord } }>(
        `/api/attendance/admin/${attendanceId}/override`,
        input,
    );
    return res.data.data.attendance;
}
