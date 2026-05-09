import { useCallback, useEffect, useRef, useState } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import { Link } from "react-router"
import remarkGfm from "remark-gfm"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import rehypeHighlight from "rehype-highlight"
import { Copy, Check } from "lucide-react"
import type { Element } from "hast"
import { cn } from "@/lib/utils"
import "highlight.js/styles/github-dark.css"

const YOUTUBE_HOSTS = new Set([
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "youtu.be",
    "www.youtu.be",
])

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/

function extractYouTubeId(rawHref: string): string | null {
    let url: URL
    try {
        url = new URL(rawHref)
    } catch {
        return null
    }
    if (!YOUTUBE_HOSTS.has(url.hostname)) return null
    if (url.hostname === "youtu.be" || url.hostname === "www.youtu.be") {
        const id = url.pathname.slice(1).split("/")[0]
        return YOUTUBE_ID_PATTERN.test(id) ? id : null
    }
    if (url.pathname === "/watch") {
        const v = url.searchParams.get("v")
        return v && YOUTUBE_ID_PATTERN.test(v) ? v : null
    }
    const segmentMatch = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/)
    if (segmentMatch && YOUTUBE_ID_PATTERN.test(segmentMatch[1])) {
        return segmentMatch[1]
    }
    return null
}

function paragraphYouTubeId(node: Element | undefined): string | null {
    if (!node || node.children.length !== 1) return null
    const child = node.children[0]
    if (child.type !== "element" || child.tagName !== "a") return null
    const href = child.properties?.href
    if (typeof href !== "string") return null
    return extractYouTubeId(href)
}

function YouTubeEmbed({ videoId }: { videoId: string }) {
    return (
        <div className="my-4 aspect-video w-full overflow-hidden rounded-md border border-border">
            <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title="YouTube video"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full border-0"
            />
        </div>
    )
}

const SANITIZE_SCHEMA = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        h1: [...(defaultSchema.attributes?.h1 ?? []), "id"],
        h2: [...(defaultSchema.attributes?.h2 ?? []), "id"],
        h3: [...(defaultSchema.attributes?.h3 ?? []), "id"],
        h4: [...(defaultSchema.attributes?.h4 ?? []), "id"],
        h5: [...(defaultSchema.attributes?.h5 ?? []), "id"],
        h6: [...(defaultSchema.attributes?.h6 ?? []), "id"],
        code: [
            ...(defaultSchema.attributes?.code ?? []),
            ["className", /^language-/],
        ],
    },
}

const REMARK_PLUGINS = [remarkGfm]
const REHYPE_PLUGINS = [
    [rehypeSanitize, SANITIZE_SCHEMA],
    rehypeSlug,
    rehypeHighlight,
] as const

function isExternalHref(href: string): boolean {
    if (href.startsWith("/") || href.startsWith("#")) return false
    try {
        const url = new URL(href, window.location.origin)
        return url.origin !== window.location.origin
    } catch {
        return false
    }
}

function CodeBlock({ children, ...rest }: React.ComponentProps<"pre">) {
    const [copied, setCopied] = useState(false)
    const timeoutRef = useRef<number | null>(null)
    const codeText = (rest as { "data-code"?: string })["data-code"] ?? ""

    useEffect(() => () => {
        if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    }, [])

    const onCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(codeText)
            setCopied(true)
            if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
            timeoutRef.current = window.setTimeout(() => setCopied(false), 1500)
        } catch {
            // clipboard not available
        }
    }, [codeText])

    return (
        <pre
            className="relative my-4 rounded-md border border-border bg-muted/30 p-4 text-sm overflow-x-auto"
            {...rest}
        >
            <button
                type="button"
                onClick={onCopy}
                aria-label="Copy code"
                className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
            {children}
        </pre>
    )
}

