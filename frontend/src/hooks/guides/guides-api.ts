import { apiFetch } from "@/lib/api-client"
import type {
    Guide,
    GuideCreateInput,
    GuideListItem,
    GuideUpdateInput,
} from "@/types/guides"

export const LIST_EMBED = "game,tags"
export const DETAIL_EMBED = "game,tags"

interface ListParams {
    game?: string
    tag?: string
    embed?: string
}

function buildSearch(params: ListParams): string {
    const sp = new URLSearchParams()
    if (params.game) sp.set("game", params.game)
    if (params.tag) sp.set("tag", params.tag)
    if (params.embed) sp.set("embed", params.embed)
    const qs = sp.toString()
    return qs ? `?${qs}` : ""
}

export const listGuidesFn = (
    params: ListParams,
    signal?: AbortSignal,
): Promise<GuideListItem[]> =>
    apiFetch<GuideListItem[]>(`/guides/all${buildSearch(params)}`, { signal })

export const getGuideFn = (
    slug: string,
    embed: string | undefined,
    signal?: AbortSignal,
): Promise<Guide> => {
    const qs = embed ? `?${new URLSearchParams({ embed }).toString()}` : ""
    return apiFetch<Guide>(`/guides/${encodeURIComponent(slug)}${qs}`, { signal })
}

export const createGuideFn = (data: GuideCreateInput): Promise<Guide> =>
    apiFetch<Guide>("/guides/", { method: "POST", json: data })

export const updateGuideFn = (
    slug: string,
    data: GuideUpdateInput,
): Promise<Guide> =>
    apiFetch<Guide>(`/guides/${encodeURIComponent(slug)}`, {
        method: "PUT",
        json: data,
    })

export const deleteGuideFn = (slug: string): Promise<void> =>
    apiFetch<void>(`/guides/${encodeURIComponent(slug)}`, { method: "DELETE" })
