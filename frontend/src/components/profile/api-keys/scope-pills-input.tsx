import { useState, useMemo } from "react"
import { Plus, X } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export type ScopePillOption = {
    value: string
    label: string
    suffix?: string
    disabled?: boolean
    disabledReason?: string
}

type ScopePillsInputProps = {
    options: ScopePillOption[]
    selected: string[]
    onChange: (next: string[]) => void
    placeholder?: string
    emptyHint?: string
    id?: string
}

export function ScopePillsInput({
    options,
    selected,
    onChange,
    placeholder = "Add...",
    emptyHint,
    id,
}: ScopePillsInputProps) {
    const [open, setOpen] = useState(false)
    const [filter, setFilter] = useState("")

    const selectedSet = useMemo(() => new Set(selected), [selected])
    const filtered = useMemo(() => {
        const f = filter.trim().toLowerCase()
        if (!f) return options
        return options.filter((o) =>
            o.label.toLowerCase().includes(f)
            || o.value.toLowerCase().includes(f),
        )
    }, [options, filter])

    const toggle = (value: string) => {
        if (selectedSet.has(value)) {
            onChange(selected.filter((v) => v !== value))
        } else {
            onChange([...selected, value])
        }
    }

    const remove = (value: string) => {
        onChange(selected.filter((v) => v !== value))
    }

    return (
        <div
            id={id}
            className={cn(
                "flex flex-wrap items-center gap-1.5 rounded-md border border-input",
                "bg-transparent px-2 py-1.5 min-h-9",
            )}
        >
            {selected.length === 0 && emptyHint && (
                <span className="text-xs text-muted-foreground pl-1">
                    {emptyHint}
                </span>
            )}
            {selected.map((value) => {
                const opt = options.find((o) => o.value === value)
                const label = opt?.label ?? value
                const suffix = opt?.suffix
                return (
                    <span
                        key={value}
                        className={cn(
                            "inline-flex items-center gap-1 rounded border border-primary/40",
                            "bg-primary/10 px-2 py-0.5 text-xs",
                        )}
                    >
                        <span>{label}</span>
                        {suffix && (
                            <code className="text-muted-foreground text-[10px]">
                                {suffix}
                            </code>
                        )}
                        <button
                            type="button"
                            onClick={() => remove(value)}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                            aria-label={`Remove ${label}`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                )
            })}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "inline-flex items-center gap-1 rounded px-2 py-0.5",
                            "text-xs text-muted-foreground hover:text-foreground",
                        )}
                    >
                        <Plus className="h-3 w-3" />
                        {placeholder}
                    </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-72 p-2">
                    <input
                        type="text"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Filter..."
                        className={cn(
                            "w-full rounded border border-input bg-transparent",
                            "px-2 py-1 text-xs mb-2",
                            "focus-visible:outline-none focus-visible:ring-1",
                        )}
                    />
                    <div className="max-h-64 overflow-y-auto flex flex-col">
                        {filtered.length === 0 && (
                            <span className="text-xs text-muted-foreground p-2">
                                No matches.
                            </span>
                        )}
                        {filtered.map((o) => {
                            const checked = selectedSet.has(o.value)
                            const rowId = `scope-${o.value}`
                            return (
                                <label
                                    key={o.value}
                                    htmlFor={rowId}
                                    title={o.disabled ? o.disabledReason : undefined}
                                    className={cn(
                                        "flex items-center gap-2 rounded px-2 py-1.5 text-sm",
                                        "cursor-pointer hover:bg-muted/50",
                                        o.disabled && "opacity-50 cursor-not-allowed",
                                    )}
                                >
                                    <Checkbox
                                        id={rowId}
                                        checked={checked}
                                        disabled={o.disabled}
                                        onCheckedChange={() => !o.disabled && toggle(o.value)}
                                    />
                                    <span className="flex-1">{o.label}</span>
                                    {o.suffix && (
                                        <code className="text-[10px] text-muted-foreground">
                                            {o.suffix}
                                        </code>
                                    )}
                                </label>
                            )
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
