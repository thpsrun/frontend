import { useState } from "react"
import {
    GRADIENT_PRESETS,
    type GradientPreset,
} from "@/lib/gradient-presets"
import { GradientUsername } from "@/components/profile/gradient-username"
import type { Gradients } from "@/types/shared"
import { cn } from "@/lib/utils"

interface GradientPresetPickerProps {
    username: string
    onApply: (colors: Gradients) => void
}

export function GradientPresetPicker({
    username,
    onApply,
}: GradientPresetPickerProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className="flex flex-col gap-3">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={cn(
                    "flex items-center justify-between",
                    "w-full text-sm font-medium",
                    "text-left hover:opacity-80",
                )}
                aria-expanded={open}
            >
                <span>Presets</span>
                <span
                    aria-hidden="true"
                    className={cn(
                        "transition-transform",
                        open ? "rotate-90" : "rotate-0",
                    )}
                >
                    ▶
                </span>
            </button>
            {open && (
                <div
                    className={cn(
                        "grid gap-3",
                        "grid-cols-2 sm:grid-cols-3",
                        "md:grid-cols-5",
                    )}
                >
                    {GRADIENT_PRESETS.map((preset) => (
                        <PresetTile
                            key={preset.id}
                            preset={preset}
                            username={username}
                            onApply={onApply}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

interface PresetTileProps {
    preset: GradientPreset
    username: string
    onApply: (colors: Gradients) => void
}

function PresetTile({
    preset,
    username,
    onApply,
}: PresetTileProps) {
    const handleClick = () => {
        onApply(preset.getColors())
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                "flex flex-col items-center gap-2",
                "rounded-md border border-border/40",
                "bg-background/40 p-3",
                "hover:border-border hover:bg-background/60",
                "transition-colors",
            )}
        >
            <div
                className={cn(
                    "flex h-10 w-full items-center",
                    "justify-center",
                )}
            >
                {preset.preview === "static" ? (
                    <StaticPreview
                        preset={preset}
                        username={username}
                    />
                ) : (
                    <PlaceholderPreview />
                )}
            </div>
            <span className="text-xs text-muted-foreground">
                {preset.name}
            </span>
        </button>
    )
}

function StaticPreview({
    preset,
    username,
}: {
    preset: GradientPreset
    username: string
}) {
    return (
        <GradientUsername
            name={username}
            gradients={preset.getColors()}
            className="text-base font-bold truncate"
        />
    )
}

function PlaceholderPreview() {
    return (
        <span
            className={cn(
                "text-2xl font-bold",
                "text-muted-foreground",
            )}
            aria-hidden="true"
        >
            ?
        </span>
    )
}
