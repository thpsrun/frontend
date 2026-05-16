import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useSetSrcKey, useDeleteSrcKey } from "@/hooks/auth/useSrcKey"
import {
    ModerationSettings,
} from "@/components/profile/moderation-settings"

export function SrcApiSection() {
    const { player } = useCurrentPlayer()
    const setSrcKey = useSetSrcKey()
    const deleteSrcKey = useDeleteSrcKey()

    if (!player) return null

    return (
        <div className="flex flex-col gap-6">
            <ModerationSettings
                player={player}
                setSrcKey={setSrcKey}
                deleteSrcKey={deleteSrcKey}
            />
        </div>
    )
}
