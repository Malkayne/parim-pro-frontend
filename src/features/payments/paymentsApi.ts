import { http } from '../../shared/api/http';

export type PaymentStatus = 'calculated' | 'approved' | 'paid' | 'pending';

export type BankDetails = {
    bankName: string;
    accountNumber: string;
    accountName: string;
};

export type Payment = {
    _id: string;
    userId: string;
    eventId: string;
    roleId: string;
    attendanceId: string;
    amount: string;
    currency: string;
    status: PaymentStatus;
    calculatedAt?: string;
    approvedAt?: string;
    paidAt?: string;
    staffName: string;
    role: string;
    bankDetails: BankDetails | null;
};

type CalculatePaymentsResponse = {
    success: boolean;
    message: string;
    data: {
        generatedCount: number;
        totalAmount: string;
    };
};

export async function calculatePayments(eventId: string) {
    const res = await http.post<CalculatePaymentsResponse>(`/api/payments/calculate/${eventId}`);
    return res.data;
}

type GetEventPaymentsResponse = {
    success: boolean;
    data: {
        payments: Payment[];
    };
};

export async function getEventPayments(eventId: string) {
    const res = await http.get<GetEventPaymentsResponse>(`/api/payments/events/${eventId}`);
    return res.data.data.payments;
}

type PaymentActionResponse = {
    success: boolean;
    message: string;
    data: {
        paymentId: string;
        status: PaymentStatus;
    };
};

export async function approvePayment(paymentId: string) {
    const res = await http.patch<PaymentActionResponse>(`/api/payments/${paymentId}/approve`);
    return res.data;
}

export async function markAsPaid(paymentId: string) {
    const res = await http.patch<PaymentActionResponse>(`/api/payments/${paymentId}/paid`);
    return res.data;
}
