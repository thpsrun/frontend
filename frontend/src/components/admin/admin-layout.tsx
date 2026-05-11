import { SidebarLayout, type NavGroup } from "@/components/layout/sidebar-layout"

const NAV_GROUPS: ReadonlyArray<NavGroup> = [
    {
        heading: "-- Admin --",
        items: [
            { label: "Sync Logs", to: "/admin/sync-logs" },
            { label: "Game Display", to: "/admin/game-display" },
            { label: "THPSBot Status", to: "/admin/bot-session" },
            { label: "Reconcile", to: "/admin/reconcile" },
        ],
    },
    {
        heading: "-- Content --",
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
