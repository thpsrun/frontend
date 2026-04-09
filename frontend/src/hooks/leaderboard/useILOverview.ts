import { useQuery } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { ILOverviewResponse } from "@/types/api"
import { API_BASE_URL } from "@/constants"

export interface UseILOverviewParams {
    gameSlug: string
    valueSlugs?: string[]
}

type QueryOptions = Omit<
    UseQueryOptions<ILOverviewResponse, Error>,
    "queryKey" | "queryFn"
>

const fetchILOverview = async ({
    gameSlug,
    valueSlugs,
}: UseILOverviewParams): Promise<ILOverviewResponse> => {
    if (!gameSlug) {
        throw new Error("gameSlug required")
    }

    const qs = new URLSearchParams()
    if (valueSlugs && valueSlugs.length > 0) {
        qs.set("values", valueSlugs.join(","))
    }
    qs.set("embed", "stats,recent")

    const url = `${API_BASE_URL}/website/lbs`
        + `/${encodeURIComponent(gameSlug)}`
        + `/levels?${qs.toString()}`

    const res = await fetch(url, {
        headers: { "Accept": "application/json" },
    })

    if (!res.ok) {
        throw new Error(
            `Failed IL overview (${res.status})`,
        )
    }

    return res.json()
}

export const useILOverview = (
    params: UseILOverviewParams,
    options?: QueryOptions,
) => {
    const enabled = !!params.gameSlug
        && (options?.enabled ?? true)

    return useQuery<ILOverviewResponse, Error>({
        queryKey: [
            "il-overview",
            params.gameSlug,
            ...(params.valueSlugs ?? []),
        ],
        queryFn: () => fetchILOverview(params),
        staleTime: 5 * 60 * 1000,
        retry: 2,
        ...options,
        enabled,
    })
}
