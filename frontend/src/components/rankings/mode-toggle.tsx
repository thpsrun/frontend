import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { HistoryMode } from "@/types/api"

interface ModeToggleProps {
    value: HistoryMode
    onChange: (m: HistoryMode) => void
}

const OPTIONS: { value: HistoryMode; label: string }[] = [
    { value: "overall", label: "Overall" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
]

export const ModeToggle = ({ value, onChange }: ModeToggleProps) => {
    return (
        <ToggleGroup
            type="single"
            value={value}
            onValueChange={(v) => {
                if (v && v !== value) onChange(v as HistoryMode)
            }}
            variant="outline"
            size="sm"
        >
            {OPTIONS.map((opt) => (
                <ToggleGroupItem
                    key={opt.value}
                    value={opt.value}
                    aria-label={opt.label}
                >
                    {opt.label}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    )
}
