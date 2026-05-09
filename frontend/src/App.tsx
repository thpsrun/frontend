import "./App.css"
import { TopBar } from "@/components/layout/top-bar"
import { Footer } from "@/components/layout/footer"
import { ErrorBoundary } from "@/components/layout/error-boundary"
import { Outlet, useLocation } from "react-router"
import { Toaster } from "sonner"

function App() {
    const { pathname } = useLocation()

    return (
        <div className="hero-container">
            <div className="background-image" />
            <div className="background-overlay" />

            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow"
            >
                Skip to content
            </a>
            <div className="w-full min-h-full max-w-400 mx-auto p-4 md:p-12 flex flex-col gap-4 md:gap-8">
                <TopBar />
                <main id="main">
                    <ErrorBoundary key={pathname}>
                        <Outlet />
                    </ErrorBoundary>
                </main>
                <Footer />
            </div>

            <Toaster richColors theme="dark" />
        </div>
    )
}

export default App