const COMPONENTS: Components = {
    h1: ({ children, ...rest }) => (
        <h1
            className="scroll-mt-24 text-3xl font-bold tracking-tight mt-8 mb-4 pb-2 border-b border-border"
            {...rest}
        >
            {children}
        </h1>
    ),
    h2: ({ children, ...rest }) => (
        <h2
            className="scroll-mt-24 text-2xl font-bold tracking-tight mt-8 mb-3 pb-1 border-b border-border/60"
            {...rest}
        >
            {children}
        </h2>
    ),
    h3: ({ children, ...rest }) => (
        <h3 className="scroll-mt-24 text-xl font-semibold mt-6 mb-2" {...rest}>
            {children}
        </h3>
    ),
    h4: ({ children, ...rest }) => (
        <h4 className="scroll-mt-24 text-lg font-semibold mt-5 mb-2" {...rest}>
            {children}
        </h4>
    ),
    h5: ({ children, ...rest }) => (
        <h5 className="scroll-mt-24 text-base font-semibold mt-4 mb-2" {...rest}>
            {children}
        </h5>
    ),
    h6: ({ children, ...rest }) => (
        <h6
            className="scroll-mt-24 text-sm font-semibold uppercase tracking-wide mt-4 mb-2 text-muted-foreground"
            {...rest}
        >
            {children}
        </h6>
    ),
    p: ({ children, node, ...rest }) => {
        const youtubeId = paragraphYouTubeId(node)
        if (youtubeId) return <YouTubeEmbed videoId={youtubeId} />
        return <p className="my-3 leading-relaxed" {...rest}>{children}</p>
    },
    ul: ({ children, ...rest }) => (
        <ul className="my-3 list-disc pl-6 space-y-1" {...rest}>{children}</ul>
    ),
    ol: ({ children, ...rest }) => (
        <ol className="my-3 list-decimal pl-6 space-y-1" {...rest}>{children}</ol>
    ),
    blockquote: ({ children, ...rest }) => (
        <blockquote
            className="my-4 border-l-4 border-border pl-4 italic text-muted-foreground"
            {...rest}
        >
            {children}
        </blockquote>
    ),
    hr: () => <hr className="my-6 border-border" />,
    strong: ({ children, ...rest }) => (
        <strong className="font-semibold" {...rest}>{children}</strong>
    ),
    em: ({ children, ...rest }) => (
        <em className="italic" {...rest}>{children}</em>
    ),
    table: ({ children, ...rest }) => (
        <div className="my-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm" {...rest}>{children}</table>
        </div>
    ),
    thead: ({ children, ...rest }) => (
        <thead className="border-b border-border" {...rest}>{children}</thead>
    ),
    th: ({ children, ...rest }) => (
        <th className="px-3 py-2 text-left font-semibold" {...rest}>{children}</th>
    ),
    td: ({ children, ...rest }) => (
        <td className="px-3 py-2 border-b border-border/40" {...rest}>{children}</td>
    ),
    code: ({ children, className, ...rest }) => {
        const isBlock = typeof className === "string" && className.startsWith("language-")
        if (isBlock) {
            return <code className={className} {...rest}>{children}</code>
        }
        return (
            <code
                className="rounded bg-muted px-1.5 py-0.5 text-[0.875em] font-mono"
                {...rest}
            >
                {children}
            </code>
        )
    },
    a: ({ href, children, ...rest }) => {
        const target = href ?? ""
        const linkClass = "text-link underline underline-offset-2 hover:opacity-80"
        if (target.startsWith("/")) {
            return <Link to={target} className={linkClass}>{children}</Link>
        }
        if (isExternalHref(target)) {
            return (
                <a
                    href={target}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={linkClass}
                    {...rest}
                >
                    {children}
                </a>
            )
        }
        return <a href={target} className={linkClass} {...rest}>{children}</a>
    },
    img: ({ src, alt, ...rest }) => (
        <img
            src={src ?? ""}
            alt={alt ?? ""}
            loading="lazy"
            className="max-w-full h-auto rounded-md"
            {...rest}
        />
    ),
    pre: (props) => {
        const childArray = Array.isArray(props.children)
            ? props.children
            : [props.children]
        const codeChild = childArray.find(
            (c): c is React.ReactElement =>
                !!c
                && typeof c === "object"
                && "type" in (c as object)
                && (c as React.ReactElement).type === "code",
        )
        const codeProps = codeChild?.props as { children?: unknown } | undefined
        const codeText = typeof codeProps?.children === "string"
            ? codeProps.children
            : Array.isArray(codeProps?.children)
                ? codeProps.children.filter((x: unknown) => typeof x === "string").join("")
                : ""
        return <CodeBlock {...props} data-code={codeText} />
    },
}

interface Props {
    content: string
    className?: string
}

export function GuideMarkdown({ content, className }: Props) {
    return (
        <div
            className={cn(
                "max-w-none wrap-brea-word text-foreground",
                className,
            )}
        >
            <ReactMarkdown
                remarkPlugins={REMARK_PLUGINS}
                rehypePlugins={REHYPE_PLUGINS as never}
                components={COMPONENTS}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
