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

    const logoutPathRef = useRef(location.pathname)

    // Shows the logout banner for 2s, then redirects them home automatically.
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
        player?.player.name ?? player?.player.username ?? "User"
    const playerProfile = `/player/${displayName}`
    const avatarUrl = player?.player.pfp
        ? `${BACKEND_URL}${player.player.pfp}`
        : null

    const handleLogout = async () => {
        try {
            await logout.mutateAsync()
            setShowLogoutMsg(true)
        } catch (err) {
            console.error("Logout Failed:", err)
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

            <DropdownMenuContent align="end" className="w-48">
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
                <DropdownMenuItem asChild>
                    <Link to="/submissions" className="flex items-center gap-2">
                        Submissions Hub
                    </Link>
                </DropdownMenuItem>

                {/* This should only be proc'd when the user is a Django super admin;
                the root account would need to set this per user, and should only be
                given to super moderators and trusted peeps.*/}
                {player?.player.is_superuser && (
                    <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2">
                            Admin Hub
                        </Link>
                    </DropdownMenuItem>
                )}
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
