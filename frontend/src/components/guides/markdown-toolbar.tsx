import { useCallback } from "react"
import {
    Bold, Italic, Heading2, Code, Code2, Quote, List, ListOrdered, Link as LinkIcon, Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
    textareaRef: React.RefObject<HTMLTextAreaElement | null>
    value: string
    onChange: (next: string) => void
}

type Op = (sel: string) => { insert: string; selectStart: number; selectEnd: number }

const ops: Record<string, Op> = {
    bold: (s) => ({
        insert: `**${s || "bold"}**`,
        selectStart: 2,
        selectEnd: 2 + (s.length || 4),
    }),
    italic: (s) => ({
        insert: `*${s || "italic"}*`,
        selectStart: 1,
        selectEnd: 1 + (s.length || 6),
    }),
    h2: (s) => ({
        insert: `\n## ${s || "Heading"}\n`,
        selectStart: 4,
        selectEnd: 4 + (s.length || 7),
    }),
    code: (s) => ({
        insert: `\`${s || "code"}\``,
        selectStart: 1,
        selectEnd: 1 + (s.length || 4),
    }),
    codeblock: (s) => ({
        insert: `\n\`\`\`\n${s || "code"}\n\`\`\`\n`,
        selectStart: 5,
        selectEnd: 5 + (s.length || 4),
    }),
    quote: (s) => ({
        insert: `\n> ${s || "quote"}\n`,
        selectStart: 3,
        selectEnd: 3 + (s.length || 5),
    }),
    bullets: (s) => ({
        insert: `\n- ${s || "item"}\n`,
        selectStart: 3,
        selectEnd: 3 + (s.length || 4),
    }),
    numbered: (s) => ({
        insert: `\n1. ${s || "item"}\n`,
        selectStart: 4,
        selectEnd: 4 + (s.length || 4),
    }),
    link: (s) => ({
        insert: `[${s || "text"}](url)`,
        selectStart: 1,
        selectEnd: 1 + (s.length || 4),
    }),
    image: (s) => ({
        insert: `![${s || "alt"}](url)`,
        selectStart: 2,
        selectEnd: 2 + (s.length || 3),
    }),
}

interface BtnProps {
    op: keyof typeof ops
    title: string
    children: React.ReactNode
    onApply: (op: keyof typeof ops) => void
}

function ToolbarBtn({ op, title, children, onApply }: BtnProps) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            title={title}
            onClick={() => onApply(op)}
        >
            {children}
        </Button>
    )
}

export function MarkdownToolbar({ textareaRef, value, onChange }: Props) {
    const apply = useCallback(
        (key: keyof typeof ops) => {
            const ta = textareaRef.current
            if (!ta) return
            const start = ta.selectionStart ?? value.length
            const end = ta.selectionEnd ?? value.length
            const sel = value.slice(start, end)
            const { insert, selectStart, selectEnd } = ops[key](sel)
            const next = value.slice(0, start) + insert + value.slice(end)
            onChange(next)
            requestAnimationFrame(() => {
                ta.focus()
                const cursorStart = start + selectStart
                const cursorEnd = start + selectEnd
                ta.setSelectionRange(cursorStart, cursorEnd)
            })
        },
        [textareaRef, value, onChange],
    )

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-1">
            <ToolbarBtn op="bold" title="Bold (Ctrl+B)" onApply={apply}><Bold className="size-4" /></ToolbarBtn>
            <ToolbarBtn op="italic" title="Italic (Ctrl+I)" onApply={apply}><Italic className="size-4" /></ToolbarBtn>
            <ToolbarBtn op="h2" title="Heading" onApply={apply}><Heading2 className="size-4" /></ToolbarBtn>
            <ToolbarBtn op="code" title="Inline code" onApply={apply}><Code className="size-4" /></ToolbarBtn>
            <ToolbarBtn op="codeblock" title="Code block" onApply={apply}><Code2 className="size-4" /></ToolbarBtn>
            <ToolbarBtn op="quote" title="Quote" onApply={apply}><Quote className="size-4" /></ToolbarBtn>
            <ToolbarBtn op="bullets" title="Bulleted list" onApply={apply}><List className="size-4" /></ToolbarBtn>
            <ToolbarBtn op="numbered" title="Numbered list" onApply={apply}><ListOrdered className="size-4" /></ToolbarBtn>
            <ToolbarBtn op="link" title="Link" onApply={apply}><LinkIcon className="size-4" /></ToolbarBtn>
            <ToolbarBtn op="image" title="Image" onApply={apply}><ImageIcon className="size-4" /></ToolbarBtn>
        </div>
    )
}
