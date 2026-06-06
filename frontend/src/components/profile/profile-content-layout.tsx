import { useLocation } from "react-router"
import { SidebarLayout, type NavGroup } from "@/components/layout/sidebar-layout"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { sectionTitle } from "@/lib/page-title"

const NAV_GROUPS: ReadonlyArray<NavGroup> = [
    {
        heading: "Content",
        items: [
            { label: "Guides", to: "/profile/content/guides" },
            { label: "Runs", to: "/profile/content/runs" },
        ],
    },
]

const CONTENT_LABELS: Record<string, string> = {
    guides: "Guides",
    runs: "Runs",
}

export function ProfileContentLayout() {
    const { pathname } = useLocation()
    useDocumentTitle(
        sectionTitle(pathname, "/profile/content", "Content", CONTENT_LABELS),
    )
    return (
        <SidebarLayout
            navGroups={NAV_GROUPS}
            indexPath="/profile/content"
            redirectTo="/profile/content/guides"
            maxWidth="max-w-300"
        />
    )
}
