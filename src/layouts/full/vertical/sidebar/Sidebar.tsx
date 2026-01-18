import * as React from 'react'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import { Icon } from '@iconify/react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AMLogo, AMMenu, AMMenuItem, AMSidebar, AMSubmenu } from 'tailwind-sidebar'
import 'tailwind-sidebar/styles.css'

import SidebarContent, { type SidebarItem } from './sidebaritems'
import FullLogo from '../../shared/logo/FullLogo'
import { useTheme } from 'src/components/provider/theme-provider'
import { LogoutConfirmDialog } from 'src/components/ui/LogoutConfirmDialog'

type SidebarRouterLinkProps = React.ComponentProps<typeof Link> & { href?: string }
const SidebarRouterLink = React.forwardRef<HTMLAnchorElement, SidebarRouterLinkProps>(
  ({ href, to, ...props }, ref) => {
    return <Link ref={ref as any} to={(to ?? href ?? '/') as any} {...(props as any)} />
  },
)
SidebarRouterLink.displayName = 'SidebarRouterLink'

const renderSidebarItems = (
  items: SidebarItem[],
  currentPath: string,
  onClose?: () => void,
  isSubItem: boolean = false,
) => {
  return items.map((item) => {
    const isSelected = currentPath === item?.url
    const iconElement = item.icon ? (
      <Icon icon={item.icon} height={21} width={21} />
    ) : (
      <Icon icon={'ri:checkbox-blank-circle-line'} height={9} width={9} />
    )

    if (item.heading) {
      return (
        <div className="mb-1" key={item.heading}>
          <AMMenu
            subHeading={item.heading}
            ClassName="hide-menu leading-21 text-sidebar-foreground font-bold uppercase text-xs dark:text-sidebar-foreground"
          />
        </div>
      )
    }

    if (item.children?.length) {
      return (
        <AMSubmenu
          key={item.id}
          icon={iconElement}
          title={item.name}
          ClassName="mt-0.5 text-sidebar-foreground dark:text-sidebar-foreground"
        >
          {renderSidebarItems(item.children, currentPath, onClose, true)}
        </AMSubmenu>
      )
    }

    const itemClassNames = isSubItem
      ? `mt-0.5 text-sidebar-foreground dark:text-sidebar-foreground !hover:bg-transparent ${
          isSelected ? '!bg-transparent !text-primary' : ''
        }`
      : `mt-0.5 text-sidebar-foreground dark:text-sidebar-foreground`

    return (
      <div 
        onClick={item.onClick || onClose} 
        key={item.id}
      >
        <AMMenuItem
          icon={iconElement}
          isSelected={isSelected}
          link={item.url || undefined}
          target={'_self'}
          disabled={item.disabled}
          component={item.onClick ? 'button' : (SidebarRouterLink as any)}
          className={`${itemClassNames}`}
        >
          <span className="truncate flex-1">{item.title || item.name}</span>
        </AMMenuItem>
      </div>
    )
  })
}

export default function SidebarLayout({ onClose }: { onClose?: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const { theme } = useTheme()
  const [showLogoutModal, setShowLogoutModal] = React.useState(false)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = React.useCallback(() => {
    setShowLogoutModal(true)
  }, [])

  const confirmLogout = React.useCallback(async () => {
    setIsLoggingOut(true)
    try {
      // Add your logout logic here (clear tokens, call API, etc.)
      // For now, just navigate to login
      navigate('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }, [navigate])

  const cancelLogout = React.useCallback(() => {
    setShowLogoutModal(false)
  }, [])

  // Update the logout item in sidebar content to use the handler
  const sidebarContent = React.useMemo(() => {
    return SidebarContent.map(section => ({
      ...section,
      children: section.children?.map(item => 
        item.id === 'logout' 
          ? { ...item, onClick: handleLogout }
          : item
      )
    }))
  }, [handleLogout])

  const sidebarMode = theme === 'light' || theme === 'dark' ? theme : undefined

  return (
    <>
      <AMSidebar
        collapsible="none"
        animation={true}
        showProfile={false}
        width={'270px'}
        showTrigger={false}
        mode={sidebarMode}
        className="fixed left-0 top-0 border border-border bg-sidebar z-10 h-screen"
      >
        <div className="px-6 flex items-center brand-logo overflow-hidden">
          <AMLogo component={SidebarRouterLink as any} href="/" img="">
            <FullLogo />
          </AMLogo>
        </div>

        <SimpleBar className="h-[calc(100vh-80px)]">
          <div className="px-6 py-2">
            {sidebarContent.map((section, index) => (
              <div key={index}>
                {renderSidebarItems(
                  [
                    ...(section.heading
                      ? ([{ id: `heading-${index}`, heading: section.heading, name: section.heading }] as any)
                      : []),
                    ...((section.children || []) as any),
                  ],
                  pathname,
                  onClose,
                )}
              </div>
            ))}
          </div>
        </SimpleBar>
      </AMSidebar>

      <LogoutConfirmDialog
        open={showLogoutModal}
        confirming={isLoggingOut}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </>
  )
}
