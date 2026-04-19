import { useQuery } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { PlayerSearchResult } from "@/types/submissions"

const searchPlayers = (
    query: string,
    signal?: AbortSignal,
): Promise<PlayerSearchResult[]> => {
    const path = `/players/search?q=${encodeURIComponent(query)}&limit=10`
    return apiFetch<PlayerSearchResult[]>(path, { signal })
}

export function usePlayerSearch(query: string) {
    const [debounced, setDebounced] = useState(query)

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(query), 300)
        return () => clearTimeout(timer)
    }, [query])

    return useQuery({
        queryKey: queryKeys.player.search(debounced),
        queryFn: ({ signal }) => searchPlayers(debounced, signal),
        enabled: debounced.length >= 2,
        staleTime: 30 * 1000,
    })
}
