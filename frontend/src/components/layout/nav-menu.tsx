import { useRef, useState } from "react"
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

const SUBMENU_WIDTH_ESTIMATE = 224

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

// One dropdown row. Leaf items render as a link or label; items with children
// defer to FlyoutBranch, which reveals the next level on hover/focus.
function FlyoutNode({ item }: { item: NavItem }) {
    if (item.children.length === 0) {
        return (
            <li>
                <NavItemLink
                    item={item}
                    className={cn(
                        "block rounded-md px-2 py-1.5 text-sm",
                        "hover:bg-accent",
                    )}
                />
            </li>
        )
    }

    return <FlyoutBranch item={item} />
}

function FlyoutBranch({ item }: { item: NavItem }) {
    const rowRef = useRef<HTMLDivElement>(null)
    const [side, setSide] = useState<"right" | "left">("right")
    const [hovered, setHovered] = useState(false)
    const [focused, setFocused] = useState(false)
    const open = hovered || focused

    const decideSide = () => {
        const row = rowRef.current
        if (!row) return
        const rect = row.getBoundingClientRect()
        const overflowsRight =
            rect.right + SUBMENU_WIDTH_ESTIMATE > window.innerWidth
        setSide(overflowsRight ? "left" : "right")
    }

    return (
        <li
            className="relative"
            onMouseEnter={() => {
                decideSide()
                setHovered(true)
            }}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => {
                decideSide()
                setFocused(true)
            }}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                    setFocused(false)
                }
            }}
        >
            <div
                ref={rowRef}
                className={cn(
                    "flex items-center rounded-md hover:bg-accent",
                    open && "bg-accent",
                )}
            >
                <NavItemLink
                    item={item}
                    className="flex-1 px-2 py-1.5 text-sm"
                />
                <ChevronRight
                    className={cn(
                        "mr-2 h-3 w-3 shrink-0 text-muted-foreground",
                        side === "left" && "rotate-180",
                    )}
                />
            </div>

            <div
                className={cn(
                    "absolute top-0 z-50 min-w-44",
                    "rounded-md border bg-popover p-1 shadow-md",
                    "transition-opacity duration-100",
                    open
                        ? "visible opacity-100"
                        : "invisible opacity-0 pointer-events-none",
                    side === "right" ? "left-full" : "right-full",
                )}
            >
                <ul className="grid gap-0.5">
                    {item.children.map(child => (
                        <FlyoutNode key={child.name} item={child} />
                    ))}
                </ul>
            </div>
        </li>
    )
}

function NavDropdown({ items }: { items: NavItem[] }) {
    return (
        <ul className="grid min-w-44 gap-0.5">
            {items.map(item => (
                <FlyoutNode key={item.name} item={item} />
            ))}
        </ul>
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
                                    className={cn(
                                        navigationMenuTriggerStyle(),
                                        "px-2.5 xl:px-4",
                                    )}
                                />
                            </NavigationMenuItem>
                        )
                    }

                    return (
                        <NavigationMenuItem
                            key={item.name}
                        >
                            <NavigationMenuTrigger className="px-2.5 xl:px-4">
                                {item.name}
                            </NavigationMenuTrigger>
                            {/* overflow-visible lets the cascading submenus escape the panel's clip */}
                            <NavigationMenuContent
                                style={{ overflow: "visible" }}
                            >
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
