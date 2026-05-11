import { SidebarLayout, type NavGroup } from "@/components/layout/sidebar-layout"

const NAV_GROUPS: ReadonlyArray<NavGroup> = [
    {
        heading: "Content",
        items: [
            { label: "Guides", to: "/profile/content/guides" },
        ],
    },
]

export function ProfileContentLayout() {
    return (
        <SidebarLayout
            navGroups={NAV_GROUPS}
            indexPath="/profile/content"
            redirectTo="/profile/content/guides"
            maxWidth="max-w-5xl"
        />
    )
}
