import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { addGameModeratorFn } from "./moderators-api"

export function useAddGameModerator(slug: string, gameId: string | undefined) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (playerId: string) => {
            if (!gameId) throw new Error("Game not loaded yet.")
            return addGameModeratorFn(playerId, gameId)
        },
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: queryKeys.games.moderators(slug),
            })
        },
    })
}
