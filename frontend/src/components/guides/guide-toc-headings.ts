import { unified } from "unified"
import remarkParse from "remark-parse"
import { toString as mdastToString } from "mdast-util-to-string"
import GithubSlugger from "github-slugger"

export interface TocHeading {
    depth: 2 | 3 | 4
    text: string
    id: string
}

export const TOC_MIN_HEADINGS = 2

export function extractTocHeadings(content: string): TocHeading[] {
    const tree = unified().use(remarkParse).parse(content)
    const slugger = new GithubSlugger()
    const out: TocHeading[] = []
    function walk(node: unknown) {
        if (!node || typeof node !== "object") return
        const n = node as { type?: string; depth?: number; children?: unknown[] }
        if (
            n.type === "heading"
            && (n.depth === 2 || n.depth === 3 || n.depth === 4)
        ) {
            const text = mdastToString(n as never)
            out.push({
                depth: n.depth as 2 | 3 | 4,
                text,
                id: slugger.slug(text),
            })
        }
        if (Array.isArray(n.children)) n.children.forEach(walk)
    }
    walk(tree)
    return out
}
