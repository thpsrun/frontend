import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Props {
    label: string
    placeholder?: string
    isApplied: boolean
    onApply: (value: string) => void
    onClear: () => void
    initialValue?: string
    inputClassName?: string
}

export function TextFilterField({
    label,
    placeholder,
    isApplied,
    onApply,
    onClear,
    initialValue = "",
    inputClassName = "w-44",
}: Props) {
    const [value, setValue] = useState(initialValue)

    return (
        <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    onApply(value.trim())
                }}
                className="flex gap-2"
            >
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    className={inputClassName}
                />
                <Button type="submit" size="sm" variant="outline">
                    Apply
                </Button>
                {isApplied && (
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            setValue("")
                            onClear()
                        }}
                    >
                        Clear
                    </Button>
                )}
            </form>
        </div>
    )
}
