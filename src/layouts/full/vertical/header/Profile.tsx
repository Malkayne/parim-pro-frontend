import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import { Button } from 'src/components/ui/button';
import { useAuth } from 'src/features/auth/useAuth';
import { LogoutConfirmDialog } from 'src/components/ui/LogoutConfirmDialog';

export default function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to login even if logout API fails
      navigate('/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative group/menu ps-1 sm:ps-3 shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="hover:text-primary hover:bg-lightprimary h-9 w-9 rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary border border-border">
            <Icon icon="tabler:user" height={18} />
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-screen sm:w-[220px] pb-4 pt-2">
          <DropdownMenuItem asChild className="px-4 py-2 cursor-pointer">
            <Link to="/settings">Settings</Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          <div className="pt-2 px-4">
            <Button variant="outline" className="w-full rounded-md" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutConfirmDialog
        open={showLogoutConfirm}
        confirming={isLoggingOut}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </div>
  )
}
