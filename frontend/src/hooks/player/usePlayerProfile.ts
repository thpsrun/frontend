import { useQuery } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { PlayerResponse } from "@/types/api"
import { apiFetch, ApiError } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

type QueryOptions = Omit<
    UseQueryOptions<PlayerResponse, Error>,
    "queryKey" | "queryFn"
>

class PlayerNotFoundError extends ApiError {
    constructor(source: ApiError) {
        super(source.status, "PLAYER_NOT_FOUND", source.code, source.body)
        this.name = "PlayerNotFoundError"
    }
}

const fetchPlayerProfile = async (
    playerName: string,
    includeObsolete: boolean = false,
    signal?: AbortSignal,
): Promise<PlayerResponse> => {
    const embed = includeObsolete
        ? "country,awards,profile-obsolete,stats"
        : "country,awards,profile,stats"
    const path = `/players/${encodeURIComponent(playerName)}?embed=${embed}`
    try {
        return await apiFetch<PlayerResponse>(path, { signal })
    } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
            throw new PlayerNotFoundError(err)
        }
        throw err
    }
}

export const usePlayerProfile = (
    playerName: string,
    options?: QueryOptions & { includeObsolete?: boolean },
) => {
    const includeObsolete = options?.includeObsolete ?? false
    return useQuery<PlayerResponse, Error>({
        queryKey: queryKeys.player.profile(playerName, includeObsolete),
        queryFn: ({ signal }) =>
            fetchPlayerProfile(playerName, includeObsolete, signal),
        staleTime: 5 * 60 * 1000,
        ...options,
        enabled: !!playerName && (options?.enabled ?? true),
    })
}

export { PlayerNotFoundError }
