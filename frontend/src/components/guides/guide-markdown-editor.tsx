import { useRef } from "react"
import type { KeyboardEvent } from "react"
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownToolbar } from "./markdown-toolbar"
import { GuideMarkdown } from "./guide-markdown"

interface Props {
    value: string
    onChange: (v: string) => void
    placeholder?: string
}

export function GuideMarkdownEditor({ value, onChange, placeholder }: Props) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    // Ctrl/Cmd+B and Ctrl/Cmd+I wrap the current selection in bold or italic markers.
    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (!(e.ctrlKey || e.metaKey)) return
        const ta = textareaRef.current
        if (!ta) return
        const wrap = (left: string, right: string) => {
            e.preventDefault()
            const start = ta.selectionStart ?? value.length
            const end = ta.selectionEnd ?? value.length
            const sel = value.slice(start, end)
            const next = `${value.slice(0, start)}${left}${sel}${right}${value.slice(end)}`
            onChange(next)
            // Defer until React has flushed the controlled value to the DOM; setting the
            // selection synchronously would target the pre-edit text.
            requestAnimationFrame(() => {
                ta.focus()
                const cursor = start + left.length + sel.length + right.length
                ta.setSelectionRange(cursor, cursor)
            })
        }
        if (e.key.toLowerCase() === "b") wrap("**", "**")
        else if (e.key.toLowerCase() === "i") wrap("*", "*")
    }

    return (
        <div className="overflow-hidden rounded-md border border-border">
            <Tabs defaultValue="write">
                <TabsList className="rounded-none border-b border-border bg-transparent p-0">
                    <TabsTrigger
                        value="write"
                        className="rounded-none data-[state=active]:bg-muted/30"
                    >
                        Write
                    </TabsTrigger>
                    <TabsTrigger
                        value="preview"
                        className="rounded-none data-[state=active]:bg-muted/30"
                    >
                        Preview
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="write" className="mt-0">
                    <MarkdownToolbar
                        textareaRef={textareaRef}
                        value={value}
                        onChange={onChange}
                    />
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder ?? "Write your guide in Markdown..."}
                        className="min-h-100 resize-y rounded-none border-0 font-mono text-sm focus-visible:ring-0"
                    />
                </TabsContent>

                <TabsContent value="preview" className="mt-0">
                    <div className="min-h-100 p-4">
                        {value
                            ? <GuideMarkdown content={value} />
                            : <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
