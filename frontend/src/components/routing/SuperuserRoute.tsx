import { useEffect, useRef } from "react"
import { Navigate, Outlet } from "react-router"
import { toast } from "sonner"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"

export function SuperuserRoute() {
    const { player, isLoading } = useCurrentPlayer()
    const toasted = useRef(false)

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
