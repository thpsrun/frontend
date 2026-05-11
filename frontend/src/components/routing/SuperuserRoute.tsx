import { useEffect, useRef } from "react"
import { Navigate, Outlet } from "react-router"
import { toast } from "sonner"
import { useSession } from "@/hooks/auth/useSession"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"

export function SuperuserRoute() {
    const { isAuthenticated, isLoading: sessionLoading } = useSession()
    const { player, isLoading: profileLoading } = useCurrentPlayer()
    const toasted = useRef(false)

    // While the session is still resolving, the profile query is gated by
    // `enabled: isAuthenticated` and reports isLoading=false even though we
    // don't yet know whether the user is signed in. Wait for the session
    // first, then for the profile when authenticated.
    const isLoading = sessionLoading || (isAuthenticated && profileLoading)
    const allowed = !!player?.player.is_superuser

    useEffect(() => {
        if (!isLoading && !allowed && !toasted.current) {
            toasted.current = true
            toast.error("Admin only.")
        }
    }, [isLoading, allowed])

    if (isLoading) return null
    if (!allowed) return <Navigate to="/" replace />
    return <Outlet />
}
