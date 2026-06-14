import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"
import { useSession } from "@/hooks/auth/useSession"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useLogout } from "@/hooks/auth/useLogout"
import { useUnreadCount } from "@/hooks/notifications/useUnreadCount"
import { BACKEND_URL } from "@/constants"
import { cn, getErrorMessage } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { GradientUsername } from "@/components/profile/gradient-username"
import { NotificationsMenu } from "@/components/notifications/notifications-menu"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { UserIcon } from "lucide-react"

export function AuthButton() {
    const { isAuthenticated, isLoading } = useSession()
    const { player } = useCurrentPlayer()
    const logout = useLogout()
    const navigate = useNavigate()
    const unread = useUnreadCount().data?.count ?? 0
    const [menuOpen, setMenuOpen] = useState(false)

    if (isLoading) return null

    if (!isAuthenticated) {
        return (
            <Button variant="outline" asChild>
                <Link to="/login">Register / Login</Link>
            </Button>
        )
    }

    const displayName =
        player?.player.nickname ?? player?.player.name ?? player?.player.username ?? "User"
    const playerProfile = `/player/${displayName}`
    const avatarUrl = player?.player.pfp
        ? `${BACKEND_URL}${player.player.pfp}`
        : null

    const handleLogout = async () => {
        try {
            await logout.mutateAsync()
            toast.success("Logged Out Successfully.")
            navigate("/")
        } catch (err) {
            console.error("Logout Failed:", err)
            toast.error(getErrorMessage(err, "Logout Failed. Please Try Again..."))
        }
    }

    return (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} dir="rtl">
            <DropdownMenuTrigger asChild>
                <button className={cn(
                    "flex items-center gap-2 rounded-md",
                    "px-2 py-1 hover:bg-accent",
                    "transition-colors",
                )}>
                    <span className="relative inline-flex">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                className="size-6 rounded-full object-cover"
                            />
                        ) : (
                            <UserIcon className="size-6 text-muted-foreground" />
                        )}
                        {unread > 0 && (
                            <span
                                aria-label={`${unread} unread notifications`}
                                className={cn(
                                    "absolute -top-0.5 -right-0.5 size-2",
                                    "rounded-full bg-red-500 ring-2 ring-background",
                                )}
                            />
                        )}
                    </span>
                    <GradientUsername
                        name={displayName}
                        gradients={player?.customizations ?? null}
                        className="text-sm font-medium"
                    />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" dir="ltr" className="w-56">
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
                <DropdownMenuItem asChild>
                    <Link to="/profile/content/guides">
                        My Guides & Runs
                    </Link>
                </DropdownMenuItem>
                <NotificationsMenu onItemSelected={() => setMenuOpen(false)} />
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
