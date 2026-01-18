import type { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, LogOut, Settings, UserCheck } from 'lucide-react';

import LogoIcon from '../../assets/images/logos/logo-icon.svg';
import { useAuth } from '../../features/auth/useAuth';
import { cn } from '../../shared/utils/cn';

export function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto grid min-h-dvh max-w-[1400px] grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-border bg-sidebar lg:block">
          <div className="flex h-16 items-center gap-2 border-b border-border px-4">
            <img src={LogoIcon} className="h-8 w-8" alt="Parim" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">Parim Pro</div>
              <div className="text-xs text-muted-foreground">Admin Dashboard</div>
            </div>
          </div>

          <nav className="p-3">
            <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavItem to="/events" icon={<CalendarDays size={18} />} label="Events" />
            <NavItem to="/attendance" icon={<UserCheck size={18} />} label="Attendance" />
            <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" />

            <button
              type="button"
              className="mt-3 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-sidebar-foreground hover:bg-lightprimary"
              onClick={() => {
                logout();
                navigate('/auth/login');
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </aside>

        <div className="flex min-h-dvh flex-col">
          <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <LayoutDashboard size={18} />
                <span className="text-sm font-medium">{user?.fullName ?? 'Admin'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-border bg-transparent px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => navigate('/events')}
                >
                  Manage events
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4">
            <Outlet />
          </main>

          <footer className="border-t border-border bg-card px-4 py-3 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Parim Pro
          </footer>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  to,
  icon,
  label,
}: {
  to: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-lightprimary',
          isActive && 'bg-primary text-primary-foreground hover:bg-primary'
        )
      }
      end={to === '/'}
    >
      {icon}
      {label}
    </NavLink>
  );
}
