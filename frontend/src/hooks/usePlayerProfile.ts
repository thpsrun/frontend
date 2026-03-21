import { useQuery } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { PlayerProfile } from "@/types/api"
import { API_BASE_URL } from "@/constants"


type QueryOptions = Omit<
    UseQueryOptions<PlayerProfile, Error>,
    "queryKey" | "queryFn"
>

class PlayerNotFoundError extends Error {
    constructor() {
        super("PLAYER_NOT_FOUND")
        this.name = "PlayerNotFoundError"
    }
}

const fetchPlayerProfile = async (playerName: string): Promise<PlayerProfile> => {
    const url = `${API_BASE_URL}/players/${encodeURIComponent(playerName)}`
        + `?embed=country,awards,profile,stats`

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
    options?: QueryOptions,
) => {
    return useQuery<PlayerProfile, Error>({
        queryKey: ["player-profile", playerName],
        queryFn: () => fetchPlayerProfile(playerName),
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
