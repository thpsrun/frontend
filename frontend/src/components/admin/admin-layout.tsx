import { SidebarLayout, type NavGroup } from "@/components/layout/sidebar-layout"

const NAV_GROUPS: ReadonlyArray<NavGroup> = [
    {
        heading: "Submissions",
        items: [
            { label: "Sync Logs", to: "/admin/sync-logs" },
        ],
    },
    {
        heading: "Content",
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
