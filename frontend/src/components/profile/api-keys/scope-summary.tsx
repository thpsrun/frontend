import { capabilityLabel } from "@/lib/capability-labels"
import { cn } from "@/lib/utils"
import type { ApiKeyResponse } from "@/types/api-keys"

type ScopeSummaryProps = {
    scopeCapabilities: ApiKeyResponse["scope_capabilities"]
    scopeGames: ApiKeyResponse["scope_games"]
    className?: string
}

export function ScopeSummary({
    scopeCapabilities,
    scopeGames,
    className,
}: ScopeSummaryProps) {
    // An empty scope list means no restriction on that axis, so a key with both lists empty
    // is fully unscoped.
    const unscoped =
        scopeCapabilities.length === 0 && scopeGames.length === 0

    if (unscoped) {
        return (
            <span
                className={cn(
                    "text-xs text-muted-foreground",
                    className,
                )}
            >
                Unscoped | Full Power
            </span>
        )
    }

    const capPart = scopeCapabilities.length === 0
        ? "all capabilities"
        : scopeCapabilities.length === 1
            ? capabilityLabel(scopeCapabilities[0])
            : `${capabilityLabel(scopeCapabilities[0])} +${scopeCapabilities.length - 1}`

    const gamePart = scopeGames.length === 0
        ? "all games"
        : scopeGames.length === 1
            ? "1 game"
            : `${scopeGames.length} games`

    return (
        <span className={cn("text-xs text-muted-foreground", className)}>
            Scoped: {capPart} · {gamePart}
        </span>
    )
}
