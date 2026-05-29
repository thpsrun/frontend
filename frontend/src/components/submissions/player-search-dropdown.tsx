import type { PlayerSearchResult } from "@/types/submissions"

interface PlayerSearchDropdownProps {
    results: PlayerSearchResult[]
    onSelect: (result: PlayerSearchResult) => void
}

export function PlayerSearchDropdown({
    results,
    onSelect,
}: PlayerSearchDropdownProps) {
    if (results.length === 0) return null
    return (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-md border border-border bg-popover shadow-md overflow-hidden">
            {results.map((result) => (
                <button
                    key={result.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                    onMouseDown={(e) => {
                        e.preventDefault()
                        onSelect(result)
                    }}
                >
                    <span className="font-medium">{result.name}</span>
                    {result.nickname && (
                        <span className="text-muted-foreground ml-1">
                            ({result.nickname})
                        </span>
                    )}
                </button>
            ))}
        </div>
    )
}
