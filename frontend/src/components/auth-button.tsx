import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router"
import { useAuth } from "@/hooks/useAuth"
import { BACKEND_URL } from "@/constants"
import { Button } from "@/components/ui/button"
import { UserIcon } from "lucide-react"

export function AuthButton() {
    const { player, isAuthenticated, isLoading, logout } = useAuth()
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [showLogoutMsg, setShowLogoutMsg] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Redirect to / after showing logout message
    useEffect(() => {
        if (!showLogoutMsg) return
        const timer = setTimeout(() => {
            setShowLogoutMsg(false)
            navigate("/")
        }, 2000)
        return () => clearTimeout(timer)
    }, [showLogoutMsg, navigate])

    // Close dropdown on outside click or Escape
    useEffect(() => {
        if (!dropdownOpen) return

        function handleClickOutside(e: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setDropdownOpen(false)
            }
        }

        function handleEscape(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleEscape)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [dropdownOpen])

    if (isLoading) {
        return null
    }

    if (showLogoutMsg) {
        return (
            <div className="relative">
                <div className="rounded-md border bg-popover px-4 py-2 text-sm shadow-md">
                    Logout Successful!
                </div>
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

    const displayName = player?.name ?? player?.username ?? "User"
    const playerProfile = "/player/" + displayName
    const avatarUrl = player?.pfp
        ? `${BACKEND_URL}${player.pfp}`
        : null

    const handleLogout = async () => {
        setDropdownOpen(false)
        try {
            await logout.mutateAsync()
            setShowLogoutMsg(true)
        } catch (err) {
            console.error("Logout failed:", err)
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent transition-colors"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
            >
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={displayName}
                        className="size-6 rounded-full object-cover"
                    />
                ) : (
                    <UserIcon className="size-6 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">{displayName}</span>
            </button>

            {dropdownOpen && (
                <div
                    className="absolute right-0 top-full mt-1 w-40 rounded-md border bg-popover shadow-md z-50"
                    role="menu"
                >
                    <Link
                        to={playerProfile}
                        className="block px-4 py-2 text-sm hover:bg-accent rounded-t-md"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                    >
                        Player Profile
                    </Link>
                    <Link
                        to="/profile/settings"
                        className="block px-4 py-2 text-sm hover:bg-accent rounded-t-md"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                    >
                        Edit Profile
                    </Link>
                    <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent rounded-b-md text-destructive"
                        role="menuitem"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    )
}
