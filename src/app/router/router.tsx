import { createBrowserRouter, Navigate } from 'react-router-dom';

import FullLayout from 'src/layouts/full/FullLayout';
import { RequireAuth } from '../../features/auth/RequireAuth';
import { DashboardRouterPage } from '../../pages/DashboardRouterPage';
import { EventsPage } from '../../pages/EventsPage';
import { EventDetailsPage } from '../../pages/EventDetailsPage';
import { AttendancePage } from '../../pages/AttendancePage';
import { SettingsPage } from '../../pages/SettingsPage';
import { TrainingsPage } from '../../pages/TrainingsPage';
import { ReportsPage } from '../../pages/ReportsPage';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterAdminPage } from '../../pages/RegisterAdminPage';
import { VerifyOtpPage } from '../../pages/VerifyOtpPage';
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../../pages/ResetPasswordPage';
import LandingPage from '../../pages/LandingPage';
import { useAuth } from '../../features/auth/useAuth';

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/auth/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/register',
    element: <RegisterAdminPage />,
  },
  {
    path: '/auth/verify-otp',
    element: <VerifyOtpPage />,
  },
  {
    path: '/auth/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/auth/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <FullLayout />
      </RequireAuth>
    ),
    children: [
      { path: 'dashboard', element: <DashboardRouterPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'events/:uniqueId', element: <EventDetailsPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'trainings', element: <TrainingsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
