import { useState } from "react"
import { Link } from "react-router"
import { ChevronRight } from "lucide-react"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useNavbar } from "@/hooks/home/useNavbar"
import type { NavItem } from "@/types/api"
import { cn } from "@/lib/utils"

function isExternalUrl(url: string): boolean {
    return (
        url.startsWith("http://") ||
        url.startsWith("https://")
    )
}

function NavItemLink({
    item,
    className,
}: {
    item: NavItem
    className?: string
}) {
    if (!item.url) {
        return <span className={className}>{item.name}</span>
    }

    if (isExternalUrl(item.url)) {
        return (
            <NavigationMenuLink asChild>
                <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                >
                    {item.name}
                </a>
            </NavigationMenuLink>
        )
    }

    return (
        <NavigationMenuLink asChild>
            <Link to={item.url} className={className}>
                {item.name}
            </Link>
        </NavigationMenuLink>
    )
}

function NavItemList({
    items,
    onFlyout,
    activeFlyout,
}: {
    items: NavItem[]
    onFlyout: (item: NavItem | null) => void
    activeFlyout: NavItem | null
}) {
    return (
        <ul className="grid gap-0.5">
            {items.map(item => {
                const hasChildren = item.children.length > 0

                // Group header - children but no URL
                if (hasChildren && !item.url) {
                    return (
                        <li
                            key={item.name}
                            className="mt-2 first:mt-0"
                        >
                            <div className={cn(
                                "text-xs font-semibold",
                                "uppercase tracking-wider",
                                "px-2 py-1",
                                "text-muted-foreground",
                            )}>
                                {item.name}
                            </div>
                            <NavItemList
                                items={item.children}
                                onFlyout={onFlyout}
                                activeFlyout={activeFlyout}
                            />
                        </li>
                    )
                }

                // Flyout trigger - has URL and children
                if (hasChildren) {
                    const isActive =
                        activeFlyout?.name === item.name
                    return (
                        <li
                            key={item.name}
                            onMouseEnter={() => onFlyout(item)}
                        >
                            <div className={cn(
                                "flex items-center",
                                "rounded-md",
                                isActive
                                    ? "bg-accent"
                                    : "hover:bg-accent",
                            )}>
                                <NavItemLink
                                    item={item}
                                    className={cn(
                                        "flex-1 px-2",
                                        "py-1.5 text-sm",
                                    )}
                                />
                                <ChevronRight className={cn(
                                    "h-3 w-3 mr-2",
                                    "text-muted-foreground",
                                )} />
                            </div>
                        </li>
                    )
                }

                // Leaf link
                return (
                    <li
                        key={item.name}
                        onMouseEnter={() => onFlyout(null)}
                    >
                        <NavItemLink
                            item={item}
                            className={cn(
                                "block rounded-md px-2",
                                "py-1.5 text-sm",
                                "hover:bg-accent",
                            )}
                        />
                    </li>
                )
            })}
        </ul>
    )
}

function NavDropdown({ items }: { items: NavItem[] }) {
    const [flyout, setFlyout] = useState<NavItem | null>(
        null,
    )

    return (
        <div
            className="flex"
            onMouseLeave={() => setFlyout(null)}
        >
            <NavItemList
                items={items}
                onFlyout={setFlyout}
                activeFlyout={flyout}
            />
            {flyout && flyout.children.length > 0 && (
                <div className={cn(
                    "border-l pl-2 ml-2",
                    "min-w-[140px]",
                )}>
                    <ul className="grid gap-0.5">
                        {flyout.children.map(child => (
                            <li key={child.name}>
                                <NavItemLink
                                    item={child}
                                    className={cn(
                                        "block rounded-md",
                                        "px-2 py-1 text-sm",
                                        "text-muted-foreground",
                                        "hover:bg-accent",
                                        "hover:text-foreground",
                                    )}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export function NavMenu() {
    const { data } = useNavbar()

    if (!data?.nav) return null

    return (
        <NavigationMenu viewport={false}>
            <NavigationMenuList>
                {data.nav.map(item => {
                    if (
                        item.children.length === 0 &&
                        item.url
                    ) {
                        return (
                            <NavigationMenuItem
                                key={item.name}
                            >
                                <NavItemLink
                                    item={item}
                                    className={
                                        navigationMenuTriggerStyle()
                                    }
                                />
                            </NavigationMenuItem>
                        )
                    }

                    return (
                        <NavigationMenuItem
                            key={item.name}
                        >
                            <NavigationMenuTrigger>
                                {item.name}
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <NavDropdown
                                    items={item.children}
                                />
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    )
                })}
            </NavigationMenuList>
        </NavigationMenu>
    )
}
