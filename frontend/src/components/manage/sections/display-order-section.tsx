import { Navigate, useParams } from "react-router"

import { useGameDetail } from "@/hooks/game/useGameDetail"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { GameDisplayEditor } from "@/components/admin/game-display/game-display-editor"
import { AlertBanner } from "@/components/common/alert-banner"
import { SectionPanel } from "@/components/profile/section-panel"

export function DisplayOrderSection() {
    const { gameSlug } = useParams<{ gameSlug: string }>()
    const { player, isLoading: playerLoading } = useCurrentPlayer()
    const game = useGameDetail(gameSlug ?? "")

    // The sidebar only links here for superusers, but the URL is directly reachable by any game
    // mod, so re-check once the profile has loaded.
    if (playerLoading) return null
    if (!player?.player.is_superuser) {
        return <Navigate to={`/${gameSlug}/manage/timing`} replace />
    }
    if (game.isLoading) return null
    if (!game.data) {
        return (
            <SectionPanel title="Display Order">
                <AlertBanner variant="error">Game not found.</AlertBanner>
            </SectionPanel>
        )
    }

    return <GameDisplayEditor gameId={game.data.id} />
}
