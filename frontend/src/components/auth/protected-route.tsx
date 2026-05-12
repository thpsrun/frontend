import { Navigate, Outlet, useLocation } from "react-router"
import { useSession } from "@/hooks/auth/useSession"
import { Loader2 } from "lucide-react"

export function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useSession()
    const location = useLocation()

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
                state={{ from: location.pathname + location.search }}
            />
        )
    }

    return <Outlet />
}
