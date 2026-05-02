import { useEffect, useMemo, useState } from "react"
import { unified } from "unified"
import remarkParse from "remark-parse"
import { toString as mdastToString } from "mdast-util-to-string"
import GithubSlugger from "github-slugger"
import { cn } from "@/lib/utils"

interface Heading {
    depth: 2 | 3
    text: string
    id: string
}

function extractHeadings(content: string): Heading[] {
    const tree = unified().use(remarkParse).parse(content)
    const slugger = new GithubSlugger()
    const out: Heading[] = []
    function walk(node: unknown) {
        if (!node || typeof node !== "object") return
        const n = node as { type?: string; depth?: number; children?: unknown[] }
        if (n.type === "heading" && (n.depth === 2 || n.depth === 3)) {
            const text = mdastToString(n as never)
            out.push({
                depth: n.depth as 2 | 3,
                text,
                id: slugger.slug(text),
            })
        }
        if (Array.isArray(n.children)) n.children.forEach(walk)
    }
    walk(tree)
    return out
}

interface Props {
    content: string
    className?: string
}

export function GuideToc({ content, className }: Props) {
    const headings = useMemo(() => extractHeadings(content), [content])
    const [activeId, setActiveId] = useState<string | null>(null)

    useEffect(() => {
        if (headings.length < 3) return
        const elements = headings
            .map((h) => document.getElementById(h.id))
            .filter((el): el is HTMLElement => el !== null)
        if (elements.length === 0) return

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting)
                if (visible.length > 0) {
                    setActiveId(visible[0].target.id)
                }
            },
            { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
        )
        elements.forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [headings])

    if (headings.length < 3) return null

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
                    <li key={h.id} className={h.depth === 3 ? "pl-3" : ""}>
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
