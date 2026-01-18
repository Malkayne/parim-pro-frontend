import { Icon } from '@iconify/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu'
import { Button } from 'src/components/ui/button'

const items = [
  { title: 'New event created', subtitle: 'An event was added recently' },
  { title: 'Attendance updated', subtitle: 'Attendance list changed' },
]

export default function Messages() {
  return (
    <div className="relative group/menu px-4 sm:px-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="relative">
            <span className="relative after:absolute after:w-10 after:h-10 after:rounded-full hover:text-primary after:-top-1/2 hover:after:bg-lightprimary text-foreground dark:text-muted-foreground rounded-full flex justify-center items-center cursor-pointer group-hover/menu:after:bg-lightprimary group-hover/menu:!text-primary">
              <Icon icon="tabler:bell-ringing" height={20} />
            </span>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-screen sm:w-[320px] py-4">
          <div className="flex items-center px-4 justify-between">
            <h3 className="mb-0 text-lg font-semibold">Notifications</h3>
          </div>

          <div className="mt-2">
            {items.map((it, idx) => (
              <DropdownMenuItem key={idx} className="px-4 py-3 flex flex-col items-start">
                <div className="text-sm font-medium">{it.title}</div>
                <div className="text-xs text-muted-foreground">{it.subtitle}</div>
              </DropdownMenuItem>
            ))}
          </div>

          <div className="pt-3 px-4">
            <Button variant={'outline'} className="w-full">
              View all
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
