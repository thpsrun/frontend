import { useMemo } from "react"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"

export function useIsGameMod(gameSlug: string | undefined): {
    isMod: boolean
    isLoading: boolean
} {
    const { player, isLoading } = useCurrentPlayer()
    const isMod = useMemo(() => {
        if (!gameSlug || !player) return false
        if (player.player.is_superuser) return true
        return player.moderation.moderated_games.some(
            (g) => g.slug === gameSlug,
        )
    }, [gameSlug, player])
    return { isMod, isLoading }
}
