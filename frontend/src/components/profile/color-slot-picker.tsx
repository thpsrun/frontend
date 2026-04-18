import { useState } from "react"
import { HexColorPicker } from "react-colorful"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ColorSlotPickerProps {
    label: string
    color: string | null
    onChange: (color: string | null) => void
}

export function ColorSlotPicker({
    label,
    color,
    onChange,
}: ColorSlotPickerProps) {
    const [open, setOpen] = useState(false)
    const [hexInput, setHexInput] = useState(color ?? "")

    const handleColorChange = (newColor: string) => {
        onChange(newColor)
        setHexInput(newColor)
    }

    const handleHexInput = (value: string) => {
        setHexInput(value)
        if (/^#[0-9a-fA-F]{6}$/.test(value)) {
            onChange(value)
        }
    }

    const handleClear = () => {
        onChange(null)
        setHexInput("")
        setOpen(false)
    }

    return (
        <div className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
                {label}
            </span>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "w-12 h-12 rounded-lg border-2",
                            "border-border/40 cursor-pointer",
                            "transition-colors",
                            "hover:border-border",
                            !color && "bg-muted/30",
                        )}
                        style={color
                            ? { backgroundColor: color }
                            : undefined}
                    />
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-3"
                    side="top"
                >
                    <div className="flex flex-col gap-3">
                        <HexColorPicker
                            color={color ?? "#ffffff"}
                            onChange={handleColorChange}
                        />
                        <Input
                            value={hexInput}
                            onChange={(e) =>
                                handleHexInput(e.target.value)
                            }
                            placeholder="#000000"
                            className={cn(
                                "font-mono text-sm",
                                "text-center",
                            )}
                            maxLength={7}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                        >
                            Clear
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
            {color && (
                <span className={cn(
                    "text-xs font-mono",
                    "text-muted-foreground",
                )}>
                    {color}
                </span>
            )}
        </div>
    )
}
