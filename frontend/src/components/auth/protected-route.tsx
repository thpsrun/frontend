import { Navigate, Outlet, useLocation } from "react-router"
import { useSession } from "@/hooks/auth/useSession"
import { Loader2 } from "lucide-react"

export function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useSession()
    const location = useLocation()

    // Hold rendering until the session query settles; redirecting while it's still loading
    // would bounce already-authenticated users to /login on every hard refresh.
    if (isLoading) {
        return (
            <div className="flex justify-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                // The login page reads state.from to send the user back here after login.
                state={{ from: location.pathname + location.search }}
            />
        )
    }

    return <Outlet />
}
