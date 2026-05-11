import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useGames } from "@/hooks/game/useGames"
import type { Game } from "@/types/api"

interface Props {
    selected: Game | null
    onSelect: (game: Game | null) => void
    disabled?: boolean
    placeholder?: string
}

export function GamePicker({ selected, onSelect, disabled, placeholder }: Props) {
    const { data: games, isLoading, error } = useGames()

    const isDisabled = disabled || isLoading || Boolean(error)
    const value = selected?.id ?? ""
    const items = games ?? []

    return (
        <div className="space-y-1">
            <Select
                value={value}
                onValueChange={(next) => {
                    const found = items.find((g) => g.id === next) ?? null
                    onSelect(found)
                }}
                disabled={isDisabled}
            >
                <SelectTrigger>
                    <SelectValue
                        placeholder={
                            isLoading
                                ? "Loading games..."
                                : error
                                    ? "Failed to load games"
                                    : placeholder ?? "Select a game"
                        }
                    />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                    {items.map((game) => (
                        <SelectItem key={game.id} value={game.id}>
                            {game.name}
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
