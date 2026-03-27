import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router"
import { useAuth } from "@/hooks/auth/useAuth"
import { BACKEND_URL } from "@/constants"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { UserIcon } from "lucide-react"

export function AuthButton() {
    const {
        player, isAuthenticated, isLoading, logout,
    } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showLogoutMsg, setShowLogoutMsg] = useState(false)
    // Track the path at logout time so we can cancel the
    // redirect if the user navigates away during the delay
    const logoutPathRef = useRef(location.pathname)

    useEffect(() => {
        if (!showLogoutMsg) return
        logoutPathRef.current = location.pathname
        const timer = setTimeout(() => {
            setShowLogoutMsg(false)
            if (location.pathname === logoutPathRef.current) {
                navigate("/")
            }
        }, 2000)
        return () => clearTimeout(timer)
    }, [showLogoutMsg, navigate, location.pathname])

    if (isLoading) return null

    if (showLogoutMsg) {
        return (
            <div className={cn(
                "rounded-md border bg-popover",
                "px-4 py-2 text-sm shadow-md",
                "animate-in fade-in-0 duration-200",
            )}>
                Logout Successful!
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <Button variant="outline" asChild>
                <Link to="/login">Register / Login</Link>
            </Button>
        )
    }

    const displayName =
        player?.name ?? player?.username ?? "User"
    const playerProfile = `/player/${displayName}`
    const avatarUrl = player?.pfp
        ? `${BACKEND_URL}${player.pfp}`
        : null

    const handleLogout = async () => {
        try {
            await logout.mutateAsync()
            setShowLogoutMsg(true)
        } catch (err) {
            console.error("Logout failed:", err)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn(
                    "flex items-center gap-2 rounded-md",
                    "px-2 py-1 hover:bg-accent",
                    "transition-colors",
                )}>
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="size-6 rounded-full object-cover"
                        />
                    ) : (
                        <UserIcon className="size-6 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                        {displayName}
                    </span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                    <Link to={playerProfile}>
                        Player Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to="/profile/settings">
                        Edit Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive"
                    onSelect={handleLogout}
                >
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
