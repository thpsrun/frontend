import "./App.css"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Footer } from "@/components/layout/footer"
import { ErrorBoundary } from "@/components/layout/error-boundary"
import { Outlet, useLocation } from "react-router"
import { Toaster } from "sonner"
import { useMfaGate } from "@/lib/mfa-gate"
import { MfaSetupGate } from "@/components/auth/mfa-setup-gate"
import { CookieConsentBanner } from "@/components/common/cookie-consent-banner"

function App() {
    const { pathname } = useLocation()
    const gated = useMfaGate()

    return (
        <div className="hero-container">
            <div className="background-image" />
            <div className="background-overlay" />

            {gated ? (
                <MfaSetupGate />
            ) : (
                <>
                    <a
                        href="#main"
                        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow"
                    >
                        Skip to Content
                    </a>
                    <div className="w-full min-h-full max-w-400 mx-auto p-4 md:p-12 flex flex-col gap-4 md:gap-8 pb-[calc(env(safe-area-inset-bottom)+5rem)] lg:pb-12">
                        <TopBar />
                        <main id="main">
                            <ErrorBoundary key={pathname}>
                                <Suspense
                                    fallback={
                                        <div className="flex justify-center p-8 text-muted-foreground">
                                            <Loader2 className="size-5 animate-spin" />
                                        </div>
                                    }
                                >
                                    <Outlet />
                                </Suspense>
                            </ErrorBoundary>
                        </main>
                        <Footer />
                    </div>
                    <BottomNav />
                </>
            )}

            <Toaster richColors theme="dark" />
            <CookieConsentBanner />
        </div>
    )
}

export default App
