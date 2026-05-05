import { type ReactNode } from "react"
import { NavLink, Outlet, Navigate, useLocation } from "react-router"
import { Panel } from "@/components/ui/panel"
import { cn } from "@/lib/utils"

export interface NavItem {
    label: string
    to: string
}

export interface NavGroup {
    heading: string
    items: ReadonlyArray<NavItem>
}

interface Props {
    navGroups: ReadonlyArray<NavGroup>
    indexPath: string
    redirectTo: string
    maxWidth: "max-w-200" | "max-w-300"
    mobileExtras?: ReactNode
    desktopExtras?: ReactNode
}

const linkBase = cn(
    "rounded-md px-3 py-2 text-sm transition-colors",
    "whitespace-nowrap",
)
const activeClass = "bg-muted font-medium text-foreground"
const inactiveClass = cn(
    "text-muted-foreground",
    "hover:bg-muted/50 hover:text-foreground",
)

function navLinkClass({ isActive }: { isActive: boolean }) {
    return cn(linkBase, isActive ? activeClass : inactiveClass)
}

export function SidebarLayout({
    navGroups,
    indexPath,
    redirectTo,
    maxWidth,
    mobileExtras,
    desktopExtras,
}: Props) {
    const location = useLocation()

    if (location.pathname === indexPath) {
        return <Navigate to={redirectTo} replace />
    }

    return (
        <div className="flex justify-center px-4 pt-12">
            <div className={cn(
                "w-full",
                maxWidth,
                "flex flex-col lg:flex-row gap-6",
            )}>
                <nav className="lg:hidden">
                    <Panel className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 p-2">
                        {navGroups.map((group) => (
                            <div key={group.heading} className="flex flex-col gap-1 min-w-max">
                                <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                                    {group.heading}
                                </div>
                                <div className="flex gap-1.5">
                                    {group.items.map((item) => (
                                        <NavLink key={item.to} to={item.to} className={navLinkClass}>
                                            {item.label}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {mobileExtras}
                    </Panel>
                </nav>

                <nav className="hidden lg:flex lg:flex-col lg:w-55 lg:sticky lg:top-6 lg:self-start shrink-0">
                    <Panel className="flex flex-col p-2 gap-0.5">
                        {navGroups.map((group) => (
                            <div key={group.heading} className="flex flex-col gap-0.5 mb-1">
                                <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                                    {group.heading}
                                </div>
                                {group.items.map((item) => (
                                    <NavLink key={item.to} to={item.to} className={navLinkClass}>
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        ))}
                        {desktopExtras}
                    </Panel>
                </nav>

                <div className="flex-1 min-w-0">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
