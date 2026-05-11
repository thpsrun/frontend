import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import type { GameCategory } from "@/types/api"

interface Props {
    items: GameCategory[]
    isLoading: boolean
    error: Error | null
    hasGame: boolean
    selected: GameCategory | null
    onSelect: (category: GameCategory | null) => void
    disabled?: boolean
}

export function CategoryPicker({
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
                    const found = items.find((c) => c.id === next) ?? null
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
                                    ? "Loading categories..."
                                    : error
                                        ? "Failed to load categories"
                                        : "Select a category"
                        }
                    />
                </SelectTrigger>
                <SelectContent>
                    {items.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                                {cat.name}
                                <span className="text-xs text-muted-foreground">
                                    {cat.type === "per-level" ? "IL" : "FG"}
                                </span>
                            </span>
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
