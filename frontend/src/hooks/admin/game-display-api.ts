import { apiFetch } from "@/lib/api-client"
import type {
    GameDisplayResponse,
    ReorderRequest,
    VisibilityRequest,
} from "@/types/admin-game-display"

export const fetchGameDisplay = (
    gameId: string,
    signal?: AbortSignal,
): Promise<GameDisplayResponse> =>
    apiFetch<GameDisplayResponse>(
        `/auth/admin/games/${gameId}/display`,
        { signal },
    )

export const reorderDisplayItemsFn = (
    gameId: string,
    body: ReorderRequest,
): Promise<void> =>
    apiFetch<void>(
        `/auth/admin/games/${gameId}/display/reorder`,
        { method: "POST", json: body },
    )

export const setDisplayVisibilityFn = (
    gameId: string,
    body: VisibilityRequest,
): Promise<void> =>
    apiFetch<void>(
        `/auth/admin/games/${gameId}/display/visibility`,
        { method: "POST", json: body },
    )
