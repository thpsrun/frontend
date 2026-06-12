import { useState } from "react"
import { Link } from "react-router"
import { ChevronDown } from "lucide-react"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { useNavbar } from "@/hooks/home/useNavbar"
import type { NavItem } from "@/types/api"
import { cn } from "@/lib/utils"

function isExternalUrl(url: string): boolean {
    return url.startsWith("http://") || url.startsWith("https://")
}

const leafClass = "block rounded-md px-2 py-2.5 text-sm hover:bg-accent"

function LeafLink({
    item,
    onNavigate,
    depth,
}: {
    item: NavItem
    onNavigate: () => void
    depth: number
}) {
    if (!item.url) return null

    const className = cn(leafClass, depth === 0 && "font-medium")

    return isExternalUrl(item.url) ? (
        <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className={className}
        >
            {item.name}
        </a>
    ) : (
        <Link to={item.url} onClick={onNavigate} className={className}>
            {item.name}
        </Link>
    )
}

interface MobileNavItemProps {
    item: NavItem
    onNavigate: () => void
    depth?: number
}

function MobileNavItem({ item, onNavigate, depth = 0 }: MobileNavItemProps) {
    const [open, setOpen] = useState(false)

    if (item.children.length === 0) {
        return <LeafLink item={item} onNavigate={onNavigate} depth={depth} />
    }

    return (
        <div className="flex flex-col">
            <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((prev) => !prev)}
                className={cn(
                    "flex items-center justify-between gap-2 rounded-md px-2 py-2.5 text-left hover:bg-accent",
                    depth === 0
                        ? "text-sm font-semibold"
                        : "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                )}
            >
                <span className="truncate">{item.name}</span>
                <ChevronDown
                    className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform",
                        open && "rotate-180",
                    )}
                />
            </button>
            {open && (
                <div className="ml-2 flex flex-col border-l border-border/40 pl-2">
                    {item.url && (
                        <LeafLink
                            item={{ ...item, children: [] }}
                            onNavigate={onNavigate}
                            depth={depth + 1}
                        />
                    )}
                    {item.children.map((child) => (
                        <MobileNavItem
                            key={child.name}
                            item={child}
                            onNavigate={onNavigate}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

interface MobileNavSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function MobileNavSheet({ open, onOpenChange }: MobileNavSheetProps) {
    const { data } = useNavbar()

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="max-h-[80vh] rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
            >
                <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav
                    aria-label="Primary"
                    className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto px-4 pb-4"
                >
                    {data?.nav?.map((item) => (
                        <MobileNavItem
                            key={item.name}
                            item={item}
                            onNavigate={() => onOpenChange(false)}
                        />
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
    )
}
