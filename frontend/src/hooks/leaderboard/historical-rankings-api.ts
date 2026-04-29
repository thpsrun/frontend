import type { HistoricalRankingsResponse, HistoryMode } from "@/types/api"
import { apiFetch } from "@/lib/api-client"
import { MODE_URL_TO_API } from "@/lib/rankings-modes"

export interface FetchHistoricalRankingsParams {
    mode: HistoryMode
    year: number
    month: number
    gameSlug?: string
}

export const fetchHistoricalRankings = (
    params: FetchHistoricalRankingsParams,
    signal?: AbortSignal,
): Promise<HistoricalRankingsResponse> => {
    const { mode, year, month, gameSlug } = params
    const apiMode = MODE_URL_TO_API[mode]
    const tail = gameSlug ? `${encodeURIComponent(gameSlug)}/` : ""
    const path = `/pointslb/history/${apiMode}/${year}/${month}/${tail}`
    return apiFetch<HistoricalRankingsResponse>(path, { signal })
}
