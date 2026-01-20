import { useCallback, useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { useTheme } from 'src/components/provider/theme-provider'
import { Sheet, SheetContent, SheetTitle } from 'src/components/ui/sheet'

import SidebarLayout from '../sidebar/Sidebar'
import FullLogo from '../../shared/logo/FullLogo'
import Messages from './Messages'
import Profile from './Profile'
import Search from './Search'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [isSticky, setIsSticky] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleScroll = useCallback(() => {
    setIsSticky(window.scrollY > 50)
  }, [])

  const handleResize = useCallback(() => {
    if (window.innerWidth > 1023) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [handleResize, handleScroll])

  const toggleMode = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <>
      <header
        className={`sticky top-0 z-[2] ${isSticky ? 'bg-background/95 backdrop-blur shadow-sm' : 'bg-transparent'
          }`}
      >
        <nav className="rounded-none bg-transparent py-4 px-6 !max-w-full flex justify-between items-center border-b border-border">
          <span
            onClick={() => setIsOpen(true)}
            className="px-[15px] hover:text-primary text-foreground relative after:absolute after:w-10 after:h-10 after:rounded-full hover:after:bg-lightprimary after:bg-transparent rounded-full xl:hidden flex justify-center items-center cursor-pointer"
          >
            <Icon icon="tabler:menu-2" height={20} />
          </span>

          <div className="hidden xl:flex items-center gap-2 w-[420px]">
            <Search />
          </div>

          <div className="block xl:hidden">
            <FullLogo />
          </div>

          <div className="flex items-center">
            <div
              className="hover:text-primary px-2 group focus:ring-0 rounded-full flex justify-center items-center cursor-pointer text-foreground dark:text-muted-foreground relative"
              onClick={toggleMode}
            >
              <span className="flex items-center justify-center relative after:absolute after:w-10 after:h-10 after:rounded-full after:-top-1/2 group-hover:after:bg-lightprimary">
                {theme === 'light' ? (
                  <Icon icon="tabler:moon" width="20" />
                ) : (
                  <Icon icon="solar:sun-bold-duotone" width="20" className="group-hover:text-primary" />
                )}
              </span>
            </div>

            {/* <Messages /> */}
            <Profile />
          </div>
        </nav>
      </header>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <VisuallyHidden>
            <SheetTitle>sidebar</SheetTitle>
          </VisuallyHidden>
          <SidebarLayout onClose={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
