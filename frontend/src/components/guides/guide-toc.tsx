import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { TocHeading } from "./guide-toc-headings"

interface Props {
    headings: TocHeading[]
    className?: string
}

const DEPTH_PADDING: Record<2 | 3 | 4, string> = {
    2: "",
    3: "pl-3",
    4: "pl-6",
}

export function GuideToc({ headings, className }: Props) {
    const [activeId, setActiveId] = useState<string | null>(null)

    useEffect(() => {
        const elements = headings
            .map((h) => document.getElementById(h.id))
            .filter((el): el is HTMLElement => el !== null)
        if (elements.length === 0) return

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting)
                if (visible.length === 0) return
                const id = visible[0].target.id
                setActiveId((prev) => (prev === id ? prev : id))
            },
            { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
        )
        elements.forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [headings])

    return (
        <nav
            aria-label="Table of contents"
            className={cn(
                "text-sm",
                "[&_a]:block [&_a]:py-1 [&_a]:transition-colors",
                className,
            )}
        >
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                On this page
            </p>
            <ul className="space-y-0.5">
                {headings.map((h) => (
                    <li key={h.id} className={DEPTH_PADDING[h.depth]}>
                        <a
                            href={`#${h.id}`}
                            className={cn(
                                "text-muted-foreground hover:text-foreground",
                                activeId === h.id && "text-foreground font-medium",
                            )}
                        >
                            {h.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
