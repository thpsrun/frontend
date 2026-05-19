import { apiFetch } from "@/lib/api-client"
import type { GameModerator } from "@/types/moderators"

interface GameModeratorsEmbedResponse {
    moderators?: GameModerator[] | null
}

export const listGameModeratorsFn = async (
    slug: string,
    signal?: AbortSignal,
): Promise<GameModerator[]> => {
    const data = await apiFetch<GameModeratorsEmbedResponse>(
        `/games/${encodeURIComponent(slug)}?embed=moderators`,
        { signal },
    )
    return data.moderators ?? []
}

export const addGameModeratorFn = (
    playerId: string,
    gameId: string,
): Promise<void> =>
    apiFetch<void>(
        `/auth/admin/users/${encodeURIComponent(playerId)}`
            + `/moderates/${encodeURIComponent(gameId)}`,
        { method: "POST" },
    )

export const removeGameModeratorFn = (
    playerId: string,
    gameId: string,
): Promise<void> =>
    apiFetch<void>(
        `/auth/admin/users/${encodeURIComponent(playerId)}`
            + `/moderates/${encodeURIComponent(gameId)}`,
        { method: "DELETE" },
    )
