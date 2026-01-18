export interface SidebarItem {
  heading?: string
  id: string
  name: string
  title?: string
  icon?: string
  url?: string
  children?: SidebarItem[]
  disabled?: boolean
  isPro?: boolean
  onClick?: () => void
}

export interface SidebarSection {
  heading?: string
  children?: SidebarItem[]
}

const SidebarContent: SidebarSection[] = [
  {
    heading: 'Home',
    children: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        title: 'Dashboard',
        icon: 'solar:widget-2-linear',
        url: '/',
      },
    ],
  },
  {
    heading: 'Management',
    children: [
      {
        id: 'events',
        name: 'Events',
        title: 'Events',
        icon: 'solar:calendar-linear',
        url: '/events',
      },
      {
        id: 'attendance',
        name: 'Attendance',
        title: 'Attendance',
        icon: 'solar:clipboard-check-linear',
        url: '/attendance',
      },
      {
        id: 'trainings',
        name: 'Trainings',
        title: 'Trainings',
        icon: 'solar:book-bookmark-linear',
        url: '/trainings',
      },
      {
        id: 'reports',
        name: 'Reports',
        title: 'Reports',
        icon: 'solar:file-text-linear',
        url: '/reports',
      },
    ],
  },
  {
    heading: 'Profile',
    children: [
      {
        id: 'settings',
        name: 'Settings',
        title: 'Settings',
        icon: 'solar:settings-linear',
        url: '/settings',
      },
      {
        id: 'logout',
        name: 'Logout',
        title: 'Logout',
        icon: 'solar:logout-linear',
      }
    ],
  },
]

export default SidebarContent
