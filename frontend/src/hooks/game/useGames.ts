import { useQuery } from "@tanstack/react-query"

import type { Game } from "@/types/api"
import { API_BASE_URL } from "@/constants"


const fetchGames = async (): Promise<Game[]> => {
    const res = await fetch(`${API_BASE_URL}/games/all`, {
        headers: { "Accept": "application/json" },
    })

    if (!res.ok) {
        throw new Error(`Failed to fetch games (${res.status})`)
    }

    return res.json()
}

export const useGames = () => {
    return useQuery<Game[]>({
        queryKey: ["games-all"],
        queryFn: fetchGames,
        staleTime: 30 * 60 * 1000,
    })
}
