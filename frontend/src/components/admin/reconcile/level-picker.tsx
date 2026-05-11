import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import type { GameLevel } from "@/types/api"

interface Props {
    items: GameLevel[]
    isLoading: boolean
    error: Error | null
    hasGame: boolean
    selected: GameLevel | null
    onSelect: (level: GameLevel | null) => void
    disabled?: boolean
}

export function LevelPicker({
    items,
    isLoading,
    error,
    hasGame,
    selected,
    onSelect,
    disabled,
}: Props) {
    const isDisabled = disabled || isLoading || !hasGame || Boolean(error)
    const value = selected?.id ?? ""

    return (
        <div className="space-y-1">
            <Select
                value={value}
                onValueChange={(next) => {
                    const found = items.find((l) => l.id === next) ?? null
                    onSelect(found)
                }}
                disabled={isDisabled}
            >
                <SelectTrigger>
                    <SelectValue
                        placeholder={
                            !hasGame
                                ? "Pick a game first"
                                : isLoading
                                    ? "Loading levels..."
                                    : error
                                        ? "Failed to load levels"
                                        : "Select a level"
                        }
                    />
                </SelectTrigger>
                <SelectContent>
                    {items.map((lvl) => (
                        <SelectItem key={lvl.id} value={lvl.id}>
                            {lvl.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && (
                <p className="text-xs text-destructive">
                    {error.message}
                </p>
            )}
        </div>
    )
}
