import { http } from '../../shared/api/http';

export type AttendanceSummary = {
    eventTitle: string;
    summary: {
        assigned: number;
        active: number;
        checkedIn: number;
        completed: number;
        absent: number;
        total: number;
    };
    attendanceRate: string;
};

type GetAttendanceReportResponse = {
    success: boolean;
    data: AttendanceSummary;
};

export async function getAttendanceReport(eventId: string) {
    const res = await http.get<GetAttendanceReportResponse>(`/api/reports/events/${eventId}/attendance`);
    return res.data.data;
}

export async function exportAttendanceCSV(eventId: string) {
    // For CSV/PDF downloads, we usually want to trigger a direct browser download
    // or use a blob if we need to pass authentication headers.
    // Given our 'http' util might handle auth, let's use a blob.
    const res = await http.get(`/api/reports/events/${eventId}/attendance/csv`, {
        responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance_report_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
}

export async function exportAttendancePDF(eventId: string) {
    const res = await http.get(`/api/reports/events/${eventId}/attendance/pdf`, {
        responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance_report_${eventId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
}
