import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { removeGameModeratorFn } from "./moderators-api"

export function useRemoveGameModerator(
    slug: string,
    gameId: string | undefined,
) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (playerId: string) => {
            if (!gameId) throw new Error("Game not loaded yet.")
            return removeGameModeratorFn(playerId, gameId)
        },
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: queryKeys.games.moderators(slug),
            })
        },
    })
}
