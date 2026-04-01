import "./App.css"
import { TopBar } from "@/components/layout/top-bar"
import { Footer } from "@/components/layout/footer"
import { ErrorBoundary } from "@/components/layout/error-boundary"
import { Outlet, useLocation } from "react-router"

function App() {
    const { pathname } = useLocation()

    return (
        <div className="hero-container">
            <div className="background-image" />
            <div className="background-overlay" />

            <div className="w-full min-h-full max-w-[100rem] mx-auto p-12 flex flex-col gap-8">
                <TopBar />
                <ErrorBoundary key={pathname}>
                    <Outlet />
                </ErrorBoundary>
                <Footer />
            </div>
        </div>
    )
}

export default App
