import "./App.css"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { TopBar } from "@/components/layout/top-bar"
import { Footer } from "@/components/layout/footer"
import { ErrorBoundary } from "@/components/layout/error-boundary"
import { Outlet } from "react-router"

function App() {
    return (
        <ThemeProvider defaultTheme="dark">
            <div className="hero-container">
                <div className="background-image" />
                <div className="background-overlay" />

                <div className="w-full min-h-full max-w-[100rem] mx-auto p-12 flex flex-col gap-8">
                    <TopBar />
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                    <Footer />
                </div>
            </div>
        </ThemeProvider>
    )
}

export default App
