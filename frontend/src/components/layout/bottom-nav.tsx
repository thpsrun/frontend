import { useState } from "react"
import { Link, useLocation } from "react-router"
import { Home, Gamepad2, Trophy, User, Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { useSession } from "@/hooks/auth/useSession"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { MobileNavSheet } from "@/components/layout/mobile-nav-sheet"
import { GamesPickerSheet } from "@/components/layout/games-picker-sheet"

export function BottomNav() {
    const { pathname } = useLocation()
    const { isAuthenticated } = useSession()
    const { player } = useCurrentPlayer()
    const [moreOpen, setMoreOpen] = useState(false)
    const [gamesOpen, setGamesOpen] = useState(false)

    const displayName =
        player?.player.nickname ?? player?.player.name ?? player?.player.username ?? ""
    const profileTo = isAuthenticated && displayName ? `/player/${displayName}` : "/login"

    const isActive = (to: string) =>
        to === "/" ? pathname === "/" : pathname.startsWith(to)

    const baseTab = cn(
        "flex flex-1 flex-col items-center justify-center gap-1 py-2",
        "text-[10px] text-muted-foreground transition-colors",
    )
    const activeText = "text-foreground"

    return (
        <>
            <nav
                aria-label="primary mobile navigation"
                className={cn(
                    "fixed inset-x-0 bottom-0 z-50 lg:hidden",
                    "flex items-stretch border-t border-border/60 bg-background/95 backdrop-blur",
                    "pb-[env(safe-area-inset-bottom)]",
                )}
            >
                <Link to="/" className={cn(baseTab, isActive("/") && activeText)}>
                    <Home className="size-5" />
                    Home
                </Link>

                <button
                    type="button"
                    onClick={() => setGamesOpen(true)}
                    className={baseTab}
                >
                    <Gamepad2 className="size-5" />
                    Games
                </button>

                <Link
                    to="/rankings"
                    className={cn(baseTab, isActive("/rankings") && activeText)}
                >
                    <Trophy className="size-5" />
                    Rankings
                </Link>

                <Link
                    to={profileTo}
                    className={cn(baseTab, isActive("/player") && activeText)}
                >
                    <User className="size-5" />
                    {isAuthenticated ? "Profile" : "Sign in"}
                </Link>

                <button
                    type="button"
                    onClick={() => setMoreOpen(true)}
                    className={baseTab}
                >
                    <Menu className="size-5" />
                    More
                </button>
            </nav>

            <MobileNavSheet open={moreOpen} onOpenChange={setMoreOpen} />
            <GamesPickerSheet open={gamesOpen} onOpenChange={setGamesOpen} />
        </>
    )
}
