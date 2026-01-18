import { http } from '../../shared/api/http';

export type AdminRole = 'admin' | 'event_manager';

export type OtpType = 'verification' | 'password_reset';

export async function registerAdmin(input: {
  fullName: string;
  mail: string;
  phoneNumber: string;
  createPassword: string;
  confirmPassword: string;
  role: AdminRole;
}) {
  const res = await http.post('/api/auth/register-admin', input);
  return res.data;
}

export async function verifyAdminOtp(input: { mail: string; otp: string }) {
  const res = await http.post('/api/auth/verify-otp', {
    ...input,
    userType: 'admin',
  });
  return res.data;
}

export async function resendAdminOtp(input: { mail: string }) {
  const res = await http.post('/api/auth/resend-otp', {
    ...input,
    userType: 'admin',
    type: 'verification',
  });
  return res.data;
}

export async function resendAdminPasswordResetOtp(input: { mail: string }) {
  const res = await http.post('/api/auth/resend-otp', {
    ...input,
    userType: 'admin',
    type: 'password_reset',
  });
  return res.data;
}

export async function loginAdmin(input: { mail: string; password: string }) {
  const res = await http.post('/api/auth/login', {
    ...input,
    userType: 'admin',
  });
  return res.data;
}

export async function forgotAdminPassword(input: { mail: string }) {
  const res = await http.post('/api/auth/forgot-password', {
    ...input,
    userType: 'admin',
  });
  return res.data;
}

export async function resetAdminPassword(input: { mail: string; otp: string; newPassword: string }) {
  const res = await http.post('/api/auth/reset-password', {
    ...input,
    userType: 'admin',
  });
  return res.data;
}

export async function refreshToken(input: { refreshToken: string }) {
  const res = await http.post('/api/auth/refresh-token', input);
  return res.data;
}
