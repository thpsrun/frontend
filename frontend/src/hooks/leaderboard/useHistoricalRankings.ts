import { useQuery } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { HistoricalRankingsResponse } from "@/types/api"
import { queryKeys } from "@/lib/query-keys"
import {
    fetchHistoricalRankings,
    type FetchHistoricalRankingsParams,
} from "./historical-rankings-api"

type QueryOptions = Omit<
    UseQueryOptions<HistoricalRankingsResponse, Error>,
    "queryKey" | "queryFn"
>

export const useHistoricalRankings = (
    params: FetchHistoricalRankingsParams,
    options?: QueryOptions,
) => {
    return useQuery<HistoricalRankingsResponse, Error>({
        queryKey: queryKeys.rankings.historical({
            mode: params.mode,
            year: params.year,
            month: params.month,
            gameSlug: params.gameSlug,
        }),
        queryFn: ({ signal }) => fetchHistoricalRankings(params, signal),
        staleTime: 60_000,
        ...options,
    })
}
