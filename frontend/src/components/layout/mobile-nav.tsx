import { useState } from "react"
import { Link } from "react-router"
import { Menu } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useNavbar } from "@/hooks/home/useNavbar"
import type { NavItem } from "@/types/api"
import { cn } from "@/lib/utils"

function isExternalUrl(url: string): boolean {
    return url.startsWith("http://") || url.startsWith("https://")
}

interface NavLinkProps {
    item: NavItem
    onNavigate: () => void
    depth?: number
}

function MobileNavItem({
    item,
    onNavigate,
    depth = 0,
}: NavLinkProps) {
    const hasChildren = item.children.length > 0

    const linkClassName = cn(
        "block rounded-md px-2 py-2 text-sm hover:bg-accent",
        depth === 0 && "font-medium",
    )

    const link = item.url
        ? isExternalUrl(item.url)
            ? (
                <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onNavigate}
                    className={linkClassName}
                >
                    {item.name}
                </a>
            )
            : (
                <Link to={item.url} onClick={onNavigate} className={linkClassName}>
                    {item.name}
                </Link>
            )
        : null

    // Items with children render their children below; a linked parent keeps
    // its link, an unlinked parent becomes a section header.
    if (hasChildren) {
        return (
            <div className="flex flex-col">
                {link ?? (
                    <p
                        className={cn(
                            "text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 pt-3 pb-1",
                        )}
                    >
                        {item.name}
                    </p>
                )}
                <div className="flex flex-col">
                    {item.children.map((child) => (
                        <MobileNavItem
                            key={child.name}
                            item={child}
                            onNavigate={onNavigate}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return link
}

export function MobileNav() {
    const { data } = useNavbar()
    const [open, setOpen] = useState(false)

    if (!data?.nav) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open navigation menu"
                >
                    <Menu className="size-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Menu</DialogTitle>
                </DialogHeader>
                <nav
                    aria-label="Primary"
                    className="flex flex-col gap-1 max-h-[70vh] overflow-y-auto"
                >
                    {data.nav.map((item) => (
                        <MobileNavItem
                            key={item.name}
                            item={item}
                            onNavigate={() => setOpen(false)}
                        />
                    ))}
                </nav>
            </DialogContent>
        </Dialog>
    )
}
