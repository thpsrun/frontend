import { SidebarLayout, type NavGroup } from "@/components/layout/sidebar-layout"

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

export function AdminLayout() {
    return (
        <SidebarLayout
            navGroups={NAV_GROUPS}
            indexPath="/admin"
            redirectTo="/admin/sync-logs"
            maxWidth="max-w-300"
        />
    )
}
