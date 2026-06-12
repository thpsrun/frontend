import { NavLink, useLocation } from "react-router"
import { SidebarLayout, type NavGroup } from "@/components/layout/sidebar-layout"
import { cn } from "@/lib/utils"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { sectionTitle } from "@/lib/page-title"

const NAV_GROUPS: ReadonlyArray<NavGroup> = [
    {
        heading: "Account",
        items: [
            { label: "General", to: "/profile/settings/general" },
            { label: "Notifications", to: "/profile/settings/notifications" },
            { label: "Social Media", to: "/profile/settings/social" },
            { label: "Security", to: "/profile/settings/security" },
            { label: "SRC API", to: "/profile/settings/src-api" },
        ],
    },
    {
        heading: "Developer",
        items: [
            { label: "API Keys", to: "/profile/settings/api-keys" },
        ],
    },
]

const SETTINGS_LABELS: Record<string, string> = {
    general: "General",
    notifications: "Notifications",
    social: "Social",
    security: "Security",
    "src-api": "Speedrun.com API",
    "api-keys": "API Keys",
    danger: "Danger Zone",
}

// Danger Zone is kept out of NAV_GROUPS and rendered through the extras slots so it can sit
// visually separated below the regular items and use destructive link styling.
const DANGER_ITEM = {
    label: "Danger Zone",
    to: "/profile/settings/danger",
} as const

const dangerLinkClass = ({ isActive }: { isActive: boolean }) => cn(
    "rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap",
    isActive
        ? "bg-destructive/10 font-medium text-destructive"
        : "text-destructive/70 hover:bg-destructive/10 hover:text-destructive",
)

export function ProfileSettingsLayout() {
    const { pathname } = useLocation()
    useDocumentTitle(
        sectionTitle(pathname, "/profile/settings", "Settings", SETTINGS_LABELS),
    )
    return (
        <SidebarLayout
            navGroups={NAV_GROUPS}
            indexPath="/profile/settings"
            redirectTo="/profile/settings/general"
            maxWidth="max-w-200"
            mobileExtras={
                <NavLink to={DANGER_ITEM.to} className={dangerLinkClass}>
                    {DANGER_ITEM.label}
                </NavLink>
            }
            desktopExtras={
                <>
                    <div className="my-2 border-t border-border/40" />
                    <NavLink to={DANGER_ITEM.to} className={dangerLinkClass}>
                        {DANGER_ITEM.label}
                    </NavLink>
                </>
            }
        />
    )
}
