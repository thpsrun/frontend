import { SidebarLayout, type NavGroup } from "@/components/layout/sidebar-layout"

const NAV_GROUPS: ReadonlyArray<NavGroup> = [
    {
        heading: "ADMIN",
        items: [
            { label: "Sync Logs", to: "/admin/sync-logs" },
            { label: "Users", to: "/admin/users" },
            { label: "Game Display", to: "/admin/game-display" },
            { label: "THPSBot Status", to: "/admin/bot-session" },
            { label: "Reconcile", to: "/admin/reconcile" },
        ],
    },
    {
        heading: "CONTENT",
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
