import { useLocation } from "react-router"
import { SidebarLayout, type NavGroup } from "@/components/layout/sidebar-layout"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { sectionTitle } from "@/lib/page-title"

const NAV_GROUPS: ReadonlyArray<NavGroup> = [
    {
        heading: "Admin",
        items: [
            { label: "Sync Logs", to: "/admin/sync-logs" },
            { label: "User Management", to: "/admin/users" },
        ],
    },
    {
        heading: "Site Management",
        items: [
            { label: "Game Display", to: "/admin/game-display" },
            { label: "Navbar", to: "/admin/navbar" },
            { label: "THPSBot Status", to: "/admin/thpsbot" },
            { label: "Reconcile", to: "/admin/reconcile" },
        ],
    },
    {
        heading: "Content Management",
        items: [
            { label: "Tags", to: "/admin/tags" },
        ],
    },
]

// Maps the first path segment after /admin to the document-title suffix (sectionTitle
// falls back to plain "Admin" for unknown segments).
const ADMIN_LABELS: Record<string, string> = {
    "sync-logs": "Sync Logs",
    thpsbot: "Bot",
    reconcile: "Reconcile",
    tags: "Tags",
    navbar: "Navbar",
    "game-display": "Game Display",
    users: "Users",
}

export function AdminLayout() {
    const { pathname } = useLocation()
    useDocumentTitle(sectionTitle(pathname, "/admin", "Admin", ADMIN_LABELS))
    return (
        <SidebarLayout
            navGroups={NAV_GROUPS}
            indexPath="/admin"
            redirectTo="/admin/sync-logs"
            maxWidth="max-w-300"
        />
    )
}
