import { Outlet } from 'react-router-dom'
import Sidebar from './vertical/sidebar/Sidebar.tsx'
import Header from './vertical/header/Header.tsx'

export default function FullLayout() {
  return (
    <div className="flex w-full min-h-screen bg-background text-foreground">
      <div className="page-wrapper flex w-full">
        <div className="hidden xl:block">
          <Sidebar />
        </div>

        <div className="body-wrapper w-full">
          <Header />

          <div className="container mx-auto px-6 py-6">
            <main className="grow">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
