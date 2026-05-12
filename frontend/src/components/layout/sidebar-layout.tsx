import { type ReactNode } from "react"
import {
    NavLink,
    Outlet,
    Navigate,
    useLocation,
    useNavigate,
} from "react-router"
import { Panel } from "@/components/ui/panel"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
    maxWidth: "max-w-200" | "max-w-300" | "max-w-5xl"
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

interface MobileSelectItem {
    label: string
    to: string
    danger?: boolean
}

interface MobileSelectGroup {
    heading: string
    items: MobileSelectItem[]
}

interface MobileSectionSelectProps {
    groups: MobileSelectGroup[]
    currentPath: string
}

function MobileSectionSelect({
    groups,
    currentPath,
}: MobileSectionSelectProps) {
    const navigate = useNavigate()
    const allItems = groups.flatMap((g) => g.items)
    const active = allItems.find((i) => i.to === currentPath)
    return (
        <Select
            value={active?.to ?? ""}
            onValueChange={(to) => navigate(to)}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a section" />
            </SelectTrigger>
            <SelectContent>
                {groups.map((group, idx) => (
                    <SelectGroup key={`${group.heading}-${idx}`}>
                        <SelectLabel>{group.heading}</SelectLabel>
                        {group.items.map((item) => (
                            <SelectItem
                                key={item.to}
                                value={item.to}
                                className={
                                    item.danger
                                        ? "text-destructive focus:text-destructive"
                                        : undefined
                                }
                            >
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                ))}
            </SelectContent>
        </Select>
    )
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

    const mobileGroups: MobileSelectGroup[] = navGroups.map((g) => ({
        heading: g.heading,
        items: g.items.map((i) => ({ label: i.label, to: i.to })),
    }))

    return (
        <div className="flex justify-center px-4">
            <div className={cn(
                "w-full",
                maxWidth,
                "flex flex-col lg:flex-row gap-6",
            )}>
                <Panel className="lg:hidden flex flex-col gap-2 p-3">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground px-1">
                        Section
                    </span>
                    <MobileSectionSelect
                        groups={mobileGroups}
                        currentPath={location.pathname}
                    />
                    {mobileExtras && (
                        <div className="border-t border-border/40 pt-2">
                            {mobileExtras}
                        </div>
                    )}
                </Panel>

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
