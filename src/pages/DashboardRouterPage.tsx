import { useAuth } from 'src/features/auth/useAuth';
import { DashboardPage } from './DashboardPage';
import { StaffDashboardPage } from './StaffDashboardPage';

export function DashboardRouterPage() {
    const { user } = useAuth();

    // Route to appropriate dashboard based on user role
    if (user?.role === 'admin' || user?.role === 'event_manager') {
        return <DashboardPage />;
    }

    // Default to staff dashboard for user role and any other role
    return <StaffDashboardPage />;
}
