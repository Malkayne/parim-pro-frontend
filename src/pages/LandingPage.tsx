import { useNavigate } from 'react-router-dom'
import { Button } from 'src/components/ui/button'
import logo from 'src/assets/images/logos/logo-icon.svg'
import landingBg from 'src/assets/images/landing-bg.png'

export default function LandingPage() {
    const navigate = useNavigate()

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-background font-sans text-foreground">
            {/* Background with subtle animation */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000 hover:scale-105"
                style={{ backgroundImage: `url(${landingBg})` }}
            />

            {/* Dynamic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent backdrop-blur-[2px]" />

            {/* Content */}
            <div className="relative z-10 flex min-h-screen flex-col px-6 py-12 lg:px-24">
                {/* Navbar */}
                <header className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Parim Pro Logo" className="h-10 w-10 drop-shadow-lg" />
                        <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">Parim Pro</span>
                    </div>
                    <div className="hidden space-x-4 sm:flex">
                        <Button
                            variant="outline"
                            className="border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                            onClick={() => navigate('/auth/login')}
                        >
                            Sign In
                        </Button>
                        <Button
                            className="bg-primary text-white shadow-xl hover:bg-primary/90"
                            onClick={() => navigate('/auth/register')}
                        >
                            Get Started
                        </Button>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex flex-1 flex-col justify-center max-w-2xl px-4 sm:px-0">
                    <div className="space-y-6">
                        <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md">
                            Streamline Your Event Management
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl drop-shadow-2xl">
                            Precision <br />
                            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Attendance</span> <br />
                            Tracking.
                        </h1>
                        <p className="max-w-md text-lg text-white/70 leading-relaxed drop-shadow-sm">
                            The ultimate platform for event managers to handle staff registration,
                            live attendance tracking, and reporting with ease.
                        </p>
                        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                            <Button
                                size="lg"
                                className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-2xl transition-all hover:translate-y-[-2px]"
                                onClick={() => navigate('/auth/register')}
                            >
                                Start for Free
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 text-lg font-semibold border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all hover:translate-y-[-2px]"
                                onClick={() => navigate('/auth/login')}
                            >
                                Log In
                            </Button>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="mt-auto pt-12 border-t border-white/10">
                    {/* <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-sm text-white/40 italic">
                            Built for professionals, by professionals.
                        </p>
                        <div className="flex items-center gap-6 text-sm font-medium text-white/60">
                            <span className="hover:text-white cursor-pointer transition-colors">Documentation</span>
                            <span className="hover:text-white cursor-pointer transition-colors">Features</span>
                            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                        </div>
                    </div> */}
                    <div className="mt-8 text-center text-xs text-white/20">
                        &copy; {new Date().getFullYear()} Parim Pro. All rights reserved.
                    </div>
                </footer>
            </div>
        </div>
    )
}
