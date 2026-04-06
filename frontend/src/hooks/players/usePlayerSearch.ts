import { useQuery } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { API_BASE_URL } from "@/constants"
import { handleApiError } from "@/lib/api"
import type { PlayerSearchResult } from "@/types/submissions"

async function searchPlayers(
    query: string,
): Promise<PlayerSearchResult[]> {
    const res = await fetch(
        `${API_BASE_URL}/players/search?q=${encodeURIComponent(query)}&limit=10`,
        { credentials: "include" },
    )
    if (!res.ok) await handleApiError(res, "Player search failed")
    return res.json()
}

export function usePlayerSearch(query: string) {
    const [debounced, setDebounced] = useState(query)

    useEffect(() => {
        const timer = setTimeout(
            () => setDebounced(query),
            300,
        )
        return () => clearTimeout(timer)
    }, [query])

    return useQuery({
        queryKey: ["playerSearch", debounced],
        queryFn: () => searchPlayers(debounced),
        enabled: debounced.length >= 2,
        staleTime: 30 * 1000,
    })
}
