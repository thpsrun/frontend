import { useQuery } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { PlayerResponse } from "@/types/api"
import { API_BASE_URL } from "@/constants"


type QueryOptions = Omit<
    UseQueryOptions<PlayerResponse, Error>,
    "queryKey" | "queryFn"
>

class PlayerNotFoundError extends Error {
    constructor() {
        super("PLAYER_NOT_FOUND")
        this.name = "PlayerNotFoundError"
    }
}

const fetchPlayerProfile = async (
    playerName: string,
    includeObsolete: boolean = false,
): Promise<PlayerResponse> => {
    const embed = includeObsolete
        ? "country,awards,profile-obsolete,stats"
        : "country,awards,profile,stats"
    const url = `${API_BASE_URL}/players/${encodeURIComponent(playerName)}`
        + `?embed=${embed}`

    const res = await fetch(url, {
        headers: { "Accept": "application/json" },
    })

    if (res.status === 404) {
        throw new PlayerNotFoundError()
    }

    if (!res.ok) {
        throw new Error(`Failed to fetch player profile (${res.status})`)
    }

    return res.json()
}

export const usePlayerProfile = (
    playerName: string,
    options?: QueryOptions & { includeObsolete?: boolean },
) => {
    const includeObsolete = options?.includeObsolete ?? false
    return useQuery<PlayerResponse, Error>({
        queryKey: ["player-profile", playerName, includeObsolete],
        queryFn: () => fetchPlayerProfile(playerName, includeObsolete),
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
            if (error instanceof PlayerNotFoundError) return false
            return failureCount < 2
        },
        ...options,
        enabled: !!playerName && (options?.enabled ?? true),
    })
}

export { PlayerNotFoundError }
