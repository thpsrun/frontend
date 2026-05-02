import { useCallback, useState } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import { Link } from "react-router"
import remarkGfm from "remark-gfm"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import rehypeHighlight from "rehype-highlight"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

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
    const onCopy = useCallback(async () => {
        try {
            const text = (rest as { "data-code"?: string })["data-code"] ?? ""
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            // clipboard not available
        }
    }, [rest])

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

function buildComponents(): Components {
    return {
        a: ({ href, children, ...rest }) => {
            const target = href ?? ""
            if (target.startsWith("/")) {
                return <Link to={target}>{children}</Link>
            }
            if (isExternalHref(target)) {
                return (
                    <a href={target} target="_blank" rel="noreferrer noopener" {...rest}>
                        {children}
                    </a>
                )
            }
            return <a href={target} {...rest}>{children}</a>
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
}

interface Props {
    content: string
    className?: string
}

export function GuideMarkdown({ content, className }: Props) {
    return (
        <div
            className={cn(
                "prose prose-invert prose-zinc max-w-none break-words",
                className,
            )}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                    [rehypeSanitize, SANITIZE_SCHEMA],
                    rehypeSlug,
                    rehypeHighlight,
                ]}
                components={buildComponents()}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
