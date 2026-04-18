import { NavLink, Outlet, Navigate, useLocation } from "react-router"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
    { label: "General", to: "/profile/settings/general" },
    { label: "Customization", to: "/profile/settings/customization" },
    { label: "Social Media", to: "/profile/settings/social" },
    { label: "Security", to: "/profile/settings/security" },
] as const

const DANGER_ITEM = {
    label: "Danger Zone",
    to: "/profile/settings/danger",
} as const

const sidebarPanel = cn(
    "rounded-lg border border-border/40",
    "bg-background/70 backdrop-blur-sm",
    "shadow-sm",
)

const linkBase = cn(
    "rounded-md px-3 py-2 text-sm transition-colors",
    "whitespace-nowrap",
)

const activeClass = "bg-muted font-medium text-foreground"
const inactiveClass = cn(
    "text-muted-foreground",
    "hover:bg-muted/50 hover:text-foreground",
)

export function ProfileSettingsLayout() {
    const location = useLocation()

    if (location.pathname === "/profile/settings") {
        return <Navigate to="/profile/settings/general" replace />
    }

    return (
        <div className="flex justify-center px-4 pt-12">
            <div className={cn(
                "w-full max-w-200",
                "flex flex-col lg:flex-row gap-6",
            )}>
                <nav className={cn(
                    "lg:hidden flex gap-1.5 overflow-x-auto",
                    "pb-1 -mb-1",
                    sidebarPanel,
                    "p-2",
                )}>
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => cn(
                                linkBase,
                                isActive
                                    ? activeClass
                                    : inactiveClass,
                            )}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                    <NavLink
                        to={DANGER_ITEM.to}
                        className={({ isActive }) => cn(
                            linkBase,
                            isActive
                                ? "bg-destructive/10 font-medium text-destructive"
                                : "text-destructive/70 hover:bg-destructive/10 hover:text-destructive",
                        )}
                    >
                        {DANGER_ITEM.label}
                    </NavLink>
                </nav>

                <nav className={cn(
                    "hidden lg:flex lg:flex-col",
                    "lg:w-55 lg:sticky lg:top-6 lg:self-start",
                    "shrink-0",
                    sidebarPanel,
                    "p-2 gap-0.5",
                )}>
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => cn(
                                linkBase,
                                isActive
                                    ? activeClass
                                    : inactiveClass,
                            )}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                    <div className="my-2 border-t border-border/40" />
                    <NavLink
                        to={DANGER_ITEM.to}
                        className={({ isActive }) => cn(
                            linkBase,
                            isActive
                                ? "bg-destructive/10 font-medium text-destructive"
                                : "text-destructive/70 hover:bg-destructive/10 hover:text-destructive",
                        )}
                    >
                        {DANGER_ITEM.label}
                    </NavLink>
                </nav>

                <div className="flex-1 min-w-0">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
